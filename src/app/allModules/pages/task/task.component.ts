import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class TaskComponent implements OnInit {

  searchText = '';
  inputdisplayedColumns: string[] = [
    'Field',
    'Validation',
    'Remarks'
  ];
  outputdisplayedColumns: string[] = [
    'Level',
    'Field',
    'Validation',
    'Remarks'
  ];
  logicdisplayedColumns: string[] = [
    'LogicText'
  ];
  validationdisplayedColumns: string[] = [
    'ValidationText'
  ];
  sketchdisplayedColumns: string[] = [
    'Text'
  ];
  inputdataSource = new MatTableDataSource<any>();
  outputdataSource = new MatTableDataSource<any>();
  logicdataSource = new MatTableDataSource<any>();
  validationdataSource = new MatTableDataSource<any>();
  sketchdataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor() { }

  ngOnInit() {

    const allInvoiceDetails = [
      { Field: '', Validation: '', Remarks: '' },
      { Field: '', Validation: '', Remarks: '' },
      { Field: '', Validation: '', Remarks: '' }
    ];
    const allOutputDetails = [
      {Level:'', Field: '', Validation: '', Remarks: '' },
      {Level:'', Field: '', Validation: '', Remarks: '' },
      {Level:'', Field: '', Validation: '', Remarks: '' }
    ];
    const allLogicDetails = [
      {LogicText:'' },
      {LogicText:'' },
      {LogicText:'' },
    ];
    const allValidationDetails = [
      {ValidationText:'' },
      {ValidationText:'' },
      {ValidationText:'' },
    ];
    const allSketchDetails = [
      {Text:'' },
      {Text:'' },
      {Text:'' },
    ];

    this.inputdataSource = new MatTableDataSource(
      allInvoiceDetails
    );
    this.outputdataSource = new MatTableDataSource(
      allOutputDetails
    );
    this.logicdataSource = new MatTableDataSource(
      allLogicDetails
    );
    this.validationdataSource = new MatTableDataSource(
      allValidationDetails
    );
    this.sketchdataSource = new MatTableDataSource(
      allSketchDetails
    );
  }
  applyFilter(filterValue: string): void {
    this.inputdataSource.filter = filterValue.trim().toLowerCase();
  }

}
