import {Form} from "./common/Form";
import { IOrderAdress } from "../types"; 
import { IEvents} from "./base/events";

export class OrderAdress extends Form<IOrderAdress> {
    protected _buttons: HTMLButtonElement[];
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttons = Array.from (container.querySelectorAll('.button_alt'));
    }
}