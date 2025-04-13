import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { CommonModule } from '@angular/common';
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
    AddtocartbuttonComponent

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
    private scriptLoader: ScriptLoaderService,
    public productService: ProductsService,
    public scriptStore: ScriptStoreService,
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
             /* 'vendor/swiper/swiper-bundle.min.js', */ 
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

  }
