import { Injectable, Input, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Project } from 'app/models/project';
import { Task, TaskView, Logic, Validation } from 'app/models/task';
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

  GetAllTasks(): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasks`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllTasksByDeveloper(UserID: Guid): Observable<Task[] | string> {
    return this._httpClient.get<Task[]>(`${this.baseAddress}api/Project/GetAllTasksByDeveloper?UserID=${UserID}`)
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
}
