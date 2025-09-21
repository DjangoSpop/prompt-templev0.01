'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { features, isDevelopment } from '@/lib/config/env';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'disabled';
  message?: string;
  url?: string;
}

export function DevHealthCheck() {
  const [services, setServices] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    if (!isDevelopment()) return;

    const checkServices = async () => {
      const serviceChecks: ServiceStatus[] = [
        {
          name: 'Mock API Mode',
          status: features.mockApi ? 'healthy' : 'disabled',
          message: features.mockApi ? 'Using mock data for development' : 'Using real API endpoints',
        },
        {
          name: 'Analytics Service',
          status: features.analytics ? 'healthy' : 'disabled',
          message: features.analytics ? 'Analytics tracking enabled' : 'Analytics disabled',
        },
        {
          name: 'Teams Feature',
          status: features.teams ? 'healthy' : 'disabled',
          message: features.teams ? 'Team features available' : 'Teams disabled',
        },
        {
          name: 'Billing Feature',
          status: features.billing ? 'healthy' : 'disabled',
          message: features.billing ? 'Billing features available' : 'Billing disabled',
        },
      ];

      // Check API connectivity if not in mock mode
      if (!features.mockApi) {
        try {
          const response = await fetch('/api/health');
          serviceChecks.push({
            name: 'API Server',
            status: response.ok ? 'healthy' : 'unhealthy',
            message: response.ok ? `Connected (${response.status})` : `Failed (${response.status})`,
            url: '/api/health',
          });
        } catch (error) {
          serviceChecks.push({
            name: 'API Server',
            status: 'unhealthy',
            message: 'Connection failed',
            url: '/api/health',
          });
        }
      }

      setServices(serviceChecks);
    };

    checkServices();
  }, []);

  if (!isDevelopment() || services.length === 0) return null;

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'disabled':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Development Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(service.status)}
              <span className="text-sm font-medium">{service.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
              {service.message && (
                <span className="text-xs text-gray-600">{service.message}</span>
              )}
            </div>
          </div>
        ))}
        <div className="pt-2 text-xs text-blue-600">
          This panel only appears in development mode.
        </div>
      </CardContent>
    </Card>
  );
}