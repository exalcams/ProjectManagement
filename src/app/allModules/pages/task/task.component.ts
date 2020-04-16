import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MenuApp, AuthenticationDetails, UserView } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { Task, TaskView, Input, Output, Logic, Validation, TaskSubGroupView, SketchView, AttachmentDetails, AcceptTaskView, TaskLog } from 'app/models/task';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ProjectService } from 'app/services/project.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Guid } from 'guid-typescript';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { SelectSprintDialogComponent } from '../select-sprint-dialog/select-sprint-dialog.component';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShareParameterService } from 'app/services/share-parameters.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TaskComponent implements OnInit {
  fuseConfig: any;
  // Private
  private _unsubscribeAll: Subject<any>;
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  taskFormGroup: FormGroup;
  inputFormGroup: FormGroup;
  outputFormGroup: FormGroup;
  logicFormGroup: FormGroup;
  validationFormGroup: FormGroup;
  acceptTaskFormGroup: FormGroup;
  SelectedAcceptTask: AcceptTaskView;
  searchText = '';
  AllTaskSubGroupView: TaskSubGroupView[] = [];
  AllTasks: Task[] = [];
  AllTaskLogs: TaskLog[] = [];
  selectID: number;
  SelectedTask: Task;
  SelectedTaskView: TaskView;
  InputsByTask: Input[] = [];
  OutputsByTask: Output[] = [];
  LogicsByTask: Logic[] = [];
  ValidationsByTask: Validation[] = [];
  SketchViewsByTask: SketchView[] = [];
  InputdisplayedColumns: string[] = [
    'Field',
    'Validation',
    'Remarks',
    'Action'
  ];
  OutputdisplayedColumns: string[] = [
    'Level',
    'Field',
    'Validation',
    'Remarks',
    'Action'
  ];
  LogicdisplayedColumns: string[] = [
    'LogicText',
    'Action'
  ];
  ValidationdisplayedColumns: string[] = [
    'ValidationText',
    'Action'
  ];
  sketchdisplayedColumns: string[] = [
    'Text'
  ];
  InputdataSource = new MatTableDataSource<Input>();
  OutputdataSource = new MatTableDataSource<Output>();
  LogicdataSource = new MatTableDataSource<Logic>();
  ValidationdataSource = new MatTableDataSource<Validation>();
  sketchdataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  AllDevelopersAndTLs: UserView[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('inputValidation') inputValidation: ElementRef;
  @ViewChild('inputRemarks') inputRemarks: ElementRef;
  @ViewChild('outputField') outputField: ElementRef;
  @ViewChild('outputValidation') outputValidation: ElementRef;
  @ViewChild('outputRemarks') outputRemarks: ElementRef;
  @ViewChild('logicText') logicText: ElementRef;
  @ViewChild('validationText') validationText: ElementRef;
  @ViewChild('fileInput1') fileInput1: ElementRef;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  math = Math;
  constructor(
    private _masterService: MasterService,
    private _projectService: ProjectService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _fuseSidebarService: FuseSidebarService,
    private _fuseConfigService: FuseConfigService,
    private _shareParameterService: ShareParameterService
  ) {
    this.SelectedTask = new Task();
    this.SelectedTaskView = new TaskView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Task') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeTaskFormGroup();
      this.InitializeInputFormGroup();
      this.InitializeOutputFormGroup();
      this.InitializeLogicFormGroup();
      this.InitializeValidationFormGroup();
      this.InitializeAcceptTaskFormGroup();
      this.GetAllDevelopersAndTLs();
      this.GetAllTaskSubGroupView();
      this.GetAllTask();
    } else {
      this._router.navigate(['/auth/login']);
    }
    const allSketchDetails = [
      { Text: '' },
      { Text: '' },
      { Text: '' },
    ];

    this.sketchdataSource = new MatTableDataSource(
      allSketchDetails
    );

    // Subscribe to config changes
    this._fuseConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.fuseConfig = config;
      });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  InitializeTaskFormGroup(): void {
    this.taskFormGroup = this._formBuilder.group({
      Title: ['', Validators.required],
      Type: ['', Validators.required],
      EstimatedEffort: ['', [Validators.required, Validators.pattern('^([0-9]*[1-9][0-9]*(\\.[0-9]+)?|[0]*\\.[0-9]*[1-9][0-9]*)$')]],
      CompletionBefore: ['', Validators.required],
      AssignedTo: [[], Validators.required],
      TaskSubGroupID: ['', Validators.required],
      AcceptedEffort: [''],
      AcceptedCompletionDate: ['']
    });
    // this.DynamicallyAddAcceptedValidation();
  }

  DynamicallyAddAcceptedValidation(): void {
    if (this.CurrentUserRole.toLocaleLowerCase() === 'developer') {
      this.taskFormGroup.get('AcceptedEffort').setValidators([Validators.required, Validators.pattern('^([0-9]*[1-9][0-9]*(\\.[0-9]+)?|[0]*\\.[0-9]*[1-9][0-9]*)$')]);
      this.taskFormGroup.get('AcceptedEffort').updateValueAndValidity();
      this.taskFormGroup.get('AcceptedCompletionDate').setValidators(Validators.required);
      this.taskFormGroup.get('AcceptedCompletionDate').updateValueAndValidity();
    } else {
      this.taskFormGroup.get('AcceptedEffort').clearValidators();
      this.taskFormGroup.get('AcceptedEffort').updateValueAndValidity();
      this.taskFormGroup.get('AcceptedCompletionDate').clearValidators();
      this.taskFormGroup.get('AcceptedCompletionDate').updateValueAndValidity();
    }
  }

  InitializeInputFormGroup(): void {
    this.inputFormGroup = this._formBuilder.group({
      Field: ['', Validators.required],
      Validation: ['', Validators.required],
      Remarks: [''],
    });
  }

  InitializeOutputFormGroup(): void {
    this.outputFormGroup = this._formBuilder.group({
      Level: ['', Validators.required],
      Field: ['', Validators.required],
      Validation: ['', Validators.required],
      Remarks: [''],
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

  InitializeAcceptTaskFormGroup(): void {
    this.acceptTaskFormGroup = this._formBuilder.group({
      AcceptedEffort: ['', Validators.required],
      AcceptedCompletionDate: ['', Validators.required],
      Remarks: ['', Validators.required]
    });
  }

  ResetControl(): void {
    this.SelectedTask = new Task();
    this.SelectedTaskView = new TaskView();
    this.SelectedAcceptTask = new AcceptTaskView();
    this.selectID = 0;
    this.taskFormGroup.reset();
    Object.keys(this.taskFormGroup.controls).forEach(key => {
      this.taskFormGroup.get(key).enable();
      this.taskFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
    this.ClearInputFormGroup();
    this.ClearOutputFormGroup();
    this.ClearLogicFormGroup();
    this.ClearValidationFormGroup();
    this.ClearInputDataSource();
    this.ClearOutputDataSource();
    this.ClearLogicDataSource();
    this.ClearValidationDataSource();
    this.ClearSketchFiles();
    this.ClearAcceptTaskedFormGroup();
  }

  ClearInputFormGroup(): void {
    this.inputFormGroup.reset();
    Object.keys(this.inputFormGroup.controls).forEach(key => {
      this.inputFormGroup.get(key).markAsUntouched();
    });
  }

  ClearInputDataSource(): void {
    this.InputsByTask = [];
    this.InputdataSource = new MatTableDataSource(this.InputsByTask);
  }

  ClearOutputFormGroup(): void {
    this.outputFormGroup.reset();
    Object.keys(this.outputFormGroup.controls).forEach(key => {
      this.outputFormGroup.get(key).markAsUntouched();
    });

  }

  ClearOutputDataSource(): void {
    this.OutputsByTask = [];
    this.OutputdataSource = new MatTableDataSource(this.OutputsByTask);
  }

  ClearLogicFormGroup(): void {
    this.logicFormGroup.reset();
    Object.keys(this.logicFormGroup.controls).forEach(key => {
      this.logicFormGroup.get(key).markAsUntouched();
    });
  }

  ClearLogicDataSource(): void {
    this.LogicsByTask = [];
    this.LogicdataSource = new MatTableDataSource(this.LogicsByTask);
  }

  ClearValidationFormGroup(): void {
    this.validationFormGroup.reset();
    Object.keys(this.validationFormGroup.controls).forEach(key => {
      this.validationFormGroup.get(key).markAsUntouched();
    });
  }

  ClearAcceptTaskedFormGroup(): void {
    this.acceptTaskFormGroup.reset();
    Object.keys(this.acceptTaskFormGroup.controls).forEach(key => {
      this.acceptTaskFormGroup.get(key).markAsUntouched();
    });
  }

  ClearValidationDataSource(): void {
    this.ValidationsByTask = [];
    this.ValidationdataSource = new MatTableDataSource(this.ValidationsByTask);
  }

  ClearSketchFiles(): void {
    this.SketchViewsByTask = [];
    this.fileToUploadList = [];
    this.fileToUpload = null;
  }

  // ClearFileList(): void {
  //   this.fileToUpload = null;
  //   this.fileToUploadList = [];
  // }

  GetAllDevelopersAndTLs(): void {
    this._masterService.GetAllDevelopersAndTLs().subscribe(
      (data) => {
        this.AllDevelopersAndTLs = <UserView[]>data;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllTaskSubGroupView(): void {
    this._projectService.GetAllTaskSubGroupView().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllTaskSubGroupView = <TaskSubGroupView[]>data;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllTask(): void {
    if (this.CurrentUserRole.toLocaleLowerCase() === 'developer') {
      this.GetAllTasksByDeveloper();
    }
    else if (this.CurrentUserRole.toLocaleLowerCase() === 'team lead') {
      this.GetAllTasksByTL();
    }
    else {
      this.GetAllTasks();
    }
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

  GetAllTasksByDeveloper(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetAllTasksByDeveloper(this.CurrentUserID).subscribe(
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

  GetAllTasksByTL(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetAllTasksByTL(this.CurrentUserID).subscribe(
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
    this.GetAllTaskLogsByTaskID(selectedTask.TaskID);
    this.ResetControl();
    this.SelectedTask = selectedTask;
    console.log(this.SelectedTask);
    this.selectID = selectedTask.TaskID;
    this.EnableAllTaskFields();
    this.SetTaskValues();
    this.GetTaskSubItems();
  }

  typeSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      this.SelectedTask.Type = event.value;
    }
  }

  applyFilter(filterValue: string): void {
    this.InputdataSource.filter = filterValue.trim().toLowerCase();
  }

  EnableAllTaskFields(): void {
    Object.keys(this.taskFormGroup.controls).forEach(key => {
      this.taskFormGroup.get(key).enable();
    });
  }

  SetTaskValues(): void {
    this.taskFormGroup.get('Title').patchValue(this.SelectedTask.Title);
    this.taskFormGroup.get('Type').patchValue(this.SelectedTask.Type);
    this.taskFormGroup.get('EstimatedEffort').patchValue(this.SelectedTask.EstimatedEffort);
    this.taskFormGroup.get('CompletionBefore').patchValue(this.SelectedTask.CompletionBefore);
    this.taskFormGroup.get('AssignedTo').patchValue(this.SelectedTask.AssignedTo);
    this.taskFormGroup.get('TaskSubGroupID').patchValue(this.SelectedTask.TaskSubGroupID);
    this.taskFormGroup.get('AcceptedEffort').patchValue(this.SelectedTask.AcceptedEffort);
    this.taskFormGroup.get('AcceptedCompletionDate').patchValue(this.SelectedTask.AcceptedCompletionDate);
    this.DisableTaskFields();
  }

  DisableTaskFields(): void {
    if (this.CurrentUserRole.toLocaleLowerCase() === 'developer') {
      this.DisableTaskFieldsForAssignedToUser();
    }
    else if (this.CurrentUserRole.toLocaleLowerCase() === 'team lead') {
      if (this.SelectedTask.CreatedBy !== this.CurrentUserID.toString()) {
        this.DisableTaskFieldsForAssignedToUser();
      } else {
        if (!this.SelectedTask.AssignedTo.includes(this.CurrentUserID)) {
          if (this.SelectedTask.AcceptedCompletionDate) {
            this.DisableAllTaskFields();
          } else {
            this.DisableTaskFieldsForCreatedUser();
          }
        }
      }
    }
  }

  DisableTaskFieldsForAssignedToUser(): void {
    this.taskFormGroup.get('Title').disable();
    this.taskFormGroup.get('Type').disable();
    this.taskFormGroup.get('EstimatedEffort').disable();
    this.taskFormGroup.get('CompletionBefore').disable();
    this.taskFormGroup.get('AssignedTo').disable();
    this.taskFormGroup.get('TaskSubGroupID').disable();
    this.taskFormGroup.get('AcceptedEffort').disable();
    this.taskFormGroup.get('AcceptedCompletionDate').disable();
  }

  DisableTaskFieldsForCreatedUser(): void {
    this.taskFormGroup.get('AcceptedEffort').disable();
    this.taskFormGroup.get('AcceptedCompletionDate').disable();
  }

  DisableAllTaskFields(): void {
    this.DisableTaskFieldsForAssignedToUser();
    this.DisableTaskFieldsForCreatedUser();
  }

  GetTaskSubItems(): void {
    this.GetInputsByTask();
    this.GetOutputsByTask();
    this.GetLogicsByTask();
    this.GetValidationsByTask();
    this.GetSketchViewsByTask();
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

  GetSketchViewsByTask(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetSketchViewsByTask(this.SelectedTask.TaskID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.fileToUploadList = [];
        this.SketchViewsByTask = data as SketchView[];
        this.SketchViewsByTask.forEach(x => {
          const fil: File = new File([], x.AttachmentName);
          // fil.size = x.Size;
          this.fileToUploadList.push(fil);
        });
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  AddInputToTable(): void {
    if (this.inputFormGroup.valid) {
      const input = new Input();
      input.Field = this.inputFormGroup.get('Field').value;
      input.Validation = this.inputFormGroup.get('Validation').value;
      input.Remarks = this.inputFormGroup.get('Remarks').value;
      if (!this.InputsByTask || !this.InputsByTask.length) {
        this.InputsByTask = [];
      }
      this.InputsByTask.push(input);
      this.InputdataSource = new MatTableDataSource(this.InputsByTask);
      this.ClearInputFormGroup();
    } else {
      this.ShowValidationErrors(this.inputFormGroup);
    }
  }

  AddOutputToTable(): void {
    if (this.outputFormGroup.valid) {
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
      this.ClearOutputFormGroup();
    } else {
      this.ShowValidationErrors(this.outputFormGroup);
    }
  }

  InputEnterKeyDown(): boolean {
    this.inputRemarks.nativeElement.blur();
    this.AddInputToTable();
    return true;
  }

  OutputEnterKeyDown(): boolean {
    this.outputRemarks.nativeElement.blur();
    this.AddOutputToTable();
    return true;
  }

  LogicEnterKeyDown(): boolean {
    this.logicText.nativeElement.blur();
    this.AddLogicToTable();
    return true;
  }

  ValidationEnterKeyDown(): boolean {
    this.validationText.nativeElement.blur();
    this.AddValidationToTable();
    return true;
  }

  keytab(elementName): void {
    // const element = event.srcElement.nextElementSibling; // get the sibling element
    // if (element) {
    //   (element as ElementRef).nativeElement.focus();
    // }
    // else {
    //   return;
    // }
    // ;
    switch (elementName) {
      case 'inputValidation': {
        this.inputValidation.nativeElement.focus();
        break;
      }
      case 'inputRemarks': {
        this.inputRemarks.nativeElement.focus();
        break;
      }
      case 'outputField': {
        this.outputField.nativeElement.focus();
        break;
      }
      case 'outputValidation': {
        this.outputValidation.nativeElement.focus();
        break;
      }
      case 'outputRemarks': {
        this.outputRemarks.nativeElement.focus();
        break;
      }
      default: {
        break;
      }
    }
  }

  AddLogicToTable(): void {
    if (this.logicFormGroup.valid) {
      const logic = new Logic();
      logic.LogicText = this.logicFormGroup.get('LogicText').value;
      if (!this.LogicsByTask || !this.LogicsByTask.length) {
        this.LogicsByTask = [];
      }
      this.LogicsByTask.push(logic);
      this.LogicdataSource = new MatTableDataSource(this.LogicsByTask);
      this.ClearLogicFormGroup();
    } else {
      this.ShowValidationErrors(this.logicFormGroup);
    }
  }

  AddValidationToTable(): void {
    if (this.validationFormGroup.valid) {
      const validation = new Validation();
      validation.ValidationText = this.validationFormGroup.get('ValidationText').value;
      if (!this.ValidationsByTask || !this.ValidationsByTask.length) {
        this.ValidationsByTask = [];
      }
      this.ValidationsByTask.push(validation);
      this.ValidationdataSource = new MatTableDataSource(this.ValidationsByTask);
      this.ClearValidationFormGroup();
    } else {
      this.ShowValidationErrors(this.validationFormGroup);
    }

  }

  RemoveInputFromTable(input: Input): void {
    const index: number = this.InputsByTask.indexOf(input);
    if (index > -1) {
      this.InputsByTask.splice(index, 1);
    }
    this.InputdataSource = new MatTableDataSource(this.InputsByTask);
  }

  RemoveOutputFromTable(output: Output): void {
    const index: number = this.OutputsByTask.indexOf(output);
    if (index > -1) {
      this.OutputsByTask.splice(index, 1);
    }
    this.OutputdataSource = new MatTableDataSource(this.OutputsByTask);
  }

  RemoveLogicFromTable(logic: Logic): void {
    const index: number = this.LogicsByTask.indexOf(logic);
    if (index > -1) {
      this.LogicsByTask.splice(index, 1);
    }
    this.LogicdataSource = new MatTableDataSource(this.LogicsByTask);
  }

  RemoveValidationFromTable(validation: Validation): void {
    const index: number = this.ValidationsByTask.indexOf(validation);
    if (index > -1) {
      this.ValidationsByTask.splice(index, 1);
    }
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
          if (Actiontype === 'Save') {
            this.CreateTask();
          } else if (Actiontype === 'Update') {
            this.UpdateTask();
          } else if (Actiontype === 'Delete') {
            this.DeleteTask();
          }
          else if (Actiontype === 'Accept') {
            this.AcceptTask();
          }
          else if (Actiontype === 'Complete') {
            this.CompleteTask();
          }
          else if (Actiontype === 'Reject') {
            this.RejectTask();
          }
        }
      });
  }

  GetTaskValues(): void {
    // if (this.taskFormGroup.valid) {
    this.SelectedTask.Title = this.SelectedTaskView.Title = this.taskFormGroup.get('Title').value;
    this.SelectedTask.Type = this.SelectedTaskView.Type = this.taskFormGroup.get('Type').value;
    this.SelectedTask.EstimatedEffort = this.SelectedTaskView.EstimatedEffort = this.taskFormGroup.get('EstimatedEffort').value;
    this.SelectedTask.CompletionBefore = this.SelectedTaskView.CompletionBefore = this.taskFormGroup.get('CompletionBefore').value;
    this.SelectedTask.AssignedTo = this.SelectedTaskView.AssignedTo = this.taskFormGroup.get('AssignedTo').value;
    this.SelectedTask.TaskSubGroupID = this.SelectedTaskView.TaskSubGroupID = this.taskFormGroup.get('TaskSubGroupID').value;
    this.SelectedTask.AcceptedEffort = this.SelectedTaskView.AcceptedEffort = this.taskFormGroup.get('AcceptedEffort').value;
    this.SelectedTask.AcceptedCompletionDate = this.SelectedTaskView.AcceptedCompletionDate = this.taskFormGroup.get('AcceptedCompletionDate').value;
    // }
    // else {
    //   this.ShowValidationErrors(this.taskFormGroup);
    // }
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
    // this.GetTaskValues();
    // this.GetTaskSubItemValues();
    this.SelectedTaskView.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.CreateTask(this.SelectedTaskView).subscribe(
      (data) => {
        this.SelectedTask.TaskID = +data;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this._projectService.AddTaskAttachment(this.SelectedTask.TaskID, this.CurrentUserID, this.fileToUploadList).subscribe(
            (dat) => {
              this.ResetControl();
              this.notificationSnackBarComponent.openSnackBar('Task created successfully', SnackBarStatus.success);
              this.IsProgressBarVisibile = false;
              this.GetAllTask();
            },
            (err) => {
              console.error(err);
              this.IsProgressBarVisibile = false;
              this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
          );
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar('Task created successfully', SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetAllTask();
        }
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateTask(): void {
    // this.GetTaskValues();
    // this.GetTaskSubItemValues();
    this.SelectedTaskView.TaskID = this.SelectedTask.TaskID;
    this.SelectedTaskView.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.UpdateTask(this.SelectedTaskView).subscribe(
      (data) => {
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this._projectService.AddTaskAttachment(this.SelectedTask.TaskID, this.CurrentUserID, this.fileToUploadList).subscribe(
            (dat) => {
              this.ResetControl();
              this.notificationSnackBarComponent.openSnackBar('Task updated successfully', SnackBarStatus.success);
              this.IsProgressBarVisibile = false;
              this.GetAllTask();
            },
            (err) => {
              console.error(err);
              this.IsProgressBarVisibile = false;
              this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
          );
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar('Task updated successfully', SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetAllTask();
        }
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
        this.GetAllTask();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    // if (this.taskFormGroup.valid) {
    // const file: File = this.fileToUpload;
    this.GetTaskValues();
    this.GetTaskSubItemValues();
    if (this.SelectedTask.Type.toLocaleLowerCase() === 'ui') {
      if (this.SelectedTaskView.Inputs && this.SelectedTaskView.Inputs.length &&
        this.SelectedTaskView.Inputs.length > 0) {
        this.SetActionToOpenConfirmation();
      } else {
        this.notificationSnackBarComponent.openSnackBar('Please add atleast one record for input table', SnackBarStatus.danger);
      }
    } else {
      this.SetActionToOpenConfirmation();
    }
    // } else {
    //   this.ShowValidationErrors(this.taskFormGroup);
    // }
  }

  SetActionToOpenConfirmation(): void {
    if (this.SelectedTask.TaskID) {
      const Actiontype = 'Update';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      const Actiontype = 'Save';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  DeleteClicked(): void {
    // if (this.taskFormGroup.valid) {
    if (this.SelectedTask.TaskID) {
      const Actiontype = 'Delete';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
    // } else {
    //   this.ShowValidationErrors(this.taskFormGroup);
    // }
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }

  GetAttachment(fileName: string, file?: File): void {
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._projectService.DowloandTaskImage(fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
            const blob = new Blob([data], { type: fileType });
            this.OpenAttachmentDialog(fileName, blob);
          }
          this.IsProgressBarVisibile = false;
        },
        error => {
          console.error(error);
          this.IsProgressBarVisibile = false;
        }
      );
    }
  }

  OpenAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  GetTaskGroupTitle(subTaskGroupID: number): string {
    const tas = this.AllTaskSubGroupView.find(x => x.TaskSubGroupID === subTaskGroupID);
    if (tas) {
      return tas.ProjectTitle + ' - ' + tas.TaskGroupTitle + ' - ' + tas.TaskSubGroupTitle;
    }
    return '';
  }

  AcceptTaskClicked(): void {
    if (this.acceptTaskFormGroup.valid) {
      const Actiontype = 'Accept';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors(this.acceptTaskFormGroup);
    }
  }

  GetAcceptTaskValues(): void {
    this.SelectedAcceptTask = new AcceptTaskView();
    this.SelectedAcceptTask.TaskID = this.SelectedTask.TaskID;
    this.SelectedAcceptTask.Title = this.SelectedTask.Title;
    this.SelectedAcceptTask.TaskSubGroupID = this.SelectedTask.TaskSubGroupID;
    this.SelectedAcceptTask.AcceptedEffort = this.acceptTaskFormGroup.get('AcceptedEffort').value;
    this.SelectedAcceptTask.AcceptedCompletionDate = this.acceptTaskFormGroup.get('AcceptedCompletionDate').value;
    this.SelectedAcceptTask.Remarks = this.acceptTaskFormGroup.get('Remarks').value;
  }

  AcceptTask(): void {
    this.GetAcceptTaskValues();
    this.SelectedAcceptTask.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.AcceptTask(this.SelectedAcceptTask).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task Accepted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTask();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  CompleteTaskClicked(): void {
    if (this.SelectedTask.TaskID) {
      const Actiontype = 'Complete';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  CompleteTask(): void {
    this.GetTaskValues();
    this.SelectedTask.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.CompleteTask(this.SelectedTask).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task completed successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTask();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  OpenSelectSprintDialog(): void {
    this.ResetControl();
    // const attachmentDetails: AttachmentDetails = {
    //   FileName: FileName,
    //   blob: blob
    // };
    const dialogConfig: MatDialogConfig = {
      data: 'SelectSprint',
      panelClass: 'select-sprint-dialog'
    };
    const dialogRef = this.dialog.open(SelectSprintDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        // this.taskFormGroup.get('TaskSubGroupID').patchValue(result);
        this.taskFormGroup.patchValue({
          TaskSubGroupID: result,
        });
        console.log(this.taskFormGroup.get('TaskSubGroupID').value);
      }
    });
  }

  RejectTaskClicked(): void {
    if (this.SelectedTask.TaskID) {
      const Actiontype = 'Reject';
      const Catagory = 'Task';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  RejectTask(): void {
    this.GetTaskValues();
    this.SelectedTask.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.RejectTask(this.SelectedTask).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Task rejected successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllTask();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  /**
 * Toggle sidebar open
 *
 * @param key
 */
  toggleSidebarOpen(key): void {
    // this._shareParameterService.SetCurrentTask(this.SelectedTask);
    this._fuseSidebarService.getSidebar(key).toggleOpen();
  }

  loadSelectedTaskTimline(): void {

  }

  GetAllTaskLogsByTaskID(TaskID: number): void {
    this._projectService.GetAllTaskLogsByTaskID(TaskID).subscribe(
      (data) => {
        this.AllTaskLogs = <TaskLog[]>data;
        this._shareParameterService.SetTaskLogs(this.AllTaskLogs);
        //   if (this.AllTaskLogs && this.AllTaskLogs.length) {
        //     this.loadSelectedTask(this.AllTaskLogs[0]);
        //   }
        console.log(this.AllTaskLogs);
      },
      (err) => {
        console.error(err);
        // this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
}
