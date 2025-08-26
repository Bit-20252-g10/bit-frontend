import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart';
import { CartService } from '../../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Cart', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartServiceMock: jasmine.SpyObj<CartService>;
  let toastrMock: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    cartServiceMock = jasmine.createSpyObj('CartService', ['getCartItems', 'removeFromCart', 'updateQuantity', 'getCartVisible', 'hideCart', 'clearCart', 'showCart', 'getCartItemCount', 'addToCart', 'getCartTotal']);
    toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    cartServiceMock.getCartItems.and.returnValue(of([]));
    cartServiceMock.getCartVisible.and.returnValue(of(false));
    cartServiceMock.getCartItemCount.and.returnValue(0);
    cartServiceMock.getCartTotal.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart items on init', () => {
    expect(cartServiceMock.getCartItems).toHaveBeenCalled();
  });
});
