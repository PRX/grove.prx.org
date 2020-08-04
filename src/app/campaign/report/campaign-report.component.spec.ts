import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CampaignReportComponent } from './campaign-report.component';
import moment from 'Moment';
import { Flight } from '../store/models';
import { campaignFixture, flightFixture } from '../store/models/campaign-state.factory';

describe('CampaignReportComponent', () => {
  let comp: CampaignReportComponent;
  let fix: ComponentFixture<CampaignReportComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignReportComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignReportComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        comp.campaignName = campaignFixture.name;
        comp.flights = [{ localFlight: flightFixture, remoteFlight: flightFixture, changed: true, valid: true }];
        fix.detectChanges();
      });
  }));

  it('should get the flights min/max contract start and end dates', () => {
    expect(
      comp.getFlightDates([
        { contractStartAt: moment.utc('2020-01-15'), contractEndAtFudged: moment.utc('2020-02-01') } as Flight,
        { contractStartAt: moment.utc('2020-01-01'), contractEndAtFudged: moment.utc('2020-03-01') } as Flight,
        { contractStartAt: moment.utc('2020-02-01'), contractEndAtFudged: moment.utc('2020-03-15') } as Flight
      ])
    ).toEqual({ startAt: new Date('2020-01-01'), endAt: new Date('2020-03-15') });
    expect(comp.getFlightDates([{ contractStartAt: moment.utc('2020-01-15') } as Flight, {} as Flight])).toEqual({
      startAt: new Date('2020-01-15'),
      endAt: null
    });
    expect(comp.getFlightDates([{ contractEndAtFudged: moment.utc('2020-03-15') } as Flight, {} as Flight])).toEqual({
      startAt: null,
      endAt: new Date('2020-03-15')
    });
  });

  it('should set the filename in the download link', () => {
    const link = de.query(By.css('a'));
    expect(link.nativeElement.getAttribute('download')).toContain(comp.campaignName);
  });

  it('should have the data in downloadable CSV report format', () => {
    comp.reportData = [
      ['converts', 'any'],
      ['data', 'into'],
      ['CSV', 'report', 'format'],
      [0, 1, 2, 3, 4, 5]
    ];
    fix.detectChanges();
    expect(Object.values(comp.reportDataCsv)[0]).toContain('0,1,2,3,4,5');
  });
});
