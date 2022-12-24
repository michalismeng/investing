import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'wordize'})
export class WordizePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').trim()
  }
}