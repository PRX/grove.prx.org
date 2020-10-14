import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { PingbackFormComponent } from './pingback-form.component';
import { CreativePingbacksFormComponent } from './creative-pingbacks-form.component';

@Component({
  template: `
    <form [formGroup]="form">
      <grove-creative-pingbacks
        #childForm
        formControlName="pingbacks"
        [campaignId]="campaignId"
        [flightId]="flightId"
        [creative]="creative"
      >
      </grove-creative-pingbacks>
    </form>
  `
})
class ParentFormComponent {
  @ViewChild('childForm', { static: true }) childForm: CreativePingbacksFormComponent;
  constructor(private fb: FormBuilder) {}
  form = this.fb.group({ pingbacks: '' });
}

describe('FlightZonePingbacksFormComponent', () => {
  let parent: ParentFormComponent;
  let component: CreativePingbacksFormComponent;
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
      declarations: [ParentFormComponent, CreativePingbacksFormComponent, PingbackFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it('sets pingbacks from the parent form', () => {
    parent.form.reset({ pingbacks: null });
    expect(component.formArray.length).toEqual(0);
    parent.form.setValue({ pingbacks: ['123'] });
    expect(component.formArray.length).toEqual(1);
    parent.form.setValue({ pingbacks: ['123', '456'] });
    expect(component.formArray.length).toEqual(2);
    parent.form.setValue({ pingbacks: null });
    expect(component.formArray.length).toEqual(0);
  });

  it('removes pingbacks when there are more controls than pingbacks', () => {
    parent.form.setValue({ pingbacks: ['abc', 'def'] });
    expect(component.formArray.length).toEqual(2);
    component.writeValue(['def']);
    expect(component.formArray.length).toEqual(1);
  });

  it('adds empty pingback', () => {
    parent.form.setValue({ pingbacks: ['abc', 'def'] });
    expect(component.formArray.length).toEqual(2);
    component.onAddPingback();
    expect(component.formArray.length).toEqual(3);
    expect(component.formArray.controls[2].value).toEqual('');
  });

  it('removes pingbacks by index', () => {
    parent.form.reset({
      pingbacks: ['abc', 'def']
    });
    expect(component.formArray.value).toEqual(['abc', 'def']);
    component.onRemovePingback(0);
    expect(component.formArray.value).toEqual(['def']);
  });

  it('does not emit while receiving incoming update', () => {
    jest.spyOn(component, 'onChangeFn');
    component.writeValue(['abc', 'def']);
    expect(component.onChangeFn).not.toHaveBeenCalled();
    component.writeValue(['ghi']);
    expect(component.onChangeFn).not.toHaveBeenCalled();
  });
});
