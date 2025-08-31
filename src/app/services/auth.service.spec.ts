import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpClient;
  let routerMock: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpClient);
    routerMock = TestBed.inject(Router);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });
});
