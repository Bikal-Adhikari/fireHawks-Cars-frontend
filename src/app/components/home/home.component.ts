import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Car } from 'src/app/models/car';
import { AuthService } from 'src/app/services/auth.service';
import { CarService } from 'src/app/services/car.service';
import { UsersService } from 'src/app/services/users.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user$ = this.usersService.currentUserProfile$;
  cars: Car[] = [];
  filteredCars: Car[] = [];
  filters: any = {
    mpg: null,
    cylinders: null,
    displacement: null,
    horsepower: null,
    weight: null,
    acceleration: null,
    model_year: null,
    origin: null,
  };
  searchQuery: string = '';
  sortKey: string = 'name';
  sortOrder: string = 'asc';
  newCar: Partial<Car> = {};
  filterKeys: string[] = [];

  @ViewChild('filterModal') filterModal!: TemplateRef<any>;
  @ViewChild('sortModal') sortModal!: TemplateRef<any>;
  @ViewChild('addDataModal') addDataModal!: TemplateRef<any>;

  displayedColumns: string[] = [
    'name',
    'mpg',
    'cylinders',
    'displacement',
    'horsepower',
    'weight',
    'acceleration',
    'model_year',
    'origin',
  ];

  constructor(
    private usersService: UsersService,
    public authService: AuthService,
    private carService: CarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.loadFiltersFromLocalStorage();
    this.filterKeys = Object.keys(this.filters);
  }

  loadCars(): void {
    this.carService.getCars().subscribe((data) => {
      this.cars = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredCars = this.cars
      .filter((car) => this.applySearch(car))
      .filter((car) => this.applyFilter(car))
      .sort(this.sortByKey.bind(this));
  }

  applySearch(car: Car): boolean {
    const name = car.name ?? '';
    const query = this.searchQuery ?? '';
    return name.toLowerCase().includes(query.toLowerCase());
  }

  applyFilter(car: Car): boolean {
    for (const key in this.filters) {
      if (this.filters.hasOwnProperty(key) && this.filters[key] !== null) {
        if (car[key as keyof Car] !== this.filters[key]) {
          return false;
        }
      }
    }
    return true;
  }

  isValidKey(key: string): key is keyof Car {
    return [
      'name',
      'mpg',
      'cylinders',
      'displacement',
      'horsepower',
      'weight',
      'acceleration',
      'model_year',
      'origin',
    ].includes(key);
  }

  sortByKey(a: Car, b: Car): number {
    const key = this.sortKey as keyof Car;
    const order = this.sortOrder === 'asc' ? 1 : -1;

    const aValue = a[key] ?? '';
    const bValue = b[key] ?? '';

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  }

  openFilterModal(): void {
    this.dialog.open(this.filterModal);
  }

  openSortModal(): void {
    this.dialog.open(this.sortModal);
  }

  openAddDataModal(): void {
    this.newCar = {
      name: '',
      mpg: NaN,
      cylinders: NaN,
      displacement: NaN,
      horsepower: NaN,
      weight: NaN,
      acceleration: NaN,
      model_year: NaN,
      origin: '',
    };
    this.dialog.open(this.addDataModal);
  }

  closeModal(): void {
    this.dialog.closeAll();
  }

  storeFiltersInLocalStorage(): void {
    localStorage.setItem('carFilters', JSON.stringify(this.filters));
    localStorage.setItem('searchQuery', this.searchQuery);
    localStorage.setItem('sortKey', this.sortKey);
  }

  loadFiltersFromLocalStorage(): void {
    const filters = localStorage.getItem('carFilters');
    if (filters) this.filters = JSON.parse(filters);
    this.searchQuery = localStorage.getItem('searchQuery') || '';
    this.sortKey = localStorage.getItem('sortKey') || 'name';
    this.applyFilters();
  }

  exportToCSV(): void {
    const csvData = this.convertToCSV(this.filteredCars);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'car-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: Car[]): string {
    const header =
      'name,mpg,cylinders,displacement,horsepower,weight,acceleration,model_year,origin\n';
    const rows = data.map((car) =>
      [
        car.name,
        car.mpg,
        car.cylinders,
        car.displacement,
        car.horsepower,
        car.weight,
        car.acceleration,
        car.model_year,
        car.origin,
      ].join(',')
    );
    return header + rows.join('\n');
  }

  addCar(): void {
    if (
      this.newCar.name &&
      this.newCar.mpg &&
      this.newCar.cylinders &&
      this.newCar.displacement &&
      this.newCar.horsepower &&
      this.newCar.weight &&
      this.newCar.acceleration &&
      this.newCar.model_year &&
      this.newCar.origin
    ) {
      const carToAdd: Car = {
        name: this.newCar.name,
        mpg: this.newCar.mpg,
        cylinders: this.newCar.cylinders,
        displacement: this.newCar.displacement,
        horsepower: this.newCar.horsepower,
        weight: this.newCar.weight,
        acceleration: this.newCar.acceleration,
        model_year: this.newCar.model_year,
        origin: this.newCar.origin,
      };

      this.carService.addCar(carToAdd).subscribe((newCar) => {
        this.cars.push(newCar);
        this.filteredCars = [...this.cars];
        this.applyFilters();
      });

      this.dialog.closeAll();
    } else {
      alert('Please fill out all fields before submitting.');
    }
  }

  resetNewCar() {
    this.newCar = {
      id: '',
      name: '',
      mpg: 0,
      cylinders: 0,
      displacement: 0,
      horsepower: 0,
      weight: 0,
      acceleration: 0,
      model_year: 0,
      origin: '',
    };
  }
}
