import { Component, Input } from '@angular/core';

@Component({
  selector: 'grove-daterange-overlay',
  template: `<div class="daterange-overlay" [style.display]="display ? 'block' : 'none'"></div>`,
  styles: [
    `
    .daterange-overlay {
      width:100vw;
      height: 100vh;
      top: 0;
      left: 0;
      position: fixed;
      background: rgba(0,0,0,0.3);
      pointer-events: none;
    }
    `
  ]
})
export class DaterangeOverlayComponent {
  @Input() display: boolean;
  constructor() {}
}
