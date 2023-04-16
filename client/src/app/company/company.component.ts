import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from 'src/services/company.service';
import { CompanyDataSource } from './companies-data-source';

@Component({
  selector: 'app-home',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent {

  public columnsToDisplay = ["name", "actions"]
  public name = "";
  public dataSource: CompanyDataSource;

  constructor(
    private companyService: CompanyService,
    private router: Router,
  ) {
    this.dataSource = new CompanyDataSource(this.companyService);
    this.dataSource.loadCompanies();
  }

  public addCompany() {
    this.companyService.addCompany(this.name).subscribe(_ => {
      this.dataSource.loadCompanies();
      this.name = "";
    })
  }

  public navigateToFinancials(item: any) {
    this.router.navigate(["/submissions"])
  }

  public deleteCompany(item: any) {
    this.companyService.removeCompany(item.name).subscribe(_ => this.dataSource.loadCompanies());
  }

}
