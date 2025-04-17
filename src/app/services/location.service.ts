// services/location.service.ts
import { Injectable } from '@angular/core';
import { Estado } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private estados: Estado[] = [
    {
      nombre: 'Amazonas',
      ciudades: ['Puerto Ayacucho', 'San Fernando de Atabapo', 'Maroa', 'La Esmeralda']
    },
    {
      nombre: 'Anzoátegui',
      ciudades: ['Barcelona', 'Puerto La Cruz', 'El Tigre', 'Anaco', 'Cantaura', 'Lechería']
    },
    {
      nombre: 'Apure',
      ciudades: ['San Fernando de Apure', 'Guasdualito', 'Elorza', 'Achaguas', 'Biruaca']
    },
    {
      nombre: 'Aragua',
      ciudades: ['Maracay', 'Turmero', 'La Victoria', 'Cagua', 'Villa de Cura', 'El Limón']
    },
    {
      nombre: 'Barinas',
      ciudades: ['Barinas', 'Ciudad Bolivia', 'Santa Bárbara', 'Sabaneta', 'Barinitas']
    },
    {
      nombre: 'Bolívar',
      ciudades: ['Ciudad Bolívar', 'Ciudad Guayana', 'Upata', 'El Callao', 'Santa Elena de Uairén']
    },
    {
      nombre: 'Carabobo',
      ciudades: ['Valencia', 'Puerto Cabello', 'Guacara', 'Mariara', 'San Joaquín']
    },
    {
      nombre: 'Cojedes',
      ciudades: ['San Carlos', 'Tinaquillo', 'El Baúl', 'Tinaco', 'El Pao']
    },
    {
      nombre: 'Delta Amacuro',
      ciudades: ['Tucupita', 'Curiapo', 'Pedernales', 'Sierra Imataca']
    },
    {
      nombre: 'Falcón',
      ciudades: ['Coro', 'Punto Fijo', 'Puerto Cumarebo', 'Dabajuro', 'Churuguara']
    },
    {
      nombre: 'Guárico',
      ciudades: ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua', 'Altagracia de Orituco']
    },
    {
      nombre: 'Lara',
      ciudades: ['Barquisimeto', 'Carora', 'Quíbor', 'El Tocuyo', 'Duaca']
    },
    {
      nombre: 'Mérida',
      ciudades: ['Mérida', 'El Vigía', 'Tovar', 'Ejido', 'Lagunillas']
    },
    {
      nombre: 'Miranda',
      ciudades: ['Los Teques', 'Guarenas', 'Guatire', 'Petare', 'Santa Teresa del Tuy']
    },
    {
      nombre: 'Monagas',
      ciudades: ['Maturín', 'Punta de Mata', 'Caripito', 'Temblador']
    },
    {
      nombre: 'Nueva Esparta',
      ciudades: ['La Asunción', 'Porlamar', 'Pampatar', 'Juan Griego']
    },
    {
      nombre: 'Portuguesa',
      ciudades: ['Guanare', 'Acarigua', 'Araure', 'Biscucuy', 'Guanarito']
    },
    {
      nombre: 'Sucre',
      ciudades: ['Cumaná', 'Carúpano', 'Güiria', 'Araya', 'Cariaco']
    },
    {
      nombre: 'Táchira',
      ciudades: ['San Cristóbal', 'Rubio', 'La Fría', 'Táriba', 'Colón']
    },
    {
      nombre: 'Trujillo',
      ciudades: ['Trujillo', 'Valera', 'Boconó', 'La Quebrada', 'Carvajal']
    },
    {
      nombre: 'Vargas',
      ciudades: ['La Guaira', 'Maiquetía', 'Catia La Mar', 'Caraballeda']
    },
    {
      nombre: 'Yaracuy',
      ciudades: ['San Felipe', 'Yaritagua', 'Chivacoa', 'Nirgua', 'Cocorote']
    },
    {
      nombre: 'Zulia',
      ciudades: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Santa Bárbara del Zulia', 'Machiques']
    }
  ];

getEstados(): Estado[] {
    return [...this.estados].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  getCiudadesByEstado(estadoNombre: string): string[] {
    const estado = this.estados.find(e => e.nombre === estadoNombre);
    return estado ? [...estado.ciudades] : []; // Retorna copia del array
  }
  
}