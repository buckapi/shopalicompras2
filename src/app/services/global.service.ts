import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs'; // Add this line
import PocketBase from 'pocketbase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HostListener } from '@angular/core';  
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';
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
  unit: string;
  marketplace_link: string;
}
@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  @HostListener('window:storage', ['$event'])
  activeRoute = 'home';
  menuSelected = '';
  private cartItems: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();
  /* cartUpdated$ = new BehaviorSubject<any>(null); */ // Para notificar cambios
  cartUpdated$ = new BehaviorSubject<CartItem[]>(this.cartItems);
  previaProducto= { } as Producto;
  categorias: any[] = [];
  productos: any[] = [];
  totalProductos = 0;
  product: any;
  quantity: number = 1;
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
    unit: '',
    marketplace_link: ''
  }
  routeChanged = new BehaviorSubject<string>('');
  productToEdit$ = new BehaviorSubject<any>(null);
  constructor(
    public snackBar: MatSnackBar,
    public router: Router
  ) { 
    this.pb = new PocketBase(this.apiUrl);
    this.loadCart();
  }
  public pb: PocketBase;
  private apiUrl = 'https://db.buckapi.lat:8050';
  public listenToBackButton() {
    window.addEventListener('popstate', (event) => {
      event.preventDefault(); // Evita el comportamiento por defecto
      this.setRoute('home'); // Fuerza la ruta 'home'
      history.pushState(null, '', window.location.href); // Opcional: limpia el historial
    });
  }
  setRoute(route: string) {
    this.activeRoute = route;
    this.routeChanged.next(route);
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
  if (!product || !product.id) {
    console.error('Producto inválido', product);
    return;
  }

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
  
  this.saveCart(); // <- Esto actualiza localStorage
  this.cartUpdated$.next(this.cartItems);
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
getCartItems(): any[] {
  // Sincroniza con localStorage primero
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      this.cartItems = JSON.parse(savedCart);
    } catch (e) {
      console.error('Error parsing cart', e);
      this.cartItems = [];
    }
  }
  return [...this.cartItems];
}

getProductName(productId: string): string {
  const item = this.cartItems.find(i => i.productId === productId);
  return item ? item.name : 'Producto no encontrado';
}

removeFromCart(productId: string) {
  // Filtrar el array para eliminar el producto con el ID especificado
  this.cartItems = this.cartItems.filter(item => item.productId !== productId);
  
  // Guardar los cambios en localStorage
  this.saveCart();
  
  // Notificar a los componentes suscritos
  this.cartUpdated$.next(this.cartItems);
  
  // Opcional: Mostrar notificación
  this.snackBar.open('Producto eliminado del carrito', 'Cerrar', {
    duration: 2000,
    verticalPosition: 'top'
  });
} 
closeModal() {
  const modal = document.getElementById('offcanvasRight');
  if (modal) {
    // Método preferido usando Bootstrap
    const bsModal = bootstrap.Offcanvas.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    } else {
      // Fallback para móviles
      modal.classList.remove('show');
      document.body.classList.remove('offcanvas-open');
      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}
clearCart() {
  this.cartItems = [];
  this.saveCart();
  this.updateCartCount();
}

// Método para obtener el precio total
getTotalPrice(): number {
  return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

getUniqueItemsCount(): number {
  return this.cartItems.length;
}
getProudctName(productId: string): string {
  return this.productos.find(p => p.id === productId)?.name || '';
}

getTotalUnitsCount(): number {
  return this.cartItems.reduce((total, item) => total + item.quantity, 0);
}
updateQuantity(productId: string, newQuantity: number): void {
  const item = this.cartItems.find(i => i.productId === productId);
  if (item) {
    item.quantity = newQuantity;
    this.saveCart();
    this.cartUpdated$.next(this.cartItems);
  }
}
onStorageChange(event: StorageEvent) {
  if (event.key === 'cart') {
    this.loadCart();
  }
}
cartUpdates$ = this.cartUpdated$.pipe(
  distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
);
}
