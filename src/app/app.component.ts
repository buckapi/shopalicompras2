import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { CommonModule, ViewportScroller } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { CarComponent } from './components/car/car.component';
import { ShopComponent } from './components/shop/shop.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { HeadComponent } from './components/ui/head/head.component';
import { FooterComponent } from './components/ui/footer/footer.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ContactComponent } from './components/contact/contact.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { GlobalService } from './services/global.service';
import { ScriptLoaderService } from './services/script-loader.service';
import { ScriptStoreService } from './services/script-store.service';
import { ProductsService } from './services/products.service';
import Swiper from 'swiper';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddtocartbuttonComponent } from './components/ui/addtocartbutton/addtocartbutton.component';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as bootstrap from 'bootstrap';
import * as $ from 'jquery';
import { FormimportComponent } from './components/formimport/formimport.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    CommonModule,
    HomeComponent,
    CarComponent,
    ShopComponent,
    AboutComponent,
    LoginComponent,
    HeadComponent,
    FooterComponent,
    DashboardComponent,
    ContactComponent,
    CheckoutComponent,
    ProductDetailsComponent,
    ReactiveFormsModule,
    FormsModule,
    AddtocartbuttonComponent,
    FormimportComponent

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'shopali';
  product: any; // Asegúrate de definir el tipo de tu producto
  quantity: number = 1; // Cantidad por defecto
  constructor (
    public global: GlobalService,
    public scriptLoader: ScriptLoaderService,
    public productService: ProductsService,
    public scriptStore: ScriptStoreService,
    public viewportScroller: ViewportScroller,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  )
    {}
    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        // Cargar los scripts solo en el navegador (no en el servidor)
        this.scriptLoader
          .loadScripts([
            'js/jquery.min.js',
            'vendor/wow/wow.min.js',
            'vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
            'vendor/bootstrap-select/dist/js/bootstrap-select.min.js',
            'vendor/bootstrap-touchspin/bootstrap-touchspin.js',
            'vendor/swiper/swiper-bundle.min.js', 
            'vendor/magnific-popup/magnific-popup.js',
            'vendor/imagesloaded/imagesloaded.js',
            'vendor/masonry/masonry-4.2.2.js',
            'vendor/masonry/isotope.pkgd.min.js',
            'vendor/countdown/jquery.countdown.js',
            'vendor/wnumb/wNumb.js',
            'vendor/nouislider/nouislider.min.js',
            'vendor/slick/slick.min.js',
            'vendor/lightgallery/dist/lightgallery.min.js',
            'vendor/lightgallery/dist/plugins/thumbnail/lg-thumbnail.min.js',
            'vendor/lightgallery/dist/plugins/zoom/lg-zoom.min.js',
            'js/dz.carousel.js', 
            'js/dz.ajax.js',
            'js/custom.min.js',
            /* 'js/dashbord-account.js' */
           ])
          .then((data) => {
            console.log('Todos los scripts se han cargado correctamente', data);
          })
          .catch((error) => {
            console.error('Error al cargar los scripts', error);
          });
      }
      this.global.routeChanged.subscribe(() => {
        setTimeout(() => {
          this.viewportScroller.scrollToPosition([0, 0]);
        }, 100); // Pequeño delay para asegurar que la vista se ha renderizado
      });
    }
   
    ngAfterViewInit(): void {
      if (isPlatformBrowser(this.platformId)) {
          // Inicializa Swiper aquí
          new Swiper('.swiper', {
              // Configuración de Swiper
          });

          // Acceso a localStorage
          const isLoggedIn = localStorage.getItem('isLoggedin');
          // Lógica adicional
      } else {
          console.error('localStorage o document no están disponibles en este entorno.');
      }
  }   
    isImage(image: string): boolean {
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(image);
    }
    addToCart() {
      if (!this.product) return;
      
      this.global.addToCart(this.product, this.quantity);
      this.showSuccessNotification();
      
      // Cerrar todos los dialogs abiertos
      this.dialog.closeAll(); 
    }
    private showSuccessNotification() {
      this.global.snackBar.open('Producto agregado al carrito', 'Cerrar', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
   
    /* closeModal() {
      // Cerrar modal y eliminar backdrop
      const modal = document.getElementById('exampleModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        bsModal.hide();
        
        // Eliminar manualmente el backdrop si existe
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        
        // Habilitar el scroll del body
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
      }
      
      // Resetear cantidad
      this.quantity = 1;
      
      // Cerrar cualquier diálogo abierto
      this.dialog.closeAll();
    } */
/*     closeModal() {
      // Cerrar modal y eliminar backdrop
      const modal = document.getElementById('exampleModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        bsModal.hide();
        
        // Eliminar manualmente el backdrop si existe
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        
        // Restaurar el scroll del body
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
      }
      
      // Resetear cantidad
      this.quantity = 1;
      
      // Cerrar cualquier diálogo abierto
      this.dialog.closeAll();
    } */
  
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
