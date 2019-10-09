import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared/shared.module';
import { AvailabilityComponent } from './availability.component';

describe('AvailabilityComponent', () => {
  let comp: AvailabilityComponent;
  let fix: ComponentFixture<AvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule
      ],
      declarations: [
        AvailabilityComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(AvailabilityComponent);
      comp = fix.componentInstance;
      comp.flight = {
        id: 9,
        name: 'my flight name',
        startAt: '2019-10-01',
        endAt: '2019-11-01',
        totalGoal: 999,
        zones: ['pre_1'],
        set_inventory_uri: '/some/inventory'
      };
      comp.zones = [{id: 'pre_1', label: 'Preroll 1'}];
      comp.availabilityZones = [{
        zone: 'pre_1',
        totals: {
          startDate: '2019-10-01',
          endDate: '2019-11-01',
          groups: [
            {allocated: 0, availability: 1, startDate: '2019-10-01', endDate: '2019-10-05'},
            {allocated: 0, availability: 1339, startDate: '2019-10-06', endDate: '2019-10-12'},
            {allocated: 0, availability: 8, startDate: '2019-10-13', endDate: '2019-10-19'},
            {allocated: 0, availability: 1393, startDate: '2019-10-20', endDate: '2019-10-26'},
            {allocated: 0, availability: 722, startDate: '2019-10-27', endDate: '2019-10-31'}
          ]
        }
      }];
      fix.detectChanges();
    });
  }));

  it('gets zone name', () => {
    expect(comp.getZoneName('pre_1')).toEqual('Preroll 1');
  });

  it('toggles week expanded', () => {
    comp.toggleZoneWeekExpanded('pre_1', '2019-10-06');
    expect(comp.zoneWeekExpanded['pre_1-2019-10-06']).toBeTruthy();
  });
});
