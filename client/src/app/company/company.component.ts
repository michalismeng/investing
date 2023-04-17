import { Component, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from 'src/services/company.service';
import { CompanyDataSource } from './companies-data-source';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-company-dialog',
  templateUrl: 'add-company-dialog.html',
})
export class AddCompanyDialog {
  public name = "";
  private readonly triggerElementRef: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddCompanyDialog>,
    private companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) data: { trigger: ElementRef }
  ) {this.triggerElementRef = data.trigger;}

  public addCompany() {
    this.companyService.addCompany(this.name).subscribe(_ => {
      this.name = "";
      this.dialogRef.close("ok");
    })
  }

  ngOnInit() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef!.nativeElement.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 10}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }
}

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent {

  public columnsToDisplay = ["name", "actions"]
  public dataSource: CompanyDataSource;

  constructor(
    private companyService: CompanyService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.dataSource = new CompanyDataSource(this.companyService);
    this.dataSource.loadCompanies();
  }

  public openDialog(evt: MouseEvent): void {
    const target = new ElementRef(evt.currentTarget);
    const dialogRef = this.dialog.open(AddCompanyDialog, {
      data: { trigger: target },
    });
    dialogRef.afterClosed().subscribe(reason => { if(reason == "ok") this.dataSource.loadCompanies() })
  }

  public navigateToFinancials(item: any) {
    this.router.navigate(["/submissions"])
  }

  public deleteCompany(item: any) {
    this.companyService.removeCompany(item.name).subscribe(_ => this.dataSource.loadCompanies());
  }

}
