import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Campaign } from '../dashboard.service';

@Component({
  selector: 'grove-campaign-card',
  template: `
    <section class="{{ campaign?.status }}" *ngIf="campaign">
      <header>
        {{ campaign.flights | campaignFlightDates }}
        <a routerLink="/campaign/new" [state]="duplicateCampaignState" title="Dupicate Campaign"><mat-icon>file_copy</mat-icon></a>
      </header>
      <div class="content">
        <h3>
          <a routerLink="{{ '/campaign/' + campaign.id }}">
            {{ campaign.advertiser && campaign.advertiser.label }}
          </a>
        </h3>
        <div>
          <span class="status {{ campaign.status }}">{{ campaign.status | titlecase }}</span>
          {{ campaign.type | titlecase }}
        </div>
        <div *ngIf="campaign.flights | campaignFlightTargets as targets">
          <prx-icon size="1em" name="globe-americas"></prx-icon>
          {{ targets }}
        </div>
        <div>{{ campaign.flights | campaignFlightZones }}</div>
      </div>
      <footer>
        <div class="progress-ind" [style.width]="progressPercent"></div>
        <p class="progress">{{ campaign.actualCount | largeNumber }} / {{ campaign.totalGoal | campaignCardAbbrevNumber }}</p>
        <p>Inventory Served</p>
      </footer>
    </section>
    <section class="loading" *ngIf="!campaign">
      <prx-spinner></prx-spinner>
    </section>
  `,
  styleUrls: ['campaign-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignCardComponent {
  @Input() campaign: Campaign;

  get progressPercent() {
    return Math.min(1, this.campaign.actualCount / this.campaign.totalGoal) * 100 + '%';
  }

  get duplicateCampaignState(): { id: number } {
    return { id: this.campaign.id };
  }
}
