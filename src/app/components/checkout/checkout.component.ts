import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { LocationService } from '../../services/location.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Estado } from '../../models/location.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  estados: Estado[] = [];
  ciudades: string[] = [];
  carTotalPrice: number = 0;
  
  checkoutForm: FormGroup;

  constructor(
    public global: GlobalService,
    public locationService: LocationService,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario con validaciones
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      estado: ['', Validators.required],
      ciudad: ['', ],
      address: ['', [Validators.required, Validators.minLength(10)]],
      comment: [''],
      shippingMethod: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });

    // Inicializar datos del carrito
    this.carTotalPrice = this.global.getTotalPrice();
  }

  ngOnInit(): void {
    // Cargar estados
    this.estados = this.locationService.getEstados();
    
    // Escuchar cambios en el estado para cargar ciudades
    this.checkoutForm.get('estado')?.valueChanges.subscribe(estadoNombre => {
      if (estadoNombre) {
        this.ciudades = this.locationService.getCiudadesByEstado(estadoNombre);
        this.checkoutForm.get('ciudad')?.enable();
      } else {
        this.ciudades = [];
        this.checkoutForm.get('ciudad')?.reset();
        this.checkoutForm.get('ciudad')?.disable();
      }
    });

    // Escuchar cambios en el carrito para actualizar el total
    this.global.cartUpdated$.subscribe(() => {
      this.carTotalPrice = this.global.getTotalPrice();
    });
  }

  sendToWhatsApp() {
    // Marcar todos los campos como touched para mostrar errores
    this.markFormGroupTouched(this.checkoutForm);
    
    // Verificar si el formulario es válido
    if (this.checkoutForm.invalid) {
      console.error('Formulario inválido. Por favor complete todos los campos requeridos.');
      return;
    }

    // Obtener valores del formulario
    const formData = this.checkoutForm.value;
    const cartItems = this.global.getCartItems();

    // Validar que hay items en el carrito
    if (cartItems.length === 0) {
      console.error('El carrito está vacío');
      return;
    }

    // Formatear los items del carrito para el mensaje
    const itemsText = cartItems.map(item => 
      `➡ ${item.name} (x${item.quantity}) - $${item.price * item.quantity}`
    ).join('\n    ');

    // Crear mensaje estructurado para WhatsApp
    const message = `¡Nuevo pedido! 🛒

📌 *Información del cliente*:
👤 Nombre: ${formData.name}
📞 Teléfono: ${formData.phone}
📧 Email: ${formData.email}
📍 Ubicación: ${formData.ciudad}, ${formData.estado}
🏠 Dirección: ${formData.address}

🛍️ *Detalles del pedido*:
    ${itemsText}

💰 *Total del pedido*: $${this.carTotalPrice}

🚚 *Método de envío*: 
${formData.shippingMethod === 'envio_merida' ? 'Envío a Mérida' : 'Envío nacional'}

💳 *Método de pago*: 
${this.getPaymentMethodName(formData.paymentMethod)}

📝 *Notas adicionales*: 
${formData.comment || 'Ninguna'}`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '584127667553'; // Reemplaza con tu número de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Opcional: Resetear el formulario después de enviar
    // this.checkoutForm.reset();
    // this.global.clearCart();
  }

  // Método auxiliar para marcar todos los campos como touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para obtener el nombre del método de pago
  private getPaymentMethodName(method: string): string {
    switch(method) {
      case 'transferencia': return 'Transferencia Bancaria';
      case 'contraentrega': return 'Pago contraentrega';
      case 'digital': return 'Paypal/Binance/Zinly';
      default: return method;
    }
  }
}