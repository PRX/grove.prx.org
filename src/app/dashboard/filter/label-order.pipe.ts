import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'labelOrder'
})
export class LabelOrderPipe implements PipeTransform {
  transform(options: { [label: string]: string }[], label: string) {
    if (!options) {
      return [];
    }
    return options.sort((a, b) => a[label].localeCompare(b[label]));
  }
}
