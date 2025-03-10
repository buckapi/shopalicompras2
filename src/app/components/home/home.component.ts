import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { RealtimeProductosService } from '../../services/realtime-productos.service';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
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
categorias: any[] = [];
productos: any[] = [];
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
}

ngOnInit(): void {
  this.global.setRoute('home');

}

}

