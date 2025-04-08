import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  productos: any[] = [];
  products: any;
  quantity: number = 1;
  constructor() {}
  public cart: any[] = []; // Aquí guardaremos los productos del carro

  addProduct(product: any, quantity: number) {
    const existingProduct = this.cart.find(item => item.product.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += quantity; // Aumentar la cantidad si ya existe
    } else {
      this.cart.push({ product, quantity }); // Agregar nuevo producto
    }
  }
  getCart() {
    return this.cart;
  }
}