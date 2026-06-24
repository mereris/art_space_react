import React, { useState, useEffect, useRef } from 'react'; //импорт реакта и трех хуков для памяти, побочных эффектов и ссылки
import { Link, useNavigate } from 'react-router-dom'; //для навигации
import { getCurrentUser, updateUser, deleteWork, getFavorites, getWorks, deleteAccount } from '../api'; //импорт функций получения данных текущего пользователя,
// обновления профиля, удаления работы, получения избранного
import CreatePublicationModal from '../components/CreatePublicationModal'; //импорт модального окна для создания публикации
import DeletePublicationModal from '../components/DeletePublicationModal'; //импорт модального окна для удаления публикации

//мок-данные
//const CURRENT_MOCK_USER = MOCK_USER;

//страница профиля
function ProfilePage() {
  const navigate = useNavigate(); //для навигации между страницами
  const fileInputRef = useRef(null); //ссылка на input для загрузки аватара
  const [userData, setUserData] = useState(null); //данные пользователя
  const [userWorks, setUserWorks] = useState([]); //работы пользователя, если художник
  const [loading, setLoading] = useState(true); //флаг загрузки
  const [error, setError] = useState(''); //ошибка
  const [isEditing, setIsEditing] = useState(false); //режим редактирования профиля
  const [showDeleteModal, setShowDeleteModal] = useState(false); //удаление аккаунта
  const [showCreateModal, setShowCreateModal] = useState(false); //создание публикации
  const [showDeletePublicationModal, setShowDeletePublicationModal] = useState(false); //удаление публикации
  const [avatarPreview, setAvatarPreview] = useState('/demonstration.jpg'); //аватар

  //загрузка профиля
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        //данные пользователя
        const user = await getCurrentUser();
        setUserData(user);
        
        //работы приходят в поле artworks
        const artworks = user.artworks || [];
        setUserWorks(artworks);
        
        setAvatarPreview(user.avatar_url || '/demonstration.jpg');
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError(err.message || 'Не удалось загрузить профиль');
        
        //заглушка при ошибке
        setUserData(CURRENT_MOCK_USER);
        setUserWorks(CURRENT_MOCK_USER.role === 'Artist' ? MOCK_USER_WORKS : []);
        setAvatarPreview(CURRENT_MOCK_USER.avatar_url || '/demonstration.jpg');
      } finally {
        setLoading(false);
      }
    };

    loadProfile(); //показ профиля
  }, []);

  //выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('token'); //удаление токена
    localStorage.removeItem('user'); //удаление данных пользователя
    navigate('/login'); //перенаправление на страницу входа
  };

  //удаление аккаунта
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      alert('Аккаунт удалён!');
      setShowDeleteModal(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/'); //перенаправление на главную
    } catch (err) {
      console.error('Ошибка удаления аккаунта:', err);
      alert('Ошибка удаления аккаунта');
    }
  };

  //редактирование профиля
  const handleEdit = () => setIsEditing(true);

  //сохранение данных
  const handleSave = async () => {
    try {
      const formData = new FormData(); //для отправки файла
      formData.append('username', userData.username || '');
      formData.append('bio', userData.bio || userData.description || '');
      
      //новый файл аватара
      if (fileInputRef.current?.files?.[0]) {
        formData.append('avatar', fileInputRef.current.files[0]);
      }
      
      await updateUser(formData); //ожидание обновления
      setIsEditing(false);
      
      //перезагрузка данных
      const updatedUser = await getCurrentUser();
      setUserData(updatedUser);
      setAvatarPreview(updatedUser.avatar_url || '/demonstration.jpg');
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      alert('Не удалось обновить профиль: ' + err.message);
    }
  };

  //отмена
  const handleCancel = () => {
    //возврат последних сохраненных данных
    getCurrentUser().then(user => {
      setUserData(user);
      setAvatarPreview(user.avatar_url || '/demonstration.jpg');
    }).catch(() => {
      setUserData(CURRENT_MOCK_USER);
      setAvatarPreview(CURRENT_MOCK_USER.avatar_url || '/demonstration.jpg');
    });
    setIsEditing(false);
  };

  //изменение полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  //изменение аватара
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  //обновление списка работ при создании публикации
  const handleCreatePublication = async (newWork) => {
    try {
      const user = await getCurrentUser();
      setUserWorks(user.artworks || []);
    } catch (err) {
      console.error('Ошибка обновления списка работ:', err);
    }
  };

  //обновление списка работ при удалении публикации
  const handleDeletePublication = async () => {
    try {
      const user = await getCurrentUser();
      setUserWorks(user.artworks || []);
    } catch (err) {
      console.error('Ошибка обновления списка работ:', err);
    }
  };

  //проверка роли
  const isArtist = userData?.role === 'Artist' || userData?.role === 'Художник';
  const isViewer = userData?.role === 'Viewer' || userData?.role === 'Зритель';

  //состояние загрузки
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

  //состояние ошибки
  if (error && !userData) {
    return (
      <div className="profile-main">
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Попробовать снова</button>
      </div>
    );
  }

  //если нет данных
  if (!userData) {
    return (
      <div className="profile-main">
        <h1>Пользователь не найден</h1>
        <button onClick={() => navigate('/')} className="btn-primary">На главную</button>
      </div>
    );
  }

  return (
    <div className="profile-main">
      <div className="profile-container">
        <div className="profile-sidebar">
          <button className="sidebar-btn" onClick={() => navigate('/favorites')}>Избранное</button>
          
          {/* кнопки для художников */}
          {isArtist && (
            <>
              <button className="sidebar-btn" onClick={() => setShowCreateModal(true)}>Создать публикацию</button>
              <button className="sidebar-btn" onClick={() => setShowDeletePublicationModal(true)}>Удалить публикацию</button>
            </>
          )}
          
          <button className="sidebar-btn" onClick={handleLogout}>Выйти из аккаунта</button>
          <button className="sidebar-btn danger" onClick={() => setShowDeleteModal(true)}>Удалить аккаунт</button>
        </div>

        <div className="profile-content">
          <div className="profile-info-block">
            <div className="profile-top-row">
              <div className="left-column">
                <div
                  className={`avatar-circle ${isEditing ? 'editable' : ''}`}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  <img src={avatarPreview} alt="" />
                  {isEditing && (
                    <div className="avatar-overlay"><span>Изменить</span></div>
                  )}
                </div>
                {isEditing && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                )}
              </div>
              <div className="right-column">
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    className="profile-input"
                    value={userData.username || ''}
                    onChange={handleChange}
                    placeholder="Имя пользователя"
                  />
                ) : (
                  <h2 className="profile-name-display">{userData.username}</h2>
                )}
                <input
                  type="email"
                  className="profile-input"
                  value={userData.email || ''}
                  readOnly={true}
                  placeholder="Почта"
                />
              </div>
            </div>
            
            {isEditing ? (
              <textarea
                name="bio"
                className="profile-textarea"
                value={userData.bio || userData.description || ''}
                onChange={handleChange}
                rows="3"
                placeholder="О себе"
              />
            ) : (
              <div className="profile-description">
                {userData.bio || userData.description || 'Описание не указано'}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="edit-buttons">
              <button className="btn-save" onClick={handleSave}>Сохранить</button>
              <button className="btn-cancel-edit" onClick={handleCancel}>Отмена</button>
            </div>
          ) : (
            <button className="edit-profile-btn" onClick={handleEdit}>Редактировать профиль</button>
          )}

          {/* раздел работ для художников */}
          {isArtist && (
            <div className="user-works-section">
              <h2 className="works-heading">Мои работы</h2>
              {userWorks.length === 0 ? (
                <p className="no-works-message">У вас пока нет опубликованных работ</p>
              ) : (
                <div className="works">
                  {userWorks.map(work => (
                    <Link to={`/work/${work.id}`} key={work.id} className="work-link">
                      <div className="work-card">
                        <div className="work-image">
                          <img 
                            src={work.image_url || work.image || '/demonstration.jpg'} 
                            alt={work.title}
                            onError={(e) => {
                              e.target.src = '/demonstration.jpg';
                            }}
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
              )}
            </div>
          )}

          {/* подсказка для зрителей */}
          {isViewer && (
            <div className="user-works-section">
              <p className="no-works-message">
                У вас роль <strong>Зритель</strong>.
                <br />
                Зарегистрируйтесь как художник, чтобы публиковать работы.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* модальное окно удаления аккаунта */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Вы уверены, что хотите удалить аккаунт?</h3>
            <p>Аккаунт будет безвозвратно удалён</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Отмена</button>
              <button className="btn-delete" onClick={handleDeleteAccount}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* модальное окно создания публикации только для художников */}
      {showCreateModal && isArtist && (
        <CreatePublicationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePublication}
        />
      )}

      {/* модальное окно удаления публикации только для художников */}
      {showDeletePublicationModal && isArtist && (
        <DeletePublicationModal
          onClose={() => setShowDeletePublicationModal(false)}
          onDelete={handleDeletePublication}
          works={userWorks}
        />
      )}
    </div>
  );
}

export default ProfilePage; //экспорт страницы