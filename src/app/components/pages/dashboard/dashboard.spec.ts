import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Dashboard } from './dashboard';
import { GamesService, Game } from '../../../services/games.service';
import { ProductService, ProductModel } from '../../../services/product.service';
import { UploadService } from '../../../services/upload.service';
import { InventoryService, InventoryItem } from '../../../services/service/inventory.service';
import { ToastrService } from 'ngx-toastr';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockGamesService: jasmine.SpyObj<GamesService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockUploadService: jasmine.SpyObj<UploadService>;
  let mockInventoryService: jasmine.SpyObj<InventoryService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const gamesServiceSpy = jasmine.createSpyObj('GamesService', ['getAllGames', 'deleteGame', 'updateGame']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getConsoles', 'getAccessories', 'createConsole', 'createAccessory', 'updateProduct', 'deleteConsole', 'deleteAccessory']);
    const uploadServiceSpy = jasmine.createSpyObj('UploadService', ['uploadImage', 'uploadGameImage']);
    const inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['createItem', 'updateItem', 'deleteItem']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, Dashboard],
      providers: [
        { provide: GamesService, useValue: gamesServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: UploadService, useValue: uploadServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    mockGamesService = TestBed.inject(GamesService) as jasmine.SpyObj<GamesService>;
    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockUploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
    mockInventoryService = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('Deberia crear el componente correctamente', () => {
    // Arrange & Act (component creation is handled in beforeEach)
    // Assert
    expect(component).toBeTruthy();
  });

  it('Deberia inicializar el componente con el estado correcto', () => {
    // Arrange & Act (component initialization is handled in beforeEach)
    // Assert
    expect(component.games).toEqual([]);
    expect(component.isLoading).toBeTrue();
    expect(component.error).toBeNull();
    expect(component.editIndex).toBeNull();
    expect(component.showAddForm).toBeFalse();
    expect(component.consoles).toEqual([]);
    expect(component.accessories).toEqual([]);
  });

  describe('ngOnInit', () => {
    it('Deberia llamar a los métodos de carga de datos durante la inicialización del componente', () => {
      // Arrange
      spyOn(component, 'loadGames');
      spyOn(component, 'loadConsoles');
      spyOn(component, 'loadAccessories');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.loadGames).toHaveBeenCalled();
      expect(component.loadConsoles).toHaveBeenCalled();
      expect(component.loadAccessories).toHaveBeenCalled();
    });
  });

  describe('loadGames', () => {
    it('Deberia cargar la lista de juegos exitosamente desde el servicio', fakeAsync(() => {
      // Arrange
      const mockResponse = {
        allOK: true,
        message: '',
        data: [
          {
            _id: '1',
            name: 'Game 1',
            consola: 'PS5',
            genero: 'Action',
            descripcion: 'Test game',
            precio: 50000,
            stock: 10,
            developer: 'Dev',
            publisher: 'Pub',
            rating: 'E',
            multiplayer: false,
            imageUrl: 'url',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
          }
        ]
      };
      mockGamesService.getAllGames.and.returnValue(of(mockResponse));

      // Act
      component.loadGames();
      tick();

      // Assert
      expect(component.games.length).toBe(1);
      expect(component.games[0].name).toBe('Game 1');
      expect(component.isLoading).toBeFalse();
    }));

    it('Deberia manejar errores al cargar juegos y mostrar mensaje de error', fakeAsync(() => {
      // Arrange
      const mockError = { message: 'Error loading games' };
      mockGamesService.getAllGames.and.returnValue(throwError(mockError));

      // Act
      component.loadGames();
      tick();

      // Assert
      expect(mockToastr.error).toHaveBeenCalledWith('Error al cargar los juegos.', 'Error');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('addGame', () => {
    it('Deberia agregar un nuevo juego exitosamente incluyendo la subida de imagen', fakeAsync(() => {
      // Arrange
      component.newGame = {
        name: 'New Game',
        precio: 60000,
        stock: 5,
        consola: 'PS5',
        genero: 'RPG',
        descripcion: 'New game desc',
        developer: 'New Dev',
        publisher: 'New Pub',
        rating: 'E',
        multiplayer: false,
        imageUrl: ''
      };
      component.selectedFile = new File([''], 'test.jpg');

      const mockUploadResponse = { allOK: true, data: { imageUrl: 'uploaded-url' } };
      const mockCreateResponse = {
        allOK: true,
        message: '',
        data: {
          _id: '1',
          name: 'New Game',
          type: 'games' as const,
          price: 60000,
          stock: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      mockUploadService.uploadImage.and.returnValue(of(mockUploadResponse));
      mockInventoryService.createItem.and.returnValue(of(mockCreateResponse));
      spyOn(component, 'loadGames');
      spyOn(component, 'resetForm');

      // Act
      component.addGame();
      tick();

      // Assert
      expect(mockInventoryService.createItem).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Producto agregado exitosamente', 'Éxito');
      expect(component.loadGames).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
      expect(component.showAddForm).toBeFalse();
    }));

    it('Deberia mostrar error cuando faltan campos obligatorios en el formulario', () => {
      // Arrange
      component.newGame = { name: '', precio: 0, stock: 0 };

      // Act
      component.addGame();

      // Assert
      expect(mockToastr.error).toHaveBeenCalledWith('Faltan campos obligatorios: nombre, precio y stock', 'Error');
    });
  });

  describe('deleteGame', () => {
    it('Deberia eliminar un juego exitosamente cuando el usuario confirma la acción', fakeAsync(() => {
      // Arrange
      const mockGame: Game = {
        _id: '1',
        name: 'Game 1',
        consola: 'PS5',
        genero: 'Action',
        descripcion: 'Test',
        precio: 50000,
        stock: 10,
        developer: 'Dev',
        publisher: 'Pub',
        rating: 'E',
        multiplayer: false,
        imageUrl: 'url',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      component.games = [mockGame];

      const mockResponse = { allOK: true, message: '', data: null };
      mockGamesService.deleteGame.and.returnValue(of(mockResponse));

      spyOn(window, 'confirm').and.returnValue(true);

      // Act
      component.deleteGame(mockGame, 0);
      tick();

      // Assert
      expect(component.games.length).toBe(0);
      expect(mockToastr.success).toHaveBeenCalledWith('Juego eliminado correctamente', 'Éxito');
    }));

    it('Deberia cancelar la eliminación cuando el usuario rechaza la confirmación', () => {
      // Arrange
      const mockGame: Game = { _id: '1', name: 'Game 1' } as Game;
      component.games = [mockGame];

      spyOn(window, 'confirm').and.returnValue(false);

      // Act
      component.deleteGame(mockGame, 0);

      // Assert
      expect(component.games.length).toBe(1);
      expect(mockGamesService.deleteGame).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('Deberia limpiar el localStorage y redirigir al usuario a la página de login', () => {
      // Arrange
      spyOn(localStorage, 'removeItem');
      spyOn(localStorage, 'getItem').and.returnValue('test');

      // Act
      component.logout();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockToastr.info).toHaveBeenCalledWith('Sesión cerrada', 'Info');
    });
  });

  describe('getPriceClass', () => {
    it('Deberia retornar "price-low" cuando el precio es menor o igual a 50000', () => {
      // Arrange & Act & Assert
      expect(component.getPriceClass(30000)).toBe('price-low');
    });

    it('Deberia retornar "price-medium" cuando el precio está entre 50001 y 100000', () => {
      // Arrange & Act & Assert
      expect(component.getPriceClass(75000)).toBe('price-medium');
    });

    it('Deberia retornar "price-high" cuando el precio es mayor a 100000', () => {
      // Arrange & Act & Assert
      expect(component.getPriceClass(150000)).toBe('price-high');
    });
  });

  describe('getStockClass', () => {
    it('Deberia retornar "stock-low" cuando el stock es menor o igual a 5', () => {
      // Arrange & Act & Assert
      expect(component.getStockClass(3)).toBe('stock-low');
    });

    it('Deberia retornar "stock-medium" cuando el stock está entre 6 y 15', () => {
      // Arrange & Act & Assert
      expect(component.getStockClass(10)).toBe('stock-medium');
    });

    it('Deberia retornar "stock-high" cuando el stock es mayor a 15', () => {
      // Arrange & Act & Assert
      expect(component.getStockClass(20)).toBe('stock-high');
    });
  });

  describe('onFileSelected', () => {
    it('Deberia seleccionar un archivo de imagen válido correctamente', () => {
      // Arrange
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [mockFile] } };

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.selectedFile).toBe(mockFile);
      expect(component.error).toBeNull();
    });

    it('Deberia mostrar error cuando se selecciona un archivo que no es una imagen', () => {
      // Arrange
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      const mockEvent = { target: { files: [mockFile] } };

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.error).toBe('Por favor selecciona un archivo de imagen válido.');
    });

    it('Deberia mostrar error cuando el archivo seleccionado excede el tamaño máximo permitido', () => {
      // Arrange
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const mockEvent = { target: { files: [mockFile] } };

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.error).toBe('El archivo es demasiado grande. Máximo 5MB.');
    });
  });

  describe('loadConsoles', () => {
    it('Deberia cargar la lista de consolas exitosamente desde el servicio', fakeAsync(() => {
      // Arrange
      const mockResponse = {
        allOK: true,
        message: '',
        data: [{
          _id: '1',
          name: 'PS5',
          price: 500000,
          description: 'PlayStation 5 Console',
          stock: 10,
          category: 'console'
        }]
      };
      mockProductService.getConsoles.and.returnValue(of(mockResponse));

      // Act
      component.loadConsoles();
      tick();

      // Assert
      expect(component.consoles.length).toBe(1);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('loadAccessories', () => {
    it('Deberia cargar la lista de accesorios exitosamente desde el servicio', fakeAsync(() => {
      // Arrange
      const mockResponse = {
        allOK: true,
        message: '',
        data: [{
          _id: '1',
          name: 'Controller',
          price: 50000,
          description: 'PS5 Controller',
          stock: 20,
          category: 'accessory'
        }]
      };
      mockProductService.getAccessories.and.returnValue(of(mockResponse));

      // Act
      component.loadAccessories();
      tick();

      // Assert
      expect(component.accessories.length).toBe(1);
      expect(component.isLoading).toBeFalse();
    }));
  });
});
