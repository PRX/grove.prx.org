import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique'
})
export class UniquePipe implements PipeTransform {
  // builds a unique set of `values[property]` where `property` is an object keyed by `key` on each of the `values`
  transform(values: any[], property: string, key: string): any[] {
    if (values) {
      const uniques = values
        .filter(value => value[property] && value[property].length)
        .reduce((final, obj) => {
          return { ...final, ...obj[property].reduce((acc, value) => ({ ...acc, [value[key]]: value }), {}) };
        }, {});
      return Object.keys(uniques).map(id => uniques[id]);
    }
  }
}
