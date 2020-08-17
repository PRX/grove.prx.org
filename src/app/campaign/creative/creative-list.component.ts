import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, withLatestFrom } from 'rxjs/operators';
import { Creative } from '../store/models';
import { selectAllCreativesOrderedByCreatedAt, selectCampaignId, selectRoutedFlightId } from '../store/selectors';
import * as creativeActions from '../store/actions/creative-action.creator';

@Component({
  template: `
    <mat-toolbar color="primary">
      <mat-toolbar-row>
        <mat-icon>attach_file</mat-icon> Add Existing Creative
        <button mat-button aria-label="cancel" (click)="onCancel()"><mat-icon>clear</mat-icon></button>
      </mat-toolbar-row>
    </mat-toolbar>
    <div *ngFor="let creative of creativeList$ | async">
      <button mat-button color="primary">{{ creative.filename }}</button>
    </div>
  `,
  styleUrls: ['./creative-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeListComponent implements OnInit {
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  creativeList$: Observable<Creative[]>;
  constructor(private store: Store<any>, private router: Router) {}

  ngOnInit() {
    this.creativeList$ = this.store.pipe(select(selectAllCreativesOrderedByCreatedAt));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));
    this.store.dispatch(creativeActions.CreativeLoadList());
  }

  onCancel() {
    this.campaignId$
      .pipe(withLatestFrom(this.flightId$), first())
      .subscribe(([campaignId, flightId]) => this.router.navigate(['/campaign', campaignId, 'flight', flightId]));
  }
}
