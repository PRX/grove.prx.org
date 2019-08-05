import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-prx-styleguide';
import { CampaignModel } from '../shared/model/campaign.model';
import { CampaignService } from './campaign.service';

@Component({
  selector: 'grove-campaign-status',
  template: `
    <prx-status-bar prxSticky="all" class="status_bar">
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>{{ !campaign?.id ? 'Create' : 'Edit' }} Campaign</prx-status-bar-text>
      <prx-status-bar-text italic stretch>
        {{campaign?.name || '(Untitled)'}}
      </prx-status-bar-text>
      <prx-button [model]="campaign" dropdown="1" (click)="save()">
        Save
        <div class="dropdown-menu-items">
          <prx-button>Sub-menu</prx-button>
        </div>
      </prx-button>
    </prx-status-bar>
  `
})
export class CampaignStatusComponent {
  @Input() campaign: CampaignModel;

  constructor(private router: Router,
              private campaignService: CampaignService,
              private toastr: ToastrService) {}

  save() {
    const wasNew = this.campaign.isNew;
    this.campaignService.save(this.campaign).subscribe(() => {
      this.toastr.success('Campaign saved');
      if (wasNew) {
        this.router.navigate(['/campaign', this.campaign.id]);
      }
    });
  }

}
