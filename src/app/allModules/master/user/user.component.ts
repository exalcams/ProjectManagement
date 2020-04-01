import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { UserWithRole, AuthenticationDetails, RoleWithApp } from 'app/models/master';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserComponent implements OnInit {
  MenuItems: string[];
  AllUsers: UserWithRole[] = [];
  SelectedUser: UserWithRole;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: Guid;
  userMainFormGroup: FormGroup;
  AllRoles: RoleWithApp[] = [];
  searchText = '';
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedUser = new UserWithRole();
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
      if (this.MenuItems.indexOf('User') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.userMainFormGroup = this._formBuilder.group({
        userName: ['', Validators.required],
        roleID: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        contactNumber: ['', [Validators.required, Validators.pattern]],
        // plant: ['', Validators.required],
        profile: ['']
      });
      this.GetAllRoles();
      this.GetAllUsers();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
    this.SelectedUser = new UserWithRole();
    this.selectID = Guid.createEmpty();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllRoles(): void {
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.AllRoles = <RoleWithApp[]>data;
        // console.log(this.AllMenuApps);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllUsers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllUsers = <UserWithRole[]>data;
        if (this.AllUsers && this.AllUsers.length) {
          this.loadSelectedUser(this.AllUsers[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedUser(selectedUser: UserWithRole): void {
    this.selectID = selectedUser.UserID;
    this.SelectedUser = selectedUser;
    this.SetUserValues();
  }

  SetUserValues(): void {
    this.userMainFormGroup.get('userName').patchValue(this.SelectedUser.UserName);
    // this.userMainFormGroup.get('plant').patchValue(this.SelectedUser.Plant);
    this.userMainFormGroup.get('roleID').patchValue(this.SelectedUser.RoleID);
    this.userMainFormGroup.get('email').patchValue(this.SelectedUser.Email);
    this.userMainFormGroup.get('contactNumber').patchValue(this.SelectedUser.ContactNumber);
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
            this.CreateUser();
          } else if (Actiontype === 'Update') {
            this.UpdateUser();
          } else if (Actiontype === 'Delete') {
            this.DeleteUser();
          }
        }
      });
  }

  GetUserValues(): void {
    this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
    // this.SelectedUser.Plant = this.userMainFormGroup.get('plant').value;
    this.SelectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
    this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
    this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
  }

  CreateUser(): void {
    this.GetUserValues();
    this.SelectedUser.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateUser(this.SelectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateUser(): void {
    this.GetUserValues();
    this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateUser(this.SelectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteUser(): void {
    this.GetUserValues();
    this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteUser(this.SelectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      this.userMainFormGroup.get(key).markAsTouched();
      this.userMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.userMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedUser.UserID) {
        const Actiontype = 'Update';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.userMainFormGroup.valid) {
      if (this.SelectedUser.UserID) {
        const Actiontype = 'Delete';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}

