import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; // Add this line
import PocketBase from 'pocketbase';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

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
  private cartItems: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();
  cartUpdated$ = new BehaviorSubject<any>(null); // Para notificar cambios
  previaProducto= { } as Producto;
  categorias: any[] = [];
  productos: any[] = [];
  totalProductos = 0;
  product: any;
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
  productToEdit$ = new BehaviorSubject<any>(null);
  constructor() { 
    this.pb = new PocketBase(this.apiUrl);
    /* // Cargar carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCartCount();
    } */
      this.loadCart();
  }
  public pb: PocketBase;
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
    
// Opción 1: Si trabajas con el objeto completo
editProduct(product: any) {
  this.productToEdit$.next(JSON.parse(JSON.stringify(product)));
  this.menuSelected = 'edit-product';
}

// Método para actualizar (mejorado)
updateProduct(id: string, data: any): Observable<any> {
  return new Observable(observer => {
    this.pb.collection('productos').update(id, data)
      .then(record => {
        observer.next(record);
        observer.complete();
      })
      .catch(error => {
        console.error('Error al actualizar producto', error);
        observer.error(error);
      });
  });
}


// Método para cargar el carrito desde localStorage
public loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      this.cartItems = JSON.parse(savedCart);
      this.updateCartCount();
    } catch (e) {
      console.error('Error parsing cart', e);
      this.cartItems = [];
    }
  }
}

addToCart(product: any, quantity: number = 1) {
  const existingItem = this.cartItems.find(i => i.productId === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cartItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.files?.[0] || ''
    });
  }
  
  this.saveCart();
  this.cartUpdated$.next(this.cartItems ); // Notificar a los suscriptores
}
public saveCart() {
  localStorage.setItem('cart', JSON.stringify(this.cartItems));
  this.updateCartCount();
}

public updateCartCount() {
  const count = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  this.cartCount.next(count);
}
// Método para eliminar un producto del carrito
removeFromCart(productId: string) {
  this.cartItems = this.cartItems.filter(item => item.productId !== productId);
  this.saveCart();
  this.updateCartCount();
}

getCartItems(): CartItem[] {
  return [...this.cartItems];
}

clearCart() {
  this.cartItems = [];
  this.saveCart();
  this.updateCartCount();
}

getTotalItems(): number {
  return this.cartItems.reduce((total, item) => total + item.quantity, 0);
}

getTotalPrice(): number {
  return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

}
