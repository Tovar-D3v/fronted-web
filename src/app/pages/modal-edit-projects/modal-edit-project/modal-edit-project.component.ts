import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialogActions,
  MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';

/**
 * Componente modal para la edición de proyectos.
 * Permite editar los datos de un proyecto existente, asignar un administrador
 * y gestionar la asociación de usuarios al proyecto.
 */
@Component({
  selector: 'app-modal-edit-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './modal-edit-project.component.html',
  styleUrls: ['./modal-edit-project.component.scss']
})
export class ModalEditProjectComponent implements OnInit {
  /**
   * Formulario reactivo para la edición de proyectos.
   */
  formUpdateProject!: FormGroup;

  /**
   * Lista de administradores disponibles para asignar al proyecto.
   */
  administratorsValues: any[] = [];

  /**
   * Lista de usuarios disponibles para asociar al proyecto.
   */
  usersValues: any[] = [];

  /**
   * Lista original de IDs de usuarios asociados al proyecto.
   * Se utiliza para determinar qué usuarios se deben agregar o eliminar.
   */
  originalUserIds: number[] = [];

  /**
   * Constructor del componente.
   * @param data Datos recibidos al abrir el modal, incluyendo el proyecto a editar.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param _snackBar Servicio para mostrar notificaciones tipo snackbar.
   * @param _projectService Servicio para gestionar proyectos.
   * @param _usersService Servicio para gestionar usuarios.
   * @param dialogRef Referencia al diálogo modal.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _projectService: ProjectsService,
    private readonly _usersService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditProjectComponent>
  ) {
    this.updateFormProject();
  }

  /**
   * Método de inicialización del componente.
   * Carga los datos del proyecto, administradores y usuarios disponibles.
   */
  ngOnInit(): void {
    if (this.data?.project) {
      this.loadProjectData(this.data.project);
    }
    this.getAdministrators();
    this.getAllUsers();
  }

  /**
   * Crea y configura el formulario reactivo para la edición de proyectos.
   */
  updateFormProject(): void {
    this.formUpdateProject = this._formBuilder.group({
      nombre: ['', Validators.required], // Campo obligatorio para el nombre del proyecto
      descripcion: ['', Validators.required], // Campo obligatorio para la descripción del proyecto
      administrador_id: ['', Validators.required], // Campo obligatorio para el administrador asignado
      userIds: [[]] // Lista opcional de IDs de usuarios asociados
    });
  }

  /**
   * Carga los datos del proyecto en el formulario.
   * @param project Datos del proyecto a editar.
   */
  loadProjectData(project: any): void {
    const userIds = project.usuarios?.map((u: any) => u.id) || [];
    this.originalUserIds = [...userIds]; // Guardamos los IDs originales de usuarios

    this.formUpdateProject.patchValue({
      nombre: project.nombre,
      descripcion: project.descripcion,
      administrador_id: project.administrador_id,
      userIds
    });
  }

  /**
   * Obtiene la lista de administradores disponibles desde el servicio de usuarios.
   */
  getAdministrators(): void {
    this._usersService.getAllAdministrator().subscribe({
      next: (res) => this.administratorsValues = res.users || [],
      error: () => this._snackBar.open('Error al cargar administradores', 'Cerrar', { duration: 3000 })
    });
  }

  /**
   * Obtiene la lista de usuarios disponibles desde el servicio de usuarios.
   */
  getAllUsers(): void {
    this._usersService.getAllUsers().subscribe({
      next: (res) => this.usersValues = res.users || [],
      error: () => this._snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 })
    });
  }

  /**
   * Maneja la actualización del proyecto.
   * Valida el formulario, actualiza los datos del proyecto y gestiona
   * la asociación o desasociación de usuarios.
   */
  updateProject(): void {
    if (this.formUpdateProject.valid) {
      const { userIds, ...projectData } = this.formUpdateProject.value;
      const projectId = this.data?.project?.id;

      this._projectService.updateProject(projectId, projectData).subscribe({
        next: () => {
          const usersToAdd = userIds.filter((id: number) => !this.originalUserIds.includes(id));
          const usersToRemove = this.originalUserIds.filter((id: number) => !userIds.includes(id));

          // Asociar nuevos usuarios
          const add$ = usersToAdd.length
            ? this._projectService.assignUsersToProject({ projectId, userIds: usersToAdd })
            : undefined;

          // Desasociar usuarios eliminados
          const removeCalls = usersToRemove.map(userId =>
            this._projectService.removeUserFromProject({ projectId, userId })
          );

          Promise.all([
            add$ ? add$.toPromise() : Promise.resolve(),
            ...removeCalls.map(c => c.toPromise())
          ]).then(() => {
            this._snackBar.open('Proyecto actualizado correctamente', 'Cerrar', { duration: 5000 });
            this.dialogRef.close(true);
          }).catch(() => {
            this._snackBar.open('Proyecto actualizado, pero hubo errores al asociar o desasociar usuarios.', 'Cerrar', { duration: 5000 });
            this.dialogRef.close(true);
          });
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
          this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}