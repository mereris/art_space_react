import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { AuthContext } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { loadUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log('🔐 Попытка входа:', email);
      
      // 1. Вход
      const loginData = await login(email, password);
      console.log('✅ Вход успешен:', loginData);
      
      // 2. Загрузка пользователя
      await loadUser();
      console.log('✅ loadUser завершён');
      
      // 3. Перенаправление
      navigate('/profile');
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      setError(error.message || 'Неверный email или пароль');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-main">
      <h1 className="register-title">Вход</h1>
      <div className="auth-box">
        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ 
              color: 'red', 
              marginBottom: '15px', 
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="login-email">Электронная почта</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            <Link to="/register" className="btn-secondary">Зарегистрироваться</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;