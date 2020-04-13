import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails, UserWithRole } from 'app/models/master';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { TaskGroup, Owner, TaskSubGroup } from 'app/models/task-group';
import { TaskGroupService } from 'app/services/task-group.service';
import { Project } from 'app/models/project';
// import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MasterService } from 'app/services/master.service';
import { BehaviorSubject } from 'rxjs';

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
  AllOwners: UserWithRole[] = [];
  OwnerNamesListString: string;

  TaskGroupSelectedOwners: UserWithRole[] = [];
  TaskGroupSelectedOwnerIDList: Guid[] = [];
  // taskGroupFormDropdownSettings: IDropdownSettings = {};

  TaskSubGroupSelectedOwners: UserWithRole[] = [];
  TaskSubGroupSelectedOwnerIDList: Guid[] = [];
  // taskSubGroupFormDropdownSettings: IDropdownSettings = {};

  AllProjects: Project[] = [];
  searchText = '';
  isDeveloper: boolean;
  TotalSubGroupActualEffort: any;
  // displayedColumns: string[] = [
  //   'Title',
  //   'Owner',
  //   'PlannedStartDate',
  //   'PlannedEndDate',
  //   'PlannedEffort',
  //   'ActualStartDate',
  //   'ActualEndDate',
  //   'ActualEffort',
  //   'Action'
  // ];
  dataSource: MatTableDataSource<TaskSubGroup>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  SprintFormGroup: FormGroup;
  SprintFormArray: FormArray = this._formBuilder.array([]);
  SprintDataSource = new BehaviorSubject<AbstractControl[]>([]);
  @ViewChild(MatPaginator) sprintPaginator: MatPaginator;
  @ViewChild(MatSort) sprintSort: MatSort;
  SprintsColumns: string[] = ['Title',
    'Owner',
    'PlannedStartDate',
    'PlannedEndDate',
    'PlannedEffort',
    'ActualStartDate',
    'ActualEndDate',
    'ActualEffort',
    'Action'];

  constructor(
    private _taskGroupService: TaskGroupService,
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedTaskGroup = new TaskGroup();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    this.isDeveloper = false;
    this.AllTaskSubGroupsCount = 0;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      if (this.authenticationDetails.userRole === 'Developer') {
        this.isDeveloper = true;
      }
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Task Group') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.taskGroupMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerIDList: [[], Validators.required],
        PlannedStartDate: ['', Validators.required],
        PlannedEndDate: ['', Validators.required],
        ActualStartDate: [''],
        ActualEndDate: [''],
        PlannedEffort: ['', [Validators.required, Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')]],
        ActualEffort: ['', Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')],
        ProjectID: ['', Validators.required]
      });
      this.taskSubGroupMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerIDList: [[], Validators.required],
        PlannedStartDate: ['', Validators.required],
        PlannedEndDate: ['', Validators.required],
        PlannedEffort: ['', [Validators.required, Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')]],
        // ActualStartDate: [''],
        // ActualEndDate: [''],
        // ActualEffort: ['', Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')]
      });
      this.GetAllOwners();
      this.GetAllProjects();
      this.GetAllTaskGroups();
      // this.IntializeDropDownSettings();
      this.InitializeSprintFormGroup();

    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  InitializeSprintFormGroup(): void {
    this.SprintFormGroup = this._formBuilder.group({
      // Title: ['', Validators.required],
      // Owner: ['', Validators.required],
      // PlannedStartDate: ['', Validators.required],
      // PlannedEndDate: ['', Validators.required],
      // PlannedEffort: ['', [Validators.required, Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')]],
      // ActualStartDate: [''],
      // ActualEndDate: [''],
      // ActualEffort: ['', Validators.pattern('^[0-9]*([.][0-9]{1,3})?$')],
      Sprints: this.SprintFormArray
      // CreatedBy: ['', Validators.required]
    });
  }
  // IntializeDropDownSettings(): void {
  //   this.taskGroupFormDropdownSettings = {
  //     singleSelection: false,
  //     idField: 'UserID',
  //     textField: 'UserName',
  //     // selectAllText: 'Select All',
  //     // unSelectAllText: 'UnSelect All',
  //     enableCheckAll: false,
  //     closeDropDownOnSelection: true,
  //     itemsShowLimit: 3,
  //     allowSearchFilter: true
  //   };
  //   this.taskSubGroupFormDropdownSettings = {
  //     singleSelection: false,
  //     idField: 'UserID',
  //     textField: 'UserName',
  //     // selectAllText: 'Select All',
  //     // unSelectAllText: 'UnSelect All',
  //     enableCheckAll: false,
  //     closeDropDownOnSelection: true,
  //     itemsShowLimit: 3,
  //     allowSearchFilter: true
  //   };
  // }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ResetControl(): void {
    this.SelectedTaskGroup = new TaskGroup();
    this.SelectedTaskSubGroup = new TaskSubGroup();
    this.selectID = 0;
    this.taskGroupMainFormGroup.reset();
    Object.keys(this.taskGroupMainFormGroup.controls).forEach(key => {
      this.taskGroupMainFormGroup.get(key).markAsUntouched();

    });
    this.ClearTaskSubGroupMainFormGroup();
    this.AllTaskSubGroups = [];
    // this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
    this.ResetSprints();
    this.ResetSprintsControl();
  }

  GetAllOwners(): void {
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        // this.AllOwners = <Owner[]>data;
        // this.AllOwners = JSON.parse(data.toString());
        this.AllOwners = <UserWithRole[]>data;
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
          this.LoadSelectedTaskGroup(this.AllTaskGroups[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  LoadSelectedTaskGroup(selectedTaskGroup: TaskGroup): void {
    this.selectID = selectedTaskGroup.TaskGroupID;
    this.SelectedTaskGroup = selectedTaskGroup;
    // if (this.selectID) {
    //   this.isDeveloper = true;
    // }
    // else{
    //   this.isDeveloper = false;
    // }
    this.GetAllTaskSubGroupsBasedTaskGroup(selectedTaskGroup.TaskGroupID);
    this.SetTaskGroupValues();
    this.SelectedTaskSubGroup = new TaskSubGroup();
    this.ClearTaskSubGroupMainFormGroup();
  }

  SetTaskGroupValues(): void {
    // this.taskGroupMainFormGroup.get('TaskGroupID').patchValue(this.SelectedTaskGroup.TaskGroupID);
    // this.taskGroupMainFormGroup.get('plant').patchValue(this.SelectedTaskGroup.Plant);
    this.taskGroupMainFormGroup.get('OwnerIDList').patchValue(this.SelectedTaskGroup.OwnerIDList);
    // this.SelectedTaskGroup.OwnerIDList.forEach(y => {
    //   this.AllOwners.forEach(x => {
    //     if (x.UserID === y) {
    //       this.TaskGroupSelectedOwners.push(x);
    //     }
    //   });
    // });
    this.taskGroupMainFormGroup.get('Title').patchValue(this.SelectedTaskGroup.Title);
    this.taskGroupMainFormGroup.get('ProjectID').patchValue(this.SelectedTaskGroup.ProjectID);
    this.taskGroupMainFormGroup.get('PlannedStartDate').patchValue(this.SelectedTaskGroup.PlannedStartDate);
    this.taskGroupMainFormGroup.get('PlannedEndDate').patchValue(this.SelectedTaskGroup.PlannedEndDate);
    this.taskGroupMainFormGroup.get('PlannedEffort').patchValue(this.SelectedTaskGroup.PlannedEffort);
    this.taskGroupMainFormGroup.get('ActualStartDate').patchValue(this.SelectedTaskGroup.ActualStartDate);
    this.taskGroupMainFormGroup.get('ActualEndDate').patchValue(this.SelectedTaskGroup.ActualEndDate);
    this.taskGroupMainFormGroup.get('ActualEffort').patchValue(this.SelectedTaskGroup.ActualEffort);
  }

  GetAllTaskSubGroupsBasedTaskGroup(taskGroupID: number): void {
    this.IsProgressBarVisibile = true;
    this._taskGroupService.GetAllTaskSubGroupsBasedTaskGroup(taskGroupID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        // this.AllTaskSubGroups = <TaskSubGroup[]>data;
        this.AllTaskSubGroups = JSON.parse(data.toString());
        this.AllTaskSubGroupsCount = this.AllTaskSubGroups.length;
        console.log(this.AllTaskSubGroups);
        // if (this.AllTaskSubGroups && this.AllTaskSubGroups.length) {
        //   this.AllTaskSubGroups  = this.AllTaskSubGroups.filter(
        //     x => x.OwnerMaster.OwnerName
        // );
        // this.AllOwners = this.AllOwners.filter(x => x.OwnerIDList = this.SelectedTaskSubGroup.OwnerID);
        // Loops through AllTaskSubGroups
        this.AllTaskSubGroups.forEach(x => {
          x.OwnerName = this.GetOwnerNameByOwnerIDList(x.OwnerIDList);
        });
        // this.AllOwners = this.AllOwners.filter(x => x.OwnerID = this.SelectedTaskSubGroup.OwnerID);
        // this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
        // // console.log(this.AllTaskSubGroups);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        // }

        if (this.AllTaskSubGroups && this.AllTaskSubGroups.length) {
          this.ClearFormArray(this.SprintFormArray);
          this.AllTaskSubGroups.forEach((x, i) => {
            this.InsertSprintsFormGroup(x);
          });
        } else {
          this.ResetSprints();
        }
        // this.SprintFormGroup.disable();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  ResetSprintsControl(): void {
    this.SprintFormGroup.reset();
    Object.keys(this.SprintFormGroup.controls).forEach(key => {
      this.SprintFormGroup.get(key).markAsUntouched();
    });
    this.ResetSprints();
  }

  ResetSprints(): void {
    this.ClearFormArray(this.SprintFormArray);
    this.SprintDataSource.next(this.SprintFormArray.controls);
  }

  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  GetOwnerNameByOwnerIDList(OwnerIDList: Guid[]): any {
    let ownerNameString: any = '';
    OwnerIDList.forEach(y => {
      this.AllOwners.forEach(x => {
        if (x.UserID === y) {
          ownerNameString = ownerNameString + ',' + x.UserName;
        }
      });
    });
    return ownerNameString.substring(1);
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

  AddTaskSubGroupToTable(): void {
    if (this.taskSubGroupMainFormGroup.valid) {
      const taskSubGroup = this.GetTaskSubGroupValues();
      if (taskSubGroup) {
        this.AddTaskSubGroupByProjectID(taskSubGroup);
      }

      // tslint:disable-next-line:max-line-length
      // this.AllTaskSubGroups.forEach(x => {
      //   this.TotalSubGroupActualEffort = this.TotalSubGroupActualEffort + x.ActualEffort;
      // });
      // if ((taskSubGroup.ActualEffort && this.SelectedTaskGroup.ActualEffort && taskSubGroup.ActualEffort - this.TotalSubGroupActualEffort >= this.SelectedTaskGroup.ActualEffort)
      //   || (taskSubGroup.PlannedEffort && this.SelectedTaskGroup.PlannedEffort && taskSubGroup.PlannedEffort >= this.SelectedTaskGroup.PlannedEffort)) {
      //   this.notificationSnackBarComponent.openSnackBar('Sprinter Actual or Planned effort cannot be more than Task Group ', SnackBarStatus.danger);
      // }
      // else {
      // const input = new Input();
      // input.Field = this.inputFormGroup.get('Field').value;
      // input.Validation = this.inputFormGroup.get('Validation').value;
      // input.Remarks = this.inputFormGroup.get('Remarks').value;
      if (!this.AllTaskSubGroups || !this.AllTaskSubGroups.length) {
        this.AllTaskSubGroups = [];
      }
      // this.InputsByTask.push(input);
      // this.InputdataSource = new MatTableDataSource(this.InputsByTask);
      this.LoadTaskSubGroupTable(taskSubGroup);
      this.ClearTaskSubGroupMainFormGroup();
      // }
    } else {
      this.ShowValidationErrors(this.taskSubGroupMainFormGroup);
    }
  }

  AddTaskSubGroupByProjectID(taskSubGroup: TaskSubGroup): void {
    // this.GetTaskGroupValues();
    // this.SelectedTaskGroup.ProjectID = this.taskGroupMainFormGroup.get('ProjectID').value;
    taskSubGroup.ProjectID = this.taskGroupMainFormGroup.get('ProjectID').value;
    taskSubGroup.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._taskGroupService.AddTaskSubGroupByProjectID(taskSubGroup).subscribe(
      (data) => {
        // console.log(data);
        // this.ResetControl();
        // this.notificationSnackBarComponent.openSnackBar('TaskGroup created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetAllTaskGroups();
      },
      (err) => {
        console.error(err);
        // this.ResetControl();
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  RemoveTaskSubGroupFromTable(): void {
    if (this.SprintFormGroup.enabled) {
      if (this.SprintFormArray.length > 0) {
        // const AttNames = this.SprintFormArray.controls[this.SprintFormArray.length - 1].get('AttachmentNames').value as string[];
        // this.fileToUploadList = this.fileToUploadList.filter((el) =>
        //   !AttNames.includes(el.name)
        // );
        // AttNames.forEach(x => {
        //   const indexx = this.fileToUploadList.map(y => y.name).indexOf(x);
        //   this.fileToUploadList.splice(indexx, 1);
        // });
        this.SprintFormArray.removeAt(this.SprintFormArray.length - 1);
        this.SprintDataSource.next(this.SprintFormArray.controls);
      } else {
        this.notificationSnackBarComponent.openSnackBar('no items to delete', SnackBarStatus.warning);
      }
    }
  }

  GetTaskSubGroupValues(): TaskSubGroup {
    const taskSubGroup = new TaskSubGroup();
    taskSubGroup.Title = this.taskSubGroupMainFormGroup.get('Title').value;
    // taskSubGroup.OwnerIDList = this.TaskSubGroupSelectedOwnerIDList;

    // this.AllOwners = this.AllOwners.filter(x => x.UserID = taskSubGroup.);
    // if (this.AllOwners.length > 0) {
    //   taskSubGroup.OwnerName = this.AllOwners[0].UserName;
    // }

    taskSubGroup.OwnerIDList = this.taskSubGroupMainFormGroup.get('OwnerIDList').value;
    // this.TaskSubGroupSelectedOwners.forEach(x => {
    //   const UserID = x.UserID;
    //   // this.TaskSubGroupSelectedOwnerIDList.push(UserID);
    //   taskSubGroup.OwnerName = taskSubGroup.OwnerName + ',' + x.UserName;
    // });
    taskSubGroup.OwnerName = this.GetOwnerNameByOwnerIDList(taskSubGroup.OwnerIDList);
    // taskSubGroup.Plant = this.taskSubGroupMainFormGroup.get('plant').value;
    // taskSubGroup.OwnerID = <Guid>this.taskSubGroupMainFormGroup.get('OwnerID').value;
    // taskSubGroup.TaskSubGroupID = this.taskSubGroupMainFormGroup.get('TaskSubGroupID').value;
    taskSubGroup.PlannedStartDate = this.taskSubGroupMainFormGroup.get('PlannedStartDate').value;
    taskSubGroup.PlannedEndDate = this.taskSubGroupMainFormGroup.get('PlannedEndDate').value;
    taskSubGroup.PlannedEffort = this.taskSubGroupMainFormGroup.get('PlannedEffort').value;
    // taskSubGroup.ActualEffort = this.taskSubGroupMainFormGroup.get('ActualEffort').value;
    // taskSubGroup.ActualEndDate = this.taskSubGroupMainFormGroup.get('ActualEndDate').value;
    // taskSubGroup.ActualStartDate = this.taskSubGroupMainFormGroup.get('ActualStartDate').value;

    return taskSubGroup;
  }

  LoadTaskSubGroupTable(taskSubGroup: TaskSubGroup): void {
    // this.AllTaskSubGroups = [];
    this.AllTaskSubGroups.push(taskSubGroup);
    this.InsertSprintsFormGroup(taskSubGroup);
    // if (this.AllTaskSubGroups.length > 0) {
    //   this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
    //   // console.log(this.AllTaskSubGroups);
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }
  }

  InsertSprintsFormGroup(sprintItem: TaskSubGroup): void {
    const row = this._formBuilder.group({
      Title: [sprintItem.Title, Validators.required],
      Owner: [sprintItem.OwnerName, Validators.required],
      PlannedStartDate: [sprintItem.PlannedStartDate, Validators.required],
      PlannedEndDate: [sprintItem.PlannedEndDate, Validators.required],
      PlannedEffort: [sprintItem.PlannedEffort, Validators.required],
      ActualStartDate: [sprintItem.ActualStartDate],
      ActualEndDate: [sprintItem.ActualEndDate],
      ActualEffort: [sprintItem.ActualEffort],
      Action: [sprintItem.Action],
    });
    row.disable();
    row.get('Action').enable();
    row.get('ActualStartDate').enable();
    row.get('ActualEndDate').enable();
    row.get('ActualEffort').enable();
    this.SprintFormArray.push(row);
    this.SprintDataSource.next(this.SprintFormArray.controls);
    // return row;
  }

  SetTaskSubGroupValues(): void {
    // this.taskSubGroupMainFormGroup.get('TaskSubGroupID').patchValue(this.SelectedTaskSubGroup.TaskSubGroupID);
    // this.taskSubGroupMainFormGroup.get('plant').patchValue(this.SelectedTaskSubGroup.Plant);
    this.taskSubGroupMainFormGroup.get('OwnerIDList').patchValue(this.SelectedTaskSubGroup.OwnerIDList);
    this.taskSubGroupMainFormGroup.get('Title').patchValue(this.SelectedTaskSubGroup.Title);
    // this.taskSubGroupMainFormGroup.get('ProjectID').patchValue(this.SelectedTaskSubGroup.ProjectID);
    this.taskSubGroupMainFormGroup.get('PlannedStartDate').patchValue(this.SelectedTaskSubGroup.PlannedStartDate);
    this.taskSubGroupMainFormGroup.get('PlannedEndDate').patchValue(this.SelectedTaskSubGroup.PlannedEndDate);
    this.taskSubGroupMainFormGroup.get('PlannedEffort').patchValue(this.SelectedTaskSubGroup.PlannedEffort);
    // this.taskSubGroupMainFormGroup.get('ActualStartDate').patchValue(this.SelectedTaskSubGroup.ActualStartDate);
    // this.taskSubGroupMainFormGroup.get('ActualEndDate').patchValue(this.SelectedTaskSubGroup.ActualEndDate);
    // this.taskSubGroupMainFormGroup.get('ActualEffort').patchValue(this.SelectedTaskSubGroup.ActualEffort);
  }

  ClearTaskSubGroupMainFormGroup(): void {
    this.taskSubGroupMainFormGroup.reset();
    Object.keys(this.taskSubGroupMainFormGroup.controls).forEach(key => {
      this.taskSubGroupMainFormGroup.get(key).markAsUntouched();
    });
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
          if (Actiontype === 'Save') {
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
    this.SelectedTaskGroup.OwnerIDList = <Guid[]>this.taskGroupMainFormGroup.get('OwnerIDList').value;
    this.SelectedTaskGroup.ProjectID = this.taskGroupMainFormGroup.get('ProjectID').value;
    this.SelectedTaskGroup.PlannedStartDate = this.taskGroupMainFormGroup.get('PlannedStartDate').value;
    this.SelectedTaskGroup.PlannedEndDate = this.taskGroupMainFormGroup.get('PlannedEndDate').value;
    this.SelectedTaskGroup.PlannedEffort = this.taskGroupMainFormGroup.get('PlannedEffort').value;
    this.SelectedTaskGroup.ActualEffort = this.taskGroupMainFormGroup.get('ActualEffort').value;
    this.SelectedTaskGroup.ActualEndDate = this.taskGroupMainFormGroup.get('ActualEndDate').value;
    this.SelectedTaskGroup.ActualStartDate = this.taskGroupMainFormGroup.get('ActualStartDate').value;
  }

  TaskSubGroupOnOwnerNameChanged(): void {

  }

  TaskGroupOnOwnerNameChanged(): void {

  }

  GetTaskSubGroupValuesFromTable(): void {
    this.AllTaskSubGroups = [];
    const SprintFormArray = this.SprintFormGroup.get('Sprints') as FormArray;
    SprintFormArray.controls.forEach((x, i) => {
      const taskSubGroup: TaskSubGroup = new TaskSubGroup();
      taskSubGroup.Title = x.get('Title').value;
      const OwnerNames = x.get('Owner').value;
      const OwnerNameList = OwnerNames.split(',');
      taskSubGroup.OwnerIDList = this.GetOwnerIDByOwnerNames(OwnerNameList);
      // taskSubGroup.OwnerIDList = x.get('Owner').value;
      taskSubGroup.PlannedEffort = x.get('PlannedEffort').value;
      taskSubGroup.PlannedStartDate = x.get('PlannedStartDate').value;
      taskSubGroup.PlannedEndDate = x.get('PlannedEndDate').value;
      taskSubGroup.ActualEffort = x.get('ActualEffort').value;
      taskSubGroup.ActualStartDate = x.get('ActualStartDate').value;
      taskSubGroup.ActualEndDate = x.get('ActualEndDate').value;
      taskSubGroup.Action = x.get('Action').value;
      // taskSubGroup.NumberOfAttachments = x.get('NumberOfAttachments').value ? x.get('NumberOfAttachments').value : 0;
      // if (this.SelectedRFQStatus.toLocaleLowerCase() === 'open') {
      //   const selectedItem = this.PurchaseRequestionItems.filter(y => y.ItemID === taskSubGroup.ItemID)[0];
      //   if (selectedItem) {
      //     taskSubGroup.DelayDays = selectedItem.DelayDays;
      //     taskSubGroup.SupplierPartNumber = selectedItem.SupplierPartNumber;
      //     taskSubGroup.SelfLifeDays = selectedItem.SelfLifeDays;
      //   }
      // } else {
      //   const selectedItem = this.RFQ.RFQItems.filter(y => y.ItemID === taskSubGroup.ItemID)[0];
      //   if (selectedItem) {
      //     taskSubGroup.DelayDays = selectedItem.DelayDays;
      //     taskSubGroup.SupplierPartNumber = selectedItem.SupplierPartNumber;
      //     taskSubGroup.SelfLifeDays = selectedItem.SelfLifeDays;
      //   }
      // }
      this.AllTaskSubGroups.push(taskSubGroup);
    });
  }

  GetOwnerIDByOwnerNames(OwnerNamesList: string[]): any {
    // Loop through Owners and Get Owner ID List
    const OwnerIDList: Guid[] = [];
    this.AllOwners.forEach(x => {
      OwnerNamesList.forEach(y => {
        if (y !== ',' && y !== '') {
          if (y === x.UserName) {
            OwnerIDList.push(x.UserID);
          }
        }
      });
    });
    return OwnerIDList;
  }

  CreateTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.CreatedBy = this.authenticationDetails.userID.toString();
    this.GetTaskSubGroupValuesFromTable();
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
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.ModifiedBy = this.authenticationDetails.userID.toString();
    this.GetTaskSubGroupValuesFromTable();
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
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteTaskGroup(): void {
    this.GetTaskGroupValues();
    this.SelectedTaskGroup.ModifiedBy = this.authenticationDetails.userID.toString();
    this.GetTaskSubGroupValuesFromTable();
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
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  // ShowValidationErrors(): void {
  //   Object.keys(this.taskGroupMainFormGroup.controls).forEach(key => {
  //     this.taskGroupMainFormGroup.get(key).markAsTouched();
  //     this.taskGroupMainFormGroup.get(key).markAsDirty();
  //   });

  // }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
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
        const Actiontype = 'Save';
        const Catagory = 'TaskGroup';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors(this.taskGroupMainFormGroup);
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
      this.ShowValidationErrors(this.taskGroupMainFormGroup);
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

  onProjectClick(selectedProjectTitle: string): void {
    console.log(selectedProjectTitle);
    if (selectedProjectTitle) {
      if (selectedProjectTitle === 'Customer') {
        // this.isCustomer = true;
      } else {
        // this.isCustomer = false;
      }
    }
  }

  onProjectChange(): void {

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): any {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  RemoveSelectedRows(): void {
    this.selection.selected.forEach(item => {
      const index: number = this.AllTaskSubGroups.findIndex(d => d === item);
      console.log(this.AllTaskSubGroups.findIndex(d => d === item));
      this.AllTaskSubGroups.splice(index, 1);
      this.dataSource = new MatTableDataSource<TaskSubGroup>(this.AllTaskSubGroups);
    });
    this.selection = new SelectionModel<Element>(true, []);
  }

  RemoveTaskSubGroupFromTable1(row: TaskSubGroup): void {
    //  this.AllTaskSubGroups.forEach(item => {
    //   const index: number = this.AllTaskSubGroups.findIndex(d => d.TaskSubGroupID === item.TaskSubGroupID);
    //   // console.log(this.AllTaskSubGroups.findIndex(d => d === item));
    //   this.AllTaskSubGroups.splice(index, 1);
    //   this.dataSource = new MatTableDataSource<TaskSubGroup>(this.AllTaskSubGroups);
    // });
    this.AllTaskSubGroups = this.AllTaskSubGroups.filter(({ TaskSubGroupID }) => TaskSubGroupID !== row.TaskSubGroupID);
    // this.selection = new SelectionModel<Element>(true, []);
    this.dataSource = new MatTableDataSource<TaskSubGroup>(this.AllTaskSubGroups);

    // const index: number = this.AllTaskSubGroups.indexOf(row);
    // if (index > -1) {
    //   this.AllTaskSubGroups.splice(index, 1);
    // }
    // this.dataSource = new MatTableDataSource(this.AllTaskSubGroups);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
