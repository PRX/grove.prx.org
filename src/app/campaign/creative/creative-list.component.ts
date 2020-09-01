import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, withLatestFrom, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Creative, CreativeParams } from '../store/models';
import {
  selectCreativesOrderedByCreatedAt,
  selectCampaignId,
  selectRoutedFlightId,
  selectRoutedFlightZoneId,
  selectCreativeParams,
  selectCreativeTotal
} from '../store/selectors';
import * as campaignActions from '../store/actions/campaign-action.creator';
import * as creativeActions from '../store/actions/creative-action.creator';

@Component({
  template: `
    <mat-toolbar color="primary">
      <mat-toolbar-row>
        <mat-icon>attach_file</mat-icon>
        <h2>Add Existing Creative</h2>
        <button mat-button aria-label="cancel" (click)="onCancel()"><mat-icon>clear</mat-icon></button>
      </mat-toolbar-row>
    </mat-toolbar>
    <section>
      <h3>Filter Creatives</h3>
      <mat-form-field appearance="outline">
        <input matInput type="text" placeholder="Search by filename" (keyup)="onSearch($event.target.value)" />
      </mat-form-field>
      <h3>Add Creative</h3>
      <mat-selection-list (selectionChange)="onAdd($event.option.value)" multiple="">
        <mat-list-option
          *ngFor="let creative of creativeList$ | async"
          checkboxPosition="before"
          [value]="creative"
          [title]="creative.filename"
        >
          <h4 matLine>{{ creative.filename }}</h4>
          <p matLine>
            <span class="advertiser">{{ creative.advertiser?.name }}</span>
            <span class="uploaded">Uploaded {{ creative.createdAt | date: 'MM/dd/yyyy':'UTC' }}</span>
          </p>
        </mat-list-option>
      </mat-selection-list>
      <mat-paginator
        *ngIf="creativeParams$ | async as params"
        [length]="creativeTotal$ | async"
        [pageIndex]="params.page - 1"
        [pageSize]="params.per"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPage({ page: $event.pageIndex + 1, per: $event.pageSize })"
      ></mat-paginator>
    </section>
  `,
  styleUrls: ['./creative-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeListComponent implements OnInit, OnDestroy {
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  zoneId$: Observable<string>;
  creativeList$: Observable<Creative[]>;
  creativeParams$: Observable<CreativeParams>;
  creativeTotal$: Observable<number>;
  searchStream = new Subject<string>();
  searchSubcription: Subscription;

  constructor(private store: Store<any>, private router: Router) {}

  ngOnInit() {
    this.creativeList$ = this.store.pipe(select(selectCreativesOrderedByCreatedAt));
    this.creativeParams$ = this.store.pipe(select(selectCreativeParams));
    this.creativeTotal$ = this.store.pipe(select(selectCreativeTotal));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));
    this.zoneId$ = this.store.pipe(select(selectRoutedFlightZoneId));
    this.store.dispatch(creativeActions.CreativeLoadList({}));

    this.searchSubcription = this.searchStream
      .pipe(
        // binding the input to what the user has typed rather than what gets thru
        // tap(value => this._inputValue = value),
        // value must be > 2 chars or empty for clearing search
        filter(value => value.length > 2 || value === ''),
        // are they done typing?
        debounceTime(300),
        // only if changed
        distinctUntilChanged()
      )
      .subscribe(text => this.store.dispatch(creativeActions.CreativeLoadList({ params: { text } })));
  }

  ngOnDestroy() {
    if (this.searchSubcription) {
      this.searchSubcription.unsubscribe();
    }
  }

  onSearch(text: string) {
    this.searchStream.next(text);
  }

  onPage({ page, per }: { page: number; per: number }) {
    this.store.dispatch(creativeActions.CreativeLoadList({ params: { page, per } }));
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
