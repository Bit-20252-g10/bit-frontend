import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Juegos } from './juegos';
import { GamesService } from '../../../services/games.service';
import { CartService } from '../../../services/cart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Juegos', () => {
  let component: Juegos;
  let fixture: ComponentFixture<Juegos>;
  let gamesServiceMock: jasmine.SpyObj<GamesService>;
  let cartServiceMock: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    gamesServiceMock = jasmine.createSpyObj('GamesService', [
      'getAllGames', 
      'getPlaystationGames', 
      'getXboxGames', 
      'getNintendoGames'
    ]);
    cartServiceMock = jasmine.createSpyObj('CartService', ['addToCart', 'showCart']);
    
    gamesServiceMock.getAllGames.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: [] 
    }));
    gamesServiceMock.getPlaystationGames.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: [] 
    }));
    gamesServiceMock.getXboxGames.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: [] 
    }));
    gamesServiceMock.getNintendoGames.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: [] 
    }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: GamesService, useValue: gamesServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Juegos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia cargar los juegos al inicializarse', () => {
    expect(gamesServiceMock.getAllGames).toHaveBeenCalled();
  });
});
