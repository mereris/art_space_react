// src/api.js
const USE_MOCK = false; // для бэкенда
const API_BASE = 'http://localhost:5000'; // адрес бэкенда

// мок данные, когда USE_MOCK=true
let MOCK_WORKS = [
  { id: 1, title: "Весенний пейзаж", description: "Красивый весенний пейзаж", image_url: "/demonstration.jpg", author: { username: "daria_artist" }, category: "Масло", width: 80, height: 60, created_at: "2026-06-01", rating: 4.5, likes_count: 15, tags: ["#пейзаж", "#природа"] },
  { id: 2, title: "Портрет девушки", description: "Портрет незнакомки", image_url: "/demonstration.jpg", author: { username: "daria_artist" }, category: "Акварель", width: 50, height: 70, created_at: "2026-06-05", rating: 4.8, likes_count: 23, tags: ["#портрет", "#люди"] },
  { id: 3, title: "Закат", description: "Закат над морем", image_url: "/demonstration.jpg", author: { username: "daria_artist" }, category: "Масло", width: 100, height: 80, created_at: "2026-06-03", rating: 4.2, likes_count: 8, tags: ["#пейзаж", "#море"] },
];

let MOCK_USER = {
  id: 1,
  username: "daria_artist",
  email: "daria@example.com",
  role: "Artist",
  bio: "Люблю писать пейзажи",
  avatar_url: "/default-avatar.jpg",
  artworks: MOCK_WORKS
};

let MOCK_FAVORITES = [];

// вспомогательные функции
const delay = () => new Promise(resolve => setTimeout(resolve, 300));

// вспомогательная функция для реальных запросов
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка запроса');
  }
  
  return data;
};

// === АВТОРИЗАЦИЯ ===

export const register = async (userData) => {
  if (USE_MOCK) {
    await delay();
    console.log("Mock register:", userData);
    
    const token = "mock-token-" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
      id: 2,
      username: userData.username,
      email: userData.email,
      role: userData.role,
    }));
    
    return { access_token: token, message: "Регистрация успешна" };
  }
  
  // реальный запрос
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password,
      role: userData.role,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка регистрации');
  }

  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }

  return data;
};

export const login = async (email, password) => {
  if (USE_MOCK) {
    await delay();
    console.log("Mock login:", email, password);
    
    const token = "mock-token-" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(MOCK_USER));
    
    return { access_token: token, user: MOCK_USER };
  }
  
  // реальный запрос
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка входа');
  }

  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// === ПРОФИЛЬ ===

export const getCurrentUser = async () => {
  if (USE_MOCK) {
    await delay();
    
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      return { ...JSON.parse(savedUser), artworks: MOCK_WORKS };
    }
    
    return { ...MOCK_USER, artworks: MOCK_WORKS };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Не авторизован');
  }

  const response = await fetch(`${API_BASE}/profile/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(data.message || 'Ошибка загрузки профиля');
  }

  return data;
};

export const updateUser = async (formData) => {
  if (USE_MOCK) {
    await delay();
    
    const username = formData.get("username");
    const bio = formData.get("bio");
    
    if (username) MOCK_USER.username = username;
    if (bio) MOCK_USER.bio = bio;
    
    localStorage.setItem("user", JSON.stringify(MOCK_USER));
    
    return { message: "Профиль обновлён" };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/profile/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка обновления профиля');
  }

  return data;
};

// === РАБОТЫ ===

export const uploadArtworkImage = async (file) => {
  if (USE_MOCK) {
    await delay();
    console.log("Mock upload:", file.name);
    return "/uploads/artworks/mock-image.jpg";
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/artworks/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка загрузки изображения');
  }
  
  return data.image_url;
};

export const createWork = async (workData, imageUrl) => {
  if (USE_MOCK) {
    await delay();
    console.log("Mock createWork:", workData, imageUrl);
    
    const newWork = {
      id: Date.now(),
      title: workData.title,
      description: workData.description,
      image_url: imageUrl,
      author: { username: MOCK_USER.username },
      category: workData.category_name,
      width: workData.width,
      height: workData.height,
      created_at: new Date().toISOString(),
      rating: 0,
      likes_count: 0,
      tags: workData.tags || []
    };
    
    MOCK_WORKS.unshift(newWork);
    
    return { message: "Работа создана", artwork_id: newWork.id };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const categoryMap = {
    'Масло': 1,
    'Акварель': 2,
    'Акрил': 3,
    'Графика': 4,
    'Смешанная техника': 5
  };
  
  const response = await fetch(`${API_BASE}/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: workData.title,
      description: workData.description,
      image_url: imageUrl,
      category_id: categoryMap[workData.category_name] || 1,
      width: workData.width,
      height: workData.height,
      tags: workData.tags || [],
    }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка создания работы');
  }
  
  return data;
};

export const getWorks = async (filters = {}) => {
  if (USE_MOCK) {
    await delay();
    
    let filtered = [...MOCK_WORKS];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchLower) ||
        w.author.username.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.category && filters.category !== "Все") {
      filtered = filtered.filter(w => w.category === filters.category);
    }
    
    if (filters.tag && filters.tag !== "Все") {
      filtered = filtered.filter(w => w.tags.includes(`#${filters.tag}`));
    }
    
    if (filters.sort === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sort === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    const page = filters.page || 1;
    const per_page = filters.per_page || 24;
    const start = (page - 1) * per_page;
    const end = start + per_page;
    const items = filtered.slice(start, end);
    
    return {
      items: items,
      total: filtered.length,
      currentPage: page,
      totalPages: Math.ceil(filtered.length / per_page),
      hasMore: end < filtered.length
    };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page);
  if (filters.per_page) params.append('per_page', filters.per_page);
  if (filters.category) params.append('category', filters.category);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.author) params.append('author', filters.author);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.min_rating) params.append('min_rating', filters.min_rating);
  
  const queryString = params.toString();
  const url = `${API_BASE}/artworks${queryString ? `?${queryString}` : ''}`;
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка загрузки работ');
  }
  
  return {
    items: data.items || [],
    total: data.total || 0,
    currentPage: data.page || 1,
    totalPages: data.pages || 1,
    hasMore: (data.page || 1) < (data.pages || 1),
  };
};

export const getWorkById = async (workId) => {
  if (USE_MOCK) {
    await delay();
    
    const work = MOCK_WORKS.find(w => w.id === parseInt(workId));
    if (!work) throw new Error("Работа не найдена");
    
    const isFavorite = MOCK_FAVORITES.includes(work.id);
    
    return {
      ...work,
      is_favorite: isFavorite,
      is_liked: false
    };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/artworks/${workId}`, { headers });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Работа не найдена');
  }
  
  return data;
};

export const deleteWork = async (workId) => {
  if (USE_MOCK) {
    await delay();
    console.log("Mock deleteWork:", workId);
    
    MOCK_WORKS = MOCK_WORKS.filter(w => w.id !== parseInt(workId));
    MOCK_USER.artworks = MOCK_WORKS;
    
    return { message: "Работа удалена" };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/artworks/${workId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка удаления работы');
  }
  
  return data;
};

// === ЛАЙКИ ===

export const likeWork = async (workId) => {
  if (USE_MOCK) {
    await delay();
    const work = MOCK_WORKS.find(w => w.id === parseInt(workId));
    if (work) {
      work.likes_count++;
    }
    return { likes_count: work?.likes_count || 0 };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/likes/${workId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка при постановке лайка');
  }
  
  return data;
};

export const unlikeWork = async (workId) => {
  if (USE_MOCK) {
    await delay();
    const work = MOCK_WORKS.find(w => w.id === parseInt(workId));
    if (work && work.likes_count > 0) {
      work.likes_count--;
    }
    return { likes_count: work?.likes_count || 0 };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/likes/${workId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка при удалении лайка');
  }
  
  return data;
};

// === ИЗБРАННОЕ ===

export const addToFavorites = async (workId) => {
  if (USE_MOCK) {
    await delay();
    if (!MOCK_FAVORITES.includes(parseInt(workId))) {
      MOCK_FAVORITES.push(parseInt(workId));
    }
    return { message: "Добавлено в избранное" };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/favorites/${workId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка добавления в избранное');
  }
  
  return data;
};

export const removeFromFavorites = async (workId) => {
  if (USE_MOCK) {
    await delay();
    MOCK_FAVORITES = MOCK_FAVORITES.filter(id => id !== parseInt(workId));
    return { message: "Удалено из избранного" };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/favorites/${workId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка удаления из избранного');
  }
  
  return data;
};

export const getFavorites = async () => {
  if (USE_MOCK) {
    await delay();
    const favoriteWorks = MOCK_WORKS.filter(w => MOCK_FAVORITES.includes(w.id));
    return { items: favoriteWorks };
  }
  
  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/profile/me/favorites`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка загрузки избранного');
  }
  
  return { items: Array.isArray(data) ? data : [] };
};

// === КОММЕНТАРИИ ===

const MOCK_COMMENTS = {};

export const getComments = async (workId) => {
  if (USE_MOCK) {
    await delay();
    return { items: MOCK_COMMENTS[workId] || [] };
  }
  
  // реальный запрос
  const response = await fetch(`${API_BASE}/comments/${workId}`);
  const data = await response.json();
  
  if (!response.ok) {
    return { items: [] };
  }
  
  const items = Array.isArray(data) ? data.map(c => ({
    id: c.id,
    text: c.content,
    author: { username: c.author },
    created_at: c.created_at,
  })) : [];
  
  return { items };
};

export const addComment = async (workId, text) => {
  if (USE_MOCK) {
    await delay();
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const username = currentUser.username || MOCK_USER.username;
    
    const newComment = {
      id: Date.now(),
      text: text,
      author: { username: username },
      created_at: new Date().toISOString()
    };
    
    if (!MOCK_COMMENTS[workId]) MOCK_COMMENTS[workId] = [];
    MOCK_COMMENTS[workId].push(newComment);
    
    return newComment;
  }

  // реальный запрос
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/comments/${workId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content: text }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка отправки комментария');
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return {
    id: data.comment_id,
    text: text,
    author: { username: currentUser.username || 'Пользователь' },
    created_at: new Date().toISOString(),
  };
};

// === СОБЫТИЯ ===

export const getEvents = async () => {
  if (USE_MOCK) {
    await delay();
    return [
      { id: 1, date: "18-20 сентября 2026", title: "Viennacontemporary 2026", description: "Международная ярмарка современного искусства", place: "Вена, Австрия" },
      { id: 2, date: "23-28 сентября 2026", title: "Contemporary Istanbul 2026", description: "Международная ярмарка современного искусства в Турции", place: "Стамбул, Турция" },
      { id: 3, date: "24-28 сентября 2026", title: "Estampa 2026", description: "Международная ярмарка современного эстампа и печатной графики", place: "Мадрид, Испания" }
    ];
  }
  
  // реальный запрос
  const response = await fetch(`${API_BASE}/news`);
  const data = await response.json();
  
  if (!response.ok) {
    return [];
  }
  
  return data.map(item => ({
    id: item.id,
    date: item.event_date ? new Date(item.event_date).toLocaleDateString('ru-RU') : '',
    title: item.title,
    description: item.content,
    place: item.place || 'Место не указано',
  }));
};

// === ПРОФИЛЬ ДРУГОГО ПОЛЬЗОВАТЕЛЯ ===

// ✅ ИСПРАВЛЕНО: реальный запрос вынесен из mock-ветки
export const getUserByUsername = async (username) => {
  if (USE_MOCK) {
    await delay();
    if (username === MOCK_USER.username) {
      return { ...MOCK_USER, artworks: MOCK_WORKS };
    }
    return { 
      id: 999, 
      username: username, 
      bio: 'Описание не указано',
      avatar_url: '/demonstration.jpg',
      artworks: []
    };
  }

  // ✅ реальный запрос теперь ОТДЕЛЬНО от mock-ветки
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/profile/${username}`, {
    headers: headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Пользователь не найден');
  }
  return data;
};
export const deleteAccount = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/profile/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка удаления аккаунта');
  }
  
  // Очищаем localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  return data;
};