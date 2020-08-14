import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, Observable } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HalDoc, ToastrService } from 'ngx-prx-styleguide';
import * as creativeActions from '../actions/creative-action.creator';
import { CreativeService } from '../../../core';

@Injectable()
export class CampaignEffects {
  creativeLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeLoad),
      mergeMap(action => this.creativeService.loadCreative(action.id)),
      map(creativeDoc => creativeActions.CreativeLoadSuccess({ creativeDoc })),
      catchError(error => of(creativeActions.CreativeLoadFailure({ error })))
    )
  );

  creativeSave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeSave),
      mergeMap(action =>
        action.creativeDoc
          ? this.creativeService.createCreative(action.creative)
          : this.creativeService.updateCreative(action.creativeDoc, action.creative)
      ),
      map(creativeDoc => creativeActions.CreativeSaveSuccess({ creativeDoc })),
      catchError(error => of(creativeActions.CreativeSaveFailure({ error })))
    )
  );

  constructor(private actions$: Actions<creativeActions.CreativeActions>, private creativeService: CreativeService) {}
}
