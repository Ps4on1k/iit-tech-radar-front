import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  const auth = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>Tech Radar</Link>
            {auth.isAdmin && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link
                  to="/users"
                  style={{
                    fontSize: '14px',
                    color: isActive('/users') ? '#2563eb' : '#666',
                    textDecoration: 'none',
                    fontWeight: isActive('/users') ? 600 : 400,
                  }}
                >
                  Пользователи
                </Link>
                <Link
                  to="/import"
                  style={{
                    fontSize: '14px',
                    color: isActive('/import') ? '#2563eb' : '#666',
                    textDecoration: 'none',
                    fontWeight: isActive('/import') ? 600 : 400,
                  }}
                >
                  Импорт/Экспорт
                </Link>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {auth.isAdmin && (
              <span style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                background: '#dbeafe',
                color: '#1e40af',
              }}>
                Администратор
              </span>
            )}
            <span style={{ color: '#666', fontSize: '14px' }}>
              {auth.user?.firstName} {auth.user?.lastName}
            </span>
            <button
              onClick={() => auth.logout()}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#666',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {title && (
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{title}</h1>
          )}
          {subtitle && (
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>{subtitle}</p>
          )}
        </div>
      </div>
    </nav>
  );
};
