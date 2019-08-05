import { Component, OnInit, Input } from '@angular/core';
import { CampaignModel } from '../shared/model/campaign.model';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status [campaign]="campaign"></grove-campaign-status>

    <prx-tabs [model]="campaign">
      <nav>
        <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" [routerLink]="base">Campaign Meta Data</a>
        <a routerLinkActive="active" [routerLink]="[base, 'flights']">Flight 1</a>
      </nav>
    </prx-tabs>
  `
})
export class CampaignComponent implements OnInit {
  @Input() id: number;
  @Input() campaign: CampaignModel;
  base: string;

  ngOnInit() {
    this.base = '/campaign/' + (this.id || 'new');
  }

}
