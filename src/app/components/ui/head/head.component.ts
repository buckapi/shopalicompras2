import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/global.service';
import { AuthPocketbaseService } from '../../../services/auth-pocketbase.service';
import { RealtimeProductosService } from '../../../services/realtime-productos.service';
import Swal from 'sweetalert2';
import { AddtocartbuttonComponent } from '../addtocartbutton/addtocartbutton.component';
import { FormsModule } from '@angular/forms';
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
constructor(
  public global: GlobalService,
  public authService: AuthPocketbaseService,
  public realtimeproductos: RealtimeProductosService
){
  this.itemsCount = this.global.getUniqueItemsCount(); // Productos diferentes
this.unitsCount = this.global.getTotalUnitsCount(); // Total de unidades
}
// Agregar console.log para debuggear
ngOnInit(): void {  
  this.loadCart();    
  // Suscribirse a actualizaciones del carrito
  this.global.cartUpdated$.subscribe(() => this.loadCart());
    // Escuchar cambios en otras pestañas
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'cart') {
      this.loadCart();
    }
  });
}
// Modificar loadCart para incluir todos los contadores
loadCart() {
  this.carItems = this.global.getCartItems();
  this.carTotalPrice = this.global.getTotalPrice();
  this.carItemsCount = this.global.getTotalItems();
  this.itemsCount = this.global.getUniqueItemsCount();
  this.unitsCount = this.global.getTotalUnitsCount();
}

removeFromCart(productId: string) {
  this.global.removeFromCart(productId);
}
  /* async removeFromCart(productId: string) {
    const confirm = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de que quieres eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (confirm.isConfirmed) {
      this.global.removeFromCart(productId);
    }
  } */
updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  this.carItemsCount = cart.reduce((total: number, item: any) => total + item.quantity, 0);
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
increaseQuantity(item: CartItem) {
  this.global.updateQuantity(item.productId, item.quantity + 1);
  this.loadCart(); // Actualiza la vista
}

decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) {
    this.global.updateQuantity(item.productId, item.quantity - 1);
    this.loadCart(); // Actualiza la vista
  }
}
}