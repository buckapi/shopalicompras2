import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  @Input() maxQuantity: number = 99; // Nueva propiedad de entrada
  @Input() quantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();

  constructor(
    public global: GlobalService,
    private snackBar: MatSnackBar
  ) {}

  // Validación cuando cambia el valor manualmente
  validateQuantity(): void {
    if (isNaN(this.quantity)) {
      this.quantity = 1;
    } else if (this.quantity < 1) {
      this.quantity = 1;
    } else if (this.quantity > this.maxQuantity) {
      this.quantity = this.maxQuantity;
    }
    this.quantityChange.emit(this.quantity);
  }

  increment(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
      this.quantityChange.emit(this.quantity);
    } else {
      this.showMaxQuantityAlert();
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.global.addToCart(this.product, this.quantity);
    this.showSuccessNotification();
    this.resetQuantity();
  }

  private showSuccessNotification(): void {
    this.snackBar.open(
      `✅ ${this.quantity} ${this.quantity > 1 ? 'unidades' : 'unidad'} de ${this.product.name} agregadas al carrito`, 
      'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );
  }

  private showMaxQuantityAlert(): void {
    this.snackBar.open(
      `⚠️ No puedes agregar más de ${this.maxQuantity} unidades`, 
      'Entendido', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: ['warning-snackbar']
      }
    );
  }

  private resetQuantity(): void {
    this.quantity = 1;
    this.quantityChange.emit(this.quantity);
  }
}