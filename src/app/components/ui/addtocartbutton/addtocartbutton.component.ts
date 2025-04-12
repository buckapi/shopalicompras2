import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'; 

@Component({
  selector: 'app-addtocartbutton',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addtocartbutton.component.html',
  styleUrls: ['./addtocartbutton.component.css']
})
export class AddtocartbuttonComponent {
  @Input() product: any;
  @Input() quantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();

  constructor(
    public global: GlobalService,
    private snackBar: MatSnackBar
  ) {}

  onQuantityChange() {
    this.quantityChange.emit(this.quantity);
  }

  addToCart() {
    if (this.product) {
      this.global.addToCart(this.product, this.quantity);
      
      // Mostrar notificación
      this.snackBar.open(`${this.product.name} agregado al carrito`, 'Cerrar', {
        duration: 2000,
        verticalPosition: 'top'
      });
      
      // Resetear cantidad
      this.quantity = 1;
    }
  }
  increment() {
    this.quantity++;
    this.quantityChange.emit(this.quantity);
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

}