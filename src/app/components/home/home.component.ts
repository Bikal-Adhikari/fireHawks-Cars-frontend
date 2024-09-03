import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Car } from 'src/app/models/car';
import { AuthService } from 'src/app/services/auth.service';
import { CarService } from 'src/app/services/car.service';
import { UsersService } from 'src/app/services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

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
    name: '',
    origin: '',
    mpg: 0,
    cylinders: 0,
    displacement: 0,
    horsepower: 0,
    weight: 0,
    acceleration: 0,
    model_year: 0,
  };
  searchQuery: string = '';
  sortKey: string = 'name';
  sortOrder: string = 'asc';
  newCar: Partial<Car> = {};
  filterKeys: string[] = [];
  filterProperty: string = '';
  filterValue: any = '';
  selectedFilterKey: string = '';

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

  dataSource: MatTableDataSource<Car> = new MatTableDataSource<Car>([]);

  constructor(
    private usersService: UsersService,
    public authService: AuthService,
    private carService: CarService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.loadFiltersFromLocalStorage();
    this.filterKeys = Object.keys(this.filters);
  }

  loadCars(): void {
    this.carService.getCars().subscribe((data) => {
      this.cars = data;
      this.filteredCars = [...this.cars];
      this.dataSource.data = this.filteredCars;
      this.applyFilters();
    });
  }

  applyFilters(filters?: any): void {
    const validKeys = [
      'name',
      'origin',
      'mpg',
      'cylinders',
      'displacement',
      'horsepower',
      'model_year',
      'weight',
    ];

    const filtersToApply = filters || this.filters || {};

    if (typeof filtersToApply !== 'object' || filtersToApply === null) {
      console.warn('Invalid filters provided:', filtersToApply);
      return;
    }

    const filterEntries = Object.entries(filtersToApply).filter(
      ([key, value]) => {
        return validKeys.includes(key) && value !== null && value !== '';
      }
    );

    const appliedFilters = filterEntries.reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    console.log('Applying filters:', Object.keys(appliedFilters).length);

    if (Object.keys(appliedFilters).length > 0) {
      this.filteredCars = this.cars.filter((car) => {
        return Object.keys(appliedFilters).every((key) => {
          this.selectedFilterKey = key;
          this.filters[this.selectedFilterKey] = appliedFilters[key];
          return this.applyFilter(car);
        });
      });
    } else {
      this.filteredCars = [...this.cars];
    }

    console.log('Filtered cars after applying filters:', this.filteredCars);

    this.filteredCars = this.filteredCars
      .filter((car) => this.applySearch(car))
      .filter((car) => this.applyFilter(car))
      .sort(this.sortByKey.bind(this));
    console.log('Filtered and sorted cars:', this.filteredCars);

    this.dataSource.data = this.filteredCars;
    this.cdr.detectChanges();
    this.dialog.closeAll();
    this.storeFiltersInLocalStorage();
  }

  applySearch(car: Car): boolean {
    const name = car.name ?? '';
    const query = this.searchQuery ?? '';
    return name.toLowerCase().includes(query.toLowerCase());
  }

  applyFilter(car: Car): boolean {
    if (!this.selectedFilterKey || !this.isValidKey(this.selectedFilterKey)) {
      return true;
    }

    const filterValue = this.filters[this.selectedFilterKey];

    if (this.isNumberFilter(this.selectedFilterKey)) {
      if (filterValue === null || filterValue === undefined) {
        return true;
      }
      return (
        (car[this.selectedFilterKey as keyof Car] as number) >=
        parseFloat(filterValue as string)
      );
    } else if (this.isStringFilter(this.selectedFilterKey)) {
      return (car[this.selectedFilterKey as keyof Car] as string)
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    }

    return true;
  }

  isStringFilter(key: string): boolean {
    const stringFilters = ['name', 'origin'];
    return stringFilters.includes(key);
  }

  isNumberFilter(key: string): boolean {
    const numberFilters = [
      'mpg',
      'cylinders',
      'displacement',
      'horsepower',
      'weight',
      'acceleration',
      'model_year',
    ];
    return numberFilters.includes(key);
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

  onFilterKeyChange(selectedKey: string): void {
    this.selectedFilterKey = selectedKey;
    this.filters[this.selectedFilterKey] = null;
  }

  sortByKey(a: Car, b: Car): number {
    if (!this.isValidKey(this.sortKey)) {
      console.warn('Invalid sort key used:', this.sortKey);
      return 0;
    }

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
      mpg: 0,
      cylinders: 0,
      displacement: 0,
      horsepower: 0,
      weight: 0,
      acceleration: 0,
      model_year: 0,
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
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  loadFiltersFromLocalStorage(): void {
    const filters = localStorage.getItem('carFilters');
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        Object.keys(parsedFilters).forEach((key) => {
          if (this.isNumberFilter(key)) {
            const filterValue = parsedFilters[key];
            if (filterValue !== null && filterValue !== undefined) {
              parsedFilters[key] = Number(filterValue);
            }
          }
        });
        this.filters = parsedFilters;
      } catch (error) {
        console.error('Error parsing filters from localStorage:', error);
        this.filters = {};
      }
    } else {
      this.filters = {};
    }

    console.log('Loaded filters:', this.filters);

    this.selectedFilterKey = this.filters;
    this.searchQuery = localStorage.getItem('searchQuery') || '';
    this.sortKey = localStorage.getItem('sortKey') || 'name';
    this.sortOrder = localStorage.getItem('sortOrder') || 'asc';

    if (!this.isValidKey(this.sortKey)) {
      console.warn('Invalid sortKey:', this.sortKey);
      this.sortKey = 'name';
    }

    // Pass the filters to applyFilters
    this.applyFilters(this.filters);
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

      this.carService.addCar(carToAdd).subscribe((car) => {
        this.cars.push(car);
        this.filteredCars.push(car);
        this.applyFilters();
      });

      this.closeModal();
    } else {
      alert('Please fill all fields.');
    }
  }

  resetFilters(): void {
    this.filters = {
      name: '',
      origin: '',
      mpg: 0,
      cylinders: 0,
      displacement: 0,
      horsepower: 0,
      weight: 0,
      acceleration: 0,
      model_year: 0,
    };

    this.searchQuery = '';

    this.sortKey = 'name';
    this.sortOrder = 'asc';

    this.applyFilters();
  }
}
