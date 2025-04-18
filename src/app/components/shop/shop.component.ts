import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { RealtimeProductosService } from '../../services/realtime-productos.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { MatDialog } from '@angular/material/dialog';
import * as bootstrap from 'bootstrap';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';


@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent {
  productos: any[] = [];
  categorias: any[] = [];
  product: any;
  quantity: number = 1; 
  searchControl = new FormControl('');
  filteredProducts$: Observable<any[]>; // Declaramos primero la propiedad
  selectedCategory = new FormControl(''); // Añadir esto con las propiedades

constructor(
  public global: GlobalService,
  public realtimecategorias: RealtimeCategoriasService,
  public realtimeproductos: RealtimeProductosService,
  public authService: AuthPocketbaseService,
  public dialog: MatDialog,
) {
  this.realtimecategorias.categorias$.subscribe((categorias) => {
    this.categorias = categorias;
  });
  this.realtimeproductos.productos$.subscribe((productos) => {
    this.productos = productos;
  });
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

 closeModal() {
        const modal = document.getElementById('exampleModal');
        if (modal) {
          // Método nativo para cerrar el modal
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
      
          // Eliminar backdrop manualmente
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => backdrop.remove());
      
          // Restaurar estilos del body
          document.body.classList.remove('modal-open');
          document.body.style.overflow = 'auto';
          document.body.style.paddingRight = '0';
        }
      
        this.quantity = 1;
        this.dialog.closeAll();
      
      }
      goToProductDetails() {
        this.closeModal();
        this.global.setRoute('product-details');
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
      
      reloadPage() {
        this.closeModal();
        this.global.setRoute('shop');
      }

}
