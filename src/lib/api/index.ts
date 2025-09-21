/* eslint-disable @typescript-eslint/no-require-imports */
// Import base classes first
import { BaseApiClient } from './base';
import { authService } from './auth';

// API Services exports
export { BaseApiClient, ApiError } from './base';
export { AuthService, authService } from './auth';

// Try to export other services if they exist, otherwise create stub services
// Use a single shared fallback client to avoid creating many axios instances
const sharedFallback = new BaseApiClient();
let templatesService: BaseApiClient = sharedFallback;
let categoriesService: BaseApiClient = sharedFallback;
let analyticsService: BaseApiClient = sharedFallback;
let gamificationService: BaseApiClient = sharedFallback;
let aiService: BaseApiClient = sharedFallback;
let orchestratorService: BaseApiClient = sharedFallback;
let billingService: BaseApiClient = sharedFallback;
let coreService: BaseApiClient = sharedFallback;

try {
  const { TemplatesService } = require('./templates');
  templatesService = new TemplatesService();
  exports.TemplatesService = TemplatesService;
} catch {
  templatesService = sharedFallback;
}
try {
  const { CategoriesService } = require('./categories');
  categoriesService = new CategoriesService();
  exports.CategoriesService = CategoriesService;
} catch {
  categoriesService = sharedFallback;
}
try {
  const { AnalyticsService } = require('./analytics');
  analyticsService = new AnalyticsService();
  exports.AnalyticsService = AnalyticsService;
} catch {
  analyticsService = sharedFallback;
}
try {
  const { GamificationService } = require('./gamification');
  gamificationService = new GamificationService();
  exports.GamificationService = GamificationService;
} catch {
  gamificationService = sharedFallback;
}
try {
  const { AIService } = require('./ai');
  aiService = new AIService();
  exports.AIService = AIService;
} catch {
  aiService = sharedFallback;
}
try {
  const { OrchestratorService } = require('./orchestrator');
  orchestratorService = new OrchestratorService();
  exports.OrchestratorService = OrchestratorService;
} catch {
  orchestratorService = sharedFallback;
}
try {
  const { BillingService } = require('./billing');
  billingService = new BillingService();
  exports.BillingService = BillingService;
} catch {
  billingService = sharedFallback;
}
try {
  const { CoreService } = require('./core');
  coreService = new CoreService();
  exports.CoreService = CoreService;
} catch {
  coreService = sharedFallback;
}
// Convenience object with all services
export const api = {
  auth: authService,
  templates: templatesService,
  categories: categoriesService,
  analytics: analyticsService,
  gamification: gamificationService,
  ai: aiService,
  orchestrator: orchestratorService,
  billing: billingService,
  core: coreService,
};

// Re-export types from the generated API types
export type { components, paths, operations } from '../../types/api';