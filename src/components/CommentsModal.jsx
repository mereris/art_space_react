import React, { useState, useEffect } from 'react'; //импорт реакта и двух хуков (для хранения данных и загрузки комментариев при открытии окна)
import { getComments, addComment } from '../api'; //импорт функций получения всех комментариев к работе и добавления комментария

//модальное окно с комментариями
function CommentsModal({ onClose, workId, workTitle }) {

  //состояния

  const [comments, setComments] = useState([]); //массив комментариев

  const [newComment, setNewComment] = useState(''); //текст комментария в поле ввода

  const [loading, setLoading] = useState(true); //флаг загрузки

  const [isSubmitting, setIsSubmitting] = useState(false); //проверка отправки комментария

  const [error, setError] = useState(''); //текст ошибки

  //загрузка комментариев
  useEffect(() => {

    let isMounted = true; //проверка нахождения компонента на экране

    const loadComments = async () => {
      try {
        setLoading(true); //загрузка
        setError('');
        const data = await getComments(workId); //ожидание получения всех комментариев к работе
        //если компонент еще открыт
        if (isMounted) {
          setComments(data.items || data || []); //полученные комментарии
        }
      } catch (err) {
        console.error('Ошибка загрузки комментариев:', err);
        if (isMounted) {
          setError('Не удалось загрузить комментарии');
          setComments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false); //прекращение загрузки
        }
      }
    };

    loadComments(); //вывод комментариев в окне

    //при закрытии окна
    return () => {
      isMounted = false; //флаг меняется
    };
  }, [workId]); //у определённой работы

  //отправка комментария
  const handleAddComment = async (e) => {

    e.preventDefault(); //без перезагрузки страницы
    
    if (!newComment.trim() || isSubmitting) return; //если комментарий пустой или уже отправляется
    
    setIsSubmitting(true); //блокирование кнопки отправки
    setError(''); //очистка старой ошибки
    
    try {

      const result = await addComment(workId, newComment); //ожидание отправки комментария
      
      setComments(prev => {
        const exists = prev.some(c => c.id === result.id);
        if (exists) return prev; //проверка на дубликат
        return [...prev, result]; //добавление нового комментария в список
      });
      
      setNewComment(''); //очистка поля ввода
    } catch (err) {
      console.error('Ошибка отправки комментария:', err);
      setError(err.message || 'Ошибка при отправке комментария');
    } finally {
      setIsSubmitting(false); //разблокирована кнопка отправки
    }
  };

  //форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return ''; //проверка переданной строки
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric', //день - числом
        month: 'long', //месяц - полным названием
        year: 'numeric' //год -числом
      });
    } catch {
      return ''; //при возникновении ошибки во время форматирования
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}> {/* закрытие окна при нажатии на затемненный задний фон */}
      <div className="modal comments-modal" onClick={(e) => e.stopPropagation()}> {/* чтобы клик по окну не закрыл его */}
        <div className="comments-modal-header">
          <h2>Комментарии к работе "{workTitle}"</h2>
          <button className="comments-close-btn" onClick={onClose}>×</button>
        </div>

        {/* список комментариев */}
        <div className="comments-list">
          {/* проверка загрузки */}
          {loading ? (
            <div className="loading-indicator loading-container">
              <div className="spinner"></div>
              <p>Загрузка комментариев...</p>
            </div>
            //проверка ошибки
          ) : error ? (
            <p className="comments-error" style={{ textAlign: 'center', padding: '40px' }}>{error}</p>
            //проверка наличия комментариев
          ) : comments.length === 0 ? (
            <p className="empty-comments">Пока нет комментариев. Будьте первым!</p>
          ) : (
            comments.map((comment, index) => (
              <div key={comment.id || index} className="comment-item">
                <div className="comment-header">
                  <strong className="comment-author"> {/* автор комментария */}
                    {comment.author?.username || comment.author || 'Аноним'}
                  </strong>
                  {/* если поле с датой существует */}
                  {comment.created_at && (
                    <small className="comment-date">
                      {formatDate(comment.created_at)}
                    </small>
                  )}
                </div>
                <p className="comment-text">  {/* текст комментария */}
                  {comment.text || comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        <form className="comments-form" onSubmit={handleAddComment}> {/* форма для комментария */}
          <textarea //многострочное поле для ввода
            className="comments-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows="3"
            disabled={isSubmitting} //пока отправляется, поле заблокировано
          />
          {error && <div className="comments-error">{error}</div>} {/* ошибка */}
          <button
            type="submit"
            className="btn-modal-primary comments-submit-btn"
            disabled={!newComment.trim() || isSubmitting} //кнопка активна, когда есть текст или не отправляем
          >
            {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal; //экспорт компонента