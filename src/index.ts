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
import {Tabs} from "./components/common/Tabs";
import {IProductItem, IOrder} from "./types";
import {ContactsOrder} from "./components/ContactsOrder";
import {Success} from "./components/common/Success";

events.on( /^contacts\..*:change/,
 (data: { field: keyof IContactForm; value: string }) => { 
    appData.setContactsField(data.field, data.value);
 });

 events.on('order.address:change', (data: { value: string }) => { appData.setAddress(data.value);
 });

