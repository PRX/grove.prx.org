import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';
import { CreativeCardComponent } from './creative-card.component';
@Component({
  template: `
    <form [formGroup]="form">
      <grove-creative-card #childForm [formGroup]="form" [creative]="creative" [creativeLink]="creativeLink"></grove-creative-card>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm', { static: true }) childForm: CreativeCardComponent;

  creative = {
    id: 1,
    url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
    filename: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
    set_account_uri: '/api/v1/accounts/1',
    set_advertiser_uri: '/some/uri/1'
  };
  creativeLink = '/campaign/1/flight/2/zone/pre_1/creative/';

  form = this.fb.group({
    enabled: [true],
    weight: [1]
  });
}

describe('CreativeCardComponent', () => {
  let parent: ParentFormComponent;
  let comp: CreativeCardComponent;
  let fix: ComponentFixture<ParentFormComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatIconModule
      ],
      declarations: [ParentFormComponent, CreativeCardComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(ParentFormComponent);
        parent = fix.componentInstance;
        comp = parent.childForm;
        de = fix.debugElement;
        fix.detectChanges();
      });
  }));

  it('shows link to creative if it exists', () => {
    expect(de.query(By.css('a')).nativeElement.textContent).toContain(parent.creative.filename);
    parent.creative.id = null;
    fix.detectChanges();
    expect(de.query(By.css('a'))).toBeNull();
  });

  it('shows as silent file if creative link is not set', () => {
    expect(de.query(By.css('h3')).nativeElement.textContent).toContain('Creative');
    parent.creative = null;
    fix.detectChanges();
    expect(de.query(By.css('h3')).nativeElement.textContent).toContain('Silent File');
  });

  it('sets weight on the parent form', () => {
    comp.creativeForm.get('weight').setValue(10, { emitEvent: false });
    expect(parent.form.get('weight').value).toEqual(10);
  });
});
