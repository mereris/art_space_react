import React from 'react'; //импорт реакта

//страница с информацией о платформе
function AboutPage() {
  return (
    <div className="about-us-main">
      <h1 className="about-us-title">О нас</h1> {/* заголовок страницы */}
      
      <div className="about-us-content">
        <div className="about-us-text"> {/* конкретная информация о платформе */}
          <p>
            ArtSpace - это платформа для сообщества художников и ценителей искусства.
          </p>
          <p>
            Мы объединяем творческих людей, помогая им демонстрировать свои работы, 
            находить единомышленников и продвигать свое творчество.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; //экспорт страницы