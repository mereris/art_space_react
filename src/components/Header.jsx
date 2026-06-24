import React from 'react'; //импорт реакта
import { Link, NavLink } from 'react-router-dom'; //импорт тегов-ссылок для навигации без перезагрузки страниц

//шапка сайта
function Header() {
  return (
    <header>
      <div className="name"> {/* название платформы */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>ArtSpace</h1></Link>
      </div>

      {/* навигационное меню */}
      <nav className="menu">
        <NavLink to="/" end>Главная</NavLink>
        <NavLink to="/gallery">Галерея</NavLink>
        <NavLink to="/events">События</NavLink>
        <NavLink to="/about">О нас</NavLink>
        <NavLink to="/contacts">Контакты</NavLink>
      </nav>

      {/* кнопка перехода в профиль */}
      <Link to="/profile" className="profile-btn">Профиль</Link>
    </header>
  );
}

export default Header; //экспорт компонента