import React, { useState, useEffect } from 'react'; //импорт реакта и двух хуков (для хранения памяти и выполнения побочных эффектов)
import { getEvents } from '../api'; //импорт функции с событиями

//страница со списком событий
function EventsPage() {
  const [events, setEvents] = useState([]); //объявление переменной состояния массива событий
  const [loading, setLoading] = useState(true); //объявление переменной состояния загрузки
  const [error, setError] = useState(''); //объявление переменной состояния ошибки

  //загрузка событий
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true); //загрузка
        const data = await getEvents(); //ожидание получения всех событий
        setEvents(data); //полученные события
      } catch (err) {
        console.error('Ошибка загрузки событий:', err);
        setError('Не удалось загрузить события');
      } finally {
        setLoading(false); //окончание загрузки
      }
    };
    
    loadEvents(); //показ событий
  }, []); //выполнение только один раз

  //состояние загрузки
  if (loading) {
    return (
      <div className="events-main">
        <h1 className="events-title">События</h1>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка событий...</p>
        </div>
      </div>
    );
  }

  //состояние ошибки
  if (error) {
    return (
      <div className="events-main">
        <h1 className="events-title">События</h1>
        <div className="error-message" style={{ textAlign: 'center', padding: '40px', color: '#000' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '20px' }}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-main">
      <h1 className="events-title">События</h1> {/* заголовок страницы */}
      <div className="events-list"> {/* список событий */}
        {events.length === 0 ? (
          <p className="no-events" style={{ textAlign: 'center', padding: '40px' }}>Нет предстоящих событий</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-date">Дата начала: <span>{event.date}</span></div> {/* дата мероприятия */}
              <div className="event-info">
                <h3 className="event-title">{event.title}</h3> {/* название мероприятия */}
                <p className="event-description">{event.description}</p> {/* описание */}
                <p className="event-place">Место проведения: {event.place}</p> {/* место проведения */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventsPage; //экспорт страницы