import {Model} from "./base/Model";
import { IProductItem, IAppStateModel, IOrder, FormErrors, PaymentMethod, IContactsOrder, IOrderAddress} from "../types";
import { IEvents } from "./base/events";
export class WebProduct extends Model<IProductItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: null


}

export type CatalogChangeEvent = {
    catalog: WebProduct[]
};

export class AppStateModel extends Model<IAppStateModel> {   
        catalog: IProductItem[] = [];
        basket: IProductItem[] = []; 
        order: IOrder = {
            email: '',
            phone: '',
            items: [],
            payment: 'card',
            address: '',
            total: 0
        }
        preview: string | null;

        formErrors: FormErrors = {};  
        
        putInBasket(item: IProductItem): void {
            this.basket.push(item);
            this.emitChanges('itemsBasket:changed');
            }

        deleteFromBasket(id: string): void {
            this.basket = this.basket.filter((item) => item.id !== id);
            this.emitChanges('itemsBasket:changed');
        }

        defaultOrder(){
           this.order = {
            email: '',
            phone: '',
            items: [],
            payment: 'card',
            address: '',
            total: 0
        } 
        }

        clearBasket(): void {
            this.basket = [];
            this.emitChanges('itemBasket:changed');
            this.defaultOrder();        
            this.basket.reduce((summ, IProductItem)=> summ+IProductItem.price,0);

        }

        getTotal(){
            return  this.basket.reduce((summ, IProductItem)=> summ+IProductItem.price,0);
        }

        setCatalog(items:IProductItem[]){
            this.catalog = items.map(item => new WebProduct(item,this.events));
            this.emitChanges('items:changed',{catalog: this.catalog});
        }
        
        fullBasket():IProductItem[] {
            return this.basket
        }

        checkBasket(item:IProductItem){
            return this.basket.includes(item)
        }

        setPreview(item: WebProduct) {
            this.preview = item.id;
            this.emitChanges('preview:changed', item);
         }

        setOrder():void {
            this.order.total = this.getTotal();
            this.order.items = this.fullBasket().map((item) => item.id);

        }

        checkPayment(orderPayment: PaymentMethod):void {
            this.order.payment = orderPayment;
            this.validateOrderPayment();
        }

        checkAddress(orderAddress: string): void {
            this.order.address = orderAddress;
            this.validateOrderPayment();
        }

        checkEmail(orderEmail: string): void {
            this.order.email = orderEmail;
            this.validateOrderForm();
        }

        checkPhone(orderPhone: string): void {
            this.order.phone = orderPhone;
            this.validateOrderForm();
        }

        validateOrderPayment() {
            const errors: typeof this.formErrors = {};
            if (!this.order.payment) {
                errors.payment = 'Необходимо способ оплаты';
            }
            if (!this.order.address) {
                errors.address = 'Необходимо указать адрес';
            }
            this.formErrors = errors;
            this.events.emit('paymentErrors:change', this.formErrors);
            return Object.keys(errors).length === 0;
        }

        validateOrderForm() {
            const errors: typeof this.formErrors = {};
            if (!this.order.email) {
                errors.email = 'Необходимо указать email';
            }
            if (!this.order.phone) {
                errors.phone = 'Необходимо указать телефон';
            }
            this.formErrors = errors;
            this.events.emit('formErrors:change', this.formErrors);
            return Object.keys(errors).length === 0;
        }

        setContactField(field: keyof IContactsOrder, value: string): void {
            this.order[field] = value;        
            this.validateOrderForm();
            } 
    }
    

