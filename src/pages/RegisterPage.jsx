// src/pages/RegisterPage.jsx
import React, { useState } from 'react'; //импорт реакта и хука для памяти
import { Link, useNavigate } from 'react-router-dom'; //для навигации
import { register } from '../api'; //API-функция для создания нового пользователя

//страница регистрации
function RegisterPage() {

  //состояния
  const navigate = useNavigate(); //для перехода на другие страницы
  const [selectedRole, setSelectedRole] = useState(null); //выбранная роль
  const [username, setUsername] = useState(''); //имя пользователя
  const [email, setEmail] = useState(''); //логин
  const [password, setPassword] = useState(''); //пароль
  const [confirmPassword, setConfirmPassword] = useState(''); //подтверждение пароля
  const [isLoading, setIsLoading] = useState(false); //флаг загрузки
  const [error, setError] = useState(''); //ошибка

  //отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault(); //без перезагрузки страницы
    setError('');

    //проверка имени пользователя
    if (!username.trim()) {
      setError('Пожалуйста, введите имя пользователя!');
      return;
    }
    //проверка подтверждения пароля
    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }
    //проверка выбранной роли
    if (!selectedRole) {
      setError('Пожалуйста, выберите роль!');
      return;
    }
    //проверка количества символов
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов!');
      return;
    }

    setIsLoading(true); //загрузка

    try {

      const roleMap = {'Художник': 'Artist', 'Зритель': 'Viewer'};

      //данные пользователя
      const userData = {
        username: username,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        role: roleMap[selectedRole]
      };

      await register(userData); //ожидание отправки данных
      navigate('/profile'); //переход в профиль

    } catch (error) {
      console.error('Ошибка регистрации:', error);
      setError(error.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false); //прекращение загрузки
    }
  };

  return (
    <div className="register-main">
      <h1 className="register-title">Регистрация</h1>
      <div className="auth-box">
        <div className="role-selection">
          <h2 className="role-title">Выберите роль</h2>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${selectedRole === 'Художник' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('Художник')}
            >
              Художник
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'Зритель' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('Зритель')}
            >
              Зритель
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">Имя пользователя *</label>
            <input
              type="text"
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Электронная почта *</label>
            <input
              type="email"
              id="reg-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Пароль *</label>
            <input
              type="password"
              id="reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm">Повторите пароль *</label>
            <input
              type="password"
              id="reg-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <Link to="/login" className="btn-secondary">Войти</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage; //экспорт страницы