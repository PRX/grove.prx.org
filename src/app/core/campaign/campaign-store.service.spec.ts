import { Store } from '@ngrx/store';
import { CampaignStoreService } from './campaign-store.service';
import { Availability } from './campaign.models';
import { AllocationPreview } from '../../campaign/store/models';
import { InventoryService } from '../inventory/inventory.service';
import { of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import {
  createCampaignStoreState,
  flightFixture,
  createAllocationPreviewState,
  allocationPreviewFixture
} from '../../campaign/store/models/campaign-state.factory';

describe('CampaignStoreService', () => {
  let store: Store<any>;
  let campaignStoreService: CampaignStoreService;
  let inventoryService: InventoryService;
  let availabilityFixture: Availability;

  beforeEach(() => {
    inventoryService = {
      getInventoryAvailability: jest.fn(() => of(availabilityFixture))
    } as any;
    store = of({ router: { state: { params: { flightId: flightFixture.id } } }, campaignState: createCampaignStoreState() }) as any;

    campaignStoreService = new CampaignStoreService(store, inventoryService);

    availabilityFixture = {
      zone: 'pre_1',
      totals: {
        startDate: '2019-10-01',
        endDate: '2019-11-01',
        groups: [
          { allocated: 0, availability: 1, startDate: '2019-10-01', endDate: '2019-10-01' },
          { allocated: 0, availability: 0, startDate: '2019-10-02', endDate: '2019-10-02' },
          { allocated: 0, availability: 9858, startDate: '2019-10-03', endDate: '2019-10-03' },
          { allocated: 0, availability: 5305, startDate: '2019-10-04', endDate: '2019-10-04' },
          { allocated: 0, availability: 2387, startDate: '2019-10-05', endDate: '2019-10-05' },
          { allocated: 0, availability: 1339, startDate: '2019-10-06', endDate: '2019-10-06' },
          { allocated: 0, availability: 709, startDate: '2019-10-07', endDate: '2019-10-07' },
          { allocated: 0, availability: 357, startDate: '2019-10-08', endDate: '2019-10-08' },
          { allocated: 0, availability: 158, startDate: '2019-10-09', endDate: '2019-10-09' },
          { allocated: 0, availability: 85, startDate: '2019-10-10', endDate: '2019-10-10' },
          { allocated: 0, availability: 48, startDate: '2019-10-11', endDate: '2019-10-11' },
          { allocated: 0, availability: 19, startDate: '2019-10-12', endDate: '2019-10-12' },
          { allocated: 0, availability: 8, startDate: '2019-10-13', endDate: '2019-10-13' },
          { allocated: 0, availability: 4, startDate: '2019-10-14', endDate: '2019-10-14' },
          { allocated: 0, availability: 1, startDate: '2019-10-15', endDate: '2019-10-15' },
          { allocated: 0, availability: 10812, startDate: '2019-10-16', endDate: '2019-10-16' },
          { allocated: 0, availability: 5299, startDate: '2019-10-17', endDate: '2019-10-17' },
          { allocated: 0, availability: 2527, startDate: '2019-10-18', endDate: '2019-10-18' },
          { allocated: 0, availability: 1393, startDate: '2019-10-19', endDate: '2019-10-19' },
          { allocated: 0, availability: 722, startDate: '2019-10-20', endDate: '2019-10-20' },
          { allocated: 0, availability: 430, startDate: '2019-10-21', endDate: '2019-10-21' },
          { allocated: 0, availability: 237, startDate: '2019-10-22', endDate: '2019-10-22' },
          { allocated: 0, availability: 97, startDate: '2019-10-23', endDate: '2019-10-23' },
          { allocated: 0, availability: 10333, startDate: '2019-10-24', endDate: '2019-10-24' },
          { allocated: 0, availability: 6174, startDate: '2019-10-25', endDate: '2019-10-25' },
          { allocated: 0, availability: 3567, startDate: '2019-10-26', endDate: '2019-10-26' },
          { allocated: 0, availability: 1691, startDate: '2019-10-27', endDate: '2019-10-27' },
          { allocated: 0, availability: 765, startDate: '2019-10-28', endDate: '2019-10-28' },
          { allocated: 0, availability: 403, startDate: '2019-10-29', endDate: '2019-10-29' },
          { allocated: 0, availability: 182, startDate: '2019-10-30', endDate: '2019-10-30' },
          { allocated: 0, availability: 91, startDate: '2019-10-31', endDate: '2019-10-31' }
        ]
      }
    };
  });

  it('loads availability', done => {
    campaignStoreService.loadAvailability(flightFixture).subscribe(availabilty => {
      expect(availabilty.length).toEqual(flightFixture.zones.length);
      expect(availabilty[0].zone).toEqual(flightFixture.zones[0]);
      expect(availabilty[0].totals.groups.length).toEqual(availabilityFixture.totals.groups.length);
      done();
    });
  });

  it('rolls up into weekly availability and includes allocation preview', done => {
    campaignStoreService
      .loadAvailability(flightFixture)
      .pipe(
        withLatestFrom(of(createAllocationPreviewState().allocationPreview.entities)),
        withLatestFrom(campaignStoreService.getFlightAvailabilityRollup$())
      )
      .subscribe(([_, rollup]) => {
        expect(rollup.length).toEqual(flightFixture.zones.length);
        expect(rollup[0].totals.groups[0].startDate).toEqual(availabilityFixture.totals.groups[0].startDate);
        expect(new Date(rollup[0].totals.groups[0].endDate).getDay()).toEqual(6);
        expect(rollup[0].totals.allocationPreview).toEqual(allocationPreviewFixture.reduce((acc, alloc) => (acc += alloc.goalCount), 0));
        done();
      });
  });

  it('gets flight availability weekly rollup', done => {
    campaignStoreService.loadAvailability(flightFixture);
    campaignStoreService.getFlightAvailabilityRollup$().subscribe(rollup => {
      expect(rollup.length).toEqual(flightFixture.zones.length);
      expect(rollup[0].zone).toEqual(flightFixture.zones[0]);
      expect(rollup[0].totals.startDate).toEqual(availabilityFixture.totals.startDate);
      expect(rollup[0].totals.endDate).toEqual(availabilityFixture.totals.endDate);
      expect(rollup[0].totals.groups.length).toBeGreaterThanOrEqual(availabilityFixture.totals.groups.length / 7);
      expect(new Date(rollup[0].totals.groups[1].startDate + ' 0:0:0').getDay()).toEqual(0);
      done();
    });
  });
});
