import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable, from, tap, map, BehaviorSubject } from 'rxjs';
import { GlobalService } from './global.service';
import { UserInterface } from '../interfaces/user-interface';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AuthPocketbaseService {
  private pb: PocketBase;
  complete: boolean = false;
  private userTypeSubject = new BehaviorSubject<string | null>(this.getUserTypeFromStorage());
  userType$ = this.userTypeSubject.asObservable();
  private hasCheckedLoginStatus = false;

  constructor( 
    @Inject(PLATFORM_ID) private platformId: Object,
    public global: GlobalService
   ) 
  { 
    this.pb = new PocketBase('https://db.buckapi.lat:8050');
  }
 /*  async registerUser(data: any): Promise<any> {
    try {
      const record = await this.pb.collection('users').create(data);
      await this.pb.collection('users').requestVerification(data.email);
      return record;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  } */
    generateRandomPassword(length: number = 8): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    // Verificar si el almacenamiento local está disponible
    private isLocalStorageAvailable(): boolean {
      return typeof localStorage !== 'undefined';
    }
  
    // Obtener el tipo de usuario desde el almacenamiento local
    private getUserTypeFromStorage(): string | null {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem('type');
      }
      return null;
    }
    setUserType(type: string): void {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem('type', type);
      }
      this.userTypeSubject.next(type);
    }
  
    clearUserType(): void {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem('type');
      }
      this.userTypeSubject.next(null);
    }
/* isLogin() {
    console.log('Checking login status...');
    if (isPlatformBrowser(this.platformId)) {
        const status = localStorage.getItem('isLoggedin');
        console.log(`Login status: ${status}`);
        return status;
    } else {
        console.error('localStorage is not available.');
        return null;
    }
} */
    isLogin() {
      if (!this.hasCheckedLoginStatus) {
          console.log('Checking login status...');
          if (isPlatformBrowser(this.platformId)) {
              const status = localStorage.getItem('isLoggedin');
              console.log(`Login status: ${status}`);
              this.hasCheckedLoginStatus = true; // Marcar que ya se ha verificado
              return status;
          } else {
              console.error('localStorage is not available.');
              return null;
          }
      }
      // Si ya se ha verificado, simplemente devuelve el estado actual
      return localStorage.getItem('isLoggedin');
  }
  /* isAdmin() {
    const userType = localStorage.getItem('type');
    return userType === '"admin"';
  } */
    isAdmin() {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const userType = localStorage.getItem('type');
          return userType === '"admin"';
      } else {
          console.warn('localStorage is not available');
          return false; // O manejarlo de otra manera según tu lógica
      }
  }
  
  isCustomer() {
    const userType = localStorage.getItem('type');
    return userType === '"cliente"';
  }
  checkLoginStatus() {
    if (!this.hasCheckedLoginStatus) {
        this.hasCheckedLoginStatus = true;
        // Check login status logic here
    }
  }

  registerUser(email: string, password: string, type: string, name: string, username: string, company: string
    ): Observable<any> 
    {
    const userData = {
      email: email,
      password: password,
      passwordConfirm: password,
      type: type,
      username: username,
      name: name,
      company: company,
    };

    // Create user
    return from(
      this.pb
        .collection('users')
        .create(userData)
        .then((user) => {
          const data = {
            name: name,
            phone: '', // Agrega los campos correspondientes aquí
            userId: user.id, // Utiliza el ID del usuario recién creado
            status: 'pending', // Opcional, establece el estado del cliente
            images: {}, // Agrega los campos correspondientes aquí
          };
          if (type === 'cliente') {
            return this.pb.collection('customers').create(data);
          } else if (type === 'supervisor') {
            return this.pb.collection('supervisor').create(data);
          } else if (type === 'tecnico') {
            return this.pb.collection('technical').create(data);
          } else {
            throw new Error('Tipo de usuario no válido');
          }
        })
      );  
    }
  loginUser(email: string, password: string): Observable<any> {
    return from(this.pb.collection('users').authWithPassword(email, password))
      .pipe(
        map((authData) => {
          const pbUser = authData.record;
          const user: UserInterface = {
            id: pbUser.id,
            email: pbUser['email'],
            name: pbUser['name'],
            password: '', // No almacenamos la contraseña por seguridad
            phone: pbUser['phone'],
            images: pbUser['images'] || {},
            type: pbUser['type'],
            username: pbUser['username'],
            address: pbUser['address'],
            created: pbUser['created'],
            updated: pbUser['updated'],
            avatar: pbUser['avatar'] || '',
            status: pbUser['status'] || 'active',
            company: pbUser['company'] || '',
            // Añade aquí cualquier otro campo necesario
          };
          return { ...authData, user };
        }),
        tap((authData) => {
          this.setUser(authData.user);
          this.setToken(authData.token);
          localStorage.setItem('isLoggedin', 'true');
          localStorage.setItem('userId', authData.user.id);
        })
      );
  }

  logoutUser(): Observable<any> {
    // Limpiar la autenticación almacenada
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('dist');
    localStorage.removeItem('userId');
    localStorage.removeItem('type');
    localStorage.removeItem('clientCard');
    localStorage.removeItem('clientFicha');
    localStorage.removeItem('memberId');
    localStorage.removeItem('status');

    this.pb.authStore.clear();
    this.global.setRoute('login');
    
    // this.virtualRouter.routerActive = "home";
    return new Observable<any>((observer) => {
      observer.next(null); // o el valor que desees emitir
      observer.complete();
    });
  }

  setUser(user: UserInterface): void {
    let user_string = JSON.stringify(user);
    let type = JSON.stringify(user.type);
    localStorage.setItem('currentUser', user_string);
    localStorage.setItem('type', type);
  }
  setToken(token: any): void {
    localStorage.setItem('accessToken', token);
  }

  // getCurrentUser(): UserInterface {
  //   const user = localStorage.getItem('currentUser');
  //   return user ? JSON.parse(user) : null; 
  // }
  // getUserId(): string {
  //   const userId = localStorage.getItem('userId');
  //   return userId ? userId : '';
  // }
  getCurrentUser(): UserInterface | null {
    if (this.isLocalStorageAvailable()) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null; // Devuelve el usuario actual o null si no existe
    }
    return null; // Retorna null si no está en un entorno cliente
  }
  
  getUserId(): string {
    if (this.isLocalStorageAvailable()) {
      const userId = localStorage.getItem('userId');
      return userId ? userId : ''; // Devuelve el usuario actual o null si no existe
    }
    return ''; // Retorna vacío si no está en un entorno cliente
  }
  
  getFullName(): string {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      return user.name || 'Usuario';
    }
    return 'Usuario';
  }
  profileStatus() {
    return this.complete;
  }
 

    permision() {
  const currentUser = this.getCurrentUser();
  if (!currentUser || !currentUser.type) {
    this.global.setRoute('login');
    return;
  }

  const userType = currentUser.type.replace(/"/g, '');

  switch (userType) {
    case 'admin':
      this.global.setRoute('dashboard');
      break;
    case 'cliente':
      this.global.setRoute('home');
      break;    
    default:
      console.warn('Tipo de usuario no reconocido');
      this.global.setRoute('login');
  }
}

// Método auxiliar para obtener los datos del supervisor del localStorage
getSupervisorData(): any | null {
  if (this.isLocalStorageAvailable()) {
    const supervisorData = localStorage.getItem('supervisorData');
    return supervisorData ? JSON.parse(supervisorData) : null;
  }
  return null;
}

fetchCustomer(userId: string): Observable<any> {
    return from(
      this.pb.collection('customers').getFirstListItem(`userId="${userId}"`, {
        expand: 'userId',  // Expande la relación con la tabla users
        fields: '*'  // Obtiene todos los campos
      })
    ).pipe(
      map((customerData) => {
        if (this.isLocalStorageAvailable()) {
          localStorage.setItem('customerData', JSON.stringify(customerData));
        }
        return customerData;
      })
    );
  }

getCustomerData(): any | null {
  if (this.isLocalStorageAvailable()) {
    const customerData = localStorage.getItem('customerData');
    return customerData ? JSON.parse(customerData) : null;
  }
  return null;
}

  
}
