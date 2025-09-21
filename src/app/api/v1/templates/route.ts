import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandling, throwAPIError } from '@/lib/api/errorHandler';
import { RequestValidator, commonSchemas } from '@/lib/api/middleware/validation';
import { rateLimits } from '@/lib/api/middleware/rateLimit';
import { logger } from '@/lib/api/logger';
import { db } from '@/lib/database/connection';

// Validation schemas
const templateCreateSchema = commonSchemas.templateCreate;
const templateQuerySchema = z.object({
  ...commonSchemas.pagination.shape,
  ...commonSchemas.search.shape,
  author: z.string().optional(),
  is_featured: z.string().transform(val => val === 'true').optional(),
  is_public: z.string().transform(val => val === 'true').optional(),
});

// GET /api/v1/templates - List templates with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimits.moderate(request);
  if (!rateLimitResult.success) {
    throwAPIError.rateLimit();
  }

  // Validate query parameters
  const { data: queryParams } = await RequestValidator.validateRequest(
    request,
    templateQuerySchema,
    {
      source: 'query',
      requireAuth: false, // Public endpoint
    }
  );

  const {
    page = 1,
    limit = 20,
    q,
    category,
    author,
    is_featured,
    is_public,
    sort = 'created_at',
    order = 'desc',
  } = queryParams;

  // Build query
  let query = `
    SELECT t.*, 
           u.username as author_name,
           c.name as category_name,
           COALESCE(AVG(r.rating), 0) as avg_rating,
           COUNT(r.id) as rating_count
    FROM templates t
    LEFT JOIN users u ON t.author_id = u.id
    LEFT JOIN template_categories c ON t.category_id = c.id
    LEFT JOIN template_ratings r ON t.id = r.template_id
    WHERE 1=1
  `;

  const queryParams_db: any[] = [];
  let paramIndex = 1;

  // Add filters
  if (q) {
    query += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
    queryParams_db.push(`%${q}%`);
    paramIndex++;
  }

  if (category) {
    query += ` AND c.slug = $${paramIndex}`;
    queryParams_db.push(category);
    paramIndex++;
  }

  if (author) {
    query += ` AND u.username = $${paramIndex}`;
    queryParams_db.push(author);
    paramIndex++;
  }

  if (is_featured !== undefined) {
    query += ` AND t.is_featured = $${paramIndex}`;
    queryParams_db.push(is_featured);
    paramIndex++;
  }

  if (is_public !== undefined) {
    query += ` AND t.is_public = $${paramIndex}`;
    queryParams_db.push(is_public);
    paramIndex++;
  }

  query += ` GROUP BY t.id, u.username, c.name`;

  // Add sorting
  const allowedSortFields = ['created_at', 'updated_at', 'name', 'avg_rating'];
  if (allowedSortFields.includes(sort)) {
    query += ` ORDER BY ${sort === 'avg_rating' ? 'AVG(r.rating)' : `t.${sort}`} ${order}`;
  }

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams_db.push(limit, offset);

  // Execute query
  const result = await db.query(query, queryParams_db);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(DISTINCT t.id) as total
    FROM templates t
    LEFT JOIN users u ON t.author_id = u.id
    LEFT JOIN template_categories c ON t.category_id = c.id
    WHERE 1=1
  `;

  // Re-apply filters for count (without the joins that don't affect count)
  const countParams: any[] = [];
  let countParamIndex = 1;

  if (q) {
    countQuery += ` AND (t.name ILIKE $${countParamIndex} OR t.description ILIKE $${countParamIndex})`;
    countParams.push(`%${q}%`);
    countParamIndex++;
  }

  if (category) {
    countQuery += ` AND c.slug = $${countParamIndex}`;
    countParams.push(category);
    countParamIndex++;
  }

  if (author) {
    countQuery += ` AND u.username = $${countParamIndex}`;
    countParams.push(author);
    countParamIndex++;
  }

  if (is_featured !== undefined) {
    countQuery += ` AND t.is_featured = $${countParamIndex}`;
    countParams.push(is_featured);
    countParamIndex++;
  }

  if (is_public !== undefined) {
    countQuery += ` AND t.is_public = $${countParamIndex}`;
    countParams.push(is_public);
    countParamIndex++;
  }

  const countResult = await db.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0]?.total || '0');

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  logger.info('Templates fetched successfully', {
    count: result.rowCount,
    page,
    limit,
    total,
    filters: { q, category, author, is_featured, is_public },
  });

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
    meta: {
      query: q,
      category,
      author,
      sort,
      order,
    },
  };
});

// POST /api/v1/templates - Create new template
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting for creation
  const rateLimitResult = await rateLimits.strict(request);
  if (!rateLimitResult.success) {
    throwAPIError.rateLimit();
  }

  // Validate request body
  const validationResult = await RequestValidator.validateRequest(
    request,
    templateCreateSchema,
    {
      source: 'body',
      requireAuth: true,
    }
  );

  if (validationResult.response) {
    return validationResult.response;
  }

  const templateData = validationResult.data;

  // Extract user ID from auth token (this would typically come from middleware)
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // You would decode the JWT token here to get user ID
  // For now, we'll assume it's available
  const userId = 'current-user-id'; // This should come from JWT decoding

  // Check if category exists (if provided)
  if (templateData.category_id) {
    const categoryResult = await db.query(
      'SELECT id FROM template_categories WHERE id = $1',
      [templateData.category_id]
    );

    if (categoryResult.rowCount === 0) {
      throwAPIError.validation('Category not found');
    }
  }

  // Create template in transaction
  const template = await db.transaction(async (client) => {
    // Insert template
    const templateResult = await client.query(
      `
        INSERT INTO templates (
          name, description, prompt, category_id, 
          is_public, author_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `,
      [
        templateData.name,
        templateData.description,
        templateData.prompt,
        templateData.category_id,
        templateData.is_public,
        userId,
      ]
    );

    const newTemplate = templateResult.rows[0];

    // Insert variables if provided
    if (templateData.variables && templateData.variables.length > 0) {
      for (const variable of templateData.variables) {
        await client.query(
          `
            INSERT INTO template_variables (
              template_id, name, type, description, 
              required, default_value, options
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            newTemplate.id,
            variable.name,
            variable.type,
            variable.description,
            variable.required,
            variable.default_value,
            variable.options ? JSON.stringify(variable.options) : null,
          ]
        );
      }
    }

    // Insert tags if provided
    if (templateData.tags && templateData.tags.length > 0) {
      for (const tag of templateData.tags) {
        // Insert or get tag
        await client.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [tag]
        );

        // Link tag to template
        await client.query(
          `
            INSERT INTO template_tags (template_id, tag_id)
            SELECT $1, id FROM tags WHERE name = $2
          `,
          [newTemplate.id, tag]
        );
      }
    }

    return newTemplate;
  });

  logger.info('Template created successfully', {
    templateId: template.id,
    userId,
    name: template.name,
  });

  // Fetch complete template data with relations
  const completeTemplate = await db.query(
    `
      SELECT t.*, 
             u.username as author_name,
             c.name as category_name,
             COALESCE(json_agg(DISTINCT tv.*) FILTER (WHERE tv.id IS NOT NULL), '[]') as variables,
             COALESCE(json_agg(DISTINCT tg.name) FILTER (WHERE tg.name IS NOT NULL), '[]') as tags
      FROM templates t
      LEFT JOIN users u ON t.author_id = u.id
      LEFT JOIN template_categories c ON t.category_id = c.id
      LEFT JOIN template_variables tv ON t.id = tv.template_id
      LEFT JOIN template_tags tt ON t.id = tt.template_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.id = $1
      GROUP BY t.id, u.username, c.name
    `,
    [template.id]
  );

  return completeTemplate.rows[0];
});