
export interface IProductItem {
    
    id: string,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface IOrder {
payment: PaymentMethod;
email: string;
phone: string;
address: string;
total: number;
items: string[]
}
export type FormErrors = Partial<Record<keyof IOrder, string>>;
export type PaymentMethod = 'card' | 'cash';
export interface IAppStateModel {    
catalog: IProductItem[];
basket: string[]; 
order: IOrder | null;    

}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface IBasketCard {
    title: string;
    price: number;   
}

export interface IOrderAddress {
    payment:PaymentMethod;
    address: string;

}

export interface IContactsOrder {
    email: string;
    phone: string;
}
