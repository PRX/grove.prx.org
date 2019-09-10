import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'campaignListTotalPages'
})
export class CampaignListTotalPagesPipe implements PipeTransform {
  transform(params: {total, per}): number {
    const plusOne =
      params.total === 0 ||
      params.total % params.per > 0 ? 1 : 0;
    return Math.floor(params.total / params.per) + plusOne;
  }
}
