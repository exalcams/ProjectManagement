import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Project, Owner } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectComponent implements OnInit {
  MenuItems: string[];
  AllProjects: Project[] = [];
  AllProjectsCount: number;
  SelectedProject: Project;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  selectID: number;
  projectMainFormGroup: FormGroup;
  AllOwners: Owner[] = [];
  searchText = '';
  constructor(
    private _projectService: ProjectService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SelectedProject = new Project();
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
      if (this.MenuItems.indexOf('Project') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.projectMainFormGroup = this._formBuilder.group({
        Title: ['', Validators.required],
        OwnerID: ['', Validators.required],
        // email: ['', [Validators.required, Validators.email]],
        // contactNumber: ['', [Validators.required, Validators.pattern]],
        // // plant: ['', Validators.required],
        // profile: ['']
      });
      this.GetAllOwners();
      this.GetAllProjects();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
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
    this._projectService.GetAllOwners().subscribe(
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
    this.selectID = selectedProject.ProjectID;
    this.SelectedProject = selectedProject;
    this.SetProjectValues();
  }

  SetProjectValues(): void {
    // this.projectMainFormGroup.get('ProjectID').patchValue(this.SelectedProject.ProjectID);
    // this.projectMainFormGroup.get('plant').patchValue(this.SelectedProject.Plant);
    this.projectMainFormGroup.get('OwnerID').patchValue(this.SelectedProject.OwnerID);
    this.projectMainFormGroup.get('Title').patchValue(this.SelectedProject.Title);
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
    this.SelectedProject.OwnerID = this.projectMainFormGroup.get('OwnerID').value;
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
        const Actiontype = 'Create';
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

