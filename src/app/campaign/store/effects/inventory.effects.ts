import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, map, filter, tap, withLatestFrom } from 'rxjs/operators';
import { InventoryService } from '../../../core';
import { selectCurrentInventory, selectCurrentInventoryTargets } from '../selectors';
import * as inventoryActions from '../actions/inventory-action.creator';
import * as campaignActions from '../actions/campaign-action.creator';

@Injectable()
export class InventoryEffects {
  loadInventory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(inventoryActions.InventoryLoad),
      switchMap(() => this.inventoryService.loadInventory()),
      map(docs => inventoryActions.InventoryLoadSuccess({ docs })),
      catchError(error => of(inventoryActions.InventoryLoadFailure({ error })))
    )
  );

  loadInventoryTargets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(inventoryActions.InventoryTargetsLoad),
      switchMap(action => this.inventoryService.loadInventoryTargets(action.inventory)),
      map(doc => inventoryActions.InventoryTargetsLoadSuccess({ doc })),
      catchError(error => of(inventoryActions.InventoryTargetsLoadFailure({ error })))
    )
  );

  loadInventoryTargetsOnCampaignLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignLoadSuccess),
      withLatestFrom(this.store.select(selectCurrentInventoryTargets)),
      filter(targets => !targets),
      switchMap(_ => this.store.pipe(select(selectCurrentInventory))),
      map(inv => inventoryActions.InventoryTargetsLoad({ inventory: inv._doc }))
    )
  );

  loadInventoryTargetsOnFormChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignFlightFormUpdate),
      withLatestFrom(this.store.select(selectCurrentInventoryTargets)),
      filter(targets => !targets),
      switchMap(_ => this.store.pipe(select(selectCurrentInventory))),
      map(inv => inventoryActions.InventoryTargetsLoad({ inventory: inv._doc }))
    )
  );

  constructor(
    private actions$: Actions<inventoryActions.InventoryActions | campaignActions.CampaignActions>,
    private inventoryService: InventoryService,
    private store: Store<any>
  ) {}
}
