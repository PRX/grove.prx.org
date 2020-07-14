import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { selectError } from './store/selectors';
import * as campaignActions from './store/actions/campaign-action.creator';

@Injectable()
export class CampaignErrorService implements OnDestroy {
  errorSub: Subscription;

  constructor(private snackBar: MatSnackBar, private store: Store<any>) {
    this.errorSub = this.store.pipe(select(selectError)).subscribe(this.onCampaignError.bind(this));
  }

  onCampaignError(error: any) {
    if (error) {
      this.snackBar
        .open(error, 'Dismiss')
        .onAction()
        .pipe(take(1))
        .subscribe(() => this.onDismissError());
    }
  }

  onDismissError() {
    this.store.dispatch(campaignActions.CampaignDismissError());
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
    this.onDismissError();
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
  }
}
