import { Component, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { RealtimeProductosService } from '../../services/realtime-productos.service';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  private mainSwiper: Swiper | null = null;
  private shopSwiper: Swiper | null = null;

  ngAfterViewInit(): void {
    this.initSwipers();
  }
categorias: any[] = [];
productos: any[] = [];
searchControl = new FormControl('');
filteredProducts$: Observable<any[]>; // Declaramos primero la propiedad
selectedCategory = new FormControl(''); // Añadir esto con las propiedades

  constructor 
  (
    public global: GlobalService,
    public realtimecategorias: RealtimeCategoriasService,
    public realtimeproductos: RealtimeProductosService
  )
  {
    this.realtimecategorias.categorias$.subscribe((categorias) => {
      this.global.categorias = categorias;
    });
    this.realtimeproductos.productos$.subscribe((productos) => {
      this.global.productos = productos;
    })
    this.filteredProducts$ = combineLatest([
        this.realtimeproductos.productos$,
        this.searchControl.valueChanges.pipe(startWith('')),
        this.selectedCategory.valueChanges.pipe(startWith(''))
      ]).pipe(
        // En shop.component.ts, modificar el map del combineLatest:
    map(([products, searchTerm, categoryId]) => 
      products.filter(product => 
        (searchTerm === '' || product.name.toLowerCase().includes(searchTerm?.toLowerCase() || '')) &&
        (categoryId === '' || product.categorias === categoryId) // Cambiar a comparar con el campo 'categorias'
      )
      )
      );
    
}

ngOnInit(): void {
  this.global.setRoute('home');

}
initSwipers(): void {
  // Main slider
  this.mainSwiper = new Swiper('.swiper', {
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

  // Shop slider
  this.shopSwiper = new Swiper('.swiper-shop', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    navigation: {
      nextEl: '.shop-button-next',
      prevEl: '.shop-button-prev',
    },
  });
}

ngOnDestroy(): void {
  if (this.mainSwiper) {
    this.mainSwiper.destroy();
    this.mainSwiper = null;
  }
  if (this.shopSwiper) {
    this.shopSwiper.destroy();
    this.shopSwiper = null;
  }
}


}

