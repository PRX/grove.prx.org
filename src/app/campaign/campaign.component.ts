import { Component, Input } from '@angular/core';
import { CampaignModel } from '../shared/model/campaign.model';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status [campaign]="campaign"></grove-campaign-status>

    <prx-tabs [model]="campaign">
      <nav>
        <a routerLinkActive="active"
          [routerLinkActiveOptions]="{exact:true}"
          [routerLink]="['/campaign/', (campaign?.id || 'new')]">Campaign Meta Data</a>
        <a *ngFor="let flight of flights"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact:true}"
          [routerLink]="['/campaign/', campaign.id, 'flight', flight.id]">{{flight.name}}</a>
      </nav>

      <div class="links" *ngIf="campaign && !campaign?.isNew">
        <a [routerLink]="['/campaign/', campaign.id, 'flight', 'new']">+ Add a Flight</a>
      </div>
    </prx-tabs>
  `
})
export class CampaignComponent {
  @Input() id: number;
  @Input() campaign: CampaignModel;

  get flights() {
    return this.campaign && this.campaign.flights && this.campaign.flights.filter(f => !f.isNew);
  }
}
