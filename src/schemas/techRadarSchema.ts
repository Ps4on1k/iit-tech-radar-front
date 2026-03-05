import { z } from 'zod';

// Enum схемы
const typeSchema = z.enum(['фреймворк', 'библиотека', 'язык программирования', 'инструмент']);
const subtypeSchema = z.enum([
  'фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 
  'DevOps', 'SaaS', 'библиотека', 'data engineering', 'AI', 'observability', 
  'базы данных', 'тестирование', 'автотесты', 'нагрузочные тесты', 'безопасность', 
  'очереди', 'desktop', 'прочее'
]).optional().nullable();
const categorySchema = z.enum(['adopt', 'trial', 'assess', 'hold', 'drop']);
const maturitySchema = z.enum(['experimental', 'active', 'stable', 'deprecated', 'end-of-life']);
const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
const supportStatusSchema = z.enum(['active', 'limited', 'end-of-life', 'community-only']);
const performanceImpactSchema = z.enum(['low', 'medium', 'high']).optional().nullable();
const contributionFrequencySchema = z.enum(['frequent', 'regular', 'occasional', 'rare', 'none']).optional().nullable();
const costFactorSchema = z.enum(['free', 'paid', 'subscription', 'enterprise']).optional().nullable();
const businessCriticalitySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Resource requirements схема
const resourceRequirementsSchema = z.object({
  cpu: z.enum(['низкие', 'средние', 'высокие', 'очень высокие']).optional().nullable(),
  memory: z.enum(['низкие', 'средние', 'высокие', 'очень высокие']).optional().nullable(),
  storage: z.enum(['минимальные', 'низкие', 'средние', 'высокие']).optional().nullable(),
}).optional().nullable();

// Dependency схема
const dependencySchema = z.object({
  name: z.string().min(1, 'Название зависимости обязательно'),
  version: z.string().min(1, 'Версия зависимости обязательна'),
  optional: z.boolean().optional(),
});

// Compatibility схема
const compatibilitySchema = z.object({
  os: z.array(z.string()).optional().nullable(),
  browsers: z.array(z.string()).optional().nullable(),
  frameworks: z.array(z.string()).optional().nullable(),
}).optional().nullable();

// Основная схема TechRadar
export const techRadarSchema = z.object({
  id: z.string().uuid('Неверный формат ID').optional(),
  
  // Обязательные поля
  name: z.string().min(1, 'Название обязательно'),
  version: z.string().min(1, 'Версия обязательна'),
  type: typeSchema,
  subtype: subtypeSchema,
  category: categorySchema,
  firstAdded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),
  owner: z.string().min(1, 'Владелец обязателен'),
  maturity: maturitySchema,
  riskLevel: riskLevelSchema,
  license: z.string().min(1, 'Лицензия обязательна'),
  supportStatus: supportStatusSchema,
  businessCriticality: businessCriticalitySchema,
  vendorLockIn: z.boolean().default(false),
  
  // Опциональные поля
  versionReleaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD').optional().nullable(),
  description: z.string().optional().nullable(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD').optional().nullable(),
  stakeholders: z.array(z.string()).optional().nullable(),
  dependencies: z.array(dependencySchema).optional().nullable(),
  usageExamples: z.array(z.string()).optional().nullable(),
  documentationUrl: z.string().url('Неверный формат URL').optional().nullable(),
  internalGuideUrl: z.string().url('Неверный формат URL').optional().nullable(),
  adoptionRate: z.number().min(0, 'Значение должно быть >= 0').max(1, 'Значение должно быть <= 1').optional().nullable(),
  recommendedAlternatives: z.array(z.string()).optional().nullable(),
  relatedTechnologies: z.array(z.string()).optional().nullable(),
  endOfLifeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD').optional().nullable(),
  upgradePath: z.string().optional().nullable(),
  performanceImpact: performanceImpactSchema,
  resourceRequirements: resourceRequirementsSchema,
  securityVulnerabilities: z.array(z.string()).optional().nullable(),
  complianceStandards: z.array(z.string()).optional().nullable(),
  communitySize: z.number().min(0, 'Значение должно быть >= 0').optional().nullable(),
  contributionFrequency: contributionFrequencySchema,
  popularityIndex: z.number().min(0, 'Значение должно быть >= 0').max(1, 'Значение должно быть <= 1').optional().nullable(),
  compatibility: compatibilitySchema,
  costFactor: costFactorSchema,
  versionToUpdate: z.string().optional().nullable(),
  versionUpdateDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD').optional().nullable(),
});

// Схема для создания (без id и с обязательными полями)
export const createTechRadarSchema = techRadarSchema.omit({ id: true }).extend({
  id: z.string().optional(),
});

// Схема для обновления (все поля опциональные)
export const updateTechRadarSchema = techRadarSchema.partial();

// Типы для форм
export type TechRadarFormData = z.infer<typeof techRadarSchema>;
export type CreateTechRadarFormData = z.infer<typeof createTechRadarSchema>;
export type UpdateTechRadarFormData = z.infer<typeof updateTechRadarSchema>;
