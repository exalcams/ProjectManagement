import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: any;
  constructor() { }
  SetInvoiceDetail(InvoiceDetail: any): void {
    this.CurrentInvoiceDetail = InvoiceDetail;
  }
  GetInvoiceDetail(): any {
    return this.CurrentInvoiceDetail;
  }
}
