import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from 'app/services/users/users.service';

/**
 * Componente modal para la edición de usuarios.
 * Permite editar los datos de un usuario existente, asignar roles y asociar administradores.
 */
@Component({
  selector: 'app-modal-edit-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule
  ],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.scss'
})
export class ModalEditUsersComponent {
  /**
   * Formulario reactivo para la edición de usuarios.
   */
  formUpdateUsers!: FormGroup;

  /**
   * Lista de administradores disponibles para asignar al usuario.
   */
  administratorsValues: any[] = [];

  /**
   * Constructor del componente.
   * @param data Datos recibidos al abrir el modal, incluyendo el usuario a editar.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param _snackBar Servicio para mostrar notificaciones tipo snackbar.
   * @param _userService Servicio para gestionar usuarios.
   * @param dialogRef Referencia al diálogo modal.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditUsersComponent>
  ) {
    this.updateFormUsers(); // Inicializamos el formulario.
    this.getAllAdministrator(); // Cargamos la lista de administradores.
  }

  /**
   * Método de inicialización del componente.
   * Carga los datos del usuario en el formulario si están disponibles.
   */
  ngOnInit(): void {
    if (this.data?.user) {
      this.loadUserData(this.data.user);
    }
  }

  /**
   * Crea y configura el formulario reactivo para la edición de usuarios.
   */
  updateFormUsers(): void {
    this.formUpdateUsers = this._formBuilder.group({
      nombre: ['', Validators.required], // Campo obligatorio para el nombre.
      email: ['', [Validators.required, Validators.email]], // Campo obligatorio para el email con validación de formato.
      rol_id: ['', Validators.required], // Campo obligatorio para el rol.
      administrador_id: ['', Validators.required] // Campo obligatorio para el administrador asignado.
    });
  }

  /**
   * Carga los datos del usuario en el formulario para su edición.
   * @param user Datos del usuario a editar.
   */
  loadUserData(user: any): void {
    this.formUpdateUsers.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol_id: String(user.rol_id),
      administrador_id: user.administrador_id
    });
  }

  /**
   * Obtiene la lista de administradores disponibles desde el servicio de usuarios.
   */
  getAllAdministrator(): void {
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        this.administratorsValues = res.users || []; // Guardamos la lista de administradores.
      },
      error: (err) => {
        console.error(err); // Si hay un error, lo mostramos en la consola.
      }
    });
  }

  /**
   * Maneja la actualización del usuario.
   * Valida el formulario y envía los datos al backend para actualizar el usuario.
   */
  updateUsers(): void {
    if (this.formUpdateUsers.valid) {
      const userData = this.formUpdateUsers.value; // Obtenemos los datos del formulario.
      const userId = this.data?.user?.id; // Obtenemos el ID del usuario a editar.

      this._userService.updateUser(userId, userData).subscribe({
        next: (response) => {
          // Si la actualización es exitosa, mostramos un mensaje y cerramos el modal.
          this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          // Si ocurre un error, mostramos un mensaje de error.
          const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intente nuevamente.';
          this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}