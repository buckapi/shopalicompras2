import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/global.service';
import { AuthPocketbaseService } from '../../../services/auth-pocketbase.service';
import { RealtimeProductosService } from '../../../services/realtime-productos.service';
import Swal from 'sweetalert2';
import { AddtocartbuttonComponent } from '../addtocartbutton/addtocartbutton.component';
import { FormsModule } from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

@Component({
  selector: 'app-head',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  isMenuOpen = false;
  carItems: CartItem[] = [];
  carTotalPrice: number = 0;
  carItemsCount: number = 0;
  itemsCount: number = 0;
  unitsCount: number = 0;
  productos: any[] = [];
  product: any; // Asegúrate de definir el tipo de tu producto
  quantity: number = 1; // Cantidad por defecto
  car: any[] = [];  
  cartItems: any[] = [];
  categorias: any[] = [];
  searchControl = new FormControl('');
  filteredProducts$: Observable<any[]>; // Declaramos primero la propiedad
  selectedCategory = new FormControl(''); // Añadir esto con las propiedades

constructor(
  public global: GlobalService,
  public authService: AuthPocketbaseService,
  public realtimeproductos: RealtimeProductosService
){
  this.itemsCount = this.global.getUniqueItemsCount(); // Productos diferentes
this.unitsCount = this.global.getTotalUnitsCount(); // Total de unidades
this.filteredProducts$ = combineLatest([
        this.realtimeproductos.productos$,
        this.searchControl.valueChanges.pipe(startWith('')),
        this.selectedCategory.valueChanges.pipe(startWith(''))
      ]).pipe(
        // En shop.component.ts, modificar el map del combineLatest:
    map(([products, searchTerm, categoryId]) => 
      products.filter(product => 
        (searchTerm === '' || product.name.toLowerCase().includes(searchTerm?.toLowerCase() || '')) &&
        (categoryId === '' || product.categorias === categoryId) // Cambiar a comparar con el campo 'categorias'
      )
      )
      );
}
// Agregar console.log para debuggear
ngOnInit(): void {  
  this.loadCartItems();
    // Escuchar cambios en el carrito
    this.global.cartUpdated$.subscribe(() => this.loadCartItems());
    // Escuchar cambios en otras pestañas
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'cart') {
      this.loadCartItems();
    }
  });
}
// Modificar loadCart para incluir todos los contadores
// head.component.ts
loadCartItems(): void {
  // Obtener de GlobalService (que ya sincroniza con localStorage)
  this.cartItems = this.global.getCartItems();
  
  // Forzar actualización de la vista
  this.carItems = [...this.carItems];
}

increaseQuantity(item: any): void {
  this.global.updateQuantity(item.productId, item.quantity + 1);
}

decreaseQuantity(item: any): void {
  if (item.quantity > 1) {
    this.global.updateQuantity(item.productId, item.quantity - 1);
  }
}

removeItem(productId: string): void {
  this.global.removeFromCart(productId);
}

getProductName(productId: string): string {
  return this.global.getProductName(productId); // Implementa este método en tu GlobalService
}

showMenu() {
  this.isMenuOpen = true;
}

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
  const menu = document.getElementById('navbarNavDropdown');
  if (menu) {
    if (this.isMenuOpen) {
      menu.classList.add('show');
      document.body.style.overflow = 'hidden'; // Evita el scroll cuando el menú está abierto
    } else {
      menu.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
}

// Función para cerrar el menú y navegar
closeMenuAndNavigate(route: string) {
  this.global.setRoute(route);
  this.toggleMenu(); // Cierra el menú
}

// Opcional: Cerrar al hacer clic fuera del menú
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const menu = document.getElementById('navbarNavDropdown');
  const toggleButton = document.querySelector('.navbar-toggler');
  
  if (menu && toggleButton && this.isMenuOpen) {
    if (!target.closest('.header-nav') && !target.closest('.navbar-toggler')) {
      this.toggleMenu();
    }
  }
}
// Controlar visibilidad del buscador
toggleSearch() {
  const searchOffcanvas = document.getElementById('offcanvasTop');
  if (searchOffcanvas) {
    searchOffcanvas.classList.toggle('show');
    document.body.style.overflow = searchOffcanvas.classList.contains('show') ? 'hidden' : '';
  }
}

// Controlar visibilidad del carrito
toggleCart() {
  const cartOffcanvas = document.getElementById('offcanvasRight');
  if (cartOffcanvas) {
    cartOffcanvas.classList.toggle('show');
    document.body.style.overflow = cartOffcanvas.classList.contains('show') ? 'hidden' : '';
  }
} 


// Modificar resetCart para reiniciar todos los contadores
resetCart() {
  this.carItems = [];
  this.carTotalPrice = 0;
  this.carItemsCount = 0;
  this.itemsCount = 0;
  this.unitsCount = 0;
}

}