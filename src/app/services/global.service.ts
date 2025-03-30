import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; // Add this line
import PocketBase from 'pocketbase';

interface Producto {
  id: number;
  name: string;
  description: string;
  price: number;
  files  : string[];
  videos: string[];
  categorias: string;
  quantity: number;
  dimensions: string;
  weight: string;
  manufacturer: string;
  code: string;
  country: string;
  material: string;
}
@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  activeRoute = 'home';
  menuSelected = '';

  previaProducto= { } as Producto;
  categorias: any[] = [];
  productos: any[] = [];
  totalProductos = 0;
  cart: any[] = [];
  cartQuantity = 0;
  product: any;
  cartQuantity$ = new BehaviorSubject<number>(0); 
  cartStatus$ = new BehaviorSubject<boolean>(false);
  productSelected: Producto = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    files: [],
    videos: [],
    categorias: '',
    quantity: 0,
    dimensions: '',
    weight: '',
    manufacturer: '',
    code: '',
    country: '',
    material: '',

  }
  private productToEdit = new BehaviorSubject<any>(null);
  productToEdit$ = this.productToEdit.asObservable();
  constructor() { 
    this.pb = new PocketBase(this.apiUrl);
  }
  private pb: PocketBase;
  private apiUrl = 'https://db.buckapi.lat:8050';
  setRoute(route: string) {
    this.activeRoute = route;
  }
  setProduct(route: string,product  : Producto) {
    this.activeRoute = route;
    this.previaProducto = product;

  }
  setMenuOption(option: string) {
    this.menuSelected = option;
  }
  getCategorias(): any[] {
    return this.categorias;
  }
  setQuick(product: Producto) {
    this.previaProducto = product;
    console.log("producto",+this.previaProducto);
  }
  getProductos(): any[] {
    return this.productos;
  }
  getProductosCount(): number {
    return this.productos.length;
  }
  getProductDetails(): Producto {
    return this.previaProducto;
  }
  public updateCartQuantity() {
    const cartQuantity = this.cart.length; // Cantidad de ítems únicos en el carrito
    this.cartQuantity$.next(cartQuantity);
  }
 /*  updateCartQuantity(newQuantity: number) {
    if (this.cartQuantity !== newQuantity) {
      this.cartQuantity = newQuantity;
      this.cartSubject.next(this.cartQuantity);  // Emite el nuevo valor solo si ha cambiado
    }
  } */

  public saveCartToLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartStatus$.next(this.cart.length > 0); // Emitir estado inicial
    }
  }
  

editProduct(product: any) {
  this.productToEdit.next(product);
  this.menuSelected = 'edit-product';
}
  
/* updateProduct(product: any): Observable<any> {
  const data = {
      name: product.name,
      categorias: product.categorias,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      dimensions: product.dimensions,
      code: product.code,
      manufacturer: product.manufacturer,
      country: product.country,
      material: product.material,
      weight: product.weight,
  };

  return new Observable(observer => {
      this.pb.collection('productos').update(product.id, data)
          .then(record => {
              observer.next(record);
              observer.complete();
          })
          .catch(error => {
              observer.error(error);
          });
  });
} */
updateProduct(id: string, data: any): Observable<any> {
  return new Observable(observer => {
    this.pb.collection('productos').update(id, data)
      .then(record => observer.next(record))
      .catch(error => observer.error(error));
  });
}
}
