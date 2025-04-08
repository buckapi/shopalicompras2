import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private pb: PocketBase;
  private apiUrl = 'https://db.buckapi.lat:8050';

  constructor() {
    this.pb = new PocketBase(this.apiUrl);
  }

  async uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    try {
      return await this.pb.collection('files').create(formData);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error; // Vuelve a lanzar el error para que pueda ser manejado en el componente
    }
  }
}
