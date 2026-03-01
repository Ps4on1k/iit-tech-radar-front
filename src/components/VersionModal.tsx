import React, { useEffect, useState } from 'react';
import { versionApi } from '../services/api';
import packageJson from '../../package.json';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  const [backendVersion, setBackendVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const frontendVersion = packageJson.version;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      versionApi
        .getVersion()
        .then((data) => {
          setBackendVersion(data.version);
        })
        .catch((error) => {
          console.error('Ошибка получения версии backend:', error);
          setBackendVersion('неизвестно');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>О системе</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px 16px',
              background: '#f0f7ff',
              borderRadius: '6px',
              border: '1px solid #b3d9ff',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Frontend</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e40af' }}>
              {loading ? 'Загрузка...' : frontendVersion}
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              background: '#fff7ed',
              borderRadius: '6px',
              border: '1px solid #fed7aa',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Backend</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#c2410c' }}>
              {loading ? 'Загрузка...' : backendVersion}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Tech Radar © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
