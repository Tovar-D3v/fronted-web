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

import Swal from 'sweetalert2';
import { ProjectsService } from 'app/services/projects/projects.service';
import { ModalCreateProjectComponent } from '../modal-create-projects/modal-create-project/modal-create-project.component';
import { ModalEditProjectComponent } from '../modal-edit-projects/modal-edit-project/modal-edit-project.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

/** Definimos las claves válidas para los filtros */
interface ProjectFilters {
  nombre: string;
  descripcion: string;
}

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
  /** Columnas de la tabla */
  displayedColumns: string[] = [
    'nombre',
    'descripcion',
    'administrador',
    'usuarios',
    'fecha_creacion',
    'acciones'
  ];

  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  projectFilterForm!: FormGroup;

  /** Ahora con tipo ProjectFilters */
  projectDefaultFilter: ProjectFilters = {
    nombre: '',
    descripcion: ''
  };

  breadscrums = [
    {
      title: 'Gestión de proyectos',
      item: [],
      active: 'Listado de proyectos',
    },
  ];

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _projectsService: ProjectsService,
    private readonly _dialog: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.createProjectFilterForm();
    this.getAllProjects();
    // Sólo pasamos la clave del filtro, que TS reconoce como válida
    this.handleProjectFilterChange('nombre');
    this.handleProjectFilterChange('descripcion');
  }

  private createProjectFilterForm(): void {
    this.projectFilterForm = this._formBuilder.group({
      nombre: [''],
      descripcion: [''],
    });
  }

  /**
   * Escucha cambios en el formulario y actualiza projectDefaultFilter
   * controlName es keyof ProjectFilters, así TS sabe que es 'nombre' o 'descripcion'
   */
  private handleProjectFilterChange(controlName: keyof ProjectFilters): void {
    this.projectFilterForm.controls[controlName].valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value: string) => {
        // TS infiere que controlName es una clave válida de projectDefaultFilter
        this.projectDefaultFilter[controlName] = value;
        this.getAllProjects({ ...this.projectDefaultFilter });
      });
  }

  getAllProjects(filters?: Partial<ProjectFilters>): void {
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

  openModalCreateProject(): void {
    const dialogRef = this._dialog.open(ModalCreateProjectComponent, {
      width: '820px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.getAllProjects();
    });
  }

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
