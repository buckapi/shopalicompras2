import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swiper from 'swiper';
import { GlobalService } from '../../services/global.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import Swal from 'sweetalert2';
import { AddtocartbuttonComponent } from '../ui/addtocartbutton/addtocartbutton.component';
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  dimensiones: string;
  weight: string;
  category: string;
  files: string[];
  videos: string[];
  quantity: number;
  manufacturer: string;
  code: string;
  country: string;
  material: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddtocartbuttonComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  ngAfterViewInit(): void {
    new Swiper('.swiper', {
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
  product: any; // Asegúrate de definir el tipo de tu producto
  quantity: number = 1; // Cantidad por defecto
  selectedProduct: any;
  categories: any[] = [];
constructor(
  public global: GlobalService,
  public realtimeCategorias: RealtimeCategoriasService,
) {
  this.realtimeCategorias.categorias$.subscribe((data: any[]) => {
    this.categories = data;
    console.log('Categorías cargadas:', this.categories);
  });
}

async selectProduct(product: any) {
  this.selectedProduct = product; // Seleccionar el producto
}
getCategoryNameById(categoryId: number): string {
  try {
    if (!this.categories) {
      throw new Error('Categorías no cargadas');
    }
    const category = this.categories.find(category => category.id === categoryId);
    if (!category) {
      throw new Error(`Categoría con ID ${categoryId} no encontrada`);
    }
    return category.name;
  } catch (error) {
    console.error(error);
    return 'Categoría no disponible';
  }
}
 addToCart() {
      if (this.product) { // Verifica que el producto esté definido
        // Agregar el producto al carrito
        this.global.addToCart(this.product, this.quantity);
    
        // Reiniciar la cantidad
        this.quantity = 1;
    
        // Mostrar un alert con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Producto agregado al carrito',
          text: `¡El producto ${this.product.name} ha sido agregado al carrito!`,
          showConfirmButton: true,
          timer: 2000 // Se cerrará automáticamente después de 2 segundos
        });
      } else {
        console.error('El producto no está definido');
      }
    } 
incrementQuantity() {
  this.quantity++;
}

decrementQuantity() {
  if (this.quantity > 1) {
    this.quantity--;
  }
}

}
