import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatTabChangeEvent
} from '@angular/material';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { fuseAnimations } from '@fuse/animations';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Guid } from 'guid-typescript';

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
    isProgressBarVisibile: boolean;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    displayedColumns: string[] = [
        'TaskGroup',
        'TaskSubGroup',
        'TaskName',
        'OwnerName',
        'PlannedCompletionDate',
        'Status'
    ];
    dataSource = new MatTableDataSource<any>();
    selection = new SelectionModel<any>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    AllTickets: any[] = [];
    AllActivities: any[] = [];
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar
    ) {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
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
        } else {
            this._router.navigate(['/auth/login']);
        }

        const allInvoiceDetails = [
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
            { TaskGroup: '', TaskSubGroup: '', Task: '', Report: '' },
        ];

        this.dataSource = new MatTableDataSource(
            allInvoiceDetails
        );

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



}
