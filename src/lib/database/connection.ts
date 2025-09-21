import { Pool, PoolClient, QueryResult } from 'pg';
import { env, isProduction } from '../config/env';
import { logger, monitor } from '../api/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

class DatabaseConnection {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!env.DATABASE_URL) {
      logger.warn('Database URL not provided, database operations will be unavailable');
      return;
    }

    try {
      const config = this.parseConnectionString(env.DATABASE_URL);
      
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl,
        max: config.maxConnections || 20,
        idleTimeoutMillis: config.idleTimeoutMs || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMs || 10000,
        // Pool event handlers
        log: (message) => logger.debug('Database pool:', { message }),
      });

      // Test connection
      await this.testConnection();
      this.isConnected = true;

      logger.info('Database connection pool initialized successfully');

      // Graceful shutdown
      process.on('SIGINT', () => this.close());
      process.on('SIGTERM', () => this.close());

    } catch (error) {
      logger.error('Failed to initialize database connection', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private parseConnectionString(connectionString: string): DatabaseConfig {
    const url = new URL(connectionString);
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password,
      ssl: isProduction(),
    };
  }

  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      logger.info('Database connection test successful');
    } finally {
      client.release();
    }
  }

  async query<T = any>(
    text: string,
    params?: any[],
    client?: PoolClient
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const monitor_op = monitor(`db_query`);
    const queryClient = client || this.pool;

    try {
      const result = await queryClient.query<T>(text, params);
      
      monitor_op.end(true, {
        query: text,
        rowCount: result.rowCount,
      });

      logger.debug('Database query executed', {
        query: text,
        params: params ? '[REDACTED]' : undefined,
        rowCount: result.rowCount,
      });

      return result;
    } catch (error) {
      monitor_op.end(false, {
        query: text,
        error: error instanceof Error ? error.message : String(error),
      });

      logger.error('Database query failed', {
        query: text,
        params: params ? '[REDACTED]' : undefined,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    const monitor_op = monitor('db_transaction');

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      monitor_op.end(true);
      logger.debug('Database transaction completed successfully');
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      
      monitor_op.end(false, {
        error: error instanceof Error ? error.message : String(error),
      });

      logger.error('Database transaction failed, rolled back', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return await this.pool.connect();
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info('Database connection pool closed');
    }
  }

  getStatus(): { connected: boolean; poolSize?: number } {
    return {
      connected: this.isConnected,
      poolSize: this.pool ? this.pool.totalCount : undefined,
    };
  }

  async getHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    if (!this.pool) {
      return {
        status: 'unhealthy',
        error: 'Database not connected',
      };
    }

    const start = Date.now();
    try {
      await this.query('SELECT 1');
      return {
        status: 'healthy',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Singleton instance
export const db = new DatabaseConnection();

// Helper functions for common operations
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

export async function queryWithRetry<T = any>(
  text: string,
  params?: any[],
  maxRetries: number = 3
): Promise<QueryResult<T>> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.query<T>(text, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Database query retry ${attempt}/${maxRetries} after ${delay}ms`, {
          error: lastError.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}