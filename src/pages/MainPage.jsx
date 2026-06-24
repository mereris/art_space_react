// src/pages/MainPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MainPage() {
  // ✅ Получаем user из контекста
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="main-page-container">
      <div className="text-content">
        <h1>Твой путь в мир искусства</h1>
        <p>
          Присоединяйтесь к сообществу художников со всего мира.
          Делитесь работами, вдохновляйтесь и находите единомышленников.
        </p>
        <div className="buttons">
          {/* ✅ Используем user вместо isAuthenticated */}
          {user ? (
            <Link to="/profile" className="btn-primary">Мой профиль</Link>
          ) : (
            <Link to="/register" className="btn-primary">Зарегистрироваться</Link>
          )}
          <Link to="/gallery" className="btn-secondary">Смотреть работы</Link>
        </div>
      </div>
      <div className="image-content">
        <img src="/demonstration.jpg" alt="Демонстрационная работа" />
      </div>
    </div>
  );
}

export default MainPage;