import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Campaign } from '../../core';

@Component({
  selector: 'grove-campaign-status',
  template: `
    <prx-status-bar>
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>Edit Campaign</prx-status-bar-text>
      <prx-status-bar-text italic stretch>{{ campaign?.name }}</prx-status-bar-text>
      <prx-button [working]="isWorking" [disabled]="!isValid || !isChanged" (click)="onSave()">Save</prx-button>
    </prx-status-bar>
  `,
  styleUrls: ['./campaign-status.component.scss']
})
export class CampaignStatusComponent {
  @Input() campaign: Campaign;
  @Input() isChanged: boolean;
  @Input() isValid: boolean;
  @Input() isSaving: boolean;
  @Output() save = new EventEmitter();

  onSave() {
    this.save.emit();
  }
}
