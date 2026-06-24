import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserByUsername } from '../api';

function OtherUserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUser(data);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Пользователь не найден');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [username]);

  if (loading) {
    return (
      <div className="profile-main">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-main">
        <h1>Ошибка</h1>
        <p>{error || 'Пользователь не найден'}</p>
        <Link to="/gallery" className="btn-primary">Вернуться в галерею</Link>
      </div>
    );
  }

  return (
    <div className="profile-main">
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-info-block">
            <div className="profile-top-row">
              <div className="left-column">
                <div className="avatar-circle">
                  <img src={user.avatar_url || '/demonstration.jpg'} alt="" />
                </div>
              </div>
              <div className="right-column">
                {/* Имя пользователя */}
                <h2 className="profile-name-display">{user.username}</h2>
                
                {/* ПОЧТА - ПРЯМО ПОД НИКОМ */}
                <p className="profile-name-display">{user.email || 'Email не указан'}</p>
                
                {/* Биография */}
                <p className="profile-description">{user.bio || 'Описание не указано'}</p>
              </div>
            </div>
          </div>

          {/* Работы пользователя */}
          {user.artworks && user.artworks.length > 0 && (
            <div className="user-works-section">
              <h2 className="works-heading">Работы автора</h2>
              <div className="works">
                {user.artworks.map(work => (
                  <Link to={`/work/${work.id}`} key={work.id} className="work-link">
                    <div className="work-card">
                      <div className="work-image">
                        <img 
                          src={work.image_url || '/demonstration.jpg'} 
                          alt={work.title}
                          onError={(e) => { e.target.src = '/demonstration.jpg'; }}
                        />
                      </div>
                      <div className="work-title">
                        <h3>{work.title}</h3>
                        <p>{work.category || work.technique}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(!user.artworks || user.artworks.length === 0) && (
            <div className="user-works-section">
              <p className="no-works-message">У пользователя пока нет работ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtherUserProfilePage;