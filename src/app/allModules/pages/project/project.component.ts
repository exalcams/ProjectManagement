import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails, UserView, UserWithRole } from 'app/models/master';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
// import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MasterService } from 'app/services/master.service';
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectComponent implements OnInit {
  EnableAddProjectButton: boolean;
  MenuItems: string[];
  AllProjects: Project[] = [];
  AllProjectsCount: number;
  SelectedProject: Project;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: number;
  projectMainFormGroup: FormGroup;
  AllOwners: UserWithRole[] = [];
  SelectedOwners: UserWithRole[] = [];
  SelectedOwnerIDList: Guid[] = [];
  AppIDListAllID: Guid;
  searchText = '';
  // dropdownSettings: IDropdownSettings = {};
  constructor(
    private _projectService: ProjectService,
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedProject = new Project();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    this.AppIDListAllID = Guid.createEmpty();
    this.AllProjectsCount = 0;
    this.EnableAddProjectButton = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Project') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.projectMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerIDList: [[], Validators.required]
      });
      this.GetAllOwners();
      this.GetAllProjects();
      // this.IntializeDropDownSettings();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  // IntializeDropDownSettings(): void {
  //   this.dropdownSettings = {
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

  ResetControl(): void {
    this.EnableAddProjectButton = false;
    this.SelectedProject = new Project();
    // this.selectID = Guid.createEmpty();
    this.selectID = 0;
    this.projectMainFormGroup.reset();
    Object.keys(this.projectMainFormGroup.controls).forEach(key => {
      this.projectMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  GetAllOwners(): void {
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        // this.AllOwners = <UserWithRole[]>data;
        this.AllOwners = <UserWithRole[]>data;
        if (this.AllOwners && this.AllOwners.length > 0) {
          const xy = this.AllOwners.filter(x => x.UserName === 'All')[0];
          if (xy) {
            this.AppIDListAllID = xy.UserID;
          }
        }
        // console.log(this.AllOwners);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllProjects(): void {
    this.IsProgressBarVisibile = true;
    this._projectService.GetAllProjects().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        // this.AllProjects = <Project[]>data;
        this.AllProjects = JSON.parse(data.toString());
        this.AllProjectsCount = this.AllProjects.length;
        console.log(this.AllProjects);
        if (this.AllProjects && this.AllProjects.length) {
          this.loadSelectedProject(this.AllProjects[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedProject(selectedProject: Project): void {
    this.EnableAddProjectButton = true;
    this.selectID = selectedProject.ProjectID;
    this.SelectedProject = selectedProject;
    this.SetProjectValues();
  }

  SetProjectValues(): void {
    // this.projectMainFormGroup.get('ProjectID').patchValue(this.SelectedProject.ProjectID);
    // this.projectMainFormGroup.get('plant').patchValue(this.SelectedProject.Plant);
    // this.SelectedProject.OwnerIDList.forEach(x=>x==)
    // const t = [];
    // this.SelectedProject.OwnerIDList.forEach(x => {
    //   t.push(x.toString());
    // });
    this.projectMainFormGroup.get('OwnerIDList').patchValue(this.SelectedProject.OwnerIDList);
    this.projectMainFormGroup.get('Title').patchValue(this.SelectedProject.Title);
  }

  OnOwnerNameChanged(): void {
    // console.log('changed');
    const SelectedValues = this.projectMainFormGroup.get('OwnerIDList').value as Guid[];
    if (SelectedValues.includes(this.AppIDListAllID)) {
      this.projectMainFormGroup.get('OwnerIDList').patchValue([this.AppIDListAllID]);
      this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);

    }
    // console.log(this.roleMainFormGroup.get('appIDList').value);
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
            this.CreateProject();
          } else if (Actiontype === 'Update') {
            this.UpdateProject();
          } else if (Actiontype === 'Delete') {
            this.DeleteProject();
          }
        }
      });
  }

  GetProjectValues(): void {
    this.SelectedProject.Title = this.projectMainFormGroup.get('Title').value;
    // this.SelectedProject.Plant = this.projectMainFormGroup.get('plant').value;
    // this.SelectedProject.OwnerID = <Guid>this.projectMainFormGroup.get('roleID').value;
    // this.SelectedProject.ProjectID = this.projectMainFormGroup.get('ProjectID').value;
    // this.SelectedOwners.forEach(x => {
    //   const UserID = x.UserID;
    //   this.SelectedOwnerIDList.push(UserID);
    // });
    // this.SelectedProject.OwnerIDList = this.SelectedOwnerIDList;
    this.SelectedProject.OwnerIDList = <Guid[]>this.projectMainFormGroup.get('OwnerIDList').value;
  }

  CreateProject(): void {
    this.GetProjectValues();
    this.SelectedProject.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.CreateProject(this.SelectedProject).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Project created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllProjects();
      },
      (err) => {
        console.error(err);
        this.ResetControl();
        console.log(JSON.parse(err.toString()));
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateProject(): void {
    this.GetProjectValues();
    this.SelectedProject.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.UpdateProject(this.SelectedProject).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Project updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllProjects();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteProject(): void {
    this.GetProjectValues();
    this.SelectedProject.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._projectService.DeleteProject(this.SelectedProject).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Project deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllProjects();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.projectMainFormGroup.controls).forEach(key => {
      this.projectMainFormGroup.get(key).markAsTouched();
      this.projectMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.projectMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedProject.ProjectID) {
        const Actiontype = 'Update';
        const Catagory = 'Project';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Save';
        const Catagory = 'Project';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.projectMainFormGroup.valid) {
      if (this.SelectedProject.ProjectID) {
        const Actiontype = 'Delete';
        const Catagory = 'Project';
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

