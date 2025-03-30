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
  productToEdit: any = {};
  totalProductos: number = 0;
  productos: any[] = [];
  userName: string = '';
  showCategories: boolean = false;
  showProducts: boolean = false;
  addProductForm: FormGroup;
selectedImage: File | null = null;
selectedImages: { file: File, preview: string }[] = [];

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

  
  /* onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePrev = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  } */
    onImagesChange(event: any): void {
      const files = event.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push({
              file: file,
              preview: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    // Método para eliminar una imagen
    removeImage(index: number): void {
      this.selectedImages.splice(index, 1);
    }
    
  /* async onSubmit() { // Agregar 'async' aquí
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
  } */
    async onSubmit() {
      if (this.selectedImages.length === 0) {
        Swal.fire({
          title: 'Error!',
          text: 'Por favor, seleccione al menos una imagen antes de guardar el producto.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    
      const files: string[] = [];
      
      try {
        // Subir todas las imágenes
        for (const image of this.selectedImages) {
          const formData = new FormData();
          formData.append('image', image.file);
          
          const newImageRecord: any = await this.pb.collection('files').create(formData);
          
          if (newImageRecord) {
            const fileUrl = `${this.apiUrl}/api/files/${newImageRecord.collectionId}/${newImageRecord.id}/${newImageRecord.image}`;
            files.push(fileUrl);
          }
        }
    
        if (files.length > 0) {
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
    
          // Restablecer el formulario
          this.resetForm();
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'No se subieron imágenes correctamente.',
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
    /*  async updateProduct() {
    const productData = {
        id: this.productToEdit.id,
        name: this.productToEdit.name,
        price: this.productToEdit.price,
        categorias: this.productToEdit.categorias,
        description: this.productToEdit.description,
        quantity: this.productToEdit.quantity,
        files: this.productToEdit.files,
        dimensions: this.productToEdit.dimensions,
        weight: this.productToEdit.weight,
        manufacturer: this.productToEdit.manufacturer,
        code: this.productToEdit.code,
        country: this.productToEdit.country,
        material: this.productToEdit.material
    };

    // Call the updateProduct method with only productData
    await this.global.updateProduct(this.productToEdit.id, productData).toPromise();

    this.resetEditForm(); // Optional: Clear the EDIT form
    this.productos = await this.global.getProductos(); // Refresh the product list
} */
async updateProduct() {
  try {
    // Envía solo los campos necesarios (opcional, puedes enviar todo productToEdit)
    const data = {
      name: this.productToEdit.name,
      price: this.productToEdit.price,
      categorias: this.productToEdit.categorias,
      // ... otros campos ...
    };

    await this.global.updateProduct(this.productToEdit.id, data).toPromise();
    Swal.fire('¡Éxito!', 'Producto actualizado', 'success');
    this.resetEditForm();
  } catch (error) {
    Swal.fire('Error', 'No se pudo actualizar', 'error');
    console.error(error);
  }
}
resetForm(): void {
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
  this.selectedImages = [];
  this.productos = this.global.getProductos();
}
  
  // Limpiar formulario EDIT
  resetEditForm() {
    this.productToEdit = {};
  }
      
  ngOnInit(): void {
    this.productos = this.global.getProductos(); // Obtén la lista de productos
    this.totalProductos = this.global.getProductosCount(); // Obtén el conteo de productos
    this.global.productToEdit$.subscribe((product) => {
      if (product) {
        this.productToEdit = { ...product }; // Copia los datos al formulario de edición
        this.selectedImagePrev = product.files?.[0] || ''; // Precarga la imagen
        this.global.menuSelected = 'edit-product'; // Muestra el formulario de edición
      }
    });
  } 
  
  toggleCategories() {
    this.showCategories = !this.showCategories;
  }

  toggleProducts() {
    this.showProducts = !this.showProducts;
  }
}
