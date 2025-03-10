import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swiper from 'swiper';
import { GlobalService } from '../../services/global.service';
import { CarService } from '../../services/car.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  dimensiones: string;
  weight: string;
  category: string;
  files: string[];
  quantity: number;
  manufacturer: string;
  code: string;
  country: string;
  material: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  cartQuantity: number = 0;
  selectedProduct: any;
  categories: any[] = [];
constructor(
  public global: GlobalService,
  public carService: CarService,
  public realtimeCategorias: RealtimeCategoriasService
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
addToCart(product: any) {
  // If the cart is not initialized, create an empty array
  if (!this.global.cart) {
    this.global.cart = [];
  }

  // Check if the product is already in the cart
  const existingProduct = this.global.cart.find(item => item.productId === product.id);

  if (existingProduct) {
    // Increase quantity if the product already exists
    existingProduct.quantity += 1;
  } else {
    // Add new product with quantity 1
    this.global.cart.push({ ...product, quantity: 1, productId: product.id });
  }

  // Save the updated cart to localStorage
  this.saveCartToLocalStorage();
}
/* getLimitedDescription(): string {
  return this.global.previaProducto.description.length > 800 
      ? this.global.previaProducto.description.substring(0, 800) + '...' 
      : this.global.previaProducto.description;
} */
/* addToCart(product: any) {
  // Verificar que el producto no sea undefined o null
  if (!product || !product.id) {
    console.error('Producto inválido:', product);
    return;
  }

  // Si el carrito no existe, inicialízalo
  if (!this.global.cart) {
    this.global.cart = [];
  }

  // Verificar si el producto ya está en el carrito
  const existingProduct = this.global.cart.find(item => item.productId === product.id);

  // Si el producto ya está en el carrito, solo incrementamos su cantidad
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    // Si el producto no está en el carrito, lo agregamos con cantidad 1
    this.global.cart.push({ ...product, quantity: 1, productId: this.global.productSelected.id });
  }

  // Guardar en localStorage
  this.saveCartToLocalStorage();
}
 */

saveCartToLocalStorage() {
  // Update cart quantity
  this.global.updateCartQuantity();

  // Save the updated cart in localStorage
  localStorage.setItem('cart', JSON.stringify(this.global.cart));

  // Update the cart status to show if the cart has products
  this.global.cartStatus$.next(this.global.cart.length > 0);
}

ngOnInit() {
  // Listen to cart quantity changes and update accordingly
  this.global.cartQuantity$.subscribe(quantity => {
    this.global.cartQuantity = quantity;
    this.global.updateCartQuantity();
  });

  // Load the cart from localStorage if it exists
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    this.global.cart = JSON.parse(savedCart);
  } else {
    this.global.cart = []; // Ensure cart is an empty array if nothing is stored
  }
}

}
