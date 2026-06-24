// src/pages/GalleryPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getWorks } from '../api';

const PER_PAGE = 24;

function GalleryPage() {
  const [works, setWorks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    technique: 'Все',
    date: 'По умолчанию',
    rating: 'Все',
    tags: 'Все'
  });

  const observer = useRef();

  // ✅ Мемоизируем фильтры, чтобы избежать лишних ререндеров
  const filtersKey = useMemo(() => JSON.stringify({
    search: searchQuery,
    ...selectedFilters
  }), [searchQuery, selectedFilters]);

  // ✅ Правильный ref для последнего элемента
  const lastWorkRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      rootMargin: '200px' // Загружаем заранее
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Загрузка работ
  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getWorks({
          page: page,
          per_page: PER_PAGE,
          search: searchQuery || undefined,
          category: selectedFilters.technique !== 'Все' ? selectedFilters.technique : undefined,
          sort: selectedFilters.date === 'Сначала новые' ? 'newest' :
                 selectedFilters.date === 'Сначала старые' ? 'oldest' : undefined,
          min_rating: selectedFilters.rating !== 'Все' ? parseFloat(selectedFilters.rating) : undefined,
          tag: selectedFilters.tags !== 'Все' ? selectedFilters.tags : undefined
        });

        // ✅ Правильное обновление списка
        setWorks(prev => {
          if (page === 1) return result.items || [];
          
          // Убираем дубликаты по id
          const existingIds = new Set(prev.map(w => w.id));
          const newItems = (result.items || []).filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        
        // ✅ Вычисляем hasMore из ответа бэкенда
        if (result.pages) {
          setHasMore(page < result.pages);
        } else if (result.hasMore !== undefined) {
          setHasMore(result.hasMore);
        } else {
          setHasMore((result.items || []).length === PER_PAGE);
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить работы. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadWorks();
  }, [page, filtersKey]); // ✅ Зависим от строки, а не от объекта

  // Сброс пагинации при изменении фильтров
  useEffect(() => {
    setPage(1);
    setWorks([]);
    setHasMore(true);
  }, [filtersKey]);

  const handleFilterSelect = (filterName, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
    setOpenFilter(null);
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const filterOptions = {
    technique: ['Все', 'Масло', 'Акварель', 'Акрил', 'Графика', 'Смешанная техника'],
    date: ['По умолчанию', 'Сначала новые', 'Сначала старые'],
    rating: ['Все', '4.5+', '4.0+', '3.5+'],
    tags: ['Все', 'пейзаж', 'город', 'портрет', 'абстракция', 'ночь', 'природа', 'море', 'цветы', 'люди']
  };

  const filterLabels = {
    technique: 'Техника',
    date: 'Дата публикации',
    rating: 'Рейтинг',
    tags: 'Теги'
  };

  const getWorkImage = (work) => work.image_url || work.image || '/demonstration.jpg';
  const getWorkAuthor = (work) => typeof work.author === 'object' ? work.author.username : work.author;
  const getWorkCategory = (work) => work.category || work.technique;

  return (
    <div className="gallery-main">
      <div className="search-container">
        <input
          type="text"  // ✅ ИСПРАВЛЕНО: было typ14:15...e="text"
          className="search-input"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="gallery-container">
        {/* Фильтры */}
        <div className="gallery-sidebar">
          <div className="filters">
            {Object.keys(filterLabels).map(filterKey => (
              <div key={filterKey} className="filter-wrapper">
                <button className="filter-btn" onClick={() => toggleFilter(filterKey)}>
                  {filterLabels[filterKey]}
                  <span className="filter-arrow">
                    {openFilter === filterKey ? "▲" : "▼"}
                  </span>
                </button>
                
                {openFilter === filterKey && (
                  <div className="filter-dropdown">
                    {filterOptions[filterKey].map(option => (
                      <div
                        key={option}
                        className={`filter-option ${selectedFilters[filterKey] === option ? 'selected' : ''}`}
                        onClick={() => handleFilterSelect(filterKey, option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Сетка работ */}
        <div className="works">
          {error && (
            <div className="error-message" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#e74c3c', padding: '40px' }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '20px' }}>
                Попробовать снова
              </button>
            </div>
          )}
          
          {!error && works.length === 0 && !loading && (
            <p className="no-works-message">Работы не найдены</p>
          )}
          
          {!error && works.map((work, index) => {
            const isLast = index === works.length - 1;
            return (
              <Link 
                to={`/work/${work.id}`} 
                key={work.id}  // ✅ Стабильный key
                className="work-link"
                ref={isLast ? lastWorkRef : null}
              >
                <div className="work-card">
                  <div className="work-image">
                    <img 
                      src={getWorkImage(work)} 
                      alt={work.title}
                      onError={(e) => {
                        e.target.src = "/demonstration.jpg";
                      }}
                    />
                  </div>
                  <div className="work-title">
                    <h3>{work.title}</h3>
                    <p>{getWorkAuthor(work)}</p>
                    <p style={{ fontSize: "14px", color: "#666" }}>{getWorkCategory(work)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка работ...</p>
        </div>
      )}

      {!hasMore && works.length > 0 && !loading && (
        <p className="all-loaded-message"> Вы просмотрели все работы </p>
      )}
    </div>
  );
}

export default GalleryPage;