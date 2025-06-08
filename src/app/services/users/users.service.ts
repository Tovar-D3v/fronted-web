import { HttpClient, HttpParams } from '@angular/common/http'; // Importa el cliente HTTP para realizar peticiones al servidor
import { Injectable } from '@angular/core'; // Decorador para marcar la clase como un servicio inyectable
import { URL_SERVICIOS } from '@core/models/config'; // URL base para los servicios del backend
import { Observable } from 'rxjs'; // Importa Observable para manejar respuestas asincrónicas

/**
 * Servicio para gestionar las operaciones relacionadas con usuarios.
 * Este servicio se comunica con las APIs del backend para realizar
 * operaciones CRUD y obtener datos relacionados con usuarios y administradores.
 */
@Injectable({
  providedIn: 'root' // Proporciona el servicio a nivel global en la aplicación
})
export class UsersService {

  /**
   * URL base de los servicios del backend.
   * Se obtiene desde una configuración centralizada.
   */
  urlBaseServices: string = URL_SERVICIOS;

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP para realizar las peticiones al backend.
   */
  constructor(private readonly http: HttpClient) { }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param userData Datos del usuario que se desea crear.
   * @returns Observable con la respuesta de la API.
   */
  createUser(userData: any): Observable<any> { 
    const endpoint = `${this.urlBaseServices}/api/v1/users/create`; // Endpoint para crear un usuario
    return this.http.post<any>(endpoint, userData); // Realiza una petición POST al endpoint
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param userId ID del usuario que se desea actualizar.
   * @param userData Datos actualizados del usuario.
   * @returns Observable con la respuesta de la API.
   */
  updateUser(userId: number, userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/update/${userId}`; // Endpoint para actualizar un usuario
    return this.http.put<any>(endpoint, userData); // Realiza una petición PUT al endpoint
  }

  /**
   * Elimina un usuario del sistema.
   * @param userId ID del usuario que se desea eliminar.
   * @returns Observable con la respuesta de la API.
   */
  deleteUser(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/delete/${userId}`; // Endpoint para eliminar un usuario
    return this.http.delete<any>(endpoint); // Realiza una petición DELETE al endpoint
  }

  /**
   * Obtiene una lista de usuarios relacionados con un administrador.
   * Se pueden aplicar filtros opcionales para la búsqueda.
   * @param filters Filtros opcionales para buscar usuarios (nombre, email, etc.).
   * @returns Observable con la lista de usuarios.
   */
  getAllUserByAdministrator(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users`; // Endpoint para obtener usuarios
    const params = new HttpParams({ fromObject: {
      nombre: filters?.name || '', // Filtro por nombre
      email: filters?.email || '' // Filtro por email
    } });
    return this.http.get<any>(endpoint, { params }); // Realiza una petición GET con parámetros
  }

  /**
   * Obtiene una lista de todos los administradores del sistema.
   * @returns Observable con la lista de administradores.
   */
  getAllAdministrator(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/1`; // Endpoint para obtener administradores
    return this.http.get<any>(endpoint); // Realiza una petición GET al endpoint
  }

  /**
   * Obtiene una lista de todos los usuarios del sistema.
   * @returns Observable con la lista de usuarios.
   */
  getAllUsers(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/2`; // Endpoint para obtener usuarios
    return this.http.get<any>(endpoint); // Realiza una petición GET al endpoint
  }
}