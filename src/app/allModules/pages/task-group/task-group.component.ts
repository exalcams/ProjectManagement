import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TaskGroupComponent implements OnInit {

  searchText = '';
  displayedColumns: string[] = [
    'Title',
    'Owner',
    'PlannedStartDate',
    'PlannedEndDate',
    'ActualStartDate',
    'ActualEndDate',
    'PlannedEffort',
    'ActualEffort'
  ];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor() { }

  ngOnInit() {

    const allInvoiceDetails = [
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
      { Title: '', Owner: '', PlannedStartDate: '', PlannedEndDate: '', ActualStartDate: '', ActualEndDate: '', PlannedEffort: '', ActualEffort: '' },
    ];

    this.dataSource = new MatTableDataSource(
      allInvoiceDetails
    );
  }
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
