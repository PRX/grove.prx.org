import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-prx-styleguide';
import * as creativeActions from '../actions/creative-action.creator';
import { CreativeService } from '../../../core';

@Injectable()
export class CreativeEffects {
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
      mergeMap(action => {
        const save = action.creativeDoc
          ? this.creativeService.updateCreative(action.creativeDoc, action.creative)
          : this.creativeService.createCreative(action.creative);
        return save.pipe(
          map(creativeDoc => creativeActions.CreativeSaveSuccess({ creativeDoc })),
          tap(_ => this.toastr.success('Creative saved')),
          catchError(error => of(creativeActions.CreativeSaveFailure({ error })))
        );
      })
    )
  );

  creativeLoadList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeLoadList),
      mergeMap(_ =>
        this.creativeService.loadCreativeList().pipe(
          map(creativeDocs => creativeActions.CreativeLoadListSuccess({ creativeDocs })),
          catchError(error => of(creativeActions.CreativeLoadListFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions<creativeActions.CreativeActions>,
    private creativeService: CreativeService,
    private toastr: ToastrService
  ) {}
}
