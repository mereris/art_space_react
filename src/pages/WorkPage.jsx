import React, { useState, useEffect } from 'react'; //импорт реакта и двух хуков (для хранения памяти и выполнения побочных эффектов)
import { useParams, Link } from 'react-router-dom'; //хуки для получения параметров из URL и навигации
import { getWorkById, likeWork, unlikeWork, addToFavorites, removeFromFavorites } from '../api';
import CommentsModal from '../components/CommentsModal'; //импорт модального окна с комментариями

function WorkPage() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //состояние для модального окна комментариев
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const workData = await getWorkById(id);
        
        setWork(workData);
        setLikesCount(workData.likes_count || 0);
        setIsLiked(workData.is_liked || false);
        setIsFavorite(workData.is_favorite || false);
      } catch (err) {
        console.error('Ошибка загрузки работы:', err);
        setError(err.message || 'Не удалось загрузить работу');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const result = await unlikeWork(id);
        setIsLiked(false);
        setLikesCount(result.likes_count || likesCount - 1);
      } else {
        const result = await likeWork(id);
        setIsLiked(true);
        setLikesCount(result.likes_count || likesCount + 1);
      }
    } catch (err) {
      console.error('Ошибка лайка:', err);
      alert('Ошибка: ' + err.message);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Ошибка избранного:', err);
      alert('Ошибка: ' + err.message);
    }
  };

  //состояние загрузки
  if (loading) {
    return (
      <div className="work-page">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка работы...</p>
        </div>
      </div>
    );
  }

  //состояние ошибки
  if (error) {
    return (
      <div className="work-page">
        <h1>Ошибка</h1>
        <p>{error}</p>
        <Link to="/gallery" className="btn-primary">Вернуться в галерею</Link>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="work-page">
        <h1>Работа не найдена</h1>
        <Link to="/gallery" className="btn-primary">Вернуться в галерею</Link>
      </div>
    );
  }

  const imageUrl = work.image_url || work.image || '/demonstration.jpg';
  const technique = work.category || work.technique || 'Не указана';
  const authorName = work.author?.username || work.author || 'Неизвестный автор';

  return (
    <div className="work-page">
      <div className="work-container">
        <div className="work-image-large">
          <img 
            src={imageUrl} 
            alt={work.title}
            onError={(e) => {
              e.target.src = '/demonstration.jpg';
            }}
          />
        </div>
        <div className="work-info">
          <Link to={`/profile/${work.author?.username || work.author}`} className="work-author-link">
            <div className="author-name">{authorName}</div>
            <div className="author-hint">Нажмите, чтобы перейти в профиль автора</div>
          </Link>

          <h1 className="work-title-large">{work.title}</h1>

          <p className="work-description">{work.description || 'Описание не указано'}</p>

          <p className="work-date">
            Опубликовано: {work.created_at ? new Date(work.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
          </p>

          <div className="work-details">
            <p><strong>Техника:</strong> {technique}</p>
            {work.width && work.height && (
              <p><strong>Размер:</strong> {work.width} × {work.height} см</p>
            )}
            {work.rating > 0 && (
              <p><strong>Рейтинг:</strong> {work.rating}</p>
            )}
          </div>

          {/* Теги */}
          {work.tags && work.tags.length > 0 && (
            <div className="work-tags">
              <strong>Теги:</strong>
              {work.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="work-actions">
            <button
              className="btn-action"
              onClick={handleLike}
            >
              {isLiked ? '❤️' : '🤍'} {likesCount}
            </button>
            <button
              className="btn-action"
              onClick={handleFavorite}
            >
              {isFavorite ? '⭐ В избранном' : '☆ В избранное'}
            </button>
            {/* открытие модального окна */}
            <button
              className="btn-action"
              onClick={() => setShowCommentsModal(true)}
            >
              Комментарии ({work.comments_count || 0})
            </button>
          </div>
        </div>
      </div>

      {/* окно комментариев */}
      {showCommentsModal && (
        <CommentsModal
          onClose={() => setShowCommentsModal(false)}
          workId={id}
          workTitle={work.title}
        />
      )}
    </div>
  );
}

export default WorkPage; //экспорт страницы