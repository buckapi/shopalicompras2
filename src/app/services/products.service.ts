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
//   addProduct(data: Product): Observable<Product> {
//     const url_api = this.baseUrl + '/collections/productos/records';
//     return this.http.post<Product>(url_api, data).pipe(
//       map(response => response)
//     );
//   }
}