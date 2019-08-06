import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'grove-campaign-list-paging',
  template: `
    <div class="paging-container">
      <button class="pager"
        [disabled]="isPageActive(1)"
        (click)="!isPageActive(1) && showPage.emit(1)"
        title="Page 1">|«</button>
      <button class="pager"
        [disabled]="isPageActive(1)"
        (click)="!isPageActive(1) && showPage.emit(currentPage - 1)"
        title="Page {{ currentPage > 1 ? currentPage - 1 : 1 }}">«</button>

      <button
        *ngFor="let x of ' '.repeat(totalPages).split(''), let i = index"
        class="pager" [class.active]="isPageActive(i + 1)"
        [disabled]="isPageActive(i + 1)"
        (click)="!isPageActive(i + 1) && showPage.emit(i + 1)"
        title="Page {{i + 1}}">1</button>

      <button class="pager"
        [disabled]="isPageActive(totalPages)"
        (click)="!isPageActive(totalPages) && showPage.emit(currentPage + 1)"
        title="Page {{ currentPage + 1 < totalPages ? currentPage + 1 : totalPages }}">»</button>
      <button class="pager"
        [disabled]="isPageActive(totalPages)"
        (click)="!isPageActive(totalPages) && showPage.emit(totalPages)"
        title="Page {{ totalPages }}">»|</button>
    </div>
  `,
  styleUrls: ['campaign-list-paging.component.css']
})
export class CampaignListPagingComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() showPage = new EventEmitter<number>();

  isPageActive(page: number): boolean {
    return this.currentPage === page;
  }

}
