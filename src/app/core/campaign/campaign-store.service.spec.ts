import { Store } from '@ngrx/store';
import { CampaignStoreService } from './campaign-store.service';
import { Availability, Allocation, AllocationPreview } from './campaign.models';
import { InventoryService } from '../inventory/inventory.service';
import { AllocationPreviewService } from '../allocation/allocation-preview.service';
import { of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { createCampaignStoreState, flightFixture } from '../../campaign/store/reducers/campaign-state.factory';

describe('CampaignStoreService', () => {
  let store: Store<any>;
  let campaignStoreService: CampaignStoreService;
  let inventoryService: InventoryService;
  let allocationPreviewService: AllocationPreviewService;
  let availabilityFixture: Availability;
  let allocationPreviewFixture: AllocationPreview;

  beforeEach(() => {
    inventoryService = {
      getInventoryAvailability: jest.fn(flight => of(availabilityFixture))
    } as any;
    allocationPreviewService = {
      getAllocationPreview: jest.fn(flight => of(allocationPreviewFixture))
    } as any;
    store = of({ router: { state: { params: { flightId: flightFixture.id } } }, campaignState: createCampaignStoreState() }) as any;

    campaignStoreService = new CampaignStoreService(store, inventoryService, allocationPreviewService);

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
    allocationPreviewFixture = {
      startAt: '2019-10-01',
      endAt: '2019-11-01',
      name: 'New Flight 1',
      zones: ['pre_1'],
      dailyMinimum: 90,
      totalGoal: 999,
      allocations: [
        { goalCount: 28, inventoryDayId: 6553, date: '2019-10-01', zoneName: 'pre_1' },
        { goalCount: 16, inventoryDayId: 6560, date: '2019-10-02', zoneName: 'pre_1' },
        { goalCount: 8, inventoryDayId: 6567, date: '2019-10-03', zoneName: 'pre_1' },
        { goalCount: 4, inventoryDayId: 6574, date: '2019-10-04', zoneName: 'pre_1' },
        { goalCount: 3, inventoryDayId: 6581, date: '2019-10-05', zoneName: 'pre_1' },
        { goalCount: 184, inventoryDayId: 6588, date: '2019-10-06', zoneName: 'pre_1' },
        { goalCount: 85, inventoryDayId: 6595, date: '2019-10-07', zoneName: 'pre_1' },
        { goalCount: 36, inventoryDayId: 6602, date: '2019-10-08', zoneName: 'pre_1' },
        { goalCount: 20, inventoryDayId: 6609, date: '2019-10-09', zoneName: 'pre_1' },
        { goalCount: 9, inventoryDayId: 6616, date: '2019-10-10', zoneName: 'pre_1' },
        { goalCount: 4, inventoryDayId: 6623, date: '2019-10-11', zoneName: 'pre_1' },
        { goalCount: 2, inventoryDayId: 6630, date: '2019-10-12', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6637, date: '2019-10-13', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6644, date: '2019-10-14', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6651, date: '2019-10-15', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6658, date: '2019-10-16', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6665, date: '2019-10-17', zoneName: 'pre_1' },
        { goalCount: 163, inventoryDayId: 6672, date: '2019-10-18', zoneName: 'pre_1' },
        { goalCount: 82, inventoryDayId: 6679, date: '2019-10-19', zoneName: 'pre_1' },
        { goalCount: 33, inventoryDayId: 6686, date: '2019-10-20', zoneName: 'pre_1' },
        { goalCount: 15, inventoryDayId: 6693, date: '2019-10-21', zoneName: 'pre_1' },
        { goalCount: 7, inventoryDayId: 6700, date: '2019-10-22', zoneName: 'pre_1' },
        { goalCount: 4, inventoryDayId: 6707, date: '2019-10-23', zoneName: 'pre_1' },
        { goalCount: 2, inventoryDayId: 6714, date: '2019-10-24', zoneName: 'pre_1' },
        { goalCount: 164, inventoryDayId: 6721, date: '2019-10-25', zoneName: 'pre_1' },
        { goalCount: 71, inventoryDayId: 6728, date: '2019-10-26', zoneName: 'pre_1' },
        { goalCount: 29, inventoryDayId: 6735, date: '2019-10-27', zoneName: 'pre_1' },
        { goalCount: 14, inventoryDayId: 6742, date: '2019-10-28', zoneName: 'pre_1' },
        { goalCount: 7, inventoryDayId: 6749, date: '2019-10-29', zoneName: 'pre_1' },
        { goalCount: 3, inventoryDayId: 6756, date: '2019-10-30', zoneName: 'pre_1' },
        { goalCount: 1, inventoryDayId: 6763, date: '2019-10-31', zoneName: 'pre_1' }
      ]
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

  it('loads allocation preview and transforms it into state entities keyed by flight id', done => {
    campaignStoreService
      .loadAllocationPreview(flightFixture, 90)
      .pipe(withLatestFrom(campaignStoreService.state$))
      .subscribe(([allocationPreview, state]) => {
        expect(allocationPreview.dailyMinimum).toEqual(90);
        expect(state.allocationPreview[flightFixture.id]).toBeDefined();
        expect(state.allocationPreview[flightFixture.id][flightFixture.zones[0]]).toBeDefined();
        expect(state.allocationPreview[flightFixture.id][flightFixture.zones[0]].zones.length).toEqual(1);
        expect(state.allocationPreview[flightFixture.id][flightFixture.zones[0]].allocations).toMatchObject(
          (allocationPreviewFixture.allocations as Allocation[]).reduce((acc, alloc) => ({ ...acc, [alloc.date]: alloc }), {})
        );
        done();
      });
  });

  it('rolls up into weekly availability and includes allocation preview', done => {
    campaignStoreService
      .loadAvailability(flightFixture)
      .pipe(
        withLatestFrom(campaignStoreService.loadAllocationPreview(flightFixture, 90)),
        withLatestFrom(campaignStoreService.getFlightAvailabilityRollup$())
      )
      .subscribe(([_, rollup]) => {
        expect(rollup.length).toEqual(flightFixture.zones.length);
        expect(rollup[0].totals.groups[0].startDate).toEqual(availabilityFixture.totals.groups[0].startDate);
        expect(new Date(rollup[0].totals.groups[0].endDate).getDay()).toEqual(6);
        expect(rollup[0].totals.allocationPreview).toEqual(
          (allocationPreviewFixture.allocations as Allocation[]).reduce((acc, alloc) => (acc += alloc.goalCount), 0)
        );
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
