import { Pipe, PipeTransform } from '@angular/core';

export const largeNumberFormat = (value: any, defaultVal?: any) => {
  if (value !== undefined && value !== null && value !== false && !isNaN(value)) {
    return Number(value).toLocaleString(undefined, { useGrouping: true });
  } else if (defaultVal) {
    return defaultVal;
  }
};

@Pipe({ name: 'largeNumber' })
export class LargeNumberPipe implements PipeTransform {
  transform(value: number, defaultVal?: any) {
    return largeNumberFormat(value, defaultVal);
  }
}
