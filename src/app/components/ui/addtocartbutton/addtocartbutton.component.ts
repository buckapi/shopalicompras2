// addtocartbutton.component.ts
import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-addtocartbutton',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addtocartbutton.component.html',
  styleUrls: ['./addtocartbutton.component.css']
})
export class AddtocartbuttonComponent implements OnChanges {
  @Input() product: any;
  @Input() maxQuantity: number = 99;
  @Input() quantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() addedToCart = new EventEmitter<void>();

  
  constructor(
    public global: GlobalService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && changes['product'].currentValue !== changes['product'].previousValue) {
      this.quantity = 1; // Reset quantity when product changes
      this.quantityChange.emit(this.quantity);
    }
  }

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

  addToCart() {
    if (!this.product) return;
    
    this.global.addToCart(this.product, this.quantity);
    this.showSuccessNotification();
    this.addedToCart.emit();
    // Cerrar todos los dialogs abiertos
    this.dialog.closeAll();
  }

  private showSuccessNotification() {
    this.snackBar.open('Producto agregado al carrito', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
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
}