import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Task, TaskLog } from 'app/models/task';


@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentTask: Task;
  public CurrentTaskLogs: TaskLog[] = [];

  GetCurrentTask(): Task {
    return this.CurrentTask;
  }

  SetCurrentTask(CurrentTask: Task): void {
    this.CurrentTask = CurrentTask;
  }

  SetTaskLogs(taskLogs: TaskLog[]): void {
    console.log(taskLogs);
    this.CurrentTaskLogs = taskLogs;
  }

  GetTaskLogs(): TaskLog[] {
    console.log(this.CurrentTaskLogs);
    return this.CurrentTaskLogs;
  }


}
