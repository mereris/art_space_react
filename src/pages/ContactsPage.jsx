import React from 'react'; //импорт реакта

//страница с контактной информацией
function ContactsPage() {
  return (
    <div className="contacts-main">
      <h1 className="contacts-title">Контакты</h1> {/* заголовок страницы */}
      
      <div className="contacts-content"> {/* контактная информация */}
        <p className="contacts-text">
          Хотите, чтобы ваше событие появилось на нашей странице? Отправьте заявку на электронную почту!
        </p>
        <p className="contacts-text">
          Возникли вопросы? Мы всегда рады помочь - свяжитесь с нами: 
        </p>
        
        <div className="contacts-info">
          <p><strong>Почта:</strong> artspace.support@mail.ru</p>
          <p><strong>Телефон:</strong> +7 (999) 999 99 99</p>
        </div>
      </div>
    </div>
  );
}

export default ContactsPage; //экспорт страницы