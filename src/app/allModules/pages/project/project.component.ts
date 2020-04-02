import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';
import { UserWithRole, AuthenticationDetails } from 'app/models/master';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectComponent implements OnInit, OnChanges {

  searchText = '';
  @Input() currentSelectedUser: UserWithRole = new UserWithRole();
  @Output() SaveSucceed: EventEmitter<string> = new EventEmitter<string>();
  @Output() ShowProgressBarEvent: EventEmitter<string> = new EventEmitter<string>();
  user: UserWithRole;
  userMainFormGroup: FormGroup;
  AllProjects: Project[] = [];
  AllProjectsCount: number;
  jsonResponseData: any;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // fileToUpload: File;
  // fileUploader: FileUploader;
  baseAddress: string;
  slectedProfile: Uint8Array;
  authenticationDetails: AuthenticationDetails;

  constructor(private _projectService: ProjectService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authService: AuthService) {
    this.userMainFormGroup = this._formBuilder.group({
      userName: ['', Validators.required],
      roleID: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern]],
      plant: ['', Validators.required],
      profile: ['']
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.user = new UserWithRole();
    this.authenticationDetails = new AuthenticationDetails();
    this.baseAddress = _authService.baseAddress;
  }
  GetAllProjects(): void {
    this._projectService.GetAllProjects().subscribe(
      (data) => {
        this.AllProjects = JSON.parse(data.toString());
        // this.AllProjects = data.value;
        this.AllProjectsCount = this.AllProjects.length;
        console.log(this.AllProjects);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {

    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetAllProjects();

  }

  ResetControl(): void {
    this.user = new UserWithRole();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      // const control = this.userMainFormGroup.get(key);
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  // SaveClicked(): void {
  //   if (this.userMainFormGroup.valid) {
  //     // const file: File = this.fileToUpload;
  //     if (this.user.UserID) {
  //       const dialogConfig: MatDialogConfig = {
  //         data: {
  //           Actiontype: 'Update',
  //           Catagory: 'User'
  //         },
  //         panelClass: 'confirmation-dialog'
  //       };
  //       const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
  //       dialogRef.afterClosed().subscribe(
  //         result => {
  //           if (result) {
  //             this.ShowProgressBarEvent.emit('show');
  //             this.user.UserName = this.userMainFormGroup.get('userName').value;
  //             this.user.Plant = this.userMainFormGroup.get('plant').value;
  //             this.user.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
  //             this.user.Email = this.userMainFormGroup.get('email').value;
  //             this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
  //             // this.user.Password = this.userMainFormGroup.get('password').value;
  //             this.user.ModifiedBy = this.authenticationDetails.userID.toString();
  //             this._projectService.UpdateUser(this.user).subscribe(
  //               (data) => {
  //                 // console.log(data);
  //                 this.ResetControl();
  //                 this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
  //                 this.SaveSucceed.emit('success');
  //                 this._projectService.TriggerNotification('User updated successfully');
  //               },
  //               (err) => {
  //                 console.error(err);
  //                 this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //                 this.ShowProgressBarEvent.emit('hide');
  //               }
  //             );
  //           }
  //         }
  //       );

  //     } else {
  //       const dialogConfig: MatDialogConfig = {
  //         data: {
  //           Actiontype: 'Create',
  //           Catagory: 'User'
  //         },
  //         panelClass: 'confirmation-dialog'
  //       };
  //       const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
  //       dialogRef.afterClosed().subscribe(
  //         result => {
  //           if (result) {
  //             this.ShowProgressBarEvent.emit('show');
  //             this.user = new UserWithRole();
  //             this.user.UserName = this.userMainFormGroup.get('userName').value;
  //             this.user.Plant = this.userMainFormGroup.get('plant').value;
  //             this.user.RoleID = this.userMainFormGroup.get('roleID').value;
  //             this.user.Email = this.userMainFormGroup.get('email').value;
  //             this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
  //             // this.user.Password = this.userMainFormGroup.get('password').value;
  //             this.user.CreatedBy = this.authenticationDetails.userID.toString();
  //             // this.user.Profile = this.slectedProfile;
  //             this._projectService.CreateUser(this.user).subscribe(
  //               (data) => {
  //                 // console.log(data);
  //                 this.ResetControl();
  //                 this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
  //                 this.SaveSucceed.emit('success');
  //                 this._projectService.TriggerNotification('User created successfully');
  //               },
  //               (err) => {
  //                 console.error(err);
  //                 this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //                 this.ShowProgressBarEvent.emit('hide');
  //               }
  //             );
  //           }
  //         });
  //     }
  //   } else {
  //     Object.keys(this.userMainFormGroup.controls).forEach(key => {
  //       this.userMainFormGroup.get(key).markAsTouched();
  //       this.userMainFormGroup.get(key).markAsDirty();
  //     });
  //   }
  // }

  // DeleteClicked(): void {
  //   if (this.userMainFormGroup.valid) {
  //     if (this.user.UserID) {
  //       const dialogConfig: MatDialogConfig = {
  //         data: {
  //           Actiontype: 'Delete',
  //           Catagory: 'User'
  //         },
  //         panelClass: 'confirmation-dialog'
  //       };
  //       const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
  //       dialogRef.afterClosed().subscribe(
  //         result => {
  //           if (result) {
  //             this.ShowProgressBarEvent.emit('show');
  //             this.user.UserName = this.userMainFormGroup.get('userName').value;
  //             this.user.Plant = this.userMainFormGroup.get('plant').value;
  //             this.user.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
  //             this.user.Email = this.userMainFormGroup.get('email').value;
  //             this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
  //             // this.user.Password = this.userMainFormGroup.get('password').value;
  //             this.user.ModifiedBy = this.authenticationDetails.userID.toString();
  //             this._projectService.DeleteUser(this.user).subscribe(
  //               (data) => {
  //                 // console.log(data);
  //                 this.ResetControl();
  //                 this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
  //                 this.SaveSucceed.emit('success');
  //                 this._projectService.TriggerNotification('User deleted successfully');
  //               },
  //               (err) => {
  //                 console.error(err);
  //                 this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //                 this.ShowProgressBarEvent.emit('hide');
  //               }
  //             );
  //           }
  //         });
  //     }
  //   } else {
  //     Object.keys(this.userMainFormGroup.controls).forEach(key => {
  //       this.userMainFormGroup.get(key).markAsTouched();
  //       this.userMainFormGroup.get(key).markAsDirty();
  //     });
  //   }
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentSelectedUser) {
      this.user = new UserWithRole();
      this.user.UserID = this.currentSelectedUser.UserID;
      this.user.UserName = this.currentSelectedUser.UserName;
      this.user.Plant = this.currentSelectedUser.Plant;
      this.user.RoleID = this.currentSelectedUser.RoleID;
      this.user.Email = this.currentSelectedUser.Email;
      this.user.ContactNumber = this.currentSelectedUser.ContactNumber;
      this.user.Password = this.currentSelectedUser.Password;
      this.user.CreatedBy = this.currentSelectedUser.CreatedBy;
      this.user.CreatedOn = this.currentSelectedUser.CreatedOn;
      this.user.ModifiedBy = this.currentSelectedUser.ModifiedBy;
      this.user.ModifiedOn = this.currentSelectedUser.ModifiedOn;
      this.userMainFormGroup.get('userName').patchValue(this.user.UserName);
      this.userMainFormGroup.get('plant').patchValue(this.user.Plant);
      this.userMainFormGroup.get('roleID').patchValue(this.user.RoleID);
      this.userMainFormGroup.get('email').patchValue(this.user.Email);
      this.userMainFormGroup.get('contactNumber').patchValue(this.user.ContactNumber);
      // this.userMainFormGroup.get('password').patchValue(this.user.Password);
      // this.userMainFormGroup.get('confirmPassword').patchValue(this.user.Password);
    } else {
      // this.menuAppMainFormGroup.get('appName').patchValue('');
      this.ResetControl();
    }
  }

}
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const confirmPassword = control.parent.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (confirmPassword.value === '') {
    return null;
  }

  if (password.value === confirmPassword.value) {
    return null;
  }

  return { 'passwordsNotMatching': true };
};

