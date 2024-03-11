import './scss/styles.scss';
import {LarekApi} from "./components/LarekApi";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppStateModel, WebProduct} from "./components/AppData";
import {Page} from "./components/Page";
import {Card} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {IProductItem, IOrder} from "./types";
import {ContactsOrder} from "./components/ContactsOrder";
import {OrderAdress} from "./components/Order";
import {Success} from "./components/common/Success";

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success')
const storeProductTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
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
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => {
    events.emit('modal:close')
    modal.close()
  }
});
// Получаем карточки с сервера


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога



events.on( /^contacts\..*:change/,
 (data: { field: keyof ; value: string }) => { 
    appData.setContactsField(data.field, data.value);
 });

 events.on('order.address:change', (data: { value: string }) => { appData.setAddress(data.value);
 });

