import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CustomValidator } from 'app/shared/custom-validator';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { Project } from 'app/models/project';
import { TaskGroup, TaskSubGroup } from 'app/models/task-group';
import { TaskGroupService } from 'app/services/task-group.service';
import { SelectSprint } from 'app/models/task';

@Component({
  selector: 'select-sprint-dialog',
  templateUrl: './select-sprint-dialog.component.html',
  styleUrls: ['./select-sprint-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SelectSprintDialogComponent implements OnInit {
  AllProjects: Project[] = [];
  AllTaskGroups: TaskGroup[] = [];
  AllTaskSubGroups: TaskSubGroup[] = [];
  selectSprintForm: FormGroup;
  selectSprint: SelectSprint;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<SelectSprintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private _taskGroupService: TaskGroupService,

  ) {
    this.selectSprintForm = this._formBuilder.group({
      ProjectID: ['', Validators.required],
      TaskGroupID: ['', Validators.required],
      TaskSubGroupID: ['', Validators.required]
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    this.GetAllProjects();
  }

  GetAllProjects(): void {
    this._taskGroupService.GetAllProjects().subscribe(
      (data) => {
        // this.AllProjects = <Owner[]>data;
        this.AllProjects = JSON.parse(data.toString());
        // console.log(this.AllProjects);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllTaskGroupsBasedProjectID(ProjectID: number): void {
    this._taskGroupService.GetAllTaskGroupsBasedProjectID(ProjectID).subscribe(
      (data) => {
        // this.AllTaskGroups = <TaskGroup[]>data;
        this.AllTaskGroups = JSON.parse(data.toString());
        console.log(this.AllTaskGroups);
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetAllTaskSubGroupsBasedTaskGroup(taskGroupID: number): void {
    this._taskGroupService.GetAllTaskSubGroupsBasedTaskGroup(taskGroupID).subscribe(
      (data) => {
        // this.AllTaskSubGroups = <TaskSubGroup[]>data;
        this.AllTaskSubGroups = JSON.parse(data.toString());
        // this.AllTaskSubGroups.forEach(x => {
        //   x.OwnerName = this.GetOwnerNameByOwnerIDList(x.OwnerIDList);
        // });
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  YesClicked(): void {
    if (this.selectSprintForm.valid) {
      this.selectSprint = new SelectSprint();
      this.selectSprint.ProjectID = this.selectSprintForm.get('ProjectID').value;
      this.selectSprint.TaskGroupID = this.selectSprintForm.get('TaskGroupID').value;
      this.selectSprint.TaskSubGroupID = this.selectSprintForm.get('TaskSubGroupID').value;
      if (this.selectSprint.TaskSubGroupID) {
        this.notificationSnackBarComponent.openSnackBar('task sub group cannot be empty', SnackBarStatus.danger);
      } else {
        this.matDialogRef.close(this.selectSprint);
      }
    } else {
      Object.keys(this.selectSprintForm.controls).forEach(key => {
        this.selectSprintForm.get(key).markAsTouched();
        this.selectSprintForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }

  OnProjectChanged(): void {
    // console.log('changed');
    const selectedProjectID = this.selectSprintForm.get('ProjectID').value as number;
    if (selectedProjectID) {
      // this.roleMainFormGroup.get('appIDList').patchValue([this.AppIDListAllID]);
      // this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);
       this.GetAllTaskGroupsBasedProjectID(selectedProjectID);
    }
    // console.log(this.roleMainFormGroup.get('appIDList').value);
  }

  OnTaskGroupChanged(): void {
    // console.log('changed');
    const selectedTaskGroupID = this.selectSprintForm.get('ProjectID').value as number;
    if (selectedTaskGroupID) {
      // this.roleMainFormGroup.get('appIDList').patchValue([this.AppIDListAllID]);
      // this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);
       this.GetAllTaskSubGroupsBasedTaskGroup(selectedTaskGroupID);
    }
    // console.log(this.roleMainFormGroup.get('appIDList').value);
  }

}
