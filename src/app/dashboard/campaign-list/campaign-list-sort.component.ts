import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'grove-campaign-list-sort',
  template: `
    <input type="checkbox" class="updown-toggle" id="sort" [checked]="direction" (click)="changeDirection.emit(!direction)" />
    <label for="sort"></label>
  `
})
export class CampaignListSortComponent {
  @Input() direction: boolean;
  @Output() changeDirection = new EventEmitter<boolean>();
}
