import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'campaignType'
})
export class CampaignTypePipe implements PipeTransform {
  transform(type: string): string {
    switch (type) {
      case 'paid_campaign':
        return 'Paid Campaign';
      case 'cross_promo':
        return 'Cross Promo';
      case 'cross_promo_special':
        return 'Cross Promo Special';
      case 'event':
        return 'Event';
      case 'fundraiser':
        return 'Fundraiser';
      case 'house':
        return 'House';
      case 'survey':
        return 'Survey';
      default:
        return '';
    }
  }
}
