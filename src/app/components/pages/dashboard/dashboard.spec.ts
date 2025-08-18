import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GamesService, Game } from '../../../services/games.service';
import { ProductService, ProductModel } from '../../../services/product.service';
import { UploadService } from '../../../services/upload.service';
import { InventoryService, InventoryItem } from '../../../services/service/inventory.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let gamesService: jasmine.SpyObj<GamesService>;
  let productService: jasmine.SpyObj<ProductService>;
  let uploadService: jasmine.SpyObj<UploadService>;
  let inventoryService: jasmine.SpyObj<InventoryService>;
  let router: jasmine.SpyObj<Router>;

  const mockGames: Game[] = [
    {
      _id: '1',
      name: 'Test Game 1',
      consola: 'PS5',
      genero: 'Action',
      descripcion: 'Test description',
      precio: 59900,
      stock: 10,
      developer: 'Test Dev',
      publisher: 'Test Pub',
      rating: 'E',
      multiplayer: false,
      imageUrl: 'test.jpg',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];

  const mockProducts: ProductModel[] = [
    {
      _id: '1',
      name: 'PS5 Console',
      price: 499900,
      stock: 5,
      category: 'console',
      description: 'Next gen console',
      imageUrl: 'ps5.jpg'
    }
  ];

  const mockInventoryItems: InventoryItem[] = [
    {
      _id: '1',
      name: 'Test Game',
      type: 'games',
      description: 'Test game',
      price: 59900,
      stock: 10,
      imageUrl: 'test.jpg',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];

  beforeEach(async () => {
    const gamesServiceSpy = jasmine.createSpyObj('GamesService', [
      'getAllGames', 'updateGame', 'deleteGame'
    ]);
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getConsoles', 'getAccessories', 'updateProduct'
    ]);
    const uploadServiceSpy = jasmine.createSpyObj('UploadService', [
      'uploadImage', 'uploadGameImage'
    ]);
    const inventoryServiceSpy = jasmine.createSpyObj('InventoryService', [
      'createItem', 'updateItem', 'deleteItem'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: GamesService, useValue: gamesServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: UploadService, useValue: uploadServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    gamesService = TestBed.inject(GamesService) as jasmine.SpyObj<GamesService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    uploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
    inventoryService = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.isLoading).toBe(true);
      expect(component.games).toEqual([]);
      expect(component.error).toBeNull();
      expect(component.showAddForm).toBe(false);
      expect(component.editIndex).toBeNull();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call load methods on ngOnInit', () => {
      spyOn(component, 'loadGames');
      spyOn(component, 'loadConsoles');
      spyOn(component, 'loadAccessories');

      component.ngOnInit();

      expect(component.loadGames).toHaveBeenCalled();
      expect(component.loadConsoles).toHaveBeenCalled();
      expect(component.loadAccessories).toHaveBeenCalled();
    });
  });

  describe('Game Management', () => {
    it('should load games successfully', fakeAsync(() => {
      gamesService.getAllGames.and.returnValue(of({
        allOK: true,
        data: mockGames,
        message: 'Success'
      }));

      component.loadGames();
      tick();

      expect(gamesService.getAllGames).toHaveBeenCalled();
      expect(component.games).toEqual(mockGames);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
    }));

    it('should handle error when loading games', fakeAsync(() => {
      gamesService.getAllGames.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loadGames();
      tick();

      expect(component.error).toBe('Error al cargar los juegos.');
      expect(component.isLoading).toBe(false);
    }));

    it('should start editing a game', () => {
      component.games = mockGames;
      
      component.startEdit(0);
      
      expect(component.editIndex).toBe(0);
      expect(component.editedGame).toEqual(mockGames[0]);
    });

    it('should cancel editing', () => {
      component.editIndex = 0;
      component.editedGame = mockGames[0];
      
      component.cancelEdit();
      
      expect(component.editIndex).toBeNull();
      expect(component.editedGame).toEqual({});
    });

    it('should save game edit successfully', fakeAsync(() => {
      component.games = mockGames;
      component.editIndex = 0;
      component.editedGame = { precio: 69900, stock: 15 };
      
      gamesService.updateGame.and.returnValue(of({
        allOK: true,
        data: { ...mockGames[0], precio: 69900, stock: 15 },
        message: 'Updated'
      }));

      component.saveEdit(mockGames[0]);
      tick();

      expect(gamesService.updateGame).toHaveBeenCalledWith('1', {
        precio: 69900,
        stock: 15
      });
      expect(component.editIndex).toBeNull();
    }));

    it('should delete a game successfully', fakeAsync(() => {
      component.games = [...mockGames];
      spyOn(window, 'confirm').and.returnValue(true);
      
      gamesService.deleteGame.and.returnValue(of({
        allOK: true,
        data: null,
        message: 'Deleted'
      }));

      component.deleteGame(mockGames[0], 0);
      tick();

      expect(gamesService.deleteGame).toHaveBeenCalledWith('1');
      expect(component.games.length).toBe(0);
    }));

    it('should not delete game if user cancels', () => {
      component.games = [...mockGames];
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteGame(mockGames[0], 0);
      
      expect(gamesService.deleteGame).not.toHaveBeenCalled();
      expect(component.games.length).toBe(1);
    });
  });

  describe('Product Management', () => {
    it('should load consoles successfully', fakeAsync(() => {
      productService.getConsoles.and.returnValue(of({
        allOK: true,
        data: mockProducts,
        message: 'Success'
      }));

      component.loadConsoles();
      tick();

      expect(productService.getConsoles).toHaveBeenCalled();
      expect(component.consoles).toEqual(mockProducts);
    }));

    it('should load accessories successfully', fakeAsync(() => {
      productService.getAccessories.and.returnValue(of({
        allOK: true,
        data: mockProducts,
        message: 'Success'
      }));

      component.loadAccessories();
      tick();

      expect(productService.getAccessories).toHaveBeenCalled();
      expect(component.accessories).toEqual(mockProducts);
    }));
  });

  describe('Image Upload', () => {
    it('should handle file selection', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: { files: [mockFile] }
      };

      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBe(mockFile);
      expect(component.error).toBeNull();
    });

    it('should reject non-image files', () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      const mockEvent = {
        target: { files: [mockFile] }
      };

      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBeNull();
      expect(component.error).toBe('Por favor selecciona un archivo de imagen válido.');
    });
  });

  describe('Form Management', () => {
    it('should reset new game form', () => {
      component.newGame = {
        name: 'Test Game',
        precio: 100,
        stock: 10
      };

      component.resetForm();

      expect(component.newGame.name).toBe('');
      expect(component.newGame.precio).toBe(0);
      expect(component.newGame.stock).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct price class', () => {
      expect(component.getPriceClass(40000)).toBe('price-low');
      expect(component.getPriceClass(75000)).toBe('price-medium');
      expect(component.getPriceClass(150000)).toBe('price-high');
    });

    it('should return correct stock class', () => {
      expect(component.getStockClass(3)).toBe('stock-low');
      expect(component.getStockClass(10)).toBe('stock-medium');
      expect(component.getStockClass(20)).toBe('stock-high');
    });
  });

  describe('Logout', () => {
    it('should logout and navigate to login', () => {
      spyOn(localStorage, 'removeItem');
      
      component.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
