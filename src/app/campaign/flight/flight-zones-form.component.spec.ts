import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { PingbackFormComponent } from './pingbacks/pingback-form.component';
import { FlightZonePingbacksFormComponent } from './pingbacks/flight-zone-pingbacks-form.component';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { FlightZone, InventoryZone } from '../store/models';

@Component({
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-zones
        #childForm
        formControlName="zones"
        [flightZones]="flightZones"
        [zoneOptions]="options"
        [isCompanion]="isCompanion"
      >
      </grove-flight-zones>
    </form>
  `
})
class ParentFormComponent {
  @ViewChild('childForm', { static: true }) childForm: FlightZonesFormComponent;
  constructor(private fb: FormBuilder) {}
  flightForm = this.fb.group({ zones: '' });
  options: InventoryZone[] = [
    { id: 'pre_1', label: 'Preroll 1' },
    { id: 'pre_2', label: 'Preroll 2' },
    { id: 'post_1', label: 'Postroll 1' }
  ];
  flightZones: FlightZone[] = [{ id: 'pre_1' }, { id: 'pre_2' }];
  isCompanion = false;
}

describe('FlightZonesFormComponent', () => {
  let parent: ParentFormComponent;
  let component: FlightZonesFormComponent;
  let fixture: ComponentFixture<ParentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
      ],
      declarations: [ParentFormComponent, FlightZonesFormComponent, FlightZonePingbacksFormComponent, PingbackFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it('sets zones from the parent form', () => {
    // adds a single empty zone if no flight zones
    parent.flightForm.setValue({ zones: [] });
    expect(component.zones.length).toEqual(1);
    parent.flightForm.setValue({ zones: [{}] });
    expect(component.zones.length).toEqual(1);
    parent.flightForm.reset({ zones: [{}, {}] });
    expect(component.zones.length).toEqual(2);
  });

  it('adds zone from the top most available option', () => {
    component.onAddZone();
    expect(component.zones.value).toEqual([
      { id: '', url: '', pingbacks: [] },
      { id: component.zoneOptions[component.flightZones.length].id, url: '', pingbacks: [] }
    ]);
  });

  it('removes zones by index', () => {
    parent.flightForm.reset({
      zones: [{ id: 'pre_1' }, { id: 'pre_2' }]
    });
    expect(component.zones.value).toEqual([
      { id: 'pre_1', url: '', pingbacks: [] },
      { id: 'pre_2', url: '', pingbacks: [] }
    ]);
    component.onRemoveZone(0);
    expect(component.zones.value).toEqual([{ id: 'pre_2', url: '', pingbacks: [] }]);
  });

  it('removes zones when there are more controls than zones', () => {
    parent.flightForm.reset({
      zones: [{ id: 'pre_1' }, { id: 'pre_2' }]
    });
    expect(component.zones.value).toEqual([
      { id: 'pre_1', url: '', pingbacks: [] },
      { id: 'pre_2', url: '', pingbacks: [] }
    ]);
    component.writeValue([{ id: 'pre_2', url: '', pingbacks: [] }]);
    expect(component.zones.value).toEqual([{ id: 'pre_2', url: '', pingbacks: [] }]);
  });

  it('does very basic mp3 validations', () => {
    component.flightZones = [{ id: 'pre_1' }];

    const zone = component.zones.at(0);
    const urlField = zone.get('url');

    urlField.setValue('');
    expect(urlField.errors).toEqual(null);

    urlField.setValue('http://this.looks/valid.mp3');
    expect(urlField.errors).toEqual(null);
    expect(zone.get('url').hasError('invalidUrl')).toEqual(false);
    expect(zone.get('url').hasError('notMp3')).toEqual(false);

    urlField.setValue('ftp://this.is/invalid.mp3');
    expect(urlField.errors).toEqual({ invalidUrl: { value: 'ftp://this.is/invalid.mp3' } });
    expect(zone.get('url').hasError('invalidUrl')).toEqual(true);

    urlField.setValue('http://this.is/notaudio.jpg');
    expect(urlField.errors).toEqual({ notMp3: { value: 'http://this.is/notaudio.jpg' } });
    expect(zone.get('url').hasError('notMp3')).toEqual(true);
  });

  it('does not emit while receiving incoming update', () => {
    jest.spyOn(component, 'onChangeFn');
    component.writeValue([{ id: 'pre_1' }, { id: 'pre_2' }]);
    expect(component.onChangeFn).not.toHaveBeenCalled();
    component.writeValue([{ id: 'pre_1' }]);
    expect(component.onChangeFn).not.toHaveBeenCalled();
  });

  it('clears controls for empty zone', () => {
    component.writeValue([{ id: 'pre_1', url: 'http://this.looks/valid.mp3' }]);
    expect(component.zones.controls[0].get('id').value).toEqual('pre_1');
    expect(component.zones.controls[0].get('url').value).toEqual('http://this.looks/valid.mp3');
    component.writeValue([]);
    expect(component.zones.controls[0].get('id').value).toEqual('');
    expect(component.zones.controls[0].get('url').value).toEqual('');
  });
});
