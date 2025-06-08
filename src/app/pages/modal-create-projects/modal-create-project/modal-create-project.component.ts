import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { ProjectsService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';

/**
 * Componente modal para la creación de proyectos.
 * Permite crear un nuevo proyecto, asignar un administrador y asociar usuarios al proyecto.
 */
@Component({
  selector: 'app-modal-create-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.scss']
})
export class ModalCreateProjectComponent implements OnInit {
  /**
   * Formulario reactivo para la creación de proyectos.
   */
  formCreateProject!: FormGroup;

  /**
   * Lista de administradores disponibles para asignar al proyecto.
   */
  administratorsValues: any[] = [];

  /**
   * Lista de usuarios disponibles para asociar al proyecto.
   */
  usersValues: any[] = [];

  /**
   * Constructor del componente.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param _projectsService Servicio para gestionar proyectos.
   * @param _usersService Servicio para gestionar usuarios.
   * @param _dialogRef Referencia al diálogo modal.
   * @param _snackBar Servicio para mostrar notificaciones tipo snackbar.
   */
  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _projectsService: ProjectsService,
    private readonly _usersService: UsersService,
    private readonly _dialogRef: MatDialogRef<ModalCreateProjectComponent>,
    private readonly _snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  /**
   * Método de inicialización del componente.
   * Carga la lista de administradores y usuarios disponibles.
   */
  ngOnInit(): void {
    this.getAdministrators();
    this.getAllUsers();
  }

  /**
   * Crea y configura el formulario reactivo para la creación de proyectos.
   */
  createForm(): void {
    this.formCreateProject = this._formBuilder.group({
      nombre: ['', Validators.required], // Campo obligatorio para el nombre del proyecto
      descripcion: ['', Validators.required], // Campo obligatorio para la descripción del proyecto
      administrador_id: ['', Validators.required], // Campo obligatorio para el administrador asignado
      userIds: [[]] // Lista opcional de IDs de usuarios asociados
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
   * Maneja el envío del formulario para crear un proyecto.
   * Valida el formulario, crea el proyecto y asocia usuarios si es necesario.
   */
  onSubmit(): void {
    if (this.formCreateProject.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const { userIds, ...projectData } = this.formCreateProject.value;

    // Crear el proyecto
    this._projectsService.createProject(projectData).subscribe({
      next: (response) => {
        const createdProject = response.project;

        // Si hay usuarios seleccionados, asociarlos al proyecto
        if (userIds && userIds.length > 0) {
          this._projectsService.assignUsersToProject({
            projectId: createdProject.id,
            userIds
          }).subscribe({
            next: () => {
              this._snackBar.open('Proyecto y usuarios asociados correctamente', 'Cerrar', { duration: 5000 });
              this.formCreateProject.reset();
              this._dialogRef.close(true);
            },
            error: () => {
              this._snackBar.open('Proyecto creado, pero ocurrió un error al asociar usuarios.', 'Cerrar', { duration: 5000 });
              this._dialogRef.close(true);
            }
          });
        } else {
          this._snackBar.open(response.message || 'Proyecto creado con éxito', 'Cerrar', { duration: 5000 });
          this._dialogRef.close(true);
        }
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Error inesperado al crear el proyecto.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
}