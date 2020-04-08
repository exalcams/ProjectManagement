import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'attachment-dialog',
  templateUrl: './attachment-dialog.component.html',
  styleUrls: ['./attachment-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AttachmentDialogComponent implements OnInit {
  public AttachmentData: any;
  constructor(
    public matDialogRef: MatDialogRef<AttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private AttachmentDat: Blob,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const fileURL = URL.createObjectURL(this.AttachmentDat);
    this.AttachmentData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    // this.AttachmentData = fileURL;
    // console.log(this.AttachmentData);
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);
  }
  downloadFile(): void {

  }

}
