import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ProjectsService } from 'app/services/projects/projects.service';
import { ModalCreateProjectComponent } from '../modal-create-projects/modal-create-project/modal-create-project.component';
import { ModalEditProjectComponent } from '../modal-edit-projects/modal-edit-project/modal-edit-project.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

import Swal from 'sweetalert2';

/**
 * Componente para la gestión de proyectos.
 * Permite listar, filtrar, crear, editar y eliminar proyectos.
 */
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  /**
   * Columnas a mostrar en la tabla de proyectos.
   */
  displayedColumns: string[] = ['nombre', 'descripcion', 'acciones'];

  /**
   * Fuente de datos para la tabla de proyectos.
   */
  dataSource = new MatTableDataSource<any>([]);

  /**
   * Indicador de carga para mostrar un spinner mientras se cargan los datos.
   */
  isLoading = false;

  /**
   * Referencia al paginador de la tabla.
   */
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  /**
   * Formulario para filtrar proyectos.
   */
  projectFilterForm!: FormGroup;

  /**
   * Filtros predeterminados para la búsqueda de proyectos.
   */
  projectDefaultFilter: { [key: string]: string } = {
    nombre: '',
    descripcion: '',
  };

  /**
   * Datos para el componente de breadcrumb.
   */
  breadscrums = [
    {
      title: 'Gestión de proyectos',
      item: [],
      active: 'Listado de proyectos',
    },
  ];

  /**
   * Constructor del componente.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param _projectsService Servicio para gestionar proyectos.
   * @param _dialog Servicio para abrir modales.
   * @param _snackBar Servicio para mostrar notificaciones tipo snackbar.
   */
  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _projectsService: ProjectsService,
    private readonly _dialog: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) {}

  /**
   * Método de inicialización del componente.
   * Configura el formulario de filtros y carga la lista inicial de proyectos.
   */
  ngOnInit(): void {
    this.createProjectFilterForm();
    this.getAllProjects();
    this.handleProjectFilterChange('nombre', 'nombre');
    this.handleProjectFilterChange('descripcion', 'descripcion');
  }

  /**
   * Crea y configura el formulario para filtrar proyectos.
   */
  createProjectFilterForm(): void {
    this.projectFilterForm = this._formBuilder.group({
      nombre: [''],
      descripcion: [''],
    });
  }

  /**
   * Maneja los cambios en los filtros del formulario.
   * @param controlName Nombre del control en el formulario.
   * @param filterKey Clave del filtro en el objeto de filtros.
   */
  handleProjectFilterChange(controlName: string, filterKey: string): void {
    this.projectFilterForm.controls[controlName].valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.projectDefaultFilter[filterKey] = value;
        this.getAllProjects({ ...this.projectDefaultFilter });
      });
  }

  /**
   * Obtiene la lista de proyectos desde el servicio.
   * @param filters Filtros opcionales para la búsqueda de proyectos.
   */
  getAllProjects(filters?: any): void {
    this.isLoading = true;
    this._projectsService.getAllProjects(filters).subscribe({
      next: (res) => {
        this.dataSource.data = res.projects || [];
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: () => {
        this._snackBar.open('Error al cargar los proyectos', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  /**
   * Abre el modal para crear un nuevo proyecto.
   */
  openModalCreateProject(): void {
    const dialogRef = this._dialog.open(ModalCreateProjectComponent, {
      width: '820px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.getAllProjects();
    });
  }

  /**
   * Abre el modal para editar un proyecto existente.
   * @param project Proyecto a editar.
   */
  openModalEditProject(project: any): void {
    const dialogRef = this._dialog.open(ModalEditProjectComponent, {
      width: '820px',
      disableClose: true,
      data: { project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.getAllProjects();
    });
  }

  /**
   * Elimina un proyecto después de confirmar la acción.
   * @param projectId ID del proyecto a eliminar.
   */
  deleteProject(projectId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el proyecto permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._projectsService.deleteProject(projectId).subscribe({
          next: (response) => {
            this._snackBar.open(response.message || 'Proyecto eliminado con éxito', 'Cerrar', { duration: 4000 });
            this.getAllProjects();
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Error al eliminar el proyecto.';
            this._snackBar.open(errorMessage, 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }
}