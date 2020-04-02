import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Project } from 'app/models/project';

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
    this.baseAddress =  'http://localhost:44392/';
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

}
