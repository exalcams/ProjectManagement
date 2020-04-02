import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MenuApp, AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { Task, TaskView, Input, Output, Logic, Validation } from 'app/models/task';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ProjectService } from 'app/services/project.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TaskComponent implements OnInit {
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  taskFormGroup: FormGroup;
  inputFormGroup: FormGroup;
  outputFormGroup: FormGroup;
  logicFormGroup: FormGroup;
  validationFormGroup: FormGroup;
  searchText = '';
  AllTasks: Task[] = [];
  selectID: number;
  SelectedTask: Task;
  SelectedTaskView: TaskView;
  InputsByTask: Input[] = [];
  OutputsByTask: Output[] = [];
  LogicsByTask: Logic[] = [];
  ValidationsByTask: Validation[] = [];
  inputdisplayedColumns: string[] = [
    'Field',
    'Validation',
    'Remarks'
  ];
  outputdisplayedColumns: string[] = [
    'Level',
    'Field',
    'Validation',
    'Remarks'
  ];
  logicdisplayedColumns: string[] = [
    'LogicText'
  ];
  validationdisplayedColumns: string[] = [
    'ValidationText'
  ];
  sketchdisplayedColumns: string[] = [
    'Text'
  ];
  InputdataSource = new MatTableDataSource<any>();
  OutputdataSource = new MatTableDataSource<any>();
  LogicdataSource = new MatTableDataSource<any>();
  ValidationdataSource = new MatTableDataSource<any>();
  sketchdataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _masterService: MasterService,
    private _projectService: ProjectService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    this.SelectedTask = new Task();
    this.SelectedTaskView = new TaskView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('User') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeTaskFormGroup();
      this.InitializeInputFormGroup();
      this.InitializeOutputFormGroup();
      this.InitializeLogicFormGroup();
      this.InitializeValidationFormGroup();
      this.GetAllTasks();
    } else {
      this._router.navigate(['/auth/login']);
    }
    const allInvoiceDetails = [
      { Field: '', Validation: '', Remarks: '' },
      { Field: '', Validation: '', Remarks: '' },
      { Field: '', Validation: '', Remarks: '' }
    ];
    const allOutputDetails = [
      { Level: '', Field: '', Validation: '', Remarks: '' },
      { Level: '', Field: '', Validation: '', Remarks: '' },
      { Level: '', Field: '', Validation: '', Remarks: '' }
    ];
    const allLogicDetails = [
      { LogicText: '' },
      { LogicText: '' },
      { LogicText: '' },
    ];
    const allValidationDetails = [
      { ValidationText: '' },
      { ValidationText: '' },
      { ValidationText: '' },
    ];
    const allSketchDetails = [
      { Text: '' },
      { Text: '' },
      { Text: '' },
    ];

    this.InputdataSource = new MatTableDataSource(
      allInvoiceDetails
    );
    this.OutputdataSource = new MatTableDataSource(
      allOutputDetails
    );
    this.LogicdataSource = new MatTableDataSource(
      allLogicDetails
    );
    this.ValidationdataSource = new MatTableDataSource(
      allValidationDetails
    );
    this.sketchdataSource = new MatTableDataSource(
      allSketchDetails
    );
  }

  InitializeTaskFormGroup(): void {
    this.taskFormGroup = this._formBuilder.group({
      Title: ['', Validators.required],
      Type: ['', Validators.required],
      EstimatedEffort: ['', Validators.required],
      CompletionBefore: ['', Validators.required],
      AssignedTo: ['', Validators.required],
      AcceptedEffort: ['', Validators.required],
      AcceptedCompletionDate: ['', Validators.required]
    });
  }

  InitializeInputFormGroup(): void {
    this.inputFormGroup = this._formBuilder.group({
      Field: ['', Validators.required],
      Validation: ['', Validators.required],
      Remarks: ['', Validators.required],
    });
  }

  InitializeOutputFormGroup(): void {
    this.outputFormGroup = this._formBuilder.group({
      Level: ['', Validators.required],
      Field: ['', Validators.required],
      Validation: ['', Validators.required],
      Remarks: ['', Validators.required],
    });
  }

  InitializeLogicFormGroup(): void {
    this.logicFormGroup = this._formBuilder.group({
      LogicText: ['', Validators.required],
    });
  }

  InitializeValidationFormGroup(): void {
    this.validationFormGroup = this._formBuilder.group({
      ValidationText: ['', Validators.required],
    });
  }

  ResetControl(): void {
    this.SelectedTask = new Task();
    this.SelectedTaskView = new TaskView();
    this.selectID = 0;
    this.taskFormGroup.reset();
    Object.keys(this.taskFormGroup.controls).forEach(key => {
      this.taskFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  GetAllTasks(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetAllTasks().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllTasks = <Task[]>data;
        if (this.AllTasks && this.AllTasks.length) {
          this.loadSelectedTask(this.AllTasks[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  loadSelectedTask(selectedTask: Task): void {
    this.SelectedTask = selectedTask;
    this.selectID = selectedTask.TaskID;
    this.SetTaskValues();
    this.GetTaskSubItems();
  }

  applyFilter(filterValue: string): void {
    this.InputdataSource.filter = filterValue.trim().toLowerCase();
  }


  SetTaskValues(): void {
    this.taskFormGroup.get('Title').patchValue(this.SelectedTask.Title);
    this.taskFormGroup.get('Type').patchValue(this.SelectedTask.Type);
    this.taskFormGroup.get('EstimatedEffort').patchValue(this.SelectedTask.EstimatedEffort);
    this.taskFormGroup.get('CompletionBefore').patchValue(this.SelectedTask.CompletionBefore);
    this.taskFormGroup.get('contactNumber').patchValue(this.SelectedTask.AssignedTo);
    this.taskFormGroup.get('AcceptedEffort').patchValue(this.SelectedTask.AcceptedEffort);
    this.taskFormGroup.get('AcceptedCompletionDate').patchValue(this.SelectedTask.AcceptedCompletionDate);
  }

  GetTaskSubItems(): void {
    this.GetInputsByTask();
    this.GetOutputsByTask();
    this.GetLogicsByTask();
    this.GetValidationsByTask();
  }

  GetInputsByTask(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetInputsByTask(this.SelectedTask.TaskID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.InputsByTask = data as Input[];
        this.InputdataSource = new MatTableDataSource(this.InputsByTask);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetOutputsByTask(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetOutputsByTask(this.SelectedTask.TaskID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.OutputsByTask = data as Output[];
        this.OutputdataSource = new MatTableDataSource(this.OutputsByTask);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetLogicsByTask(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetLogicsByTask(this.SelectedTask.TaskID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.LogicsByTask = data as Logic[];
        this.LogicdataSource = new MatTableDataSource(this.LogicsByTask);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetValidationsByTask(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetValidationsByTask(this.SelectedTask.TaskID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.ValidationsByTask = data as Validation[];
        this.ValidationdataSource = new MatTableDataSource(this.ValidationsByTask);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  AddInputToTable(): void {
    const input = new Input();
    input.Field = this.inputFormGroup.get('Field').value;
    input.Validation = this.inputFormGroup.get('Validation').value;
    input.Remarks = this.inputFormGroup.get('Remarks').value;
    if (!this.InputsByTask || !this.InputsByTask.length) {
      this.InputsByTask = [];
    }
    this.InputsByTask.push(input);
    this.InputdataSource = new MatTableDataSource(this.InputsByTask);
  }

  AddOutputToTable(): void {
    const output = new Output();
    output.Level = this.outputFormGroup.get('Level').value;
    output.Field = this.outputFormGroup.get('Field').value;
    output.Validation = this.outputFormGroup.get('Validation').value;
    output.Remarks = this.outputFormGroup.get('Remarks').value;
    if (!this.OutputsByTask || !this.OutputsByTask.length) {
      this.OutputsByTask = [];
    }
    this.OutputsByTask.push(output);
    this.OutputdataSource = new MatTableDataSource(this.OutputsByTask);
  }

  AddLogicToTable(): void {
    const logic = new Logic();
    logic.LogicText = this.logicFormGroup.get('LogicText').value;
    if (!this.LogicsByTask || !this.LogicsByTask.length) {
      this.LogicsByTask = [];
    }
    this.LogicsByTask.push(logic);
    this.LogicdataSource = new MatTableDataSource(this.LogicsByTask);
  }

  AddValidationToTable(): void {
    const validation = new Validation();
    validation.ValidationText = this.validationFormGroup.get('ValidationText').value;
    if (!this.ValidationsByTask || !this.ValidationsByTask.length) {
      this.ValidationsByTask = [];
    }
    this.ValidationsByTask.push(validation);
    this.ValidationdataSource = new MatTableDataSource(this.ValidationsByTask);
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
            this.CreateTask();
          } else if (Actiontype === 'Update') {
            this.UpdateTask();
          } else if (Actiontype === 'Delete') {
            this.DeleteTask();
          }
        }
      });
  }

  GetTaskValues(): void {
    this.SelectedTask.Title = this.SelectedTaskView.Title = this.taskFormGroup.get('Title').value;
    this.SelectedTask.Type = this.SelectedTaskView.Type = this.taskFormGroup.get('Type').value;
    this.SelectedTask.CompletionBefore = this.SelectedTaskView.CompletionBefore = this.taskFormGroup.get('CompletionBefore').value;
    this.SelectedTask.AssignedTo = this.SelectedTaskView.AssignedTo = this.taskFormGroup.get('AssignedTo').value;
    this.SelectedTask.AcceptedEffort = this.SelectedTaskView.AcceptedEffort = this.taskFormGroup.get('AcceptedEffort').value;
    this.SelectedTask.AcceptedCompletionDate = this.SelectedTaskView.AcceptedCompletionDate = this.taskFormGroup.get('AcceptedCompletionDate').value;
  }

  GetTaskSubItemValues(): void {
    this.GetInputValues();
    this.GetOutputValues();
    this.GetLogicValues();
    this.GetValidationValues();
  }

  GetInputValues(): void {
    this.SelectedTaskView.Inputs = [];
    // this.SelectedTaskView.Inputs.push(...this.InputsByTask);
    this.InputsByTask.forEach(x => {
      this.SelectedTaskView.Inputs.push(x);
    });
  }

  GetOutputValues(): void {
    this.SelectedTaskView.Outputs = [];
    // this.SelectedTaskView.Outputs.push(...this.OutputsByTask);
    this.OutputsByTask.forEach(x => {
      this.SelectedTaskView.Outputs.push(x);
    });
  }

  GetLogicValues(): void {
    this.SelectedTaskView.Logics = [];
    // this.SelectedTaskView.Logics.push(...this.LogicsByTask);
    this.LogicsByTask.forEach(x => {
      this.SelectedTaskView.Logics.push(x);
    });
  }

  GetValidationValues(): void {
    this.SelectedTaskView.Validations = [];
    // this.SelectedTaskView.Validations.push(...this.ValidationsByTask);
    this.ValidationsByTask.forEach(x => {
      this.SelectedTaskView.Validations.push(x);
    });
  }

  CreateTask(): void {
    this.GetTaskValues();
    this.GetTaskSubItemValues();
    this.SelectedTask.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.CreateTask(this.SelectedTaskView).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTasks();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateTask(): void {
    this.GetTaskValues();
    this.SelectedTask.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.UpdateTask(this.SelectedTaskView).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTasks();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteTask(): void {
    this.GetTaskValues();
    this.SelectedTask.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.DeleteTask(this.SelectedTask).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTasks();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.taskFormGroup.controls).forEach(key => {
      this.taskFormGroup.get(key).markAsTouched();
      this.taskFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.taskFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedTask.TaskID) {
        const Actiontype = 'Update';
        const Catagory = 'Task';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Task';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.taskFormGroup.valid) {
      if (this.SelectedTask.TaskID) {
        const Actiontype = 'Delete';
        const Catagory = 'Task';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

}
