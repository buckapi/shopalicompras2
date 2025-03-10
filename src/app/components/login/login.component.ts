import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobalService } from '../../services/global.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible: boolean = false; // Variable para mostrar/ocultar la contraseña
  errorMessage: string | null = null;
  showPassword: boolean = false; // Asegúrate de que esta propiedad esté aquí
  constructor(
  public global: GlobalService,
    private authService: AuthPocketbaseService,
    private fb: FormBuilder
) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
}

togglePasswordVisibility() {
  this.showPassword = !this.showPassword; // Cambia la visibilidad de la contraseña
}

// Método para manejar el envío del formulario de inicio de sesión
onLogin() {
   if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
    this.authService.loginUser(email, password).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso', response);

        // Guardar el estado de login y el usuario actual en localStorage
        localStorage.setItem('isLoggedin', 'true');
        this.authService.setUser(response.user); // Suponiendo que `response.user` es el usuario

        // Redirigir según el tipo de usuario con `permision()`
        this.authService.permision();
      },
      error: (error) => {
        console.error('Error en el inicio de sesión:', error);
        this.errorMessage = 'Credenciales incorrectas, intenta de nuevo.';
      }
    });
   } else {
     this.errorMessage = 'Por favor, completa los campos correctamente.';
   }
}
}

