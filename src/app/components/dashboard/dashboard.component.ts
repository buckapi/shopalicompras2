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

  product = {
    name: '',
    price: 0, 
    categorias: '', 
    description: '', 
    files: [] , 
    videos: [] , 
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
  maxVideoSizeMB = 100; // Límite de tamaño en MB
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
      try {
        // Validación mínima de datos del producto
        if (!this.product.name || !this.product.price || !this.product.categorias) {
          await Swal.fire({
            title: 'Datos incompletos',
            text: 'Por favor complete los campos obligatorios: Nombre, Precio y Categoría',
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
    
        // Mostrar loading
        Swal.fire({
          title: 'Guardando producto...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });
    
        // Subir imágenes
        let imageUrls = [];
        try {
          imageUrls = await this.uploadImages();
        } catch (error) {
          console.error('Error al subir imágenes:', error);
          throw new Error('Error al subir las imágenes');
        }
        
        // Subir videos
        let videoUrls = [];
        try {
          videoUrls = await this.uploadVideos();
        } catch (error) {
          console.error('Error al subir videos:', error);
          throw new Error('Error al subir los videos');
        }
    
        // Preparar datos del producto
        const productData: any = {
          name: String(this.product.name || '').trim(),
          price: Number(this.product.price) || 0,
          categorias: this.product.categorias,
          description: String(this.product.description || '').trim(),
          quantity: Number(this.product.quantity) || 0,
          files: [...imageUrls],
          dimensions: String(this.product.dimensions || '').trim(),
          weight: Number(this.product.weight) || 0,
          manufacturer: String(this.product.manufacturer || '').trim(),
          code: String(this.product.code || '').trim(),
          country: String(this.product.country || '').trim(),
          material: String(this.product.material || '').trim()
        };
    
        // Agregar videos solo si existen
        if (videoUrls.length > 0) {
          productData.videos = [...videoUrls];
        }
    
        // Guardar producto
        await this.productsService.addProduct(productData);
    
        // Cerrar loading y mostrar éxito
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Producto guardado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
    
        // Resetear formulario
        this.resetForm();
    
      } catch (error: any) {
        console.error('Error al guardar producto:', error);
        
        // Mostrar mensaje de error específico si está disponible
        const errorMessage = error.message || 'Ocurrió un problema al guardar el producto';
        
        await Swal.fire({
          title: 'Error',
          text: errorMessage,
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
          console.log('Subiendo video:', video.file.name, 'Tamaño:', video.file.size);
          
          const formData = new FormData();
          formData.append('file', video.file);  // Cambiado de video_file a file
          
          console.log('Enviando video a PocketBase...');
          const record = await this.pb.collection('videos').create(formData);
          console.log('Video subido:', record);
          
          if (record?.['file']) {  // Cambiado de video_file a file
            const videoUrl = `${this.apiUrl}/api/files/${record['collectionId']}/${record['id']}/${record['file']}`;
            console.log('URL del video:', videoUrl);
            videoUrls.push(videoUrl);
          } else {
            console.error('No se encontró el archivo en la respuesta:', record);
            throw new Error('Error al procesar el video en el servidor');
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
