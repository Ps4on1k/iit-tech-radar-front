import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VersionModal } from './VersionModal';

export const Navbar: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const [showVersionModal, setShowVersionModal] = useState(false);

  if (!auth.isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          {auth.user?.role === 'manager' && (
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
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          {auth.user?.role === 'manager' && (
            <span style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '4px',
              background: '#dbeafe',
              color: '#1e40af',
            }}>
              Менеджер
            </span>
          )}
          <span style={{ color: '#666', fontSize: '14px' }}>
            {auth.user?.firstName} {auth.user?.lastName}
          </span>
          <button
            onClick={() => {
              console.log('Version button clicked!');
              setShowVersionModal(true);
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: '#2563eb',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="О системе (версии)"
          >
            ?
          </button>
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
      <VersionModal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)} />
    </nav>
  );
};
