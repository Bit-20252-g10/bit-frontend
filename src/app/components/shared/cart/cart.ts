import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isVisible = false;
  private cartSubscription: Subscription = new Subscription();
  private visibilitySubscription: Subscription = new Subscription();

  showClearCartModal: boolean = false;

  constructor(private cartService: CartService, private toastr: ToastrService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    this.visibilitySubscription = this.cartService.getCartVisible().subscribe(visible => {
      this.isVisible = visible;
    });
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.visibilitySubscription.unsubscribe();
  }

  closeCart() {
    this.cartService.hideCart();
  }

  updateQuantity(itemId: string, quantity: number) {
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: string) {
    this.cartService.removeFromCart(itemId);
  }


  openClearCartModal() {
    this.showClearCartModal = true;
  }


  closeClearCartModal(confirmed: boolean) {
    if (confirmed) {
      this.cartService.clearCart();
      this.toastr.info('El carrito ha sido vaciado.');
    }
    this.showClearCartModal = false;
  }

  checkout() {
    try {
      const message = this.createWhatsAppMessage();
      const phoneNumber = '573155230570';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      this.toastr.info('Abriendo WhatsApp para procesar tu pedido...');
      
      const newWindow = window.open(whatsappUrl, '_blank');
      if (!newWindow) {
        this.toastr.error('El navegador bloqueó la ventana emergente. Por favor, revisa la configuración.');

      }

      setTimeout(() => {
        this.cartService.clearCart();
        this.closeCart();
      }, 1000);

    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      this.toastr.error('Ocurrió un error al intentar abrir WhatsApp. Inténtalo de nuevo más tarde.');
      

      this.cartService.clearCart();
      this.closeCart();
    }
  }

  private createWhatsAppMessage(): string {
    const total = this.getCartTotal();
    
    let message = `NUEVO PEDIDO - Princegaming\n\n`;
    message += `Productos solicitados:\n\n`;
    
    this.cartItems.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name}\n`;
      message += `   Marca: ${item.brand || 'N/A'}\n`;
      message += `   Tipo: ${this.getTypeLabel(item.type)}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} c/u\n`;
      message += `   Subtotal: ${subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}\n\n`;
    });
    
    message += `TOTAL: ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}\n\n`;
    message += `Por favor, confirma mi pedido y proporciona información sobre el envío.`;
    
    return message;
  }


  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'juego': 'Juego'
    };
    return labels[type] || type;
  }
}