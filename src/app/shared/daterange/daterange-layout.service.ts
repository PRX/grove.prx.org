import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DateRangeLayoutService {
  createdAt: Date;

  constructor() {
    this.createdAt = new Date();
  }

  private layoutWidthSource = new Subject<number>();
  private layoutHeightSource = new Subject<number>();

  layoutWidth$ = this.layoutWidthSource.asObservable();
  layoutHeight$ = this.layoutHeightSource.asObservable();

  getCreatedAt() {
    return this.createdAt;
  }

  announceWidth(width: number) {
    console.log('Announcing width: ', width);
    this.layoutWidthSource.next(width);
  }

  announceHeight(height: number) {
    console.log('Announcing height: ', height);
    this.layoutHeightSource.next(height);
  }
}