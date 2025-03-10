import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RealtimeProductosService implements OnDestroy {
  private pb: PocketBase;
  private productosSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public productos$: Observable<any[]> =
    this.productosSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8050');
    this.subscribeToProductos();
  }

  private async subscribeToProductos() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('admin@admin.com', 'admin1234');

    // Suscribirse a cambios en cualquier registro de la colección 'supervisors'
    this.pb.collection('productos').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de esupervisoras
    this.updateProductosList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de esupervisoras
    this.updateProductosList();
  }

  private async updateProductosList() {
    // Obtener la lista actualizada de esupervisoras
    const records = await this.pb
      .collection('productos')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: '-created', // Ordenar por fecha de creación
      });
    this.productosSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('productos').unsubscribe('*');
  }

  getProductosCount(): number {
    return this.productosSubject.value.length;
  } 
}
