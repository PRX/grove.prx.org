import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'zoneLabel' })
export class ZoneLabelPipe implements PipeTransform {
  transform(value: any) {
    if (Array.isArray(value)) {
      return value.map((v: any) => this.transform(v)).join(', ');
    } else if (value) {
      return value.label || value.name || value.zoneName || value.id || value;
    } else {
      return '';
    }
  }
}
