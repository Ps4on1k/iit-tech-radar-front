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

const QUADRANTS: { name: string; type: TechRadarType; angle: number }[] = [
  { name: 'Фреймворки', type: 'фреймворк', angle: 45 },
  { name: 'Инструменты', type: 'инструмент', angle: 135 },
  { name: 'Языки', type: 'язык программирования', angle: 225 },
  { name: 'Библиотеки', type: 'библиотека', angle: 315 },
];

const CATEGORY_RADII: Record<TechRadarCategory, number> = {
  adopt: 0.3,
  trial: 0.5,
  assess: 0.7,
  hold: 0.85,
  drop: 1.0,
};

export const TechRadarChart: React.FC<RadarChartProps> = ({ data, radarCategory, radarType, onPointClick, onFilter }) => {
  const selectedCategory = radarCategory;
  const selectedType = radarType;
  const [hoveredCluster, setHoveredCluster] = useState<{ x: number; y: number; entities: TechRadarEntity[] } | null>(null);

  const size = 625;
  const center = size / 2;
  const maxRadius = (size / 2) - 60;

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
  }, [data, selectedCategory, selectedType, maxRadius]);

  const handlePointClick = (cluster: typeof clusteredData[0]) => {
    if (cluster.entities.length === 1 && onPointClick) {
      onPointClick(cluster.entities[0]);
    } else {
      if (onFilter) onFilter(cluster.category, cluster.type);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-8 text-center transition-colors duration-200">
        <p className="text-gray-500 dark:text-gray-400">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 transition-colors duration-200">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[625px] mx-auto" style={{ maxHeight: '625px' }}>
        {/* Фон */}
        <circle cx={center} cy={center} r={maxRadius} fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />

        {/* Кольца категорий */}
        {(Object.values(CATEGORY_RADII) as number[]).map((ratio, idx) => {
          const radius = ratio * maxRadius;
          return (
            <circle key={idx} cx={center} cy={center} r={radius} fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
          );
        })}

        {/* Линии квадрантов */}
        <line x1={center} y1={0} x2={center} y2={size} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
        <line x1={0} y1={center} x2={size} y2={center} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />

        {/* Подписи квадрантов */}
        {QUADRANTS.map((quadrant) => {
          const labelAngle = (quadrant.angle - 90) * (Math.PI / 180);
          const labelRadius = maxRadius + 25;
          const labelX = center + Math.cos(labelAngle) * labelRadius;
          const labelY = center + Math.sin(labelAngle) * labelRadius;
          return (
            <text key={quadrant.name} x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="13" className="fill-gray-700 dark:fill-gray-300 font-semibold">
              {quadrant.name}
            </text>
          );
        })}

        {/* Подписи категорий */}
        {Object.entries(CATEGORY_RADII).map(([category, ratio]) => {
          const labelRadius = ratio * maxRadius;
          return (
            <text key={category} x={center + 10} y={center - labelRadius + 4} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
              {category}
            </text>
          );
        })}

        {/* Точки технологий */}
        {clusteredData.map((cluster, idx) => {
          const count = cluster.entities.length;
          const pointRadius = count === 1 ? 6 : 10 + Math.min(count * 1.2, 10);
          const color = CATEGORY_COLORS[cluster.category];

          return (
            <g
              key={idx}
              onClick={() => handlePointClick(cluster)}
              onMouseEnter={() => setHoveredCluster({ x: cluster.x, y: cluster.y, entities: cluster.entities })}
              onMouseLeave={() => setHoveredCluster(null)}
              style={{ cursor: count === 1 ? 'pointer' : 'zoom-in' }}
            >
              <circle cx={cluster.x} cy={cluster.y} r={pointRadius} fill={color} stroke="white" strokeWidth="2" opacity="0.8" style={{ pointerEvents: 'none' }} />
              <circle cx={cluster.x} cy={cluster.y} r={pointRadius * 0.4} fill="white" opacity="0.3" style={{ pointerEvents: 'none' }} />
              {count > 1 && (
                <text x={cluster.x} y={cluster.y + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" style={{ pointerEvents: 'none' }}>
                  {count}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredCluster && (
          <g>
            <rect x={hoveredCluster.x + 15} y={hoveredCluster.y - 10} width="200" height={Math.max(50, 30 + hoveredCluster.entities.length * 22)} fill="white" className="stroke-gray-200 dark:stroke-gray-600" strokeWidth="1" rx="6" opacity="0.98" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            {hoveredCluster.entities.map((entity, idx) => (
              <g key={idx}>
                <circle cx={hoveredCluster.x + 25} cy={hoveredCluster.y + 15 + (idx * 22)} r="4" fill={CATEGORY_COLORS[entity.category]} />
                <text x={hoveredCluster.x + 35} y={hoveredCluster.y + 19 + (idx * 22)} fontSize="11" className="fill-gray-900 dark:fill-gray-100">
                  {entity.name} <tspan className="fill-gray-500 dark:fill-gray-400">v{entity.version}</tspan>
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Легенда категорий */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {(Object.keys(CATEGORY_COLORS) as TechRadarCategory[]).map(category => (
          <button
            key={category}
            onClick={() => {
              if (selectedCategory === category) {
                if (onFilter) onFilter(undefined, undefined);
              } else {
                if (onFilter) onFilter(category, selectedType);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors ${selectedCategory === category ? 'bg-opacity-20' : 'bg-transparent'}`}
            style={{ background: selectedCategory === category ? CATEGORY_COLORS[category] + '20' : 'transparent' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
            <span className={`text-xs ${selectedCategory === category ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              {category}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
        Кликните на точку для фильтрации по типу и категории (или просмотра деталей если одна технология)
      </p>
    </div>
  );
};
