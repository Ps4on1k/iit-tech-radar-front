import React, { useState, useMemo } from 'react';
import type { TechRadarEntity, TechRadarCategory, TechRadarType } from '../types';

interface TechRadarTableProps {
  data: TechRadarEntity[];
  radarCategory?: TechRadarCategory;
  radarType?: TechRadarType;
  onRowClick?: (entity: TechRadarEntity) => void;
  onRadarFilter?: (category?: TechRadarCategory, type?: TechRadarType) => void;
}

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

type SortField = 'name' | 'version' | 'category' | 'riskLevel' | 'type' | 'subtype' | 'license' | 'owner';
type SortOrder = 'asc' | 'desc';

export const TechRadarTable: React.FC<TechRadarTableProps> = ({ data, radarCategory, radarType, onRowClick, onRadarFilter }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    name: '',
    version: '',
    category: '',
    riskLevel: '',
    type: '',
    subtype: '',
    license: '',
    owner: '',
  });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredData = useMemo(() => {
    return data.filter(entity => {
      const nameMatch = entity.name.toLowerCase().includes(filters.name.toLowerCase());
      const versionMatch = entity.version.toLowerCase().includes(filters.version.toLowerCase());
      const categoryMatch = !filters.category || entity.category === filters.category;
      const riskMatch = !filters.riskLevel || entity.riskLevel === filters.riskLevel;
      const typeMatch = !filters.type || entity.type === filters.type;
      const subtypeMatch = !filters.subtype || entity.subtype === filters.subtype;
      const licenseMatch = !filters.license || entity.license.toLowerCase().includes(filters.license.toLowerCase());
      const ownerMatch = entity.owner.toLowerCase().includes(filters.owner.toLowerCase());
      return nameMatch && versionMatch && categoryMatch && riskMatch && typeMatch && subtypeMatch && licenseMatch && ownerMatch;
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortField] || '').toLowerCase();
      const bVal = String(b[sortField] || '').toLowerCase();
      const cmp = aVal.localeCompare(bVal, 'ru');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const uniqueTypes = useMemo(() => Array.from(new Set(data.map(d => d.type))), [data]);
  const uniqueSubtypes = useMemo(() => Array.from(new Set(data.map(d => d.subtype).filter(Boolean))), [data]);
  const uniqueCategories = useMemo(() => Array.from(new Set(data.map(d => d.category))), [data]);
  const uniqueRisks = useMemo(() => Array.from(new Set(data.map(d => d.riskLevel))), [data]);

  const clearFilters = () => {
    setFilters({ name: '', version: '', category: '', riskLevel: '', type: '', subtype: '', license: '', owner: '' });
    setPage(1);
    if (onRadarFilter) {
      onRadarFilter(undefined, undefined);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: '4px' }}>⇅</span>;
    return <span style={{ marginLeft: '4px' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!data || data.length === 0) {
    return <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Нет данных</p>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Индикатор активных фильтров радара */}
      {(radarCategory || radarType) && (
        <div style={{ padding: '10px 16px', background: '#eff6ff', borderBottom: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {radarCategory && (
              <span style={{ padding: '4px 10px', background: CATEGORY_COLORS[radarCategory] + '20', color: CATEGORY_COLORS[radarCategory], borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
                Категория: {radarCategory}
              </span>
            )}
            {radarType && (
              <span style={{ padding: '4px 10px', background: '#3b82f620', color: '#3b82f6', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
                Тип: {radarType}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            style={{ padding: '4px 10px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            ✕ Сбросить
          </button>
        </div>
      )}
      
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
        {/* Фильтры в порядке колонок */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Название..."
            value={filters.name}
            onChange={(e) => { setFilters({ ...filters, name: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            placeholder="Версия..."
            value={filters.version}
            onChange={(e) => { setFilters({ ...filters, version: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          />
          <select
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Все категории</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.riskLevel}
            onChange={(e) => { setFilters({ ...filters, riskLevel: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Все риски</option>
            {uniqueRisks.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Все типы</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filters.subtype}
            onChange={(e) => { setFilters({ ...filters, subtype: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          >
            <option value="">Все подтипы</option>
            {uniqueSubtypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            placeholder="Лицензия..."
            value={filters.license}
            onChange={(e) => { setFilters({ ...filters, license: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            placeholder="Владелец..."
            value={filters.owner}
            onChange={(e) => { setFilters({ ...filters, owner: e.target.value }); setPage(1); }}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Найдено: {filteredData.length} из {data.length}
          </span>
          <button
            onClick={clearFilters}
            style={{ padding: '6px 12px', fontSize: '13px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th onClick={() => handleSort('name')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Название <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('version')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Версия <SortIcon field="version" />
              </th>
              <th onClick={() => handleSort('category')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Категория <SortIcon field="category" />
              </th>
              <th onClick={() => handleSort('riskLevel')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Риск <SortIcon field="riskLevel" />
              </th>
              <th onClick={() => handleSort('type')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Тип <SortIcon field="type" />
              </th>
              <th onClick={() => handleSort('subtype')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Подтип <SortIcon field="subtype" />
              </th>
              <th onClick={() => handleSort('license')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Лицензия <SortIcon field="license" />
              </th>
              <th onClick={() => handleSort('owner')} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                Владелец <SortIcon field="owner" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((entity) => (
              <tr 
                key={entity.id}
                onClick={() => onRowClick?.(entity)}
                style={{ borderBottom: '1px solid #e5e7eb', cursor: onRowClick ? 'pointer' : 'default' }}
                onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (onRowClick) e.currentTarget.style.background = 'white'; }}
              >
                <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                  <span style={{ fontWeight: '500' }}>{entity.name}</span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                  <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{entity.version}</span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '9999px', background: CATEGORY_COLORS[entity.category] + '20', color: CATEGORY_COLORS[entity.category], fontWeight: '500', fontSize: '11px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: CATEGORY_COLORS[entity.category] }} />
                    {entity.category}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '9999px', background: RISK_COLORS[entity.riskLevel] + '20', color: RISK_COLORS[entity.riskLevel], fontWeight: '500', fontSize: '11px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: RISK_COLORS[entity.riskLevel] }} />
                    {entity.riskLevel}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{entity.type}</td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{entity.subtype || '—'}</td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{entity.license}</td>
                <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280' }}>{entity.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Показывать:</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={9999}>Все</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => goToPage(1)} disabled={page === 1} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Первая</button>
          <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>←</button>
          <span style={{ fontSize: '12px', padding: '0 8px' }}>Стр. {page} из {totalPages || 1}</span>
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>→</button>
          <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Последняя</button>
        </div>
      </div>
    </div>
  );
};
