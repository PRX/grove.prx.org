import { TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { AllocationPreviewActionService } from './allocation-preview-action.service';
import { allocationPreviewParamsFixture, flightFixture } from '../models/campaign-state.factory';
import * as actions from './allocation-preview-action.creator';

describe('AllocationPreviewActionService', () => {
  let store: Store<any>;
  let service: AllocationPreviewActionService;
  let dispatchSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [AllocationPreviewActionService]
    });
    service = TestBed.get(AllocationPreviewActionService);
    store = TestBed.get(Store);

    dispatchSpy = jest.spyOn(store, 'dispatch');
  });

  it('should dispatch action to load allocation preview', () => {
    const { flightId, name, startAt, endAt, totalGoal, dailyMinimum, zones } = allocationPreviewParamsFixture;
    const { set_inventory_uri } = flightFixture;
    service.loadAllocationPreview(flightId, set_inventory_uri, name, startAt, endAt, totalGoal, dailyMinimum, zones);
    expect(dispatchSpy).toHaveBeenCalledWith(
      new actions.AllocationPreviewLoad({ flightId, set_inventory_uri, name, startAt, endAt, totalGoal, dailyMinimum, zones })
    );
  });
});
