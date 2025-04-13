import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { LocationService } from '../../services/location.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Estado } from '../../models/location.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Añade ReactiveFormsModule aquí
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  estados: Estado[] = [];
  ciudades: string[] = [];
  carItems: any[] = [];
  carTotalPrice: number = 0;
  checkoutForm: FormGroup;

  constructor(
    public global: GlobalService,
    public locationService: LocationService,
    private fb: FormBuilder
  ) {
    this.carItems = this.global.getCartItems();
    this.carTotalPrice = this.global.getTotalPrice();
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      estado: ['', Validators.required],
      ciudad: ['', Validators.required],
      address: ['', Validators.required],
      apartment: [''],
      comment: ['']
    });
  }

  ngOnInit(): void {
    this.estados = this.locationService.getEstados();
    
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
  }

  sendToWhatsApp() {
    if (this.checkoutForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const formValues = this.checkoutForm.value;
    const message = `Hola, mi nombre es ${formValues.name}. Mi correo es ${formValues.email} y mi número de teléfono es ${formValues.phone}. 
Estado: ${formValues.estado}. 
Ciudad: ${formValues.ciudad}. 
Dirección: ${formValues.address}${formValues.apartment ? ', ' + formValues.apartment : ''}. 
Notas: ${formValues.comment || 'Ninguna'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/584127667553?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}