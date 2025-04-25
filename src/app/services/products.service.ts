// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Asegúrate de importar map
import { GlobalService } from './global.service';
import PocketBase from 'pocketbase'; // Import PocketBase

interface Product {

    name: string;
    price: number; // Change to string if price is expected as a string
    categorias: string; // Add categorias
    description: string; // Add description
    files: string[]; // Add files as an array of strings
    videos: string[]; // Add videos as an array of strings
    quantity: number; // Add quantity
    dimensions: string; // Add dimensions
    weight: string; // Add weight
    manufacturer: string; // Add manufacturer
    code: string; // Add code
    country: string; // Add country
    material: string; // Add material
    unit: string; // Add unit
    marketplace_link: string; // Add marketplace link
    
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  baseUrl: string;
  private pb: PocketBase; // Add PocketBase instance

  constructor(
    // private http: HttpClient,
    private fb: FormBuilder,
    public global: GlobalService
  ) {
    this.pb = new PocketBase('https://db.buckapi.lat:8050'); // Initialize PocketBase

    this.baseUrl = 'https://db.buckapi.lat:8050';
  }

  addProduct(data: Product): Promise<Product> {
    return this.pb.collection('productos').create(data);
  }

}