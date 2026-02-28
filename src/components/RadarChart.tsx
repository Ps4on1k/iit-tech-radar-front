import React, { useMemo, useState } from 'react';
import type { TechRadarEntity, TechRadarCategory, TechRadarType } from '../types';

interface RadarChartProps {
  data: TechRadarEntity[];
  radarCategory?: TechRadarCategory;
  radarType?: TechRadarType;
  onPointClick?: (entity: TechRadarEntity) => void;
  onFilter?: (category?: TechRadarCategory, type?: TechRadarType) => void;
}

const CATEGORY_COLORS: Record<TechRadarCategory, string> = {
  adopt: '#00C49F',
  trial: '#4DB8FF',
  assess: '#FFBB28',
  hold: '#FF8042',
  drop: '#FF4444',
};

// Позиции квадрантов (центр квадранта в градусах)
const QUADRANTS: { name: string; type: TechRadarType; angle: number }[] = [
  { name: 'Фреймворки', type: 'фреймворк', angle: 45 },
  { name: 'Инструменты', type: 'инструмент', angle: 135 },
  { name: 'Языки', type: 'язык программирования', angle: 225 },
  { name: 'Библиотеки', type: 'библиотека', angle: 315 },
];

// Радиусы для категорий (в процентах от максимального радиуса)
const CATEGORY_RADII: Record<TechRadarCategory, number> = {
  adopt: 0.3,
  trial: 0.5,
  assess: 0.7,
  hold: 0.85,
  drop: 1.0,
};

export const TechRadarChart: React.FC<RadarChartProps> = ({ data, radarCategory, radarType, onPointClick, onFilter }) => {
  // Используем внешние фильтры из props
  const selectedCategory = radarCategory;
  const selectedType = radarType;
  const [hoveredCluster, setHoveredCluster] = useState<{ x: number; y: number; entities: TechRadarEntity[] } | null>(null);

  // Параметры SVG (увеличено на 25%)
  const size = 625;
  const center = size / 2;
  const maxRadius = (size / 2) - 60;

  // Группируем данные по позиции (type + category)
  const clusteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = data;
    if (selectedCategory) filtered = filtered.filter(d => d.category === selectedCategory);
    if (selectedType) filtered = filtered.filter(d => d.type === selectedType);

    const clusters = new Map<string, {
      angle: number;
      radius: number;
      x: number;
      y: number;
      entities: TechRadarEntity[];
      category: TechRadarCategory;
      type: TechRadarType;
    }>();

    filtered.forEach(entity => {
      const quadrant = QUADRANTS.find(q => q.type === entity.type);
      if (!quadrant) return;

      const angleRad = (quadrant.angle - 90) * (Math.PI / 180);
      const radius = CATEGORY_RADII[entity.category] * maxRadius;
      const x = center + Math.cos(angleRad) * radius;
      const y = center + Math.sin(angleRad) * radius;

      const key = `${entity.type}-${entity.category}`;
      
      if (!clusters.has(key)) {
        clusters.set(key, {
          angle: quadrant.angle,
          radius,
          x,
          y,
          entities: [],
          category: entity.category,
          type: entity.type,
        });
      }
      
      clusters.get(key)!.entities.push(entity);
    });

    return Array.from(clusters.values());
  }, [data, selectedCategory, selectedType, maxRadius, center]);

  const handlePointClick = (cluster: { category: TechRadarCategory; type: TechRadarType; entities: TechRadarEntity[] }) => {
    if (cluster.entities.length === 1 && onPointClick) {
      onPointClick(cluster.entities[0]);
    } else {
      // Если уже выбран этот кластер - сбрасываем фильтры
      if (selectedCategory === cluster.category && selectedType === cluster.type) {
        if (onFilter) onFilter(undefined, undefined);
      } else {
        if (onFilter) onFilter(cluster.category, cluster.type);
      }
    }
  };

  const clearFilters = () => {
    if (onFilter) onFilter(undefined, undefined);
  };

  return (
    <div style={{ width: '100%', background: 'white', borderRadius: '8px', padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>
          Технический Радар: {data.length} технологий
        </h2>
        {(selectedCategory || selectedType) && (
          <button
            onClick={clearFilters}
            style={{
              padding: '6px 12px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }}>
          {/* Концентрические круги */}
          {(Object.keys(CATEGORY_RADII) as TechRadarCategory[]).map((category) => {
            const r = CATEGORY_RADII[category] * maxRadius;
            return (
              <circle
                key={category}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={CATEGORY_COLORS[category]}
                strokeWidth="1.5"
                opacity="0.3"
              />
            );
          })}

          {/* Оси */}
          <line x1={center} y1={0} x2={center} y2={size} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={0} y1={center} x2={size} y2={center} stroke="#e5e7eb" strokeWidth="1" />

          {/* Подписи квадрантов */}
          {QUADRANTS.map((q) => {
            const labelRadius = maxRadius * 0.85;
            const angleRad = (q.angle - 90) * (Math.PI / 180);
            const x = center + Math.cos(angleRad) * labelRadius;
            const y = center + Math.sin(angleRad) * labelRadius;
            return (
              <text
                key={q.type}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="bold"
                fill="#6b7280"
              >
                {q.name}
              </text>
            );
          })}

          {/* Точки */}
          {clusteredData.map((cluster, i) => {
            const color = CATEGORY_COLORS[cluster.category];
            const count = cluster.entities.length;
            const pointRadius = 10 + (count * 2);
            
            return (
              <g key={i}>
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={pointRadius + 5}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePointClick(cluster)}
                  onMouseEnter={() => setHoveredCluster({ x: cluster.x, y: cluster.y, entities: cluster.entities })}
                  onMouseLeave={() => setHoveredCluster(null)}
                />
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={pointRadius}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.8"
                  style={{ pointerEvents: 'none' }}
                />
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={pointRadius * 0.4}
                  fill="white"
                  opacity="0.3"
                  style={{ pointerEvents: 'none' }}
                />
                {count > 1 && (
                  <text
                    x={cluster.x}
                    y={cluster.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredCluster && (
            <g>
              <rect
                x={hoveredCluster.x + 15}
                y={hoveredCluster.y - 10}
                width="200"
                height={Math.max(50, 30 + hoveredCluster.entities.length * 22)}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
                rx="6"
                opacity="0.98"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              {hoveredCluster.entities.map((entity, idx) => (
                <g key={idx}>
                  <circle cx={hoveredCluster.x + 25} cy={hoveredCluster.y + 15 + (idx * 22)} r="4" fill={CATEGORY_COLORS[entity.category]} />
                  <text x={hoveredCluster.x + 35} y={hoveredCluster.y + 19 + (idx * 22)} fontSize="11" fill="#1f2937">
                    {entity.name} <tspan fill="#6b7280">v{entity.version}</tspan>
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Легенда категорий */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        {(Object.keys(CATEGORY_COLORS) as TechRadarCategory[]).map(category => (
          <button
            key={category}
            onClick={() => {
              // Если уже выбрана эта категория - сбрасываем
              if (selectedCategory === category) {
                if (onFilter) onFilter(undefined, undefined);
              } else {
                if (onFilter) onFilter(category, selectedType);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              border: 'none',
              background: selectedCategory === category ? CATEGORY_COLORS[category] + '20' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: CATEGORY_COLORS[category] }} />
            <span style={{ fontSize: '13px', color: selectedCategory === category ? '#1f2937' : '#6b7280' }}>
              {category}
            </span>
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
        Кликните на точку для фильтрации по типу и категории (или просмотра деталей если одна технология)
      </p>
    </div>
  );
};
