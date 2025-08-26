import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { GamesService, Game } from '../../../services/games.service';
import { ProductService, ProductModel } from '../../../services/product.service';
import { UploadService } from '../../../services/upload.service';
import { InventoryService, InventoryItem } from '../../../services/service/inventory.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let gamesServiceMock: jasmine.SpyObj<GamesService>;
  let productServiceMock: jasmine.SpyObj<ProductService>;
  let uploadServiceMock: jasmine.SpyObj<UploadService>;
  let inventoryServiceMock: jasmine.SpyObj<InventoryService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockGames: Game[] = [
    {
      _id: '1',
      name: 'Game 1',
      consola: 'PS5',
      genero: 'Action',
      descripcion: 'Test game',
      precio: 50000,
      stock: 10,
      developer: 'Dev1',
      publisher: 'Pub1',
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
      name: 'Console 1',
      price: 300000,
      stock: 5,
      category: 'consoles',
      description: 'Test console',
      imageUrl: 'console.jpg',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];

  const mockInventoryItem: InventoryItem = {
    _id: '1',
    name: 'Test Product',
    type: 'games',
    price: 50000,
    stock: 10,
    description: 'Test',
    imageUrl: 'test.jpg',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  beforeEach(async () => {
    gamesServiceMock = jasmine.createSpyObj('GamesService', ['getAllGames', 'updateGame', 'deleteGame']);
    productServiceMock = jasmine.createSpyObj('ProductService', ['getConsoles', 'getAccessories', 'updateProduct']);
    uploadServiceMock = jasmine.createSpyObj('UploadService', ['uploadImage', 'uploadGameImage']);
    inventoryServiceMock = jasmine.createSpyObj('InventoryService', ['createItem', 'updateItem', 'deleteItem']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    gamesServiceMock.getAllGames.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: mockGames 
    }));
    productServiceMock.getConsoles.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: mockProducts 
    }));
    productServiceMock.getAccessories.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: [] 
    }));
    inventoryServiceMock.createItem.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: mockInventoryItem 
    }));
    inventoryServiceMock.updateItem.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: mockInventoryItem 
    }));
    inventoryServiceMock.deleteItem.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: null 
    }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: GamesService, useValue: gamesServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: UploadService, useValue: uploadServiceMock },
        { provide: InventoryService, useValue: inventoryServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load games on init', () => {
    expect(gamesServiceMock.getAllGames).toHaveBeenCalled();
    expect(component.games).toEqual(mockGames);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading games', () => {
    gamesServiceMock.getAllGames.and.returnValue(throwError(() => new Error('Error')));
    component.loadGames();
    expect(component.error).toBe('Error al cargar los juegos.');
    expect(component.isLoading).toBeFalse();
  });

  it('should start edit mode', () => {
    component.startEdit(0);
    expect(component.editIndex).toBe(0);
    expect(component.editedGame).toEqual(mockGames[0]);
  });

  it('should cancel edit mode', () => {
    component.startEdit(0);
    component.cancelEdit();
    expect(component.editIndex).toBeNull();
    expect(component.editedGame).toEqual({});
  });

  it('should save edit', fakeAsync(() => {
    const updatedGame = { ...mockGames[0], precio: 60000 };
    gamesServiceMock.updateGame.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: updatedGame 
    }));
    
    component.startEdit(0);
    component.editedGame.precio = 60000;
    component.saveEdit(mockGames[0]);
    
    tick();
    expect(gamesServiceMock.updateGame).toHaveBeenCalledWith('1', { precio: 60000, stock: 10 });
    expect(component.games[0].precio).toBe(60000);
    expect(component.editIndex).toBeNull();
  }));

  it('should delete game', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    gamesServiceMock.deleteGame.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: null 
    }));
    
    component.deleteGame(mockGames[0], 0);
    expect(gamesServiceMock.deleteGame).toHaveBeenCalledWith('1');
    expect(component.games.length).toBe(0);
  });

  it('should not delete game if cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteGame(mockGames[0], 0);
    expect(gamesServiceMock.deleteGame).not.toHaveBeenCalled();
  });

  it('should logout and navigate to login', () => {
    spyOn(localStorage, 'removeItem');
    component.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return correct price class', () => {
    expect(component.getPriceClass(40000)).toBe('price-low');
    expect(component.getPriceClass(80000)).toBe('price-medium');
    expect(component.getPriceClass(150000)).toBe('price-high');
  });

  it('should return correct stock class', () => {
    expect(component.getStockClass(3)).toBe('stock-low');
    expect(component.getStockClass(10)).toBe('stock-medium');
    expect(component.getStockClass(20)).toBe('stock-high');
  });

  it('should handle file selection', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(mockFile);
    expect(component.error).toBeNull();
  });

  it('should reject non-image files', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.error).toContain('archivo de imagen válido');
  });

  it('should reject large files', () => {
    const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.error).toContain('demasiado grande');
  });

  it('should upload image successfully', fakeAsync(() => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    component.selectedFile = mockFile;
    
    uploadServiceMock.uploadImage.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { imageUrl: 'uploaded.jpg' } 
    }));
    
    component.uploadImage().then(url => {
      expect(url).toBe('uploaded.jpg');
    });
    
    tick();
  }));

  it('should handle upload error', fakeAsync(() => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    component.selectedFile = mockFile;
    
    uploadServiceMock.uploadImage.and.returnValue(throwError(() => new Error('Upload failed')));
    
    component.uploadImage().catch(error => {
      expect(error).toContain('Error al subir la imagen');
    });
    
    tick();
  }));

  it('should add game successfully', fakeAsync(() => {
    component.newGame = {
      name: 'New Game',
      precio: 50000,
      stock: 10,
      consola: 'PS5',
      genero: 'Action'
    };
    component.selectedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    spyOn(component, 'uploadImage').and.returnValue(Promise.resolve('uploaded.jpg'));
    
    component.addGame();
    tick();
    
    expect(inventoryServiceMock.createItem).toHaveBeenCalled();
    expect(component.successMessage).toBe('Producto agregado exitosamente');
    expect(component.showAddForm).toBeFalse();
  }));

  it('should reset form', () => {
    component.newGame = { name: 'Test', precio: 100 };
    component.selectedFile = new File(['test'], 'test.jpg');
    
    component.resetForm();
    
    expect(component.newGame.name).toBe('');
    expect(component.newGame.precio).toBe(0);
    expect(component.selectedFile).toBeNull();
  });

  it('should load consoles on init', () => {
    expect(productServiceMock.getConsoles).toHaveBeenCalled();
    expect(component.consoles).toEqual(mockProducts);
  });

  it('should load accessories on init', () => {
    expect(productServiceMock.getAccessories).toHaveBeenCalled();
    expect(component.accessories).toEqual([]);
  });

  it('should handle console image selection', fakeAsync(() => {
    const mockFile = new File(['test'], 'console.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [mockFile] } };
    
    uploadServiceMock.uploadImage.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { imageUrl: 'console-uploaded.jpg' } 
    }));
    
    component.onConsoleImageSelected(event);
    tick();
    
    expect(component.newConsole.selectedFile).toBe(mockFile);
    expect(uploadServiceMock.uploadImage).toHaveBeenCalledWith(mockFile);
  }));

  it('should handle accessory image selection', fakeAsync(() => {
    const mockFile = new File(['test'], 'accessory.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [mockFile] } };
    
    uploadServiceMock.uploadImage.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { imageUrl: 'accessory-uploaded.jpg' } 
    }));
    
    component.onAccessoryImageSelected(event);
    tick();
    
    expect(component.newAccessory.selectedFile).toBe(mockFile);
    expect(uploadServiceMock.uploadImage).toHaveBeenCalledWith(mockFile);
  }));

  it('should show alert for addConsole', () => {
    spyOn(window, 'alert');
    component.addConsole();
    expect(window.alert).toHaveBeenCalledWith('Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación');
  });

  it('should show alert for addAccessory', () => {
    spyOn(window, 'alert');
    component.addAccessory();
    expect(window.alert).toHaveBeenCalledWith('Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación');
  });

  it('should reset console form', () => {
    component.newConsole = { name: 'Test Console', price: 300000 };
    component.resetConsoleForm();
    expect(component.newConsole.name).toBe('');
    expect(component.newConsole.price).toBe(0);
  });

  it('should reset accessory form', () => {
    component.newAccessory = { name: 'Test Accessory', price: 50000 };
    component.resetAccessoryForm();
    expect(component.newAccessory.name).toBe('');
    expect(component.newAccessory.price).toBe(0);
  });

  it('should start edit console', () => {
    component.consoles = mockProducts;
    component.startEditConsole(0);
    expect(component.editConsoleIndex).toBe(0);
    expect(component.editedConsole).toEqual(mockProducts[0]);
  });

  it('should cancel edit console', () => {
    component.startEditConsole(0);
    component.cancelEditConsole();
    expect(component.editConsoleIndex).toBeNull();
    expect(component.editedConsole).toEqual({});
  });

  it('should save edit console', fakeAsync(() => {
    component.consoles = mockProducts;
    component.startEditConsole(0);
    component.editedConsole.price = 350000;
    
    productServiceMock.updateProduct.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { ...mockProducts[0], price: 350000 } 
    }));
    
    component.saveEditConsole(mockProducts[0]);
    tick();
    
    expect(productServiceMock.updateProduct).toHaveBeenCalled();
    expect(component.consoles[0].price).toBe(350000);
    expect(component.editConsoleIndex).toBeNull();
  }));
  
  it('should show alert for deleteConsole', () => {
    spyOn(window, 'alert');
    component.deleteConsole(mockProducts[0], 0);
    expect(window.alert).toHaveBeenCalledWith('Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación');
  });

  it('should start edit accessory', () => {
    component.accessories = mockProducts;
    component.startEditAccessory(0);
    expect(component.editAccessoryIndex).toBe(0);
    expect(component.editedAccessory).toEqual(mockProducts[0]);
  });

  it('should cancel edit accessory', () => {
    component.startEditAccessory(0);
    component.cancelEditAccessory();
    expect(component.editAccessoryIndex).toBeNull();
    expect(component.editedAccessory).toEqual({});
  });

  it('should save edit accessory', fakeAsync(() => {
    component.accessories = mockProducts;
    component.startEditAccessory(0);
    component.editedAccessory.price = 45000;
    
    productServiceMock.updateProduct.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { ...mockProducts[0], price: 45000 } 
    }));
    
    component.saveEditAccessory(mockProducts[0]);
    tick();
    
    expect(productServiceMock.updateProduct).toHaveBeenCalled();
    expect(component.accessories[0].price).toBe(45000);
    expect(component.editAccessoryIndex).toBeNull();
  }));

  it('should show alert for deleteAccessory', () => {
    spyOn(window, 'alert');
    component.deleteAccessory(mockProducts[0], 0);
    expect(window.alert).toHaveBeenCalledWith('Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación');
  });

  it('should start edit product', () => {
    component.startEditProduct(0, mockInventoryItem);
    expect(component.editProductIndex).toBe(0);
    expect(component.editedProduct).toEqual(mockInventoryItem);
  });

  it('should cancel edit product', () => {
    component.cancelEditProduct();
    expect(component.editProductIndex).toBeNull();
    expect(component.editedProduct).toEqual({});
  });

  it('should save edit product', fakeAsync(() => {
    component.startEditProduct(0, mockInventoryItem);
    component.editedProduct.price = 60000;
    
    inventoryServiceMock.updateItem.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: { ...mockInventoryItem, price: 60000 } 
    }));
    
    component.saveEditProduct(mockInventoryItem, 0);
    tick();
    
    expect(inventoryServiceMock.updateItem).toHaveBeenCalled();
    expect(component.successMessage).toBe('Producto actualizado correctamente');
  }));

  it('should delete product', fakeAsync(() => {
    component.games = [mockGames[0]];
    spyOn(window, 'confirm').and.returnValue(true);
    
    inventoryServiceMock.deleteItem.and.returnValue(of({ 
      allOK: true, 
      message: 'Success', 
      data: null 
    }));
    
    component.deleteProduct(mockInventoryItem, 0);
    tick();
    
    expect(inventoryServiceMock.deleteItem).toHaveBeenCalledWith('1');
    expect(component.games.length).toBe(0);
    expect(component.successMessage).toBe('Producto eliminado correctamente');
  }));

  it('should not delete product if cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteProduct(mockInventoryItem, 0);
    
    expect(inventoryServiceMock.deleteItem).not.toHaveBeenCalled();
  });
});
