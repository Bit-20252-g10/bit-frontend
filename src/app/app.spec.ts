import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let toastrMock: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['validateToken', 'logout']);
    toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    authServiceMock.validateToken.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Princegaming');
  });

  it('should validate token on initialization', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(authServiceMock.validateToken).toHaveBeenCalled();
  });

  it('should logout if token validation fails', () => {
    authServiceMock.validateToken.and.returnValue(of(false));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
