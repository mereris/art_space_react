import React, { useState } from 'react'; //импорт реакта и хука для памяти
import { uploadArtworkImage, createWork } from '../api'; //функция загрузки изображения на сервер и создания работы в бд

//модальное окно создания публикации
function CreatePublicationModal({ onClose, onCreate }) {

  //данные формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technique: 'Масло',
    width: '',
    height: '',
    tags: ''
  });

  const [previewImage, setPreviewImage] = useState(null); //ссылка для предпросмотра
  const [selectedFile, setSelectedFile] = useState(null); //выбранный пользователем файл
  const [fileName, setFileName] = useState(''); //имя файла
  const [isLoading, setIsLoading] = useState(false); //флаг загрузки
  const [error, setError] = useState(''); //ошибка

  //обновление состояния формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  //выбор файла
  const handleFileSelect = (e) => {
    const file = e.target.files[0]; //первый выбранный файл
    if (!file) return; //если файл не выбран

    //проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    //проверка размера файла
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 10 МБ)');
      return;
    }

    setSelectedFile(file); //запоминание выбранного файла
    setFileName(file.name); //запоминание названия
    setError('');

    const reader = new FileReader(); //объект для чтения файлов
    reader.onloadend = () => {
      setPreviewImage(reader.result); //сохранение результата
    };
    reader.readAsDataURL(file);
  };

  //очистка выбранного файла
  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setPreviewImage(null);
  };

  //отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault(); //без перезагрузки
    setError('');

    //если не выбрано изображение
    if (!selectedFile && !previewImage) {
      setError('Пожалуйста, выберите изображение работы');
      return;
    }

    //если не введено название работы
    if (!formData.title.trim()) {
      setError('Пожалуйста, введите название работы');
      return;
    }

    //если не введены размеры
    if (!formData.width || !formData.height) {
      setError('Пожалуйста, укажите размеры работы');
      return;
    }

    setIsLoading(true); //загрузка

    try {

      let imageUrl = null; //ссылка на загруженное изображение

      //если файл выбран
      if (selectedFile) {
        imageUrl = await uploadArtworkImage(selectedFile); //ожидание загрузки
      } else if (previewImage && previewImage.startsWith('data:')) {
        const file = dataURLtoFile(previewImage, 'artwork.jpg'); //для моков
        imageUrl = await uploadArtworkImage(file); //ожидание загрузки
      }

      //создание работы
      const newWork = await createWork({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_name: formData.technique,
        width: parseInt(formData.width),
        height: parseInt(formData.height),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      }, imageUrl);

      console.log('Публикация создана:', newWork);

      if (onCreate) {
        onCreate(newWork); //обновление профиля
      }

      onClose(); //закрытие модального окна

    } catch (err) {
      console.error('Ошибка создания:', err);
      setError(err.message || 'Ошибка при создании публикации');
    } finally {
      setIsLoading(false); //прекращение загрузки
    }
  };

  //вспомогательная функция для моков
  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal create-publication-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Создание публикации</h2>

        {error && (
          <div className="error-message-modal">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* загрузка изображения */}
          <div className="form-group-modal">
            <label className="form-label-required">Фотография работы</label>
            
            {/* предпросмотр изображения */}
            {previewImage && (
              <div className="preview-container">
                <img 
                  src={previewImage} 
                  alt="Предпросмотр работы" 
                  className="preview-image"
                />
                <button 
                  type="button" 
                  className="clear-file-btn"
                  onClick={handleClearFile}
                >
                  Удалить изображение
                </button>
              </div>
            )}

            {/* выбор файла */}
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <input 
                  type="file"
                  className="file-input-hidden"
                  onChange={handleFileSelect}
                  accept="image/*"
                  disabled={isLoading}
                />
              </label>
              
              {/* отображение имени выбранного файла */}
              {fileName && (
                <span className="file-name-display">
                  {fileName}
                </span>
              )}
            </div>

            <small className="file-hint">Поддерживаются: JPG, PNG, GIF, WebP (макс. 10 МБ)</small>
          </div>

          {/* название работы */}
          <div className="form-group-modal">
            <label className="form-label-required">Название работы</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: «Весеннее утро»"
              required
              disabled={isLoading}
              className="form-input"
            />
          </div>

          {/* описание */}
          <div className="form-group-modal">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Расскажите о своей работе..."
              disabled={isLoading}
              className="form-textarea"
            />
          </div>

          {/* техника исполнения */}
          <div className="form-group-modal">
            <label className="form-label-required">Техника исполнения</label>
            <select
              name="technique"
              value={formData.technique}
              onChange={handleChange}
              disabled={isLoading}
              className="form-select"
            >
              <option value="Масло">Масло</option>
              <option value="Акварель">Акварель</option>
              <option value="Акрил">Акрил</option>
              <option value="Графика">Графика</option>
              <option value="Смешанная техника">Смешанная техника</option>
            </select>
          </div>

          {/* размеры */}
          <div className="form-group-modal">
            <label className="form-label-required">Размеры (в сантиметрах)</label>
            <div className="size-inputs">
              <input
                type="number"
                name="width"
                placeholder="Ширина"
                value={formData.width}
                onChange={handleChange}
                disabled={isLoading}
                className="form-input"
                min="1"
              />
              <input
                type="number"
                name="height"
                placeholder="Высота"
                value={formData.height}
                onChange={handleChange}
                disabled={isLoading}
                className="form-input"
                min="1"
              />
            </div>
          </div>

          {/* теги */}
          <div className="form-group-modal">
            <label>Теги (через запятую)</label>
            <input
              type="text"
              name="tags"
              placeholder="пейзаж, природа, лето"
              value={formData.tags}
              onChange={handleChange}
              disabled={isLoading}
              className="form-input"
            />
          </div>

          {/* кнопки действий */}
          <div className="modal-buttons-row">
            <button
              type="button"
              className="btn-modal-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreatePublicationModal; //экспорт модального окна