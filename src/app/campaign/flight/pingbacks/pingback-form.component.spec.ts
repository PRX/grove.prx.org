import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { PingbackFormComponent } from './pingback-form.component';
import { campaignFixture, flightFixture } from '../../store/models/campaign-state.factory';

@Component({
  template: `
    <form [formGroup]="form">
      <grove-pingback
        #childForm
        formControlName="pingback"
        [campaignId]="campaignId"
        [flightId]="flightId"
        [creative]="creative"
        [podcastId]="podcastId"
      >
      </grove-pingback>
    </form>
  `
})
class ParentFormComponent {
  @ViewChild('childForm', { static: true }) childForm: PingbackFormComponent;
  constructor(private fb: FormBuilder) {}
  form = this.fb.group({ pingback: '' });
  campaignId = campaignFixture.id;
  flightId = flightFixture.id;
  creative = 'http://this.looks/valid.mp3';
  podcastId = flightFixture.set_inventory_uri.split('/').pop();
}

describe('PingbackFormComponent', () => {
  let parent: ParentFormComponent;
  let component: PingbackFormComponent;
  let fixture: ComponentFixture<ParentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ParentFormComponent, PingbackFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it('sets pingback template and preview from the parent form', () => {
    parent.form.reset({ pingback: null });
    expect(component.formGroup.value).toEqual({ template: '', preview: '' });
    const pingback = 'http://some/ping/back.gif';
    parent.form.setValue({ pingback });
    expect(component.formGroup.value).toEqual({ template: pingback, preview: pingback });
  });

  it('validates the URL and shows error in preview', () => {
    component.formGroup.get('template').setValue('http://some/ping/back.gif');
    expect(component.validateTemplate(component.formGroup.get('template'))).toBeNull();
    component.formGroup.get('template').setValue('some/ping/back.gif');
    expect(component.validateTemplate(component.formGroup.get('template'))).not.toBeNull();
    expect(component.validateTemplate(component.formGroup.get('template')).error).toContain('Invalid URL');
    expect(component.formGroup.get('preview').value).toContain('Invalid URL');
  });

  it('finds template parameters in the URL', () => {
    component.formGroup
      .get('template')
      .setValue('http://some/ping/back.gif?c={creative}&p={podcast}&e={episode}&cid={campaign}&f={flight}&ip={ip}&nocr=1');
    expect(component.findTemplateParams(component.formGroup.get('template').value)).toEqual([
      'creative',
      'podcast',
      'episode',
      'campaign',
      'flight',
      'ip'
    ]);
  });

  it('checks for invalid template parameters and shows error in preview', () => {
    component.formGroup
      .get('template')
      .setValue('http://some/ping/back.gif?c={crtv}&p={purrcast}&e={eprisodic}&cid={campaignly}&f={flyt}&ip={ipaddr}&nocr=1');
    const invalidParams = ['crtv', 'purrcast', 'eprisodic', 'campaignly', 'flyt', 'ipaddr'];
    expect(component.checkInvalidTemplateParams(component.formGroup.get('template').value)).toEqual(invalidParams);
    expect(component.formGroup.get('preview').value).toContain(invalidParams.join(', '));
  });

  it('replaces template parameters in the URL', () => {
    const pingback = 'http://some/ping/back.gif?c={creative}&p={podcast}&cid={campaign}&f={flight}';
    component.formGroup.get('template').setValue(pingback);
    const preview = component.formGroup.get('preview').value;
    expect(preview).toEqual(component.previewValue(pingback));
    expect(preview).toContain(`c=${component.creative}`);
    expect(preview).toContain(`p=${component.podcastId}`);
    expect(preview).toContain(`cid=${component.campaignId}`);
    expect(preview).toContain(`f=${component.flightId}`);
  });

  it('resizes the textareas as values are entered', () => {
    const spy = jest.spyOn(component.autosizePingback, 'resizeToFitContent');
    component.formGroup.get('template').setValue('http://some/ping/back.gif');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
