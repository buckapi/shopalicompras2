import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
constructor(public global: GlobalService) { }
sendToWhatsApp() {
  const phoneNumber = '584127667553'; // Reemplaza con el número de WhatsApp
  const message = `Hola, mi nombre es ${this.formData.name}. Mi correo es ${this.formData.email} y mi número de teléfono es ${this.formData.phone}. Mensaje: ${this.formData.message}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${+584127667553}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank'); // Abre el enlace en una nueva pestaña
}
}
