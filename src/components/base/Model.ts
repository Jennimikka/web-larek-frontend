import {IEvents} from "./events";

// Гарда для проверки на модель
export const isModel = (obj: unknown): obj is Model<any> => {
    return obj instanceof Model;
}

/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */

export abstract class Model<T> { 
 constructor(data: Partial<T>, protected events: IEvents) { 
  Object.assign(this, data); 
  console.log(this); 
 } 
 emitChanges(event: string, payload?: object): void { 
  this.events.emit(event, payload ?? {}); 
 } 
}