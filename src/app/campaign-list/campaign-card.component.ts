import { Component, Input } from '@angular/core';
import { Campaign } from './campaign-list.service';

@Component({
  selector: 'grove-campaign-card',
  template: `
    <div class="header {{campaign.status}}"></div>
    <section>
      <div>{{campaign.flights | campaignFlightDates}}</div>
      <div class="advertiser">
        <a routerLink="{{'/campaign/' + campaign.id}}">{{campaign.advertiser}}</a>
      </div>
      <div>
        <span class="status {{campaign.status}}">{{campaign.status}}</span>
        {{campaign.type | campaignType}}
      </div>
      <div *ngIf="campaign.flights | campaignFlightTargets as targets">
        <prx-icon size="1em" name="globe"></prx-icon>
        {{targets}}
      </div>
      <div>{{campaign.flights | campaignFlightZones}}</div>
    </section>
  `,
  styleUrls: ['campaign-card.component.scss']
})
export class CampaignCardComponent {
  @Input() campaign: Campaign;
}
