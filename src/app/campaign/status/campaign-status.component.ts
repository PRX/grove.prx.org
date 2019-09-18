import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CampaignState } from 'src/app/core';

@Component({
  selector: 'grove-campaign-status',
  template: `
    <prx-status-bar>
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>Edit Campaign</prx-status-bar-text>
      <prx-status-bar-text italic stretch>{{ state?.localCampaign?.name }}</prx-status-bar-text>
      <prx-button [working]="isSaving" [disabled]="anyInvalid || allUnchanged" (click)="onSave()">Save</prx-button>
    </prx-status-bar>
  `,
  styleUrls: ['./campaign-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStatusComponent {
  @Input() state: CampaignState;
  @Input() isSaving: boolean;
  @Output() save = new EventEmitter();

  get anyInvalid(): boolean {
    if (this.state) {
      return !this.state.valid || Object.values(this.state.flights).some(f => !f.valid);
    } else {
      return false;
    }
  }

  get allUnchanged(): boolean {
    if (this.state) {
      return !this.state.changed && Object.values(this.state.flights).every(f => !f.changed);
    } else {
      return false;
    }
  }

  onSave() {
    this.save.emit();
  }
}
