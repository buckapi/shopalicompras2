import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import PocketBase from "pocketbase";
import Swal from 'sweetalert2';
import { GlobalService } from '../../services/global.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { RealtimeProductosService } from '../../services/realtime-productos.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private pb: PocketBase;
  private apiUrl = 'https://db.buckapi.lat:8050';

  product = {
    name: '',
    price: 0, // Change to string
    categorias: '', // Include categorias
    description: '', // Include description
    files: [] , // Include files as an array
    quantity: 0,
    dimensions: '',
    weight: '',
    manufacturer: '',
    code: '',
    country: '',
    material: '',
  };

  totalProductos: number = 0;
  productos: any[] = [];
  userName: string = '';
  showCategories: boolean = false;
  showProducts: boolean = false;
  addProductForm: FormGroup;
selectedImage: File | null = null;
selectedImagePrev: string = '';
  constructor(
    public global: GlobalService,
    public authService: AuthPocketbaseService,
    public realtimeProductosService: RealtimeProductosService,
    public realtimecategorias: RealtimeCategoriasService,
    public productsService: ProductsService,
    public fb: FormBuilder,

  ) {
    this.pb = new PocketBase(this.apiUrl);
    this.addProductForm = this.fb.group({
      name: [''],
      price: [''],
      stock: [''],
      categorias: [''],
      description: [''],
      files: [''],
      quantity: [''],
      dimensions: [''],
      weight: [''],
      manufacturer: [''],
      code: [''],
      country: [''],
      material: [''],
    });
  }


  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePrev = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  async onSubmit() { // Agregar 'async' aquí
    if (!this.selectedImage) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, seleccione una imagen antes de guardar el producto.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    const formData = new FormData();

    formData.append('image', this.selectedImage); // Agregar la imagen al formData
  
    try {
      // Intentar subir la imagen y crear el producto en una sola operación
      let newImageRecord: any = await this.pb.collection('files').create(formData);
  
      if (newImageRecord) {
        console.log('Imagen subida:', newImageRecord);
  

        const files: string[] = [
          this.apiUrl +
          '/api/files/' +
          newImageRecord.collectionId +
          '/' +
          newImageRecord.id +
          '/' +
          newImageRecord.image
        ];

        
        // Crear el objeto del producto con la información necesaria
        const productData = {
          name: this.product.name,
          price: this.product.price,
          categorias: this.product.categorias,
          description: this.product.description,
          quantity: this.product.quantity,
          files: files, 
          dimensions: this.product.dimensions,
          weight: this.product.weight,
          manufacturer: this.product.manufacturer,
          code: this.product.code,
          country: this.product.country,
          material: this.product.material
        };
  
        // Llamar al servicio para agregar el producto
        await this.productsService.addProduct(productData);
  
        Swal.fire({
          title: 'Éxito!',
          text: 'Producto guardado con éxito!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
  
        // Restablecer el objeto del producto
        this.product = { 
          name: '', 
          price: 0, 
          categorias: '', 
          description: '', 
          quantity: 0,
          files: [],
          dimensions: '',
          weight: '',
          manufacturer: '',
          code: '',
          country: '',
          material: '',
        }; 
        this.selectedImage = null; // Restablecer la imagen seleccionada
        this.productos = this.global.getProductos(); // Refrescar la lista de productos
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'La imagen no se subió correctamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo agregar el producto.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error al agregar el producto:', error);
    }
  }
    // onImageChange(event: any): void {
    //   const file = event.target.files[0];
    //   if (file) {
    //     this.selectedImage = file;
    //     const reader = new FileReader();
    //     reader.onload = (e: any) => {
    //       this.selectedImagePrev = e.target.result;
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // }
  
    //   onSubmit() {
    //     if (!this.selectedImage) {
    //       Swal.fire({
    //         title: 'Error!',
    //         text: 'Por favor, seleccione una imagen antes de guardar el producto.',
    //         icon: 'error',
    //         confirmButtonText: 'Aceptar'
    //       });
    //       return;
    //     }
      
    //     // First, upload the image
    //     this.imageService.uploadImage(this.selectedImage).then(imageResponse => {
    //       // Assuming imageResponse contains the image URL or ID
    //       this.product = {
    //         name: this.product.name,
    //         price: this.product.price,
    //         categorias: this.product.categorias,
    //         description: this.product.description,
    //         quantity: this.product.quantity,
    //         files: [] // or however you get the image URL
    //       };
      
    //       // Now add the product with the uploaded image
    //       return this.productsService.addProduct(this.product);
    //     }).then(response => {
    //       console.log('Product added:', response);
          
    //       // Show SweetAlert for successful product addition
    //       Swal.fire({
    //         title: 'Éxito!',
    //         text: 'Producto guardado con éxito!',
    //         icon: 'success',
    //         confirmButtonText: 'Aceptar'
    //       });
      
    //       // Reset the product object with all required properties
    //       this.product = { 
    //         name: '', 
    //         price: 0, 
    //         categorias: '', 
    //         description: '', 
    //         quantity: 0,
    //         files: []
    //       }; 
    //       this.selectedImage = null; // Reset selected image
      
    //       // Refresh the product list
    //       this.productos = this.global.getProductos(); 
    //     }).catch(error => {
    //       console.error('Error adding product:', error);
    //       // Show SweetAlert for error
    //       Swal.fire({
    //         title: 'Error!',
    //         text: 'Error al guardar el producto.',
    //         icon: 'error',
    //         confirmButtonText: 'Aceptar'
    //       });
    //     });
    //   }

   /*    onImageChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
          this.selectedImage = file;
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImagePrev = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    
      onSubmit() {
        if (!this.selectedImage) {
          Swal.fire({
            title: 'Error!',
            text: 'Por favor, seleccione una imagen antes de guardar el producto.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
      
        // First, upload the image
        this.imageService.uploadImage(this.selectedImage).then((imageResponse: { id: string }) => {
          // Check the type of imageResponse.id
          console.log('Image Response:', imageResponse); // Log the response for debugging
      
          // Ensure that imageResponse.id is treated as a string
          this.product = {
            name: this.product.name,
            price: this.product.price,
            categorias: this.product.categorias,
            description: this.product.description,
            quantity: this.product.quantity,
            files: [imageResponse.id] // Ensure this is a string
          };
      
          // Now add the product with the uploaded image
          return this.productsService.addProduct(this.product);
        }).then(response => {
          console.log('Product added:', response);
          Swal.fire({
            title: 'Éxito!',
            text: 'Producto guardado con éxito!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
      
          // Reset the product object with all required properties
          this.product = { 
            name: '', 
            price: 0, 
            categorias: '', 
            description: '', 
            quantity: 0,
            files: []
          }; 
          this.selectedImage = null;
        }).catch(error => {
          console.error('Error adding product:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Error al guardar el producto.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
      } */
      
  ngOnInit(): void {
    this.productos = this.global.getProductos(); // Obtén la lista de productos
    this.totalProductos = this.global.getProductosCount(); // Obtén el conteo de productos
  } 

  toggleCategories() {
    this.showCategories = !this.showCategories;
  }

  toggleProducts() {
    this.showProducts = !this.showProducts;
  }
}
