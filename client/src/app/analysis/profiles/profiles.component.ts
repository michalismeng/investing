import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Profile } from 'src/models/profile';
import { ProfilesService } from 'src/services/profiles.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
})
export class ProfilesComponent {

  public companyName: string = "";

  constructor(
    private route: ActivatedRoute,
    private profilesService: ProfilesService,
  ) {
    this.route.params.subscribe(params => {
      this.companyName = params["name"]
    })
  }

  public profileChanged(profile: Profile) {
    this.profilesService.postProfile(this.companyName, profile).subscribe()
  }

}
