import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { Profile } from 'src/models/profile';
import { ProfilesService } from 'src/services/profiles.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

export const MY_FORMATS = {
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-profiles-form',
  templateUrl: './profiles-form.component.html',
  styleUrls: ['./profiles-form.component.scss']
})
export class ProfilesFormComponent implements OnInit {

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public profile: FormGroup;
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
      'locOperations': [[]],
      'prodsAndServices': [[]],
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
      'competitors': [[]],
      'moat': [''],
      'cyclical': [''],
      'comment': [''],
    })

    this.route.params.subscribe(params => {
      this.profilesService.getProfile(params["name"]).pipe(filter(v => v != null)).subscribe(v => this.profile.setValue(v))
    })
  }

  ngOnInit(): void {
  }

  public onFormSubmit() {
    this.onChange.next(this.profile?.value)
  }

  get productsAndServices() {
    return this.profile.get('prodsAndServices');
  }

  get locOperations() {
    return this.profile.get('locOperations');
  }

  get competitors() {
    return this.profile.get('competitors');
  }

  private formField(field: string) {
    switch(field) {
      case "comp": return this.competitors;
      case "prod": return this.productsAndServices;
      case "ops": return this.locOperations;
    }
    return null;
  }

  add(event: MatChipInputEvent, field: string): void {
    const value = (event.value || '').trim();
    if (value) {
      this.formField(field)?.value.push(value);
      this.formField(field)?.updateValueAndValidity();
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  remove(element: string, field: string): void {
    const index = this.formField(field)?.value.indexOf(element);

    if (index >= 0) {
      this.formField(field)?.value.splice(index, 1);
      this.formField(field)?.updateValueAndValidity();
    }
  }

  edit(element: string, event: MatChipEditedEvent, field: string) {
    const value = event.value.trim();

    if (!value) {
      this.remove(element, field);
      return;
    }

    // Edit existing fruit
    const index = this.formField(field)?.value.indexOf(element);
    if (index >= 0) {
      this.formField(field)!.value[index] = value;
    }
  }

}
