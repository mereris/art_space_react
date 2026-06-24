import React, { useState, useEffect } from 'react'; //импорт реакта и двух хуков (для хранения памяти и выполнения побочных эффектов)
import { Link } from 'react-router-dom'; //импорт тега-ссылки для навигации без перезагрузки
import { getFavorites } from '../api'; //API-функция для получения списка избранных работ пользователя

//фильтры
const filterOptions = {
  technique: ["Все", "Масло", "Акварель", "Акрил", "Графика", "Смешанная техника"],
  date: ["По умолчанию", "Сначала новые", "Сначала старые"],
  rating: ["Все", "4.5+", "4.0+", "3.5+"],
  tags: ["Все", "пейзаж", "город", "портрет", "абстракция", "ночь", "природа", "море", "цветы", "люди"]
};

//страница избранных работ пользователя
function FavoritesPage() {
  const [favorites, setFavorites] = useState([]); //массив избранных работ
  const [loading, setLoading] = useState(true); //флаг загрузки
  const [error, setError] = useState(''); //сообщение об ошибке
  
  const [searchQuery, setSearchQuery] = useState(""); //поисковой запрос
  const [openFilter, setOpenFilter] = useState(null); //открытый фильтр
  //выбранные фильтры
  const [selectedFilters, setSelectedFilters] = useState({
    technique: "Все",
    date: "По умолчанию",
    rating: "Все",
    tags: "Все"
  });

  //загрузка избранных работ
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true); //идёт загрузка
        const data = await getFavorites(); //ожидание получения всех избранных работ
        setFavorites(data.items || []); //новое значение
      } catch (err) {
        console.error('Ошибка загрузки избранного:', err);
        setError('Не удалось загрузить избранные работы');
      } finally {
        setLoading(false); //отключение загрузки
      }
    };
    
    loadFavorites(); //показ работ на экране
  }, []); //выполнение только один раз при открытии страницы

  //обработчик выбора значения фильтра
  const handleFilterSelect = (filterName, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterName]: value })); //обновление одного фильтра
    setOpenFilter(null); //закрытие выпадающего списка после выбора
  };

  //открытие/закрытие выпадающего списка
  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  //фильтрация и сортировка
  const filteredWorks = favorites
    .filter(work => {
      //проверка поискового запроса
      const matchesSearch = work.title?.toLowerCase().includes(searchQuery.toLowerCase()) || work.author?.toLowerCase().includes(searchQuery.toLowerCase()); //проверка по автору и названию
      //проверка техники
      const matchesTechnique = selectedFilters.technique === "Все" || work.category === selectedFilters.technique;
      
      //проверка рейтинга
      let matchesRating = true; //флаг
      if (selectedFilters.rating !== "Все") {
        const minRating = parseFloat(selectedFilters.rating); //преобразование выбранного рейтинга в вещественное число
        matchesRating = (work.rating || 0) >= minRating; //сравнение
      }
      
      //проверка тегов
      const matchesTags = selectedFilters.tags === "Все" || (work.tags && work.tags.some(tag => tag.includes(selectedFilters.tags)));
      
      return matchesSearch && matchesTechnique && matchesRating && matchesTags; //результат проверки фильтров
    })

    .sort((a, b) => {
      if (selectedFilters.date === "Сначала новые") {
        return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      }
      if (selectedFilters.date === "Сначала старые") {
        return new Date(a.created_at || a.date) - new Date(b.created_at || b.date);
      }
      return 0;
    });
  
  //типы фильтров
  const filterLabels = {technique: "Техника", date: "Дата публикации", rating: "Рейтинг", tags: "Теги"};

  //состояние загрузки
  if (loading) {
    return (
      <div className="favorites-main">
        <h1 className="favorites-title">Избранное</h1>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка избранных работ...</p>
        </div>
      </div>
    );
  }

  //состояние ошибки
  if (error) {
    return (
      <div className="favorites-main">
        <h1 className="favorites-title">Избранное</h1>
        <div className="error-message" style={{
          textAlign: 'center',
          padding: '40px',
          color: '#000'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} //перезагрузка
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-main">
      <h1 className="favorites-title">Избранное</h1> {/* заголовок страницы */}
      
      {/* поисковой запрос */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="gallery-container">
        <div className="filters">
          {/* проход по всем фильтрам */}
          {Object.keys(filterLabels).map(filterKey => (
            <div key={filterKey} className="filter-wrapper">
              {/* кнопка фильтра */}
              <button
                className="filter-btn" 
                onClick={() => toggleFilter(filterKey)}
              >
                {filterLabels[filterKey]} {/* название фильтра */}
                <span className="filter-arrow">
                  {openFilter === filterKey ? "▲" : "▼"}
                </span>
              </button>
              
              {/* открытие выборов, если фильтр открыт */}
              {openFilter === filterKey && (
                <div className="filter-dropdown">
                  {/* пеоебор вариантов */}
                  {filterOptions[filterKey].map(option => (
                    <div
                      key={option}
                      className={`filter-option ${selectedFilters[filterKey] === option ? 'selected' : ''}`}
                      onClick={() => handleFilterSelect(filterKey, option)} //при клике
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="works">
          {/* если пусто по фильтрам */}
          {filteredWorks.length === 0 ? (
            <p className="no-favorites">
              {favorites.length === 0 //если нет избранных работ
                ? "У вас пока нет избранных работ. Добавьте работы в избранное на странице работы!"
                : "По вашему запросу ничего не найдено"}
            </p>
          ) : (
            //перебор всех отфильтрованных работ
            filteredWorks.map(work => (
              <Link 
                to={`/work/${work.id}`} //переход на работу
                key={work.id}
                className="work-link"
              >
                <div className="work-card">
                  <div className="work-image">
                    <img 
                      src={work.image_url || work.image || "/demonstration.jpg"} //картинка
                      alt={work.title} //подпись
                      onError={(e) => {
                        e.target.src = "/demonstration.jpg"; //при ошибке
                      }}
                    />
                  </div>
                  <div className="work-title">
                    <h3>{work.title}</h3> {/* подпись */}
                    <p>{work.author}</p> {/* навтор */}
                    <p style={{ fontSize: "14px", color: "#666" }}>{work.category || work.technique}</p> {/* стиль */}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoritesPage; //экспорт страницы