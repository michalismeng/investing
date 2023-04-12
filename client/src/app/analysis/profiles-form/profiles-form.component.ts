import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { Profile } from 'src/models/profile';
import { ProfilesService } from 'src/services/profiles.service';

@Component({
  selector: 'app-profiles-form',
  templateUrl: './profiles-form.component.html',
  styleUrls: ['./profiles-form.component.scss']
})
export class ProfilesFormComponent implements OnInit {

  public profile: FormGroup;
  public name: string = "";
  @Input() initial: Profile | null = null;
  @Output() onChange = new EventEmitter<Profile>(); 

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private profilesService: ProfilesService,
  ) {
    this.profile = this.fb.group({
      'date': [''],
      'description': [''],
      'locHQ': [''],
      'locOperations': [''],
      'prodsAndServices': [''],
      'revGeneration': [''],
      'sector': [''],
      'simple': [false],
      'lifecycle': [''],
      'website': [''],
      'irWebsite': [''],
      'founded': [''],
      'ipo': [''],
      'nature': [''],
      'exciting': [false],
      'dirty': [false],
      'hot': [false],
      'nicheDomination': [''],
      'competition': [''],
      'competitors': [''],
      'moat': [''],
      'cyclical': [''],
      'comment': [''],
      'name': ['']
    })

    this.route.params.subscribe(params => {
      this.name = params["name"]
      this.profilesService.getProfile(this.name).subscribe(v => this.profile.setValue(v))
    })
  }

  ngOnInit(): void {
  }

  public onFormSubmit() {
    this.onChange.next({ name: this.name, ...this.profile?.value })
  }

}
