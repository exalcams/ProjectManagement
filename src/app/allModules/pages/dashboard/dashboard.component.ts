import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatTabChangeEvent, MatIconRegistry, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MenuApp, AuthenticationDetails, UserView, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { Task, TaskView, Input, Output, Logic, Validation, TaskSubGroupView, SketchView, AttachmentDetails } from 'app/models/task';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ProjectService } from 'app/services/project.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Guid } from 'guid-typescript';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    MenuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    AllOwners: UserWithRole[] = [];
    AllTasks: Task[] = [];
    AllTasksCount: number;
    AllNewTasksCount: number;
    AllOpenTasksCount: number;
    AllEscalatedTasksCount: number;
    AllReworkTasksCount: number;
    displayedColumns: string[] = [
        'TaskGroup',
        'TaskSubGroup',
        'TaskName',
        'OwnerName',
        'PlannedCompletionDate',
        'Status'
    ];
    dataSource: MatTableDataSource<Task>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<any>(true, []);
    AllTickets: any[] = [];
    AllActivities: any[] = [];
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private _masterService: MasterService,
        private _projectService: ProjectService,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = true;
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserRole = this.authenticationDetails.userRole;
            this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
            if (this.MenuItems.indexOf('Dashboard') < 0) {
                this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
                );
                this._router.navigate(['/auth/login']);
            }
            this.GetAllOwners();
            this.GetAllTasksCount();
            this.GetAllNewTasksCountToday();
            this.GetAllOpenTasksCount();
            this.GetAllEscalatedTasksCountToday();
            this.GetAllReworkTasksCountToday();
            // this.GetAllTasks();
            this.LoadSelectedTask('new');
        } else {
            this._router.navigate(['/auth/login']);
        }

        // const allInvoiceDetails = [
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        //     { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        // ];

        // this.dataSource = new MatTableDataSource(
        //     allInvoiceDetails
        // );

        this.AllTickets = [
            { TicketNo: '1234', TicketDate: new Date(), Comment: 'Heading for ticket will come here' },
            { TicketNo: '1235', TicketDate: new Date(), Comment: 'Heading for ticket will come here' },
            { TicketNo: '1236', TicketDate: new Date(), Comment: 'Heading for ticket will come here' },
            // { TicketNo: '1237', TicketDate: new Date(), Comment: 'Heading for ticket will come here' }
        ];
        this.AllActivities = [
            { Profile: 'assets/images/avatars/carl.jpg', Interval: '12 min ago', Comment: 'Rupesh uploaded smartfarm file' },
            { Profile: 'assets/images/avatars/Katina.jpg', Interval: '2 hr ago', Comment: 'Maria uploaded digital file' },
            { Profile: 'assets/images/avatars/garry.jpg', Interval: '2 hr ago', Comment: 'You assigned @Rupesh to complete illustration' },
            { Profile: 'assets/images/avatars/Velazquez.jpg', Interval: '1 day ago', Comment: 'Darmendra uploaded smartfarm file' }
        ];
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    GetAllNewTasksToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllNewTasksToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllNewTasksCountToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllNewTasksCountToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                // this.AllTasks = <Task[]>data;
                this.AllNewTasksCount = <number>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
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

    GetAllTasks(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllTasks1().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
                this.AllTasks.forEach(x => {
                    x.OwnerNames = this.GetOwnerNameByOwnerIDList(x.AssignedTo);
                });
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
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

    GetAllTasksCount(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllTasksCount().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                // this.AllTasks = <Task[]>data;
                this.AllTasksCount = <number>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllOpenTasks(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllOpenTasks().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllOpenTasksCount(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllOpenTasksCount().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                // this.AllTasks = <Task[]>data;
                this.AllOpenTasksCount = <number>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllEscalatedTasksToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllEscalatedTasksToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllEscalatedTasksCountToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllEscalatedTasksCountToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                // this.AllTasks = <Task[]>data;
                this.AllEscalatedTasksCount = <number>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllReworkTasksToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllReworkTasksToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    GetAllReworkTasksCountToday(): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllReworkTasksCountToday().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                // this.AllTasks = <Task[]>data;
                this.AllReworkTasksCount = <number>data;
                // if (this.AllTasks && this.AllTasks.length) {
                //     this.loadSelectedTask(this.AllTasks[0]);
                // }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    LoadSelectedTask(choice: string): void {

        if (choice) {
            if (choice.toLowerCase() === 'new') {
                this.AllTasks = [];
                // this.dataSource = new MatTableDataSource(this.AllTasks);
                this.GetAllTasksByChoice(choice);
            }
            else if (choice.toLowerCase() === 'open') {
                this.AllTasks = [];
                this.GetAllTasksByChoice(choice);
            }
            else if (choice.toLowerCase() === 'escalated') {
                this.AllTasks = [];
                this.GetAllTasksByChoice(choice);
            }
            else if (choice.toLowerCase() === 'rework') {
                this.AllTasks = [];
                this.GetAllTasksByChoice(choice);
            }
        }
    }

    GetAllTasksByChoice(choice: string): void {
        this.IsProgressBarVisibile = true;
        this._projectService.GetAllTasksByChoice(choice).subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllTasks = <Task[]>data;
                this.AllTasks.forEach(x => {
                    x.OwnerNames = this.GetOwnerNameByOwnerIDList(x.AssignedTo);
                });
                this.dataSource = new MatTableDataSource(this.AllTasks);
                // console.log(this.AllTasks);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

}
