import { Component } from '@angular/core';
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
  showMenu() {
    this.isMenuOpen = true;
  }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
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

}

