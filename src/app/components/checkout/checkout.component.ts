import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    message: '',
    state: '',
    city: '',
    address: '',
    apartment: '',
    comment: ''
  };
constructor() {
 
  }
  sendToWhatsApp() {
    const form = document.getElementById('checkoutForm') as HTMLFormElement;

    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const state = (form.elements.namedItem('state') as HTMLSelectElement).value;
    const city = (form.elements.namedItem('city') as HTMLSelectElement).value;
    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    const apartment = (form.elements.namedItem('apartment') as HTMLInputElement).value;
    const comment = (form.elements.namedItem('comment') as HTMLTextAreaElement).value;

    const message = `Hola, mi nombre es ${name}. Mi correo es ${email} y mi número de teléfono es ${phone}. Estado: ${state}. Ciudad: ${city}. Dirección: ${address} ${apartment ? ', ' + apartment : ''}. Notas: ${comment}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/584127667553?text=${encodedMessage}`; // Reemplaza con el número de WhatsApp

    window.open(whatsappUrl, '_blank'); // Abre el enlace en una nueva pestaña
}
}
