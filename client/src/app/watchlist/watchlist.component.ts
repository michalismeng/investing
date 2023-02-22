import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Submission } from 'src/models/submission';
import { WatchlistEntry } from 'src/models/watchlist';
import { FinancialsService } from 'src/services/financials.service';
import { SubmissionsService } from 'src/services/submissions.service';
import { WatchlistDataSource } from './watchlist-data-source';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {

  public dataSource: WatchlistDataSource;
  public columnsToDisplay = ["name", "countFilings", "actions"];

  constructor(
    private financialsService: FinancialsService,
    private submissionsService: SubmissionsService,
    private router: Router,
  ) {
    this.dataSource = new WatchlistDataSource(this.financialsService, this.submissionsService);
  }

  ngOnInit(): void {
    this.dataSource.loadWatchlists();
  }

  public add() {
    this.router.navigate(["/submissions"])
  }

  public delete(name: string) {
    this.financialsService.deleteWatchlist(name).subscribe(_ => this.dataSource.loadWatchlists())
  }

  public navigateToFinancials(item: WatchlistEntry) {
    this.router.navigate(["/financials", item.name])
  }

  public submissionsTooltip(subs: Submission[]): string {
    return subs.map(s => `${s.fy}`).sort().join(" ")
  }
}
