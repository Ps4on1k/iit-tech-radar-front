import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { techRadarApi } from '../services/api';
import type { TechRadarEntity } from '../types';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS: Record<string, string> = {
  adopt: '#00C49F',
  trial: '#4DB8FF',
  assess: '#FFBB28',
  hold: '#FF8042',
  drop: '#FF4444',
};

const RISK_COLORS: Record<string, string> = {
  low: '#00C49F',
  medium: '#FFBB28',
  high: '#FF8042',
  critical: '#FF4444',
};

const RISK_ICONS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};

const SUPPORT_STATUS_ICONS: Record<string, string> = {
  active: '🟢',
  limited: '🟡',
  'end-of-life': '🔴',
  'community-only': '🔵',
};

const PERFORMANCE_ICONS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

const COST_ICONS: Record<string, string> = {
  free: '💚',
  paid: '💰',
  subscription: '💳',
  enterprise: '💼',
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const categoryIcons: Record<string, string> = {
    adopt: '✅',
    trial: '🧪',
    assess: '👁️',
    hold: '⚠️',
    drop: '❌',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs"
      style={{
        background: `${CATEGORY_COLORS[category]}20`,
        color: CATEGORY_COLORS[category]
      }}
    >
      <span className="text-sm">{categoryIcons[category] || '•'}</span>
      {category}
    </span>
  );
};

const RiskBadge: React.FC<{ riskLevel: string }> = ({ riskLevel }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs"
    style={{
      background: `${RISK_COLORS[riskLevel]}20`,
      color: RISK_COLORS[riskLevel]
    }}
  >
    <span className="text-sm">{RISK_ICONS[riskLevel] || '•'}</span>
    {riskLevel}
  </span>
);

const InfoRow: React.FC<{ label: string; value?: string | number | boolean | null; highlight?: boolean; icon?: string }> = ({ 
  label, 
  value,
  highlight = false,
  icon
}) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex py-2.5 border-b border-gray-200 dark:border-gray-700 last:border-0 items-center">
      <span className="w-48 text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">{icon && <span className="mr-2">{icon}</span>}{label}</span>
      <span className={`text-sm ${highlight ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : String(value)}
      </span>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: string }> = ({ title, children, icon }) => (
  <div className="mb-6">
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

export const TechnologyViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [entity, setEntity] = useState<TechRadarEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchEntity = async () => {
      try {
        setLoading(true);
        const data = await techRadarApi.getById(id);
        setEntity(data);
      } catch (err) {
        console.error('Ошибка загрузки технологии:', err);
        setError('Ошибка при загрузке данных технологии');
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Технология не найдена'}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#16213e] border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Вернуться к списку"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{entity.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Версия: <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{entity.version}</span></p>
            </div>
            <div className="flex gap-2">
              <CategoryBadge category={entity.category} />
              <RiskBadge riskLevel={entity.riskLevel} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
              <Section title="Основная информация" icon="📋">
                <InfoRow label="Название" value={entity.name} />
                <InfoRow label="Версия" value={entity.version} />
                <InfoRow label="Дата выпуска версии" value={entity.versionReleaseDate} />
                <InfoRow label="Тип" value={entity.type} icon="🏷️" />
                <InfoRow label="Подтип" value={entity.subtype} />
                <InfoRow label="Категория" value={entity.category} />
                <InfoRow 
                  label="Уровень зрелости" 
                  value={entity.maturity} 
                  icon="📊"
                />
                <InfoRow 
                  label="Уровень риска" 
                  value={entity.riskLevel} 
                  icon="⚠️"
                />
                <InfoRow label="Лицензия" value={entity.license} icon="📄" />
                <InfoRow label="Владелец" value={entity.owner} icon="👤" />
                <InfoRow label="Заинтересованные стороны" value={entity.stakeholders?.join(', ')} />
                <InfoRow label="Дата добавления" value={entity.firstAdded} icon="📅" />
                <InfoRow label="Последнее обновление" value={entity.lastUpdated} />
              </Section>

              {entity.description && (
                <Section title="Описание" icon="📝">
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">{entity.description}</p>
                </Section>
              )}

              {entity.dependencies && entity.dependencies.length > 0 && (
                <Section title="Зависимости" icon="🔗">
                  <div className="space-y-2">
                    {entity.dependencies.map((dep, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{dep.name}</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">v{dep.version}</span>
                        {dep.optional && (
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">опционально</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Статус поддержки" icon="🛡️">
                <InfoRow 
                  label="Статус поддержки" 
                  value={entity.supportStatus}
                  icon={SUPPORT_STATUS_ICONS[entity.supportStatus]}
                />
                <InfoRow label="Критичность для бизнеса" value={entity.businessCriticality} icon="💼" />
                <InfoRow label="Vendor Lock-in" value={entity.vendorLockIn} icon="🔒" />
                <InfoRow 
                  label="Дата окончания поддержки" 
                  value={entity.endOfLifeDate} 
                  highlight={entity.endOfLifeDate ? new Date(entity.endOfLifeDate) < new Date() : false}
                  icon="⏰"
                />
                <InfoRow label="Путь обновления" value={entity.upgradePath} icon="📈" />
              </Section>
            </div>

            {/* Технические детали */}
            <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
              <Section title="Технические характеристики" icon="⚙️">
                <InfoRow 
                  label="Влияние на производительность" 
                  value={entity.performanceImpact}
                  icon={entity.performanceImpact ? PERFORMANCE_ICONS[entity.performanceImpact] : undefined}
                />
                <InfoRow 
                  label="Стоимость" 
                  value={entity.costFactor}
                  icon={entity.costFactor ? COST_ICONS[entity.costFactor] : undefined}
                />
                <InfoRow label="Частота вклада" value={entity.contributionFrequency} icon="📦" />
                
                {entity.resourceRequirements && (
                  <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">💻 Требования к ресурсам</span>
                    <div className="grid grid-cols-3 gap-4">
                      {entity.resourceRequirements.cpu && (
                        <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">🖥️ CPU</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">{entity.resourceRequirements.cpu}</span>
                        </div>
                      )}
                      {entity.resourceRequirements.memory && (
                        <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">💾 Память</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">{entity.resourceRequirements.memory}</span>
                        </div>
                      )}
                      {entity.resourceRequirements.storage && (
                        <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">💿 Хранилище</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">{entity.resourceRequirements.storage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {entity.compatibility && (
                  <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">🔌 Совместимость</span>
                    {entity.compatibility.os && entity.compatibility.os.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-2">🖥️ Операционные системы:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {entity.compatibility.os.map((os, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs rounded-full">{os}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entity.compatibility.browsers && entity.compatibility.browsers.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-2">🌐 Браузеры:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {entity.compatibility.browsers.map((browser, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs rounded-full">{browser}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entity.compatibility.frameworks && entity.compatibility.frameworks.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-2">🔧 Фреймворки:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {entity.compatibility.frameworks.map((fw, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs rounded-full">{fw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Section>
            </div>

            {/* Примеры использования и альтернативы */}
            <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
              {entity.usageExamples && entity.usageExamples.length > 0 && (
                <Section title="Примеры использования" icon="💡">
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-900 dark:text-gray-100">
                    {entity.usageExamples.map((example, idx) => (
                      <li key={idx} className="pl-1">{example}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {entity.recommendedAlternatives && entity.recommendedAlternatives.length > 0 && (
                <Section title="Рекомендуемые альтернативы" icon="🔄">
                  <div className="flex flex-wrap gap-2">
                    {entity.recommendedAlternatives.map((alt, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium">
                        {alt}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {entity.relatedTechnologies && entity.relatedTechnologies.length > 0 && (
                <Section title="Связанные технологии" icon="🔗">
                  <div className="flex flex-wrap gap-2">
                    {entity.relatedTechnologies.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Безопасность и соответствие */}
            {(entity.securityVulnerabilities?.length || entity.complianceStandards?.length) && (
              <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
                <Section title="Безопасность и соответствие" icon="🔒">
                  {entity.securityVulnerabilities && entity.securityVulnerabilities.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 block mb-2">🚨 Уязвимости безопасности</span>
                      <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-900 dark:text-gray-100">
                        {entity.securityVulnerabilities.map((vuln, idx) => (
                          <li key={idx} className="pl-1">{vuln}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {entity.complianceStandards && entity.complianceStandards.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">✅ Стандарты соответствия</span>
                      <div className="flex flex-wrap gap-2">
                        {entity.complianceStandards.map((std, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full font-medium">
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Обновление */}
            {(entity.versionToUpdate || entity.versionUpdateDeadline) && (
              <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
                <Section title="Обновление" icon="⬆️">
                  {entity.versionToUpdate ? (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Обновить до версии:</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">{entity.versionToUpdate}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <span className="text-green-600">✅</span> Обновление не требуется
                    </p>
                  )}
                  {entity.versionUpdateDeadline && (
                    <div className={`p-3 rounded-lg ${
                      new Date(entity.versionUpdateDeadline) < new Date()
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : 'bg-blue-50 dark:bg-blue-900/10'
                    }`}>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">⏰ Дедлайн:</p>
                      <p className={`text-sm font-bold ${
                        new Date(entity.versionUpdateDeadline) < new Date()
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {new Date(entity.versionUpdateDeadline).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* Метрики */}
            {(entity.adoptionRate !== undefined || entity.popularityIndex !== undefined || entity.communitySize) && (
              <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
                <Section title="Метрики" icon="📊">
                  {entity.adoptionRate !== undefined && entity.adoptionRate !== null && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">🏢 Внедрение в компании</p>
                      <div className="flex items-end gap-3 mb-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {(entity.adoptionRate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, entity.adoptionRate * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {entity.popularityIndex !== undefined && entity.popularityIndex !== null && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">⭐ Индекс популярности</p>
                      <div className="flex items-end gap-3 mb-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {(entity.popularityIndex * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, entity.popularityIndex * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {entity.communitySize && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">👥 Размер сообщества</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {entity.communitySize.toLocaleString()}
                      </p>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* Ссылки */}
            {(entity.documentationUrl || entity.internalGuideUrl) && (
              <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
                <Section title="Документация" icon="📚">
                  {entity.documentationUrl && (
                    <a
                      href={entity.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <span>📖</span>
                      <span>Официальная документация</span>
                    </a>
                  )}
                  {entity.internalGuideUrl && (
                    <a
                      href={entity.internalGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <span>📘</span>
                      <span>Внутреннее руководство</span>
                    </a>
                  )}
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
