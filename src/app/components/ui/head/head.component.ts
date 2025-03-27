import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/global.service';
import { AuthPocketbaseService } from '../../../services/auth-pocketbase.service';
import { CarService } from '../../../services/car.service';
import { RealtimeProductosService } from '../../../services/realtime-productos.service';
@Component({
  selector: 'app-head',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  isMenuOpen = false;
  carItems: any[] = [];
  carTotalPrice: number = 0;
  productos: any[] = [];
  product: any; // Asegúrate de definir el tipo de tu producto
  quantity: number = 1; // Cantidad por defecto
  car: any[] = [];  
  cartItems: any[] = [];
constructor(
  public global: GlobalService,
  public authService: AuthPocketbaseService,
  public carService: CarService,
  public realtimeproductos: RealtimeProductosService
){}
ngOnInit(): void {
  this.carItems = this.carService.getCart();
  this.carTotalPrice = this.carItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

updateCart() {
  this.carItems = this.carService.getCart();
  this.carTotalPrice = this.carItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}
removeProduct(item: any) {
  this.carService.cart = this.carService.cart.filter(cartItem => cartItem.product.id !== item.product.id);
  this.updateCart(); // Actualiza la vista después de eliminar el producto
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
// Función para navegación
/* closeMenuAndNavigate(route: string) {
  this.global.setRoute(route);
  
  // Cierra cualquier offcanvas abierto
  const openCanvases = document.querySelectorAll('.offcanvas.show');
  openCanvases.forEach(canvas => {
    canvas.classList.remove('show');
  });
  document.body.style.overflow = '';
} */
}