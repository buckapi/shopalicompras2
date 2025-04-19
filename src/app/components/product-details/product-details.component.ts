import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swiper from 'swiper';
import { GlobalService } from '../../services/global.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { AddtocartbuttonComponent } from '../ui/addtocartbutton/addtocartbutton.component';
import { ElementRef, ViewChild } from '@angular/core';
import { SimpleChanges, OnChanges } from '@angular/core';

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
export class ProductDetailsComponent implements OnChanges {
  @ViewChild('productVideo') productVideo?: ElementRef<HTMLVideoElement>;

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
  /* product: any; // Asegúrate de definir el tipo de tu producto
  selectedProduct: any;
  categories: any[] = []; */
  product?: Product;
  selectedProduct?: Product;
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
public resetVideoPlayer(): void {
  if (this.productVideo) {
    this.productVideo.nativeElement.pause();
    this.productVideo.nativeElement.currentTime = 0;
  }
}
ngOnChanges(changes: SimpleChanges): void {
  if (changes['product'] || changes['selectedProduct']) {
    this.resetVideoPlayer();
  }
}

async selectProduct(product: Product): Promise<void> {
  this.selectedProduct = product;
  this.resetVideoPlayer();
  
  if (this.productVideo && product?.videos?.length) {
    // Usamos setTimeout para asegurarnos que el cambio de vista se haya completado
    setTimeout(() => {
      const video = this.productVideo!.nativeElement;
      video.src = product.videos[0];
      video.load();
      video.play().catch(e => console.log('Auto-play prevented:', e));
    }, 0);
  }
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
getCategoryName(categoryId: string): string {
  if (!categoryId || !this.categories || this.categories.length === 0) {
    return 'Sin categoría';
  }
  
  const category = this.categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Categoría no encontrada';
}


}
