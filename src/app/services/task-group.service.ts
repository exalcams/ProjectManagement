import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { TaskGroup, TaskSubGroup } from 'app/models/task-group';
import { $ } from 'protractor';

@Injectable({
    providedIn: 'root'
})
export class TaskGroupService {

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

    // TaskGroups
    GetAllTaskGroups(): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllTaskGroups`)
            .pipe(catchError(this.errorHandler));
    }

    GetAllTaskSubGroups(): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllTaskSubGroups`)
            .pipe(catchError(this.errorHandler));
    }

    GetAllTaskSubGroupsBasedTaskGroup(taskGroupID: number): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllTaskSubGroupsBasedTaskGroup?TaskGroupID=` + taskGroupID)
            .pipe(catchError(this.errorHandler));
    }


    GetAllOwners(): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllOwners`)
            .pipe(catchError(this.errorHandler));
    }

    GetAllProjects(): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}api/Project/GetAllProjects`)
            .pipe(catchError(this.errorHandler));
    }

    AddTaskSubGroupByProjectID(taskSubGroup: TaskSubGroup): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/Project/AddTaskSubGroupByProjectID`,
        taskSubGroup,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    CreateTaskGroup(project: TaskGroup): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/Project/CreateTaskGroup`,
            project,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    

    UpdateTaskGroup(project: TaskGroup): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/Project/UpdateTaskGroup`,
            project,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteTaskGroup(project: TaskGroup): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/Project/DeleteTaskGroup`,
            project,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

}
