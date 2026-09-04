import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'firstUpper', standalone: true})
export class FirstUpperPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
