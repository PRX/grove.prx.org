import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'geoTargets' })
export class GeoTargetsPipe implements PipeTransform {
  transform(value: any) {
    if (Array.isArray(value)) {
      return value.map((v: any) => this.transform(v)).join(', ');
    } else if (value) {
      let target: string;
      switch (value.type) {
        case 'country':
          target = value.code;
          break;
        case 'subdiv':
        case 'metro':
          target = value.label;
          break;
        // ignore other target types
        default:
          break;
      }
      if (target && value.exclude) {
        target += ' (excluded)';
      }
      return target;
    } else {
      return '';
    }
  }
}
