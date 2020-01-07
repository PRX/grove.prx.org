import { Component, Inject } from '@angular/core';
import { PORTAL_DATA } from './daterange-injection';

@Component({
  selector: 'grove-datepicker-portal',
  template: `<div class="mat-datepicker-content"
    [style.width]="componentData.width + 'px'"
    [style.height]="componentData.height + 'px'">
    <h2>{{componentData.content}}</h2>
  </div>`,
  styles: [
    `
    h2 {
      text-align: center;
      font-size: 1.5em;
    }
    .mat-datepicker-content {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e3e3e3;
    }
    `
  ]
})
export class DaterangePortalComponent {
  constructor(
    @Inject(PORTAL_DATA)
    public componentData: {
      height: number;
      width: number;
      content: string;
    }) {
  }
}
