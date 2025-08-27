import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService, Game } from '../../../services/games.service';
import { UploadService } from '../../../services/upload.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ProductService,
  ProductModel,
} from '../../../services/product.service';
import {
  InventoryService,
  InventoryItem,
} from '../../../services/service/inventory.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  games: Game[] = [];
  isLoading = true;
  error: string | null = null;
  editIndex: number | null = null;
  editedGame: Partial<Game> = {};
  showAddForm = false;
  newGame: Partial<Game> = {
    name: '',
    consola: '',
    genero: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    developer: '',
    publisher: '',
    rating: 'E',
    multiplayer: false,
    imageUrl: '',
  };
  selectedFile: File | null = null;

  isUploading = false;
  consoles: ProductModel[] = [];
  accessories: ProductModel[] = [];
  showAddConsoleForm = false;
  showAddAccessoryForm = false;
  newConsole: Partial<ProductModel> & {
    selectedFile?: File | null;
    brand?: string;
    model?: string;
    features?: string;
    releaseYear?: number;
    color?: string;
  } = {
    name: '',
    brand: '',
    model: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '',
    selectedFile: null,
    features: '',
    releaseYear: undefined,
    color: '',
  };
  newAccessory: Partial<ProductModel> & {
    selectedFile?: File | null;
    brand?: string;
  } = {
    name: '',
    price: 0,
    category: '',
    stock: 0,
    description: '',
    imageUrl: '',
    selectedFile: null,
    brand: '',
  };

  editConsoleIndex: number | null = null;
  editedConsole: Partial<ProductModel> = {};
  editAccessoryIndex: number | null = null;
  editedAccessory: Partial<ProductModel> = {};
  successMessage: string | null = null;

  constructor(
    private gamesService: GamesService,
    private productService: ProductService,
    private uploadService: UploadService,
    private router: Router,
    private http: HttpClient,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadConsoles();
    this.loadAccessories();
  }

  loadGames() {
    this.isLoading = true;
    this.gamesService.getAllGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games = response.data;
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los juegos.';
        this.isLoading = false;
      },
    });
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editedGame = { ...this.games[index] };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editedGame = {};
  }

  saveEdit(game: Game) {
    if (!this.editedGame.precio || !this.editedGame.stock) return;
    this.gamesService
      .updateGame(game._id, {
        precio: this.editedGame.precio,
        stock: this.editedGame.stock,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.games[this.editIndex!] = { ...game, ...response.data };
            this.cancelEdit();
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al guardar los cambios.';
        },
      });
  }

  deleteGame(game: Game, index: number) {
    if (!confirm('¿Seguro que deseas eliminar este juego?')) return;
    this.gamesService.deleteGame(game._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games.splice(index, 1);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar el juego.';
      },
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  getPriceClass(precio: number): string {
    if (precio <= 50000) return 'price-low';
    if (precio <= 100000) return 'price-medium';
    return 'price-high';
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'stock-low';
    if (stock <= 15) return 'stock-medium';
    return 'stock-high';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo es demasiado grande. Máximo 5MB.';
        return;
      }
      this.selectedFile = file;
      this.error = null;
    }
  }

  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No hay archivo seleccionado');
        return;
      }
      this.isUploading = true;
      console.log('Iniciando subida de imagen...');
      this.uploadService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            let imageUrl =
              response.data?.imageUrl ||
              response.data?.url ||
              response.data?.filename ||
              response.data?.path ||
              response.data;

            if (imageUrl && typeof imageUrl === 'string') {
              resolve(imageUrl);
            } else {
              reject('No se pudo obtener la URL de la imagen');
            }
          } else {
            reject(response.message || 'Error en la subida de imagen');
          }
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error en subida de imagen:', err);
          reject('Error al subir la imagen');
        },
      });
    });
  }

  async addGame() {
    if (
      !this.newGame.name ||
      !this.newGame.precio ||
      this.newGame.stock == null
    ) {
      this.error = 'Faltan campos obligatorios: nombre, precio y stock';
      console.error('Faltan campos obligatorios');
      return;
    }

    try {
      let imageUrl = '';
      if (this.selectedFile) {
        console.log('Subiendo imagen...');
        imageUrl = await this.uploadImage();
      }

      const productData: Partial<InventoryItem> = {
        name: this.newGame.name || '',
        type: 'games' as const,
        description: this.newGame.descripcion || '',
        price: this.newGame.precio || 0,
        stock: this.newGame.stock || 0,
        imageUrl:
          imageUrl ||
          'https://placehold.co/400x300/e9ecef/212529?text=Sin+Imagen',
        consola: this.newGame.consola || '',
        genero: this.newGame.genero || '',
        developer: this.newGame.developer || '',
        publisher: this.newGame.publisher || '',
        releaseYear: this.newGame.releaseYear || undefined,
        rating: this.newGame.rating || 'E',
        multiplayer: this.newGame.multiplayer || false,
      };

      console.log('Datos del producto a enviar:', productData);

      this.inventoryService.createItem(productData).subscribe({
        next: (response: any) => {
          console.log('Producto agregado correctamente:', response);
          if (response.allOK) {
            this.successMessage = 'Producto agregado exitosamente';
            this.loadGames(); // refrescar lista
            this.showAddForm = false;
            this.resetForm(); // limpiar formulario
            setTimeout(() => (this.successMessage = null), 2500);
          } else {
            this.error = response.message;
          }
        },
        error: (err: any) => {
          console.error('Error al agregar producto:', err);
          this.error = 'No se pudo agregar el producto';
        },
      });
    } catch (error: any) {
      this.error = error.message || error;
      console.error('Error en addGame:', error);
    }
  }

  resetForm() {
    this.newGame = {
      name: '',
      consola: '',
      genero: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      developer: '',
      publisher: '',
      rating: 'E',
      multiplayer: false,
      imageUrl: '',
    };
    this.selectedFile = null;
  }

  onGameImageSelected(event: any, game: Game): void {
    const file = event.target.files?.[0];
    if (file) {
      this.updateGameImage(game, file);
    }
  }

  async updateGameImage(game: Game, file: File): Promise<void> {
    try {
      this.uploadService.uploadGameImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            // Update the game with new image URL
            this.gamesService
              .updateGame(game._id, { imageUrl: response.data.imageUrl })
              .subscribe({
                next: (updateResponse) => {
                  if (updateResponse.allOK) {
                    const index = this.games.findIndex(
                      (g) => g._id === game._id
                    );
                    if (index !== -1) {
                      this.games[index] = {
                        ...this.games[index],
                        imageUrl: response.data.imageUrl,
                      };
                    }
                  }
                },
              });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al actualizar la imagen del juego.';
        },
      });
    } catch (error) {
      this.error = error as string;
    }
  }

  loadConsoles() {
    this.isLoading = true;
    this.productService.getConsoles().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles = response.data;
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las consolas.';
        this.isLoading = false;
      },
    });
  }

  loadAccessories() {
    this.isLoading = true;
    this.productService.getAccessories().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories = response.data;
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los accesorios.';
        this.isLoading = false;
      },
    });
  }

  onConsoleImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newConsole.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newConsole.imageUrl = response.data.imageUrl;
          }
        },
      });
    }
  }

  onAccessoryImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newAccessory.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newAccessory.imageUrl = response.data.imageUrl;
          }
        },
      });
    }
  }

  async addConsole() {
    alert(
      'Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación'
    );
  }

  async addAccessory() {
    alert(
      'Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación'
    );
  }

  resetConsoleForm() {
    this.newConsole = {
      name: '',
      brand: '',
      model: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: '',
      selectedFile: null,
      features: '',
      releaseYear: undefined,
      color: '',
    };
  }

  resetAccessoryForm() {
    this.newAccessory = {
      name: '',
      price: 0,
      category: '',
      stock: 0,
      description: '',
      imageUrl: '',
      selectedFile: null,
      brand: '',
    };
  }

  uploadConsoleImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newConsole.selectedFile) {
        reject('No hay archivo seleccionado para la consola');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newConsole.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err) => {
          this.isUploading = false;
          reject('Error al subir la imagen de la consola');
        },
      });
    });
  }

  uploadAccessoryImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newAccessory.selectedFile) {
        reject('No hay archivo seleccionado para el accesorio');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newAccessory.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err) => {
          this.isUploading = false;
          reject('Error al subir la imagen del accesorio');
        },
      });
    });
  }

  startEditConsole(index: number) {
    this.editConsoleIndex = index;
    this.editedConsole = { ...this.consoles[index] };
  }

  cancelEditConsole() {
    this.editConsoleIndex = null;
    this.editedConsole = {};
  }

  saveEditConsole(consoleItem: ProductModel) {
    if (!this.editedConsole.price || !this.editedConsole.stock) return;
    this.productService
      .updateProduct(consoleItem._id, {
        name: this.editedConsole.name,
        price: this.editedConsole.price,
        stock: this.editedConsole.stock,
        category: this.editedConsole.category,
        description: this.editedConsole.description,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.consoles[this.editConsoleIndex!] = {
              ...consoleItem,
              ...response.data,
            };
            this.cancelEditConsole();
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al guardar los cambios de la consola.';
        },
      });
  }

  deleteConsole(consoleItem: ProductModel, index: number) {
    alert(
      'Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación'
    );
  }

  startEditAccessory(index: number) {
    this.editAccessoryIndex = index;
    this.editedAccessory = { ...this.accessories[index] };
  }

  cancelEditAccessory() {
    this.editAccessoryIndex = null;
    this.editedAccessory = {};
  }

  saveEditAccessory(accessoryItem: ProductModel) {
    if (!this.editedAccessory.price || !this.editedAccessory.stock) return;
    this.productService
      .updateProduct(accessoryItem._id, {
        name: this.editedAccessory.name,
        price: this.editedAccessory.price,
        stock: this.editedAccessory.stock,
        category: this.editedAccessory.category,
        description: this.editedAccessory.description,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.accessories[this.editAccessoryIndex!] = {
              ...accessoryItem,
              ...response.data,
            };
            this.cancelEditAccessory();
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al guardar los cambios del accesorio.';
        },
      });
  }

  deleteAccessory(accessoryItem: ProductModel, index: number) {
    alert(
      'Funcionalidad del frontend en contrucción y llamado al backend pendiente de implementación'
    );
  }

  // Variables para edición
  editProductIndex: number | null = null;
  editedProduct: Partial<InventoryItem> = {};

  startEditProduct(index: number, product: InventoryItem) {
    this.editProductIndex = index;
    this.editedProduct = { ...product };
  }

  cancelEditProduct() {
    this.editProductIndex = null;
    this.editedProduct = {};
  }

  saveEditProduct(product: InventoryItem, index: number) {
    if (
      this.editedProduct.price == null ||
      this.editedProduct.stock == null ||
      !this.editedProduct.name
    ) {
      this.error = 'Nombre, precio y stock son obligatorios';
      return;
    }

    this.inventoryService
      .updateItem(product._id, this.editedProduct)
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            if (product.type === 'games') {
              this.games[index] = {
                ...this.games[index],
                ...this.editedProduct,
              } as Game;
            } else if (product.type === 'consoles') {
              this.consoles[index] = {
                ...this.consoles[index],
                ...this.editedProduct,
              } as ProductModel;
            } else if (product.type === 'accessories') {
              this.accessories[index] = {
                ...this.accessories[index],
                ...this.editedProduct,
              } as ProductModel;
            }

            this.successMessage = 'Producto actualizado correctamente';
            this.cancelEditProduct();
            setTimeout(() => (this.successMessage = null), 3000);
          } else {
            this.error = response.message;
          }
        },
        error: () => {
          this.error = 'Error al actualizar el producto.';
        },
      });
  }

  deleteProduct(product: InventoryItem, index: number) {
    if (!confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) return;

    this.inventoryService.deleteItem(product._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          if (product.type === 'games') this.games.splice(index, 1);
          else if (product.type === 'consoles') this.consoles.splice(index, 1);
          else if (product.type === 'accessories')
            this.accessories.splice(index, 1);

          this.successMessage = 'Producto eliminado correctamente';
          setTimeout(() => (this.successMessage = null), 3000);
        } else {
          this.error = response.message;
        }
      },
      error: () => {
        this.error = 'Error al eliminar el producto.';
      },
    });
  }
}
