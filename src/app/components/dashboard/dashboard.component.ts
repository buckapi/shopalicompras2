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
import { VideoOptimizerService } from '../../services/video.service';
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
  error?: string;  // Nuevo campo para manejar errores
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
  maxVideoSizeMB = 500; // Límite de tamaño en MB
  categories: any[] = [];
  constructor(
    public global: GlobalService,
    public authService: AuthPocketbaseService,
    public realtimeProductosService: RealtimeProductosService,
    public realtimecategorias: RealtimeCategoriasService,
    public productsService: ProductsService,
    public fb: FormBuilder,
    public videoService: VideoOptimizerService
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
      videos: [''],

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

    async onVideoSelected(event: Event): Promise<void> {
      const input = event.target as HTMLInputElement;
      const files = input.files;
      
      if (!files || files.length === 0) return;
    
      // Obtener el límite máximo del servidor (5MB en tu caso)
      const serverMaxSize = 104857600; // 100MB en bytes
      const serverMaxSizeMB = (serverMaxSize / (1024 * 1024)).toFixed(1);
    
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Video seleccionado:', file.name, 'Tamaño:', file.size);
        
        // Validar tamaño contra el límite del servidor
        if (file.size > serverMaxSize) {
          await Swal.fire({
            title: 'Archivo demasiado grande',
            html: `El video <strong>${file.name}</strong> (${(file.size/(1024*1024)).toFixed(1)}MB) 
                   excede el límite máximo de ${serverMaxSizeMB}MB permitido por el servidor.`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          continue;
        }
    
        // Resto de validaciones (tipo de archivo, etc.)
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/3gpp', 'video/3gpp2','video/quicktime'];
        if (!validVideoTypes.includes(file.type)) {
          await Swal.fire({
            title: 'Formato no soportado',
            text: `El archivo ${file.name} debe ser MP4, WebM, OGG, MOV, 3GPP, 3GPP2 o QuickTime`,
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
          continue;
        }
    
        // Si pasa las validaciones, agregar a la lista
        const videoUrl = URL.createObjectURL(file);
        this.selectedVideos.push({
          file: file,
          preview: videoUrl,
          uploadProgress: 0,
          uploadComplete: false,
          error: undefined
        });
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
        
      
          let videoUrls = [];
          try {
            videoUrls = await this.uploadVideos();
          } catch (error: unknown) {
            let errorMessage = 'Error al subir videos';
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            
            await Swal.fire({
              title: 'Error en videos',
              text: errorMessage,
              icon: 'error'
            });
            return;
          }
    
        // Preparar datos del producto
        const productData: any = {
          name: String(this.product.name || '').trim(),
          price: Number(this.product.price) || 0,
          categorias: this.product.categorias,
          description: String(this.product.description || '').trim(),
          quantity: Number(this.product.quantity) || 0,
          files: [...imageUrls],
          videos: [...videoUrls],
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
        this.global.menuSelected = 'products';
    
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
    async uploadVideos(): Promise<string[]> {
      const videoUrls: string[] = [];
      
      for (const video of this.selectedVideos) {
        try {
          console.log('Subiendo video:', video.file.name, 'Tamaño:', video.file.size);
          
          const formData = new FormData();
          formData.append('video_file', video.file);  // Usar 'video_file' que coincide con tu colección
          
          console.log('Enviando video a PocketBase...');
          const record = await this.pb.collection('videos').create(formData);
          console.log('Video subido:', record);
          
          // Verificar el campo correcto según tu colección
          if (record?.['video_file']) {
            const videoUrl = `${this.apiUrl}/api/files/${record['collectionId']}/${record['id']}/${record['video_file']}`;
            console.log('URL del video:', videoUrl);
            videoUrls.push(videoUrl);
          } else {
            console.error('No se encontró el archivo en la respuesta:', record);
            throw new Error('El servidor no devolvió la información del video correctamente');
          }
        } catch (error: unknown) {
          console.error('Error subiendo video:', error);
          
          let errorMessage = 'Error al subir el video';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          throw new Error(errorMessage);
        }
      }
      
      return videoUrls;
    }

    async updateProduct() {
      try {
        const data = {
          name: this.productToEdit.name,
          price: this.productToEdit.price,
          categorias: this.productToEdit.categorias,
          description: this.productToEdit.description,
          quantity: this.productToEdit.quantity,
          dimensions: this.productToEdit.dimensions,
          weight: this.productToEdit.weight,
          manufacturer: this.productToEdit.manufacturer,
          code: this.productToEdit.code,
          country: this.productToEdit.country,
          material: this.productToEdit.material,
          files: this.productToEdit.files,
          videos: this.productToEdit.videos,
        };

        await this.global.updateProduct(this.productToEdit.id, data).toPromise();
        Swal.fire('¡Éxito!', 'Producto actualizado', 'success');
        this.resetEditForm();
        this.global.menuSelected = 'products';
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
  async deleteProduct(id: string) {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await this.pb.collection('productos').delete(id);
        Swal.fire(
          '¡Eliminado!',
          'El producto ha sido eliminado.',
          'success'
        );
        // Actualizar la lista de productos
        this.productos = this.global.getProductos();
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Swal.fire(
        'Error',
        'No se pudo eliminar el producto',
        'error'
      );
    }
  }
  async deleteCategory(id: string) {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await this.pb.collection('categorias').delete(id);
        Swal.fire(
          '¡Eliminado!',
          'La categoria ha sido eliminada.',
          'success'
        );
        // Actualizar la lista de categorias
        this.realtimecategorias.categorias = this.global.getCategorias();
      }
    } catch (error) {
      console.error('Error al eliminar la categoria:', error);
      Swal.fire(
        'Error',
        'No se pudo eliminar la categoria',
        'error'
      );
    }
  }
}
