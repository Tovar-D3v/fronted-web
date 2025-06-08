import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UsersService } from 'app/services/users/users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Componente modal para la creación de usuarios.
 * Permite crear un nuevo usuario, asignar roles y asociar administradores si es necesario.
 */
@Component({
  selector: 'app-modal-create-user',
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
  templateUrl: './modal-create-user.component.html',
  styleUrl: './modal-create-user.component.scss'
})
export class ModalCreateUserComponent implements OnInit {
  /**
   * Formulario reactivo para la creación de usuarios.
   */
  formCreateUser!: FormGroup;

  /**
   * Lista de administradores disponibles para asignar al usuario.
   */
  administratorsValues: any[] = [];

  /**
   * Controla si se muestra el campo de administrador.
   */
  showFieldAdministrator: boolean = false;

  /**
   * Constructor del componente.
   * @param data Datos recibidos al abrir el modal.
   * @param _formBuilder Servicio para construir formularios reactivos.
   * @param _userService Servicio para gestionar usuarios.
   * @param dialogRef Referencia al diálogo modal.
   * @param _sanckBar Servicio para mostrar notificaciones tipo snackbar.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalCreateUserComponent>,
    private readonly _sanckBar: MatSnackBar
  ) {
    this.createFormUsers();

    // Validación de la contraseña de confirmación
    this.formCreateUser.controls['confirmPassword'].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.validatePassword(value);
    });
  }

  /**
   * Método de inicialización del componente.
   * Carga la lista de administradores disponibles.
   */
  ngOnInit(): void {
    this.getAllAdministrator();
  }

  /**
   * Crea y configura el formulario reactivo para la creación de usuarios.
   */
  createFormUsers(): void {
    this.formCreateUser = this._formBuilder.group({
      nombre: ['', Validators.required], // Campo obligatorio para el nombre
      email: ['', Validators.required], // Campo obligatorio para el email
      password: ['', Validators.required], // Campo obligatorio para la contraseña
      confirmPassword: ['', Validators.required], // Campo obligatorio para confirmar la contraseña
      rol_id: ['', Validators.required], // Campo obligatorio para el rol
      administrador_id: [undefined, Validators.required] // Campo opcional para el administrador
    });
  }

  /**
   * Obtiene la lista de administradores disponibles desde el servicio de usuarios.
   */
  getAllAdministrator(): void {
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        this.administratorsValues = res.users || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  /**
   * Maneja el cambio de rol en el formulario.
   * @param event Evento que contiene el valor del rol seleccionado.
   */
  onChangeRole(event: any): void {
    if (event.value === '1') {
      this.hideAdministratorField(); // Oculta el campo de administrador si el rol es "Administrador"
    } else {
      this.showAdministratorField(); // Muestra el campo de administrador para otros roles
    }
  }

  /**
   * Maneja el envío del formulario para crear un usuario.
   * Valida el formulario y envía los datos al backend.
   */
  onSubmit(): void {
    if (this.formCreateUser.invalid) {
      Swal.fire('Error', 'Por favor completa los campos', 'error');
      return;
    }

    const superAdminId = 1; // ID fijo para el super administrador
    const userDataInformation = {
      nombre: this.formCreateUser.get('nombre')?.value,
      email: this.formCreateUser.get('email')?.value,
      password: this.formCreateUser.get('password')?.value,
      rol_id: Number(this.formCreateUser.get('rol_id')?.value),
      administrador_id: this.formCreateUser.get('rol_id')?.value === '1' ? superAdminId : this.formCreateUser.get('administrador_id')?.value
    };

    this._userService.createUser(userDataInformation).subscribe({
      next: (response) => {
        this._sanckBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formCreateUser.reset();
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
        this._sanckBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  /**
   * Valida que la contraseña de confirmación coincida con la original.
   * @param confirmPassword Contraseña de confirmación ingresada.
   */
  private validatePassword(confirmPassword: string): void {
    const password = this.formCreateUser.get('password')?.value;
    if (password !== confirmPassword) {
      this.formCreateUser.get('confirmPassword')?.setErrors({ invalid: true });
    } else {
      this.formCreateUser.get('confirmPassword')?.setErrors(null);
    }
  }

  /**
   * Muestra el campo de administrador en el formulario.
   */
  private showAdministratorField(): void {
    this.showFieldAdministrator = true;
    this.formCreateUser.get('administrador_id')?.setValidators([Validators.required]);
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
  }

  /**
   * Oculta el campo de administrador en el formulario.
   */
  private hideAdministratorField(): void {
    this.showFieldAdministrator = false;
    this.formCreateUser.get('administrador_id')?.clearValidators();
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
  }
}