import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-addtocartbutton',
  standalone: true,
  imports: [CommonModule, FormsModule,  ],
  templateUrl: './addtocartbutton.component.html',
  styleUrls: ['./addtocartbutton.component.css']
})
export class  AddtocartbuttonComponent {
  @Input() product: any;
  @Input() maxQuantity: number = 99; // Nueva propiedad de entrada
  @Input() quantity: number = 1;
  @Output() quantityChange = new EventEmitter<number>();
  @Input() resetTrigger: boolean = false;
  public lastProductId: string | null = null;
  constructor(
    public global: GlobalService,
    public snackBar: MatSnackBar
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetTrigger'] || 
        (changes['product'] && this.product?.id !== this.lastProductId)) {
      this.resetQuantity();
      this.lastProductId = this.product?.id;
    }
  }

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

  addToCart() {
    if (!this.product) return;
    
    this.global.addToCart(this.product, this.quantity);
    this.showSuccessNotification();
    this.resetQuantity();
    
  }
/* addToCart() {
  if (!this.product) {
    console.error('No hay producto definido');
    return;
  }

  console.log('Agregando producto:', this.product.id); // Debug
  
  // CORRECCIÓN: Pasar los parámetros correctamente al servicio
  this.global.addToCart(this.product, this.quantity);

  this.showSuccessNotification();
  this.resetQuantity();
} */
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

  private resetQuantity(): void {
    this.quantity = 1;
    this.quantityChange.emit(this.quantity);
    // No necesitas el setTimeout si usas ChangeDetectionStrategy.OnPush
  }
}