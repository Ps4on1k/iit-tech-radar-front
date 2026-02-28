import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { importApi } from '../services/api';
import type { TechRadarEntity } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components';

interface ValidationResult {
  valid: boolean;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: Array<{ index: number; errors: string[] }>;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  updated?: number;
  errors: Array<{ index: number; error: string }>;
}

export const ImportPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'skip' | 'update' | 'overwrite'>('update');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    setValidationResult(null);
    setImportResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!jsonContent) {
      setError('Загрузите JSON файл для валидации');
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setImportResult(null);

      let data: TechRadarEntity[];
      try {
        data = JSON.parse(jsonContent);
      } catch (err) {
        setError('Неверный формат JSON');
        return;
      }

      if (!Array.isArray(data)) {
        setError('JSON должен содержать массив технологий');
        return;
      }

      const result = await importApi.validateTechRadar(data);
      setValidationResult(result);

      if (!result.valid) {
        setError(`Найдено ошибок: ${result.invalidRecords}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Ошибка валидации');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!jsonContent) {
      setError('Загрузите JSON файл для импорта');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: TechRadarEntity[];
      try {
        data = JSON.parse(jsonContent);
      } catch (err) {
        setError('Неверный формат JSON');
        return;
      }

      if (!Array.isArray(data)) {
        setError('JSON должен содержать массив технологий');
        return;
      }

      const result = await importApi.importTechRadar(data, {
        skipExisting: importMode === 'skip',
        updateExisting: importMode === 'update' || importMode === 'overwrite',
      });

      // Backend возвращает { message, result } при успехе
      // result содержит { success, imported, skipped, updated, errors }
      if (result.result?.success || result.message) {
        setImportResult(result.result || result);
        setShouldRedirect(true);
      } else {
        setImportResult(result.result || result);
        setError('Импорт завершен с ошибками');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; result?: ImportResult } } };
      setError(error.response?.data?.error || 'Ошибка импорта');
      if (error.response?.data?.result) {
        setImportResult(error.response.data.result);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await importApi.exportTechRadar();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tech-radar-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Ошибка экспорта');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonFile(null);
    setJsonContent('');
    setValidationResult(null);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Эффект для редиректа после успешного импорта
  React.useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
    }
  }, [shouldRedirect, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <PageHeader title="Импорт/Экспорт техрадара" subtitle="Загрузка данных из JSON файла или выгрузка текущих данных" />
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            background: loading ? '#9ca3af' : '#059669',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Экспорт...' : 'Экспортировать JSON'}
        </button>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Upload Section */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>Загрузка JSON файла</h2>

          <div
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f9fafb',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p style={{ color: '#374151', fontSize: '14px', marginBottom: '8px' }}>
              {jsonFile ? jsonFile.name : 'Перетащите файл сюда или кликните для выбора'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Только JSON файлы</p>
          </div>

          {jsonContent && (
            <div style={{ marginTop: '20px' }}>
              {/* Switch для режима импорта */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Режим импорта:</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Skip existing */}
                  <button
                    onClick={() => setImportMode('skip')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: importMode === 'skip' ? '#7c3aed' : '#e5e7eb',
                      background: importMode === 'skip' ? '#f5f3ff' : 'white',
                      color: importMode === 'skip' ? '#7c3aed' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${importMode === 'skip' ? '#7c3aed' : '#d1d5db'}`,
                        background: importMode === 'skip' ? '#7c3aed' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {importMode === 'skip' && (
                          <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>Пропускать</div>
                        <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>Не изменять существующие</div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Update existing */}
                  <button
                    onClick={() => setImportMode('update')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: importMode === 'update' ? '#7c3aed' : '#e5e7eb',
                      background: importMode === 'update' ? '#f5f3ff' : 'white',
                      color: importMode === 'update' ? '#7c3aed' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${importMode === 'update' ? '#7c3aed' : '#d1d5db'}`,
                        background: importMode === 'update' ? '#7c3aed' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {importMode === 'update' && (
                          <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>Обновлять</div>
                        <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>Изменять существующие</div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Overwrite */}
                  <button
                    onClick={() => setImportMode('overwrite')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: importMode === 'overwrite' ? '#dc2626' : '#e5e7eb',
                      background: importMode === 'overwrite' ? '#fef2f2' : 'white',
                      color: importMode === 'overwrite' ? '#dc2626' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${importMode === 'overwrite' ? '#dc2626' : '#d1d5db'}`,
                        background: importMode === 'overwrite' ? '#dc2626' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {importMode === 'overwrite' && (
                          <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ color: '#dc2626' }}>Заменить всё</div>
                        <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>Полная замена данных</div>
                      </div>
                    </div>
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  {importMode === 'skip' && 'ⓘ Существующие записи будут пропущены, новые — добавлены'}
                  {importMode === 'update' && 'ⓘ Существующие записи будут обновлены, новые — добавлены'}
                  {importMode === 'overwrite' && '⚠ Все существующие записи будут заменены данными из файла'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleValidate}
                  disabled={validating || loading}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'white',
                    background: validating ? '#9ca3af' : '#7c3aed',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: validating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {validating ? 'Валидация...' : 'Проверить данные'}
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading || validating}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'white',
                    background: loading ? '#9ca3af' : '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Импорт...' : 'Импортировать'}
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading || validating}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Очистить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>Результаты валидации</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Всего записей</p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{validationResult.totalRecords}</p>
              </div>
              <div style={{ padding: '16px', background: validationResult.valid ? '#d1fae5' : '#fee2e2', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: validationResult.valid ? '#065f46' : '#991b1b', margin: '0 0 8px 0' }}>Валидные</p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: validationResult.valid ? '#047857' : '#b91c1c', margin: 0 }}>{validationResult.validRecords}</p>
              </div>
              <div style={{ padding: '16px', background: validationResult.invalidRecords > 0 ? '#fee2e2' : '#d1fae5', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: validationResult.invalidRecords > 0 ? '#991b1b' : '#065f46', margin: '0 0 8px 0' }}>Невалидные</p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: validationResult.invalidRecords > 0 ? '#b91c1c' : '#047857', margin: 0 }}>{validationResult.invalidRecords}</p>
              </div>
              <div style={{ padding: '16px', background: validationResult.valid ? '#d1fae5' : '#fef3c7', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: validationResult.valid ? '#065f46' : '#92400e', margin: '0 0 8px 0' }}>Статус</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: validationResult.valid ? '#047857' : '#b45309', margin: 0 }}>
                  {validationResult.valid ? '✓ Все валидно' : '✕ Есть ошибки'}
                </p>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Ошибки</h3>
                <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', borderBottom: idx === validationResult.errors.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#b91c1c', margin: '0 0 4px 0' }}>Запись #{err.index + 1}</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280' }}>
                        {err.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>Результаты импорта</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: '#d1fae5', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: '#065f46', margin: '0 0 8px 0' }}>Импортировано</p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: '#047857', margin: 0 }}>{importResult.imported}</p>
              </div>
              {importResult.updated !== undefined && (
                <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#1e40af', margin: '0 0 8px 0' }}>Обновлено</p>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#1e40af', margin: 0 }}>{importResult.updated}</p>
                </div>
              )}
              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 8px 0' }}>Пропущено</p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: '#b45309', margin: 0 }}>{importResult.skipped}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>Ошибки импорта</h3>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', borderBottom: idx === importResult.errors.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#b91c1c', margin: 0 }}>Запись #{err.index + 1}: {err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.success && importResult.errors.length === 0 && (
              <div style={{ padding: '12px 16px', background: '#d1fae5', color: '#065f46', borderRadius: '6px' }}>
                ✓ Импорт успешно завершен!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
