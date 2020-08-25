import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, withLatestFrom } from 'rxjs/operators';
import { Creative } from '../store/models';
import { selectCreativesOrderedByCreatedAt, selectCampaignId, selectRoutedFlightId, selectRoutedFlightZoneId } from '../store/selectors';
import * as campaignActions from '../store/actions/campaign-action.creator';
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
      <button mat-button color="primary" (click)="onAdd(creative)">{{ creative.filename }}</button>
    </div>
  `,
  styleUrls: ['./creative-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeListComponent implements OnInit {
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  zoneId$: Observable<string>;
  creativeList$: Observable<Creative[]>;
  constructor(private store: Store<any>, private router: Router) {}

  ngOnInit() {
    this.creativeList$ = this.store.pipe(select(selectCreativesOrderedByCreatedAt));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));
    this.zoneId$ = this.store.pipe(select(selectRoutedFlightZoneId));
    this.store.dispatch(creativeActions.CreativeLoadList());
  }

  onAdd(creative: Creative) {
    this.campaignId$.pipe(withLatestFrom(this.flightId$, this.zoneId$), first()).subscribe(([campaignId, flightId, zoneId]) => {
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
      this.store.dispatch(campaignActions.CampaignFlightZoneAddCreative({ flightId, zoneId, creative }));
    });
  }

  onCancel() {
    this.campaignId$
      .pipe(withLatestFrom(this.flightId$), first())
      .subscribe(([campaignId, flightId]) => this.router.navigate(['/campaign', campaignId, 'flight', flightId]));
  }
}
