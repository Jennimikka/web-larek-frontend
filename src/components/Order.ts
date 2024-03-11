import {Form} from "./common/Form";
import { IOrderAdress } from "../types"; 
import { IEvents} from "./base/events";

export class OrderAdress extends Form<IOrderAdress> {
    protected _buttons: HTMLButtonElement[];
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._buttons = Array.from (container.querySelectorAll('.button_alt'));

        
    }
  
    SetButtonClass(name: string): void { 
        this._buttons.forEach((button) => { 
      this.toggleClass(button, "button_alt-active",button.name===name); 
        }); 
       }
  
    set address(value: string) {
      (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
  
  }
    
