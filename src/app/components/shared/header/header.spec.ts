import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartService } from '../../../services/cart.service';
import { of } from 'rxjs';

describe('Header', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let cartServiceMock: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cartServiceMock = jasmine.createSpyObj('CartService', ['getCartItems', 'showCart', 'getCartItemCount']);
    cartServiceMock.getCartItems.and.returnValue(of([]));
    cartServiceMock.getCartItemCount.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería ser creado', () => {
    expect(component).toBeTruthy();
  });
});
