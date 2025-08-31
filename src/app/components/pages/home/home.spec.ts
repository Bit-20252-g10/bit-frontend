import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { HomeService } from '../../../services/home.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let homeServiceMock: jasmine.SpyObj<HomeService>;

  beforeEach(async () => {
    homeServiceMock = jasmine.createSpyObj('HomeService', ['getHomeData']);
    homeServiceMock.getHomeData.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { 
        hero: {
          heroTitle: 'Welcome to Our Platform',
          heroSubtitle: 'Discover amazing games and features',
          heroButtonText: 'Get Started',
          heroButtonRoute: '/games',
          heroBackgroundImage: 'banner.jpg'
        },
        categories: [],
        features: [],
        featuredGames: [],
        stats: {
          totalGames: 0
        }
      } 
    }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HomeService, useValue: homeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería ser creado', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los datos del hogar al inicializarse', () => {
    expect(homeServiceMock.getHomeData).toHaveBeenCalled();
  });
});
