import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';

export interface SubmissionsFilters {
  nameSelection: string;
  formSelection: string;
}

@Component({
  selector: 'submissions-filters',
  templateUrl: './submissions-filters.component.html',
  styleUrls: ['./submissions-filters.component.scss']
})
export class SubmissionsFiltersComponent {

  public filtersForm: FormGroup;
  @Output() onFiltersChanged = new EventEmitter<SubmissionsFilters>();

  constructor(
    fb: FormBuilder,
  ) {
    this.filtersForm = fb.nonNullable.group({
      'nameSelection': [''],
      'formSelection': [''],
    })
    
    this.filtersForm.valueChanges.pipe(debounceTime(250)).subscribe(
      v => this.onFiltersChanged.next(v)
    )
  }

  public clearFilterSelection(input: string, initial: any = []) {
    this.filtersForm.get(input)!.setValue(initial)
  }
}
