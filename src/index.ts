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
import {IProductItem, IOrder, IContactsOrder, PaymentMethod, IOrderAddress} from "./types";
import {ContactsOrder} from "./components/ContactsOrder";
import {OrderAddress, } from "./components/Order";
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
const order = new OrderAddress(cloneTemplate(orderTemplate), events);
const contacts = new ContactsOrder(cloneTemplate(contactsTemplate), events);



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

//Открытие карточки превью
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
appData.putInBasket(item);
modal.close();
});

//Удаление товара из корзины
events.on('webproduct:delete', (item: WebProduct) => {
appData.deleteFromBasket(item.id);
modal.close();
});

// Изменения данных в корзине
events.on('itemsBasket:changed',() => {
    const fullBasket = appData.fullBasket();
    page.counter = fullBasket.length;
    let total = 0;
    basket.items = fullBasket.map((item, index) => {
        const card = new BasketCard(index,cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                appData.deleteFromBasket(item.id);
                basket.total = appData.getTotal();
            }
            });
        total = total + item.price;
        return card.render({
            title: item.title,
            price: item.price,
     
        }); 
       
    }); 
     basket.total = total;   
});

// Открыть корзину
events.on('basket:open', () => {
    modal.render({
        content: basket.render()
    })
});

// переход к оформлению заказа
// Открыть форму заказа
events.on('order:open', () => {
   order.setButtonClass('');
	modal.render({
		content: order.render({
			payment: null,
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// выбрать оплату
events.on('payment:changed', (data: { target: PaymentMethod }) => {
	appData.checkPayment(data.target);
});

// Отправлена формы доставки
	events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

// Изменилось состояние валидации формы с адресом
events.on('formAddresErrors:change', (errors: Partial<IOrderAddress>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address }).filter((i) => !!i).join('; ');
    
});


 // Изменилось одно поле формы с контактами
events.on( /^contacts\..*:change/,
 (data: { field: keyof IContactsOrder; value: string }) => { 
    appData.setContactField(data.field, data.value);
    
 });
// Изменилось состояние валидации формы kонтактов
 events.on('formContactErrors:change', (errors: Partial<IContactsOrder>) => {
     const { email, phone } = errors;
     contacts.valid = !email && !phone;
     contacts.errors = Object.values({phone, email}).filter((i) => !!i).join('; ');
 });

 // Изменился адрес доставки
events.on('order.address:change', (data: { value: string }) => {
	appData.checkAddress(data.value);
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
	appData.setOrder();
	api.orderProduct(appData.order)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate),{
					onClick: () => {
						modal.close();
						appData.clearBasket();
						order.setButtonClass('');
						events.emit('itemsBasket:changed');
					}
			}, appData.order.total);
			modal.render({content: success.render({})});
            appData.clearBasket();
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// Разблокируем прокрутку модалки
events.on('modal:close', () => {
    page.locked = false;
});







 

