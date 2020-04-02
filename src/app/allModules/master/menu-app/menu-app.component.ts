import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MenuApp, AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'menu-app',
  templateUrl: './menu-app.component.html',
  styleUrls: ['./menu-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MenuAppComponent implements OnInit {
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: number;
  menuAppMainFormGroup: FormGroup;
  searchText = '';
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedMenuApp = new MenuApp();
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
      this.menuAppMainFormGroup = this._formBuilder.group({
        appName: ['', Validators.required]
      });
      this.GetAllMenuApps();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
    this.SelectedMenuApp = new MenuApp();
    this.selectID = 0;
    this.menuAppMainFormGroup.reset();
    Object.keys(this.menuAppMainFormGroup.controls).forEach(key => {
      this.menuAppMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllMenuApps(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllMenuApp().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllMenuApps = <MenuApp[]>data;
        if (this.AllMenuApps && this.AllMenuApps.length) {
          this.loadSelectedMenuApp(this.AllMenuApps[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedMenuApp(SelectedMenuApp: MenuApp): void {
    this.selectID = SelectedMenuApp.AppID;
    this.SelectedMenuApp = SelectedMenuApp;
    this.SetMenuAppValues();
  }

  SetMenuAppValues(): void {
    this.menuAppMainFormGroup.get('appName').patchValue(this.SelectedMenuApp.AppName);
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
            this.CreateMenuApp();
          } else if (Actiontype === 'Update') {
            this.UpdateMenuApp();
          } else if (Actiontype === 'Delete') {
            this.DeleteMenuApp();
          }
        }
      });
  }

  GetMenuAppValues(): void {
    this.SelectedMenuApp.AppName = this.menuAppMainFormGroup.get('appName').value;
  }

  CreateMenuApp(): void {
    this.GetMenuAppValues();
    this.SelectedMenuApp.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateMenuApp(this.SelectedMenuApp).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('MenuApp created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllMenuApps();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateMenuApp(): void {
    this.GetMenuAppValues();
    this.SelectedMenuApp.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateMenuApp(this.SelectedMenuApp).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('MenuApp updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllMenuApps();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteMenuApp(): void {
    this.GetMenuAppValues();
    this.SelectedMenuApp.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteMenuApp(this.SelectedMenuApp).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('MenuApp deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllMenuApps();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.menuAppMainFormGroup.controls).forEach(key => {
      this.menuAppMainFormGroup.get(key).markAsTouched();
      this.menuAppMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.menuAppMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedMenuApp.AppID) {
        const Actiontype = 'Update';
        const Catagory = 'MenuApp';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'MenuApp';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.menuAppMainFormGroup.valid) {
      if (this.SelectedMenuApp.AppID) {
        const Actiontype = 'Delete';
        const Catagory = 'MenuApp';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}

