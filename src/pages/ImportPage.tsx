import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { importApi } from '../services/api';
import type { TechRadarEntity } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useNotification } from '../hooks/useNotification';

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
  errors?: Array<{ index: number; id?: string; message: string }>;
}

export const ImportPage: React.FC = () => {
  const { isAdminOrManager, isAuthenticated } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'skip' | 'update' | 'overwrite'>('skip');
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

      // Передаем параметры импорта для корректной валидации
      // overwrite не требует ID, update и skip - требуют
      const result = await importApi.validateTechRadar(data, {
        skipExisting: importMode === 'skip',
        updateExisting: importMode === 'update',
        overwrite: importMode === 'overwrite',
      });
      setValidationResult(result);

      if (!result.valid) {
        setError(`Найдено ошибок: ${result.invalidRecords}`);
      }
    } catch {
      setError('Ошибка валидации');
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
        updateExisting: importMode === 'update',
        overwrite: importMode === 'overwrite',
      });

      setImportResult(result);

      if (result.success) {
        notification.success(`Импортировано ${result.imported} записей`, { title: 'Импорт завершен' });
        setShouldRedirect(true);
      } else {
        const errorMsg = result.errors?.[0]?.message || 'Импорт завершен с ошибками';
        notification.error(errorMsg, { title: 'Ошибка импорта' });
        setError('Импорт завершен с ошибками');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMsg = error.response?.data?.error || 'Ошибка импорта';
      notification.error(errorMsg, { title: 'Ошибка' });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await importApi.exportTechRadar();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tech-radar-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notification.success('Экспорт успешно выполнен', { title: 'Экспорт' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Ошибка экспорта';
      notification.error(errorMsg, { title: 'Ошибка' });
      setError(errorMsg);
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

  React.useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
    }
  }, [shouldRedirect, navigate]);

  if (!isAuthenticated || !isAdminOrManager) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1a1a2e] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Импорт/Экспорт техрадара</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Загрузка данных из JSON файла или выгрузка текущих данных</p>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={handleExport} disabled={loading} variant="success">
            📥 Экспортировать в JSON
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload */}
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Загрузка файла</h2>
            
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         dark:file:bg-blue-900/20 dark:file:text-blue-400
                         hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              />
            </div>

            {jsonFile && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Файл:</span> {jsonFile.name}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Размер:</span> {(jsonFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleValidate} disabled={!jsonContent || validating || loading} variant="primary">
                {validating ? 'Проверка...' : 'Проверить'}
              </Button>
              <Button onClick={handleClear} disabled={!jsonContent || loading} variant="secondary">
                Очистить
              </Button>
            </div>
          </div>

          {/* Import Mode */}
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Режим импорта</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setImportMode('skip')}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  importMode === 'skip'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    importMode === 'skip' ? 'border-purple-600 bg-purple-600' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {importMode === 'skip' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Пропускать</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Не изменять существующие</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setImportMode('update')}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  importMode === 'update'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    importMode === 'update' ? 'border-purple-600 bg-purple-600' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {importMode === 'update' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Обновлять</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Изменять существующие</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setImportMode('overwrite')}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  importMode === 'overwrite'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    importMode === 'overwrite' ? 'border-red-600 bg-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {importMode === 'overwrite' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Перезаписать</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Удалить все и записать новые</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-6 bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Результаты валидации</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Всего</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{validationResult.totalRecords}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Валидно</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{validationResult.validRecords}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Ошибки</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-200">{validationResult.invalidRecords}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Статус</p>
                <p className={`text-lg font-bold ${validationResult.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {validationResult.valid ? '✓ Валидно' : '✕ Ошибки'}
                </p>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ошибки валидации</h3>
                <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Запись #{err.index + 1}</p>
                      <ul className="mt-1 space-y-1">
                        {err.errors.map((e, i) => (
                          <li key={i} className="text-xs text-red-500 dark:text-red-300">• {e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleImport}
                disabled={!validationResult.valid || loading}
                variant="primary"
              >
                {loading ? 'Импорт...' : 'Импортировать'}
              </Button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="mt-6 bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Результаты импорта</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Импортировано</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{importResult.imported}</p>
              </div>
              {importResult.updated !== undefined && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Обновлено</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{importResult.updated}</p>
                </div>
              )}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Пропущено</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{importResult.skipped}</p>
              </div>
            </div>

            {(importResult.errors && importResult.errors.length > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ошибки импорта</h3>
                <div className="max-h-48 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Запись #{err.index + 1}: {err.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.success && (!importResult.errors || importResult.errors.length === 0) && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                ✓ Импорт успешно завершен!
              </div>
            )}

            {!importResult.success && importResult.imported > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                ⚠ Импорт завершен с ошибками. Импортировано записей: {importResult.imported}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
