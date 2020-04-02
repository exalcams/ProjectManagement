import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { TaskGroup, Owner, TaskSubGroup } from 'app/models/task-group';
import { TaskGroupService } from 'app/services/task-group.service';
import { Project } from 'app/models/project';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TaskGroupComponent implements OnInit {
  MenuItems: string[];
  AllTaskGroups: TaskGroup[] = [];
  AllTaskSubGroups: TaskSubGroup[] = [];
  AllTaskSubGroupsCount: number;
  AllTaskGroupsCount: number;
  SelectedTaskGroup: TaskGroup;
  SelectedTaskSubGroup: TaskSubGroup;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: number;
  taskGroupMainFormGroup: FormGroup;
  taskSubGroupMainFormGroup: FormGroup;
  AllOwners: Owner[] = [];
  AllProjects: Project[] = [];
  searchText = '';
  displayedColumns: string[] = [
    'Title',
    'Owner',
    'PlannedStartDate',
    'PlannedEndDate',
    'ActualStartDate',
    'ActualEndDate',
    'PlannedEffort',
    'ActualEffort'
  ];
  dataSource: MatTableDataSource<TaskSubGroup>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  constructor(
    private _taskGroupService: TaskGroupService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedTaskGroup = new TaskGroup();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Task Group') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.taskGroupMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerID: ['', Validators.required],
        PlannedStartDate: ['', Validators.required],
        PlannedEndDate: ['', Validators.required],
        ActualStartDate: [''],
        ActualEndDate: [''],
        PlannedEffort: ['', Validators.required],
        ActualEffort: [''],
        ProjectID: ['', Validators.required]
      });
      this.taskSubGroupMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerID: ['', Validators.required],
        PlannedStartDate: ['', Validators.required],
        PlannedEndDate: ['', Validators.required],
        PlannedEffort: ['', Validators.required],
        ActualStartDate: [''],
        ActualEndDate: [''],
        ActualEffort: ['']
      });
      this.GetAllOwners();
      this.GetAllProjects();
      this.GetAllTaskGroups();
      this.GetAllTaskSubGroups();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ResetControl(): void {
    this.SelectedTaskGroup = new TaskGroup();
    this.SelectedTaskSubGroup = new TaskSubGroup();
    // this.selectID = Guid.createEmpty();
    this.selectID = 0;
    this.taskGroupMainFormGroup.reset();
    this.AllTaskSubGroups = null;
    Object.keys(this.taskGroupMainFormGroup.controls).forEach(key => {
      this.taskGroupMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
    this.taskSubGroupMainFormGroup.reset();
    Object.keys(this.taskSubGroupMainFormGroup.controls).forEach(key => {
      this.taskSubGroupMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  GetAllOwners(): void {
    this._taskGroupService.GetAllOwners().subscribe(
      (data) => {
        // this.AllOwners = <Owner[]>data;
        this.AllOwners = JSON.parse(data.toString());
        // console.log(this.AllOwners);
      },
      (err) => {
        console.log(err);
      }
    );
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

  GetAllTaskGroups(): void {
    this.IsProgressBarVisibile = true;
    this._taskGroupService.GetAllTaskGroups().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        // this.AllTaskGroups = <TaskGroup[]>data;
        this.AllTaskGroups = JSON.parse(data.toString());
        this.AllTaskGroupsCount = this.AllTaskGroups.length;
        console.log(this.AllTaskGroups);
        if (this.AllTaskGroups && this.AllTaskGroups.length) {
          this.loadSelectedTaskGroup(this.AllTaskGroups[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedTaskGroup(selectedTaskGroup: TaskGroup): void {
    this.selectID = selectedTaskGroup.TaskGroupID;
    this.SelectedTaskGroup = selectedTaskGroup;
    this.SetTaskGroupValues();
  }

  SetTaskGroupValues(): void {
    // this.taskGroupMainFormGroup.get('TaskGroupID').patchValue(this.SelectedTaskGroup.TaskGroupID);
    // this.taskGroupMainFormGroup.get('plant').patchValue(this.SelectedTaskGroup.Plant);
    this.taskGroupMainFormGroup.get('OwnerID').patchValue(this.SelectedTaskGroup.OwnerID);
    this.taskGroupMainFormGroup.get('Title').patchValue(this.SelectedTaskGroup.Title);
    this.taskGroupMainFormGroup.get('ProjectID').patchValue(this.SelectedTaskGroup.ProjectID);
    this.taskGroupMainFormGroup.get('PlannedStartDate').patchValue(this.SelectedTaskGroup.PlannedStartDate);
    this.taskGroupMainFormGroup.get('PlannedEndDate').patchValue(this.SelectedTaskGroup.PlannedEndDate);
    this.taskGroupMainFormGroup.get('PlannedEffort').patchValue(this.SelectedTaskGroup.PlannedEffort);
    this.taskGroupMainFormGroup.get('ActualStartDate').patchValue(this.SelectedTaskGroup.ActualStartDate);
    this.taskGroupMainFormGroup.get('ActualEndDate').patchValue(this.SelectedTaskGroup.ActualEndDate);
    this.taskGroupMainFormGroup.get('ActualEffort').patchValue(this.SelectedTaskGroup.ActualEffort);
  }

  GetAllTaskSubGroups(): void {
    this.IsProgressBarVisibile = true;
    this._taskGroupService.GetAllTaskSubGroups().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        // this.AllTaskSubGroups = <TaskSubGroup[]>data;
        this.AllTaskSubGroups = JSON.parse(data.toString());
        this.AllTaskSubGroupsCount = this.AllTaskSubGroups.length;
        console.log(this.AllTaskSubGroups);
        if (this.AllTaskSubGroups && this.AllTaskSubGroups.length) {
          //   this.AllTaskSubGroups  = this.AllTaskSubGroups.filter(
          //     x => x.OwnerMaster.OwnerName
          // );
          // this.AllOwners = this.AllOwners.filter(x => x.OwnerID = this.SelectedTaskSubGroup.OwnerID);
          this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
          // console.log(this.AllTaskSubGroups);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  SubGroupResetControl(): void {
    this.GetTaskSubGroupValues();
    this.LoadTaskSubGroupTable(this.SelectedTaskSubGroup);
    // this.SelectedTaskGroup = new TaskGroup();
    // this.selectID = Guid.createEmpty();
    this.selectID = 0;
    this.taskSubGroupMainFormGroup.reset();
    Object.keys(this.taskSubGroupMainFormGroup.controls).forEach(key => {
      this.taskSubGroupMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  GetTaskSubGroupValues(): void {
    this.SelectedTaskSubGroup = new TaskSubGroup();
    this.SelectedTaskSubGroup.Title = this.taskSubGroupMainFormGroup.get('Title').value;
    this.SelectedTaskSubGroup.OwnerID = this.taskSubGroupMainFormGroup.get('OwnerID').value;
    this.AllOwners = this.AllOwners.filter(x => x.OwnerID = this.SelectedTaskSubGroup.OwnerID);
    if (this.AllOwners.length > 0) {
      this.SelectedTaskSubGroup.OwnerName = this.AllOwners[0].OwnerName;
    }
    // this.SelectedTaskSubGroup.Plant = this.taskSubGroupMainFormGroup.get('plant').value;
    // this.SelectedTaskSubGroup.OwnerID = <Guid>this.taskSubGroupMainFormGroup.get('OwnerID').value;
    // this.SelectedTaskSubGroup.TaskSubGroupID = this.taskSubGroupMainFormGroup.get('TaskSubGroupID').value;
    this.SelectedTaskSubGroup.PlannedStartDate = this.taskSubGroupMainFormGroup.get('PlannedStartDate').value;
    this.SelectedTaskSubGroup.PlannedEndDate = this.taskSubGroupMainFormGroup.get('PlannedEndDate').value;
    this.SelectedTaskSubGroup.PlannedEffort = this.taskSubGroupMainFormGroup.get('PlannedEffort').value;
    this.SelectedTaskSubGroup.ActualEffort = this.taskSubGroupMainFormGroup.get('ActualEffort').value;
    this.SelectedTaskSubGroup.ActualEndDate = this.taskSubGroupMainFormGroup.get('ActualEndDate').value;
    this.SelectedTaskSubGroup.ActualStartDate = this.taskSubGroupMainFormGroup.get('ActualStartDate').value;

  }

  SetTaskSubGroupValues(): void {
    // this.taskSubGroupMainFormGroup.get('TaskSubGroupID').patchValue(this.SelectedTaskSubGroup.TaskSubGroupID);
    // this.taskSubGroupMainFormGroup.get('plant').patchValue(this.SelectedTaskSubGroup.Plant);
    this.taskSubGroupMainFormGroup.get('OwnerID').patchValue(this.SelectedTaskSubGroup.OwnerID);
    this.taskSubGroupMainFormGroup.get('Title').patchValue(this.SelectedTaskSubGroup.Title);
    // this.taskSubGroupMainFormGroup.get('ProjectID').patchValue(this.SelectedTaskSubGroup.ProjectID);
    this.taskSubGroupMainFormGroup.get('PlannedStartDate').patchValue(this.SelectedTaskSubGroup.PlannedStartDate);
    this.taskSubGroupMainFormGroup.get('PlannedEndDate').patchValue(this.SelectedTaskSubGroup.PlannedEndDate);
    this.taskSubGroupMainFormGroup.get('PlannedEffort').patchValue(this.SelectedTaskSubGroup.PlannedEffort);
    this.taskSubGroupMainFormGroup.get('ActualStartDate').patchValue(this.SelectedTaskSubGroup.ActualStartDate);
    this.taskSubGroupMainFormGroup.get('ActualEndDate').patchValue(this.SelectedTaskSubGroup.ActualEndDate);
    this.taskSubGroupMainFormGroup.get('ActualEffort').patchValue(this.SelectedTaskSubGroup.ActualEffort);
  }

  onOwnerChange(): void {

  }

  LoadTaskSubGroupTable(taskSubGroup: TaskSubGroup): void {
    this.AllTaskSubGroups.push(taskSubGroup);
    if (this.AllTaskSubGroups.length > 0) {
      this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
      // console.log(this.AllTaskSubGroups);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateTaskGroup();
          } else if (Actiontype === 'Update') {
            this.UpdateTaskGroup();
          } else if (Actiontype === 'Delete') {
            this.DeleteTaskGroup();
          }
        }
      });
  }

  GetTaskGroupValues(): void {
    this.SelectedTaskGroup.Title = this.taskGroupMainFormGroup.get('Title').value;
    this.SelectedTaskGroup.OwnerID = this.taskGroupMainFormGroup.get('OwnerID').value;
    this.SelectedTaskGroup.ProjectID = this.taskGroupMainFormGroup.get('ProjectID').value;
    // this.SelectedTaskGroup.Plant = this.taskGroupMainFormGroup.get('plant').value;
    // this.SelectedTaskGroup.OwnerID = <Guid>this.taskGroupMainFormGroup.get('OwnerID').value;
    // this.SelectedTaskGroup.TaskGroupID = this.taskGroupMainFormGroup.get('TaskGroupID').value;
    this.SelectedTaskGroup.PlannedStartDate = this.taskGroupMainFormGroup.get('PlannedStartDate').value;
    this.SelectedTaskGroup.PlannedEndDate = this.taskGroupMainFormGroup.get('PlannedEndDate').value;
    this.SelectedTaskGroup.PlannedEffort = this.taskGroupMainFormGroup.get('PlannedEffort').value;
    this.SelectedTaskGroup.ActualEffort = this.taskGroupMainFormGroup.get('ActualEffort').value;
    this.SelectedTaskGroup.ActualEndDate = this.taskGroupMainFormGroup.get('ActualEndDate').value;
    this.SelectedTaskGroup.ActualStartDate = this.taskGroupMainFormGroup.get('ActualStartDate').value;


  }

  CreateTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.CreatedBy = this.authenticationDetails.userID.toString();
    this.SelectedTaskGroup.taskSubGroups = this.AllTaskSubGroups;
    this.IsProgressBarVisibile = true;
    this._taskGroupService.CreateTaskGroup(this.SelectedTaskGroup).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('TaskGroup created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTaskGroups();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.ModifiedBy = this.authenticationDetails.userID.toString();
    this.SelectedTaskGroup.taskSubGroups = this.AllTaskSubGroups;
    this.IsProgressBarVisibile = true;
    this._taskGroupService.UpdateTaskGroup(this.SelectedTaskGroup).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('TaskGroup updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTaskGroups();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.ModifiedBy = this.authenticationDetails.userID.toString();
    this.SelectedTaskGroup.taskSubGroups = this.AllTaskSubGroups;
    this.IsProgressBarVisibile = true;
    this._taskGroupService.DeleteTaskGroup(this.SelectedTaskGroup).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('TaskGroup deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTaskGroups();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.taskGroupMainFormGroup.controls).forEach(key => {
      this.taskGroupMainFormGroup.get(key).markAsTouched();
      this.taskGroupMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.taskGroupMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedTaskGroup.TaskGroupID) {
        const Actiontype = 'Update';
        const Catagory = 'TaskGroup';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'TaskGroup';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.taskGroupMainFormGroup.valid) {
      if (this.SelectedTaskGroup.TaskGroupID) {
        const Actiontype = 'Delete';
        const Catagory = 'TaskGroup';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  onOwnerClick(selectedOwnerName: string): void {
    console.log(selectedOwnerName);
    if (selectedOwnerName) {
      if (selectedOwnerName === 'Customer') {
        // this.isCustomer = true;
      } else {
        // this.isCustomer = false;
      }
    }
  }
}
