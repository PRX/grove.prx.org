import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { InventoryService } from '../../../core';
import * as inventoryActions from '../actions/inventory-action.creator';

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
      switchMap(action => this.inventoryService.loadInventoryTargets(action.inventoryId)),
      map(doc => inventoryActions.InventoryTargetsLoadSuccess({ doc })),
      catchError(error => of(inventoryActions.InventoryTargetsLoadFailure({ error })))
    )
  );

  constructor(private actions$: Actions<inventoryActions.InventoryActions>, private inventoryService: InventoryService) {}
}
