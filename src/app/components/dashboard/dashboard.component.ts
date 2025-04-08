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
interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface VideoFile {
  file: File;
  preview: string;
  uploadProgress?: number;
  uploadComplete?: boolean;
}
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

  product: any = {
    id: '',
    name: '',
    price: 0,
    categorias: '',
    description: '',
    files: [],
    videos: [],
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
  selectedMedia: MediaFile[] = [];
  selectedImagePrev: string = '';
  selectedVideos: VideoFile[] = [];
  maxVideoSizeMB = 50; // Límite de tamaño en MB
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

    onVideosChange(event: any): void {
      const files = event.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Validar tamaño del video
          if (file.size > this.maxVideoSizeMB * 1024 * 1024) {
            Swal.fire({
              title: 'Archivo demasiado grande',
              text: `El video ${file.name} excede el límite de ${this.maxVideoSizeMB}MB`,
              icon: 'warning',
              confirmButtonText: 'Entendido'
            });
            continue;
          }
    
          // Validar tipo de archivo
          if (!file.type.startsWith('video/')) {
            Swal.fire({
              title: 'Formato no soportado',
              text: `El archivo ${file.name} no es un video válido`,
              icon: 'warning',
              confirmButtonText: 'Entendido'
            });
            continue;
          }
    
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedVideos.push({
              file: file,
              preview: e.target.result,
              uploadProgress: 0,
              uploadComplete: false
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    // Método para eliminar video
    removeVideo(index: number): void {
      this.selectedVideos.splice(index, 1);
    }
    async onSubmit() {
      // Validación mínima de datos del producto
      if (!this.product.name || !this.product.price) {
        Swal.fire({
          title: 'Datos incompletos',
          text: 'Por favor complete los campos obligatorios del producto',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    
      // Validación de medios (al menos una imagen o video)
      if (this.selectedImages.length === 0 && this.selectedVideos.length === 0) {
        const result = await Swal.fire({
          title: '¿Continuar sin medios?',
          text: 'El producto no tiene imágenes ni videos. ¿Desea guardarlo de todas formas?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'No, cancelar'
        });
        
        if (!result.isConfirmed) {
          return;
        }
      }
    
      try {
        // Subir imágenes
        const imageUrls = await this.uploadImages();
        
        // Subir videos
        const videoUrls = await this.uploadVideos();
    
        // Preparar datos del producto
        const productData: any = {
          name: this.product.name,
          price: this.product.price,
          categorias: this.product.categorias,
          description: this.product.description,
          quantity: this.product.quantity,
          files: [...imageUrls], // Spread operator para copiar el array
          dimensions: this.product.dimensions,
          weight: this.product.weight,
          manufacturer: this.product.manufacturer,
          code: this.product.code,
          country: this.product.country,
          material: this.product.material
        };
    
        // Agregar videos solo si existen
        if (videoUrls.length > 0) {
          productData.videos = [...videoUrls];
        }
    
        // Guardar producto
        await this.productsService.addProduct(productData);
    
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Éxito!',
          text: 'Producto guardado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
    
        // Resetear formulario
        this.resetForm();
    
      } catch (error) {
        console.error('Error al guardar producto:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un problema al guardar el producto',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    }
    
    // Método para subir imágenes corregido
    private async uploadImages(): Promise<string[]> {
      const imageUrls: string[] = [];
      
      for (const image of this.selectedImages) {
        try {
          const formData = new FormData();
          formData.append('image', image.file);
          
          const record = await this.pb.collection('files').create(formData);
          
          // Usar notación de corchetes para acceder a propiedades dinámicas
          if (record?.['image']) {
            const imageUrl = `${this.apiUrl}/api/files/${record['collectionId']}/${record['id']}/${record['image']}`;
            imageUrls.push(imageUrl);
          }
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          throw new Error('Error al subir imágenes');
        }
      }
      
      return imageUrls;
    }

    // Método para subir videos corregido
    private async uploadVideos(): Promise<string[]> {
      const videoUrls: string[] = [];
      
      for (const video of this.selectedVideos) {
        try {
          const formData = new FormData();
          formData.append('video_file', video.file);
          formData.append('name', video.file.name);
          
          const record = await this.pb.collection('videos').create(formData);
          
          if (record?.['video_file']) {
            const videoUrl = `${this.apiUrl}/api/files/${record['collectionId']}/${record['id']}/${record['video_file']}`;
            videoUrls.push(videoUrl);
            
            // También agregar la URL al array files si es necesario
            // Esto depende de cómo esté estructurado tu modelo de producto
            // files.push(videoUrl); // Descomenta si necesitas esto
          }
        } catch (error) {
          console.error('Error subiendo video:', error);
          throw new Error('Error al subir videos');
        }
      }
      
      return videoUrls;
    }

    async updateProduct() {
      try {
        const data = {
          name: this.product.name,
          price: this.product.price,
          categorias: this.product.categorias,
          description: this.product.description,
          quantity: this.product.quantity,
          dimensions: this.product.dimensions,
          weight: this.product.weight,
          manufacturer: this.product.manufacturer,
          code: this.product.code,
          country: this.product.country,
          material: this.product.material,
          files: this.product.files,
          videos: this.product.videos
        };

        await this.global.updateProduct(this.product.id, data).toPromise();
        Swal.fire('¡Éxito!', 'Producto actualizado', 'success');
        this.resetEditForm();
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar', 'error');
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
        videos: [],
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
    this.selectedImagePrev = '';
    this.global.setMenuOption('add-product');
  }
      
  ngOnInit(): void {
    // Obtener productos
    this.productos = this.global.getProductos();
    this.totalProductos = this.global.getProductosCount();

    // Suscribirse a cambios en el producto a editar
    this.global.productToEdit$.subscribe((product) => {
      console.log('Producto recibido para editar:', product);
      if (product) {
        // Copiar datos al formulario
        this.productToEdit = { ...product };
        this.selectedImagePrev = product.files?.[0] || '';
        
        // Asegurar que se muestre el formulario de edición
        this.global.setMenuOption('edit-product');
        console.log('Estado del menú:', this.global.menuSelected);
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
