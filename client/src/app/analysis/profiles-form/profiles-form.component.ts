import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Profile } from 'src/models/profile';

@Component({
  selector: 'app-profiles-form',
  templateUrl: './profiles-form.component.html',
  styleUrls: ['./profiles-form.component.scss']
})
export class ProfilesFormComponent implements OnInit {

  public profile: FormGroup | null = null;
  @Input() initial: Profile | null = null;
  @Output() onChange = new EventEmitter<Profile>(); 

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.profile = this.fb.group({
      'date': [this.initial?.date ?? ''],
      'description': [this.initial?.description ?? ''],
      'locHQ': [this.initial?.locHQ ?? ''],
      'locOperations': [this.initial?.locOperations ?? ''],
      'prodsAndServices': [this.initial?.prodsAndServices ?? ''],
      'revGeneration': [this.initial?.revGeneration ?? ''],
      'sector': [this.initial?.sector ?? ''],
      'simple': [this.initial?.simple ?? false],
      'lifecycle': [this.initial?.lifecycle ?? ''],
      'website': [this.initial?.website ?? ''],
      'irWebsite': [this.initial?.irWebsite ?? ''],
      'founded': [this.initial?.founded ?? ''],
      'ipo': [this.initial?.ipo ?? ''],
      'nature': [this.initial?.nature ?? ''],
      'exciting': [this.initial?.exciting ?? false],
      'dirty': [this.initial?.dirty ?? false],
      'hot': [this.initial?.hot ?? false],
      'nicheDomination': [this.initial?.nicheDomination ?? ''],
      'competition': [this.initial?.competition ?? ''],
      'competitors': [this.initial?.competitors ?? ''],
      'moat': [this.initial?.moat ?? ''],
      'cyclical': [this.initial?.cyclical ?? ''],
      'comment': [this.initial?.comment ?? ''],
    })
  }

  public onFormSubmit() {
    this.onChange.next(this.profile?.value)
  }

}
