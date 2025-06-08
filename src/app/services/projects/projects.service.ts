import { HttpClient, HttpParams } from '@angular/common/http'; // Importa el cliente HTTP para realizar peticiones al servidor
import { Injectable } from '@angular/core'; // Decorador para marcar la clase como un servicio inyectable
import { URL_SERVICIOS } from '@core/models/config'; // URL base para los servicios del backend
import { Observable } from 'rxjs'; // Importa Observable para manejar respuestas asincrónicas

/**
 * Servicio para gestionar las operaciones relacionadas con proyectos.
 * Este servicio se comunica con las APIs del backend para realizar
 * operaciones CRUD y gestionar la asignación de usuarios a proyectos.
 */
@Injectable({
  providedIn: 'root', // Proporciona el servicio a nivel global en la aplicación
})
export class ProjectsService {
  /**
   * URL base de los servicios del backend.
   * Se obtiene desde una configuración centralizada.
   */
  urlBaseServices: string = URL_SERVICIOS;

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP para realizar las peticiones al backend.
   */
  constructor(private readonly http: HttpClient) {}

  /**
   * Crea un nuevo proyecto en el sistema.
   * @param projectData Datos del proyecto que se desea crear.
   * @returns Observable con la respuesta de la API.
   */
  createProject(projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/create`; // Endpoint para crear un proyecto
    return this.http.post<any>(endpoint, projectData); // Realiza una petición POST al endpoint
  }

  /**
   * Actualiza los datos de un proyecto existente.
   * @param projectId ID del proyecto que se desea actualizar.
   * @param projectData Datos actualizados del proyecto.
   * @returns Observable con la respuesta de la API.
   */
  updateProject(projectId: number, projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/update/${projectId}`; // Endpoint para actualizar un proyecto
    return this.http.put<any>(endpoint, projectData); // Realiza una petición PUT al endpoint
  }

  /**
   * Elimina un proyecto del sistema.
   * @param projectId ID del proyecto que se desea eliminar.
   * @returns Observable con la respuesta de la API.
   */
  deleteProject(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/delete/${projectId}`; // Endpoint para eliminar un proyecto
    return this.http.delete<any>(endpoint); // Realiza una petición DELETE al endpoint
  }

  /**
   * Obtiene una lista de todos los proyectos.
   * Se pueden aplicar filtros opcionales para la búsqueda.
   * @param filters Filtros opcionales para buscar proyectos (nombre, descripción, etc.).
   * @returns Observable con la lista de proyectos.
   */
  getAllProjects(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects`; // Endpoint para obtener proyectos
    const params = new HttpParams({
      fromObject: {
        nombre: filters?.name || '', // Filtro por nombre
        descripcion: filters?.description || '', // Filtro por descripción
      },
    });
    return this.http.get<any>(endpoint, { params }); // Realiza una petición GET con parámetros
  }

  /**
   * Obtiene los detalles de un proyecto específico por su ID.
   * @param projectId ID del proyecto que se desea obtener.
   * @returns Observable con los detalles del proyecto.
   */
  getProjectById(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}`; // Endpoint para obtener un proyecto por ID
    return this.http.get<any>(endpoint); // Realiza una petición GET al endpoint
  }

  /**
   * Asigna múltiples usuarios a un proyecto.
   * @param data Objeto que contiene el ID del proyecto y una lista de IDs de usuarios.
   * @returns Observable con la respuesta de la API.
   */
  assignUsersToProject(data: { projectId: number; userIds: number[] }): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/associate`; // Endpoint para asociar usuarios a un proyecto
    return this.http.post<any>(endpoint, data); // Realiza una petición POST al endpoint
  }

  /**
   * Remueve un usuario específico de un proyecto.
   * @param data Objeto que contiene el ID del proyecto y el ID del usuario a remover.
   * @returns Observable con la respuesta de la API.
   */
  removeUserFromProject(data: { projectId: number; userId: number }): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/disassociate`; // Endpoint para desasociar un usuario de un proyecto
    return this.http.request<any>('delete', endpoint, { body: data }); // Realiza una petición DELETE con un cuerpo
  }
}