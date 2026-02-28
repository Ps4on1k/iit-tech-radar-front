import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import type { User } from '../types';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '../components';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

const initialFormData: FormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'user',
};

export const UsersPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      return;
    }
    loadUsers();
  }, [isAdmin, isAuthenticated]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authApi.getUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (editingUser) {
        await authApi.updateUser(editingUser.id, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        setSuccessMessage('Пользователь обновлен');
      } else {
        if (!formData.password) {
          setFormError('Пароль обязателен для нового пользователя');
          return;
        }
        await authApi.createUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        setSuccessMessage('Пользователь создан');
      }
      await loadUsers();
      handleCloseModal();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        setFormError(error.response?.data?.error || 'Ошибка сохранения');
      } else {
        setFormError('Ошибка сохранения');
      }
    }
  };

  const handleSetPassword = async (user: User) => {
    const newPassword = prompt('Введите новый пароль для пользователя:');
    if (!newPassword) return;

    try {
      await authApi.setUserPassword(user.id, newPassword);
      alert('Пароль успешно изменен');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Ошибка смены пароля');
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!confirm(`Вы уверены, что хотите ${user.isActive ? 'заблокировать' : 'разблокировать'} пользователя?`)) {
      return;
    }

    try {
      await authApi.toggleUserStatus(user.id);
      await loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Ошибка изменения статуса');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      await authApi.deleteUser(user.id);
      await loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <PageHeader title="Управление пользователями" subtitle="Создание, редактирование и удаление пользователей" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <PageHeader title="Управление пользователями" subtitle="Создание, редактирование и удаление пользователей" />
      <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={handleOpenCreate}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            background: '#2563eb',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Создать пользователя
        </button>
      </div>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {successMessage && (
          <div style={{ padding: '12px 16px', background: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '16px' }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Users Table */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ФИО</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Роль</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Статус</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1a1a1a' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1a1a1a' }}>{user.firstName} {user.lastName}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '4px',
                      background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                      color: user.role === 'admin' ? '#1e40af' : '#374151',
                    }}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '4px',
                      background: user.isActive ? '#d1fae5' : '#fee2e2',
                      color: user.isActive ? '#065f46' : '#991b1b',
                    }}>
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', color: '#2563eb', background: '#eff6ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleSetPassword(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', color: '#7c3aed', background: '#f5f3ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Сброс пароля
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', color: user.isActive ? '#dc2626' : '#059669', background: user.isActive ? '#fef2f2' : '#ecfdf5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {user.isActive ? 'Заблокировать' : 'Разблокировать'}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleCloseModal}>
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {editingUser ? 'Редактирование пользователя' : 'Создание пользователя'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#666', cursor: 'pointer', padding: '0', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {!editingUser && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Пароль</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    required={!editingUser}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Имя</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Фамилия</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Роль</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: '10px 20px', fontSize: '14px', color: '#374151', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
