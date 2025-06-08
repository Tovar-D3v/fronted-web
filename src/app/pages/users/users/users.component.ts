import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from 'app/services/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalCreateUserComponent } from 'app/pages/modal-create-user/modal-create-user/modal-create-user.component';
import { ModalEditUsersComponent } from 'app/pages/modal-edit-users/modal-edit-users/modal-edit-users.component';

/**
 * Componente para la gestión de usuarios.
 * Permite listar, filtrar, crear, editar y eliminar usuarios.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  /**
   * Columnas de la tabla de usuarios.
   */
  displayedColumns: string[] = ['name', 'email', 'role', 'action'];

  /**
   * Breadcrumbs del componente.
   */
  breadscrums = [
    {
      title: 'Gestión de usuarios',
      item: [],
      active: 'Datos básicos',
    },
  ];

  /**
   * Fuente de datos para la tabla de usuarios.
   */
  dataSource = new MatTableDataSource<any>([]);

  /**
   * Referencia al paginador de la tabla.
   */
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  /**
   * Formulario de búsqueda de usuarios.
   */
  userFormSearchFilter!: FormGroup;

  /**
   * Lista de usuarios obtenida desde el servicio.
   */
  usersList: any[] = [];

  /**
   * Indicador de carga para mostrar un spinner mientras se cargan los datos.
   */
  isLoading = false;

  /**
   * Filtros de búsqueda por defecto.
   */
  userDefaultFilterSearch: any = {
    name: undefined,
    email: undefined,
  };

  /**
   * Constructor del componente.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param userService Servicio para gestionar usuarios.
   * @param dialogModel Servicio para abrir modales.
   * @param _sanckBar Servicio para mostrar notificaciones tipo snackbar.
   */
  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly userService: UsersService,
    private readonly dialogModel: MatDialog,
    private readonly _sanckBar: MatSnackBar
  ) {}

  /**
   * Método de inicialización del componente.
   * Configura el formulario de búsqueda y carga la lista inicial de usuarios.
   */
  ngOnInit(): void {
    this.createUserFormSearchFilter();
    this.getAllUserByAdministrator();
    this.handleUserFilterChance('name', 'name');
    this.handleUserFilterChance('email', 'email');
  }

  /**
   * Crea y configura el formulario para filtrar usuarios.
   */
  createUserFormSearchFilter(): void {
    this.userFormSearchFilter = this._formBuilder.group({
      name: [''],
      email: ['']
    });
  }

  /**
   * Convierte el ID del rol en su nombre correspondiente.
   * @param rol_id ID del rol.
   * @returns Nombre del rol.
   */
  getRoleName(rol_id: number): string {
    switch (rol_id) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuarios';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Maneja los cambios en los filtros del formulario.
   * @param controlName Nombre del control en el formulario.
   * @param filterKey Clave del filtro en el objeto de filtros.
   */
  handleUserFilterChance(controlName: string, filterKey: string): void {
    this.userFormSearchFilter.controls[controlName].valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: any) => {
        this.userDefaultFilterSearch[filterKey] = value;
        this.getAllUserByAdministrator({ ...this.userDefaultFilterSearch, [filterKey]: value });
      });
  }

  /**
   * Obtiene la lista de usuarios desde el servicio.
   * @param filters Filtros opcionales para la búsqueda de usuarios.
   */
  getAllUserByAdministrator(filters?: any): void {
    this.isLoading = true;
    this.userService.getAllUserByAdministrator(filters).subscribe({
      next: (response) => {
        this.usersList = response.users || [];
        this.dataSource.data = response.users || [];
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this._sanckBar.open('Error al cargar los usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo usuario.
   */
  openModalCreateUser(): void {
    const dialogRef = this.dialogModel.open(ModalCreateUserComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    });
  }

  /**
   * Abre el modal para editar un usuario existente.
   * @param userIformation Información del usuario a editar.
   */
  openModalUpdateUsers(userIformation: any): void {
    const dialogRef = this.dialogModel.open(ModalEditUsersComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
      data: { user: userIformation }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    });
  }

  /**
   * Elimina un usuario después de confirmar la acción.
   * @param userId ID del usuario a eliminar.
   */
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        this._sanckBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.getAllUserByAdministrator();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el usuario';
        this._sanckBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
}