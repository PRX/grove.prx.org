import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Observable } from 'rxjs';
import { HalHttpError } from 'ngx-prx-styleguide';
import { InventoryService } from '../../../core';
import * as inventoryActions from '../actions/inventory-action.creator';
import { InventoryEffects } from './inventory.effects';
import { inventoryDocsFixture, inventoryTargetsDocFixture } from '../models/campaign-state.factory';

describe('InventoryEffects', () => {
  let effects: InventoryEffects;
  let actions$ = new Observable<Action>();
  let service: InventoryService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {},
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        EffectsModule.forRoot([InventoryEffects])
      ],
      providers: [
        InventoryEffects,
        {
          provide: InventoryService,
          useValue: {
            loadInventory: jest.fn(() => of(inventoryDocsFixture)),
            loadInventoryTargets: jest.fn(() => of(inventoryTargetsDocFixture))
          }
        },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(InventoryEffects);
    service = TestBed.inject(InventoryService);
  }));

  it('loads inventory', () => {
    const success = inventoryActions.InventoryLoadSuccess({ docs: inventoryDocsFixture });

    actions$ = hot('-a', { a: inventoryActions.InventoryLoad() });
    const expected = cold('-r', { r: success });
    expect(effects.loadInventory$).toBeObservable(expected);
  });

  it('fails to load inventory', () => {
    const error = new HalHttpError(500, 'error occurred');
    service.loadInventory = jest.fn(() => cold('#', {}, error));

    const outcome = inventoryActions.InventoryLoadFailure({ error });
    actions$ = hot('-a', { a: inventoryActions.InventoryLoad() });
    const expected = cold('-(b|)', { b: outcome });
    expect(effects.loadInventory$).toBeObservable(expected);
  });

  it('loads inventory targets', () => {
    const success = inventoryActions.InventoryTargetsLoadSuccess({ doc: inventoryTargetsDocFixture });

    actions$ = hot('-a', { a: inventoryActions.InventoryTargetsLoad({ inventory: 1 }) });
    const expected = cold('-r', { r: success });
    expect(effects.loadInventoryTargets$).toBeObservable(expected);
  });

  it('fails to load inventory targets', () => {
    const error = new HalHttpError(500, 'error occurred');
    service.loadInventoryTargets = jest.fn(() => cold('#', {}, error));

    const outcome = inventoryActions.InventoryTargetsLoadFailure({ error });
    actions$ = hot('-a', { a: inventoryActions.InventoryTargetsLoad({ inventory: 1 }) });
    const expected = cold('-(b|)', { b: outcome });
    expect(effects.loadInventoryTargets$).toBeObservable(expected);
  });
});
