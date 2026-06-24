import React, { useState } from 'react'; //импорт реакта и хука для памяти
import { deleteWork } from '../api'; //импорт функции удаления работы

//модальное окно удаления публикации
function DeletePublicationModal({ onClose, onDelete, works }) {

  //состояния
  const [selectedWork, setSelectedWork] = useState(null); //выбранная работа
  const [isLoading, setIsLoading] = useState(false); //флаг загрузки
  const [error, setError] = useState(''); //ошибка

  //удаление публикации
  const handleDelete = async () => {
    //если работа не выбрана
    if (!selectedWork) {
      setError("Пожалуйста, выберите работу для удаления!");
      return;
    }

    setIsLoading(true); //загрузка
    setError('');

    try {
      await deleteWork(selectedWork.id); //ожидание удаления публикации
      console.log("Публикация удалена:", selectedWork.title);
      
      onDelete(); //обновление списка работ в профиле
      onClose();  //закрытие модального окна
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setError(error.message || 'Ошибка удаления публикации');
    } finally {
      setIsLoading(false); //прекращение загрузки
    }
  };

  //получения ссылки изображения
  const getImageUrl = (work) => {
    return work.image_url || work.image || '/demonstration.jpg';
  };

  //получение техники
  const getTechnique = (work) => {
    return work.category || work.technique || 'Без категории';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-publication-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Удаление публикации</h2>
        <p className="modal-text">Выберите работу, которую хотите удалить. Эта работа будет безвозвратно удалена.</p>

        {/* если есть ошибка */}
        {error && (
          <div style={{
            backgroundColor: '#ffe6e6',
            color: '#e74c3c',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* список работ */}
        <div className="works-select-list">
          {works.length === 0 ? (
            <p className="no-works">У вас пока нет публикаций</p>
          ) : (
            works.map(work => (
              <div
                key={work.id}
                className={`work-select-item ${selectedWork?.id === work.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedWork(work);
                  setError('');
                }}
              >
                <div className="work-select-image">
                  <img 
                    src={getImageUrl(work)} 
                    alt={work.title}
                    onError={(e) => {
                      e.target.src = '/demonstration.jpg';
                    }}
                  />
                </div>
                <div className="work-select-info">
                  <p className="work-select-title">{work.title}</p>
                  <p className="work-select-technique">{getTechnique(work)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* выбранная для удаления работа */}
        {selectedWork && (
          <div className="publication-title-input">
            <input type="text" value={selectedWork.title} readOnly />
          </div>
        )}

        <div className="modal-buttons-row">
          <button 
            className="btn-modal-secondary" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            className="btn-modal-danger" 
            onClick={handleDelete} //вызов удаления
            disabled={!selectedWork || isLoading}
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePublicationModal; //экспорт компонента