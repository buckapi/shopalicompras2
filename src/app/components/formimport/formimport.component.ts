import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { GlobalService } from '../../services/global.service';
@Component({
  selector: 'app-formimport',
  templateUrl: './formimport.component.html',
  styleUrls: ['./formimport.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ],
})
export class FormimportComponent {
  formimport: FormGroup;

  constructor(
    public fb: FormBuilder,
    public global: GlobalService  ) {
    this.formimport = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      product_description: ['', Validators.required],
      investment: ['', Validators.required],
      contactPreference: ['', Validators.required],
      brands: ['', Validators.required],
      price: ['', Validators.required],
      shippingMethod: ['', Validators.required]
    });
  }

  onSubmit() {
    // Marcar todos los campos como touched para mostrar errores
    this.formimport.markAllAsTouched();
    
    // Verificar si el formulario es válido
    if (this.formimport.invalid) {
      console.error('Formulario inválido. Por favor complete todos los campos requeridos.');
      return;
    }

    // Obtener valores del formulario
    const formData = this.formimport.value;

    // Crear mensaje estructurado para WhatsApp
    const message = `¡Nueva Solicitud de Importación! 🚀

📌 *Información del Cliente*:
👤 *Nombre:* ${formData.name}
📞 *Teléfono:* ${formData.phone}
📧 *Email:* ${formData.email}
📍 *Ubicación:* ${formData.address}

📝 *Preferencia de Contacto:* ${this.getContactPreferenceText(formData.contactPreference)}

🛒 *Detalles del Producto:*
🔹 *Descripción:* ${formData.product_description}
🔹 *Marcas Conocidas en Venezuela:* ${formData.brands}
🔹 *Precio Local:* ${formData.price}
💰 *Inversión Estimada:* ${formData.investment}

🚚 *Método de Envío Preferido:* ${this.getShippingMethodText(formData.shippingMethod)}`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '584127667553'; // Reemplaza con tu número de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Opcional: Resetear el formulario después de enviar
    this.formimport.reset();
    Swal.fire('¡Solicitud enviada!', 'La solicitud ha sido enviada correctamente. Estaremos contactando contigo a la brevedad posible, Gracias por su solicitud. (tiempo maximo de espera 2 horas)', 'success');
  }

  // Métodos auxiliares para obtener texto descriptivo
  private getContactPreferenceText(value: string): string {
    switch(value) {
      case 'llamadas': return 'Prefiere ser contactado por llamadas telefónicas';
      case 'whatsapp': return 'Prefiere mensajes de voz o texto por WhatsApp';
      case 'any': return 'Cualquier método de contacto es aceptable';
      default: return 'No especificado';
    }
  }

  private getShippingMethodText(value: string): string {
    switch(value) {
      case 'aereo': return 'Envío Aéreo (25-30 días) - Recomendado para mercancía liviana';
      case 'maritimo': return 'Envío Marítimo (60-85 días) - Recomendado para mercancía pesada/voluminosa';
      case 'ambos': return 'Desea ambas cotizaciones (Aéreo y Marítimo)';
      default: return 'No especificado';
    }
  }
}