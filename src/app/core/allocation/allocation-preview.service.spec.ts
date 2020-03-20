import { AllocationPreviewService } from './allocation-preview.service';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('AllocationPreviewService', () => {
  const augury = new MockHalService();
  const auguryService = new AuguryService(augury as any);
  const allocationPreviewService = new AllocationPreviewService(auguryService);
  const allocationPreviewFixture = {
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
  const allocationPreview = new MockHalDoc(allocationPreviewFixture);

  beforeEach(() => {
    augury.mock('prx:flight-allocation-preview', allocationPreviewFixture);
    augury.mock('prx:flight', { id: 1 }).mock('preview', allocationPreviewFixture);
  });

  it('gets allocation preview for unsaved flights', done => {
    allocationPreviewService
      .getAllocationPreview({
        id: undefined,
        startAt: '2019-10-01',
        endAt: '2019-11;01',
        name: 'flight 1',
        set_inventory_uri: '/some/url',
        zones: ['pre_1'],
        totalGoal: 999,
        dailyMinimum: 90
      })
      .subscribe(alloc => {
        const { startAt, endAt, dailyMinimum, totalGoal, zones } = allocationPreview as any;
        expect(alloc).toMatchObject({ startAt, endAt, dailyMinimum, totalGoal, zones });
        done();
      });
  });

  it('gets allocation preview for saved flights', done => {
    jest.spyOn(auguryService, 'follow');
    allocationPreviewService
      .getAllocationPreview({
        id: 1,
        startAt: '2019-10-01',
        endAt: '2019-11;01',
        name: 'flight 1',
        set_inventory_uri: '/some/url',
        zones: ['pre_1'],
        totalGoal: 999,
        dailyMinimum: 90
      })
      .subscribe(() => {
        expect(auguryService.follow).toHaveBeenCalledWith('prx:flight', { id: 1 });
        done();
      });
  });
});
