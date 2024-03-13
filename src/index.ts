import './scss/styles.scss';
import {LarekApi} from "./components/LarekApi";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppStateModel, CatalogChangeEvent, WebProduct} from "./components/AppData";
import {Page} from "./components/Page";
import {Card} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import { BasketCard } from './components/common/BasketCard';
import {IProductItem, IOrder, IContactsOrder} from "./types";
import {ContactsOrder} from "./components/ContactsOrder";
import {OrderAdress} from "./components/Order";
import {Success} from "./components/common/Success";
import { container } from 'webpack';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success')
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppStateModel({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
// Переиспользуемые компоненты
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderAdress(cloneTemplate(orderTemplate), events);
const contacts = new ContactsOrder(cloneTemplate(contactsTemplate), events);
// const success = new Success(cloneTemplate(successTemplate), {
//   onClick: () => {
//     EventEmitter.emit('modal:close') 
//     modal.close() 
//   }
// });


// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card('card',cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price
            
        });
    });

    page.counter = appData.fullBasket().length;
});

// Получаем карточки с сервера
api.getProductList()
	.then(appData.setCatalog.bind(appData))  
       .catch(err => {	
	console.error(err);
})

//выбираем товар

 events.on('card:select', (item: WebProduct) => {
     appData.setPreview(item);
 });
//Открытие модальных окон
events.on('preview:changed', (item: WebProduct) => {
   if(item) {
    const card = new Card('card',cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
        if (appData.checkBasket(item)) {
            events.emit('webproduct:delete', item)
        } else {
            events.emit('webproduct:added', item)
        }
    }
            
});
        modal.render({
                content: card.render({
                title: item.title,
                image: item.image,
                category: item.category,
                description: item.description,
                price: item.price,
                button: appData.checkBasket(item) ? 'Убрать' : 'Купить',    
                   
                })
            })
        } else {
            modal.close();
        }

    });


// Добавление товара в корзину
events.on('webproduct:added', (item: WebProduct) => {
appData.throwInBasket(item);
modal.close();
});

//Удаление товара из корзины
events.on('webproduct:delete', (item: WebProduct) => {
appData.deleteFromBasket(item.id);
modal.close();
});

events.on('itemsBasket:changed',(item: BasketCard) => {
    page.counter = appData.fullBasket.length;
    const card = new BasketCard(item.index,cloneTemplate(cardBasketTemplate), {
        onClick: () => events.emit('card:basket', item)
        });
    return card.render({
        title: item.title,
        price: item.price,
        
    });
   
       
    })
    
      
    

// set items(items: HTMLElement[]) {
//     if (items.length) {
//         this._list.replaceChildren(...items);
//         this.setDisabled(this._button, true);
//      }else {
//         this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
//             textContent: 'Корзина пуста'
//         }));
//         this.setDisabled(this._button, false);
//     }
  
// }

// Отправлена форма заказа садресом 
events.on('order.address:change', (data: { value: string }) => { appData.checkAdress(data.value);
 });

 // Отправлена форма с полями телефон и e-mail
events.on( /^contacts\..*:change/,
 (data: { field: keyof IContactsOrder; value: string }) => { 
    appData.setContactField(data.field, data.value);
 });
// Изменилось состояние валидации формы
// events.on('formErrors:change', (errors: Partial<IContactsOrder>) => {
//     const { email, phone } = errors;
//     order.valid = !email && !phone;
//     order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
// });

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// Разблокируем прокрутку модалки
events.on('modal:close', () => {
    page.locked = false;
});





 

