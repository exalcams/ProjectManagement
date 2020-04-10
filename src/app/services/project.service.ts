import { Injectable, Input, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Project } from 'app/models/project';
import { Task, TaskView, Logic, Validation, TaskSubGroupView, SketchView } from 'app/models/task';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  baseAddress: string;
  NotificationEvent: Subject<any>;

  GetNotification(): Observable<any> {
    return this.NotificationEvent.asObservable();
  }

  TriggerNotification(eventName: string): void {
    this.NotificationEvent.next(eventName);
  }

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
    // this.baseAddress = 'http://localhost:44392/';
    this.NotificationEvent = new Subject();
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // Dashboard

  GetAllNewTasksToday(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllNewTasksToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllNewTasksCountToday(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllNewTasksCountToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasks1(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasks1`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasksCount(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllTasksCount`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllOpenTasks(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllOpenTasks`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllOpenTasksCount(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllOpenTasksCount`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllEscalatedTasksToday(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllEscalatedTasksToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllEscalatedTasksCountToday(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllEscalatedTasksCountToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllReworkTasksToday(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllReworkTasksToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllReworkTasksCountToday(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllReworkTasksCountToday`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasksByChoice(Choice: string): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasksByChoice?Choice=${Choice}`)
      .pipe(catchError(this.errorHandler));
  }

  // Projects
  GetAllProjects(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllProjects`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllOwners(): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllOwners`)
      .pipe(catchError(this.errorHandler));
  }

  CreateProject(project: Project): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/CreateProject`,
      project,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateProject(project: Project): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/UpdateProject`,
      project,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteProject(project: Project): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/DeleteProject`,
      project,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Task

  GetAllTaskSubGroupView(): Observable<TaskSubGroupView[] | string> {
    return this._httpClient.get<TaskSubGroupView[]>(`${this.baseAddress}api/Project/GetAllTaskSubGroupView`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasks(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasks`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasksByDeveloper(UserID: Guid): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasksByDeveloper?UserID=${UserID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasksByTL(UserID: Guid): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasksByTL?UserID=${UserID}`)
      .pipe(catchError(this.errorHandler));
  }

  CreateTask(task: TaskView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/CreateTask`,
      task,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateTask(task: TaskView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/UpdateTask`,
      task,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeleteTask(task: Task): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Project/DeleteTask`,
      task,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  AddTaskAttachment(TaskID: number, UserID: Guid, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach(x => {
        formData.append(x.name, x, x.name);
      });
    }
    formData.append('TaskID', TaskID.toString());
    formData.append('UserID', UserID.toString());

    return this._httpClient.post<any>(`${this.baseAddress}api/Project/AddTaskAttachment`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }

  GetInputsByTask(TaskID: number): Observable<Input[] | string> {
    return this._httpClient.get<Input[]>(`${this.baseAddress}api/Project/GetInputsByTask?TaskID=${TaskID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOutputsByTask(TaskID: number): Observable<Output[] | string> {
    return this._httpClient.get<Output[]>(`${this.baseAddress}api/Project/GetOutputsByTask?TaskID=${TaskID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetLogicsByTask(TaskID: number): Observable<Logic[] | string> {
    return this._httpClient.get<Logic[]>(`${this.baseAddress}api/Project/GetLogicsByTask?TaskID=${TaskID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetValidationsByTask(TaskID: number): Observable<Validation[] | string> {
    return this._httpClient.get<Validation[]>(`${this.baseAddress}api/Project/GetValidationsByTask?TaskID=${TaskID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetSketchViewsByTask(TaskID: number): Observable<SketchView[] | string> {
    return this._httpClient.get<SketchView[]>(`${this.baseAddress}api/Project/GetSketchViewsByTask?TaskID=${TaskID}`)
      .pipe(catchError(this.errorHandler));
  }

  DowloandTaskImage(AttachmentName: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}api/Project/DowloandTaskImage?AttachmentName=${AttachmentName}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }

}
