import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'campaignCardAbbrevNumber'
})
export class CampaignCardAbbreviateNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1000) {
      return `${value}`;
    }

    const suffixes = ['K', 'M', 'B'];
    const pow = Math.floor((`${Math.round(value)}`.length - 1) / 3);
    const val = Math.round(value / Math.pow(1000, pow));
    const suffix = suffixes[pow - 1];

    return `${val}${suffix}`;
  }
}
