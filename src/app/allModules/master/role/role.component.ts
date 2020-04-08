import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails, RoleWithApp, MenuApp } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class RoleComponent implements OnInit {
  MenuItems: string[];
  AllRoles: RoleWithApp[] = [];
  SelectedRole: RoleWithApp;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: Guid;
  roleMainFormGroup: FormGroup;
  AllMenuApps: MenuApp[] = [];
  searchText = '';
  AppIDListAllID: number;
  
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedRole = new RoleWithApp();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    this.AppIDListAllID = 0;
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

      this.roleMainFormGroup = this._formBuilder.group({
        roleName: ['', Validators.required],
        appIDList: [[], Validators.required]
        // appIDList: [[], CustomValidators.SelectedRole('Administrator')]
      });
      this.GetAllMenuApps();
      this.GetAllRoles();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
    this.SelectedRole = new RoleWithApp();
    this.selectID = Guid.createEmpty();
    this.roleMainFormGroup.reset();
    Object.keys(this.roleMainFormGroup.controls).forEach(key => {
      this.roleMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllMenuApps(): void {
    this._masterService.GetAllMenuApp().subscribe(
      (data) => {
        this.AllMenuApps = <MenuApp[]>data;
        if (this.AllMenuApps && this.AllMenuApps.length > 0) {
          const xy = this.AllMenuApps.filter(x => x.AppName === 'All')[0];
          if (xy) {
            this.AppIDListAllID = xy.AppID;
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllRoles(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllRoles = <RoleWithApp[]>data;
        if (this.AllRoles && this.AllRoles.length) {
          this.loadSelectedRole(this.AllRoles[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  OnAppNameChanged(): void {
    // console.log('changed');
    const SelectedValues = this.roleMainFormGroup.get('appIDList').value as number[];
    if (SelectedValues.includes(this.AppIDListAllID)) {
      this.roleMainFormGroup.get('appIDList').patchValue([this.AppIDListAllID]);
      this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);

    }
    // console.log(this.roleMainFormGroup.get('appIDList').value);
  }

  loadSelectedRole(SelectedRole: RoleWithApp): void {
    this.selectID = SelectedRole.RoleID;
    this.SelectedRole = SelectedRole;
    this.SetRoleValues();
  }

  SetRoleValues(): void {
    this.roleMainFormGroup.get('roleName').patchValue(this.SelectedRole.RoleName);
    this.roleMainFormGroup.get('appIDList').patchValue(this.SelectedRole.AppIDList);
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
            this.CreateRole();
          } else if (Actiontype === 'Update') {
            this.UpdateRole();
          } else if (Actiontype === 'Delete') {
            this.DeleteRole();
          }
        }
      });
  }

  GetRoleValues(): void {
    this.SelectedRole.RoleName = this.roleMainFormGroup.get('roleName').value;
    this.SelectedRole.AppIDList = <number[]>this.roleMainFormGroup.get('appIDList').value;
  }

  CreateRole(): void {
    this.GetRoleValues();
    this.SelectedRole.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateRole(this.SelectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateRole(): void {
    this.GetRoleValues();
    this.SelectedRole.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateRole(this.SelectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteRole(): void {
    this.GetRoleValues();
    this.SelectedRole.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteRole(this.SelectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.roleMainFormGroup.controls).forEach(key => {
      this.roleMainFormGroup.get(key).markAsTouched();
      this.roleMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.roleMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedRole.RoleID) {
        const Actiontype = 'Update';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.roleMainFormGroup.valid) {
      if (this.SelectedRole.RoleID) {
        const Actiontype = 'Delete';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}

