import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CreativeFormComponent } from './creative-form.component';
import { CreativePingbacksFormComponent } from './pingbacks/creative-pingbacks-form.component';
import { PingbackFormComponent } from './pingbacks/pingback-form.component';
import { creativesFixture, advertisersFixture } from '../store/models/campaign-state.factory';

describe('CreativeFormComponent', () => {
  let comp: CreativeFormComponent;
  let fix: ComponentFixture<CreativeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatButtonModule
      ],
      declarations: [CreativeFormComponent, CreativePingbacksFormComponent, PingbackFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CreativeFormComponent);
        comp = fix.componentInstance;
        fix.detectChanges();
      });
  }));

  it('sets the creative on the form', () => {
    comp.creative = creativesFixture[0];
    expect(comp.creativeForm.value).toMatchObject({
      id: creativesFixture[0].id,
      url: creativesFixture[0].url,
      filename: creativesFixture[0].filename,
      set_account_uri: creativesFixture[0].set_account_uri,
      set_advertiser_uri: creativesFixture[0].set_advertiser_uri,
      pingbacks: []
    });
  });

  it('emits form updates', () => {
    jest.spyOn(comp.formUpdate, 'emit');
    comp.creativeForm.get('url').setValue('any value');
    expect(comp.formUpdate.emit).toHaveBeenCalled();
  });

  it('defaults the filename to the url', () => {
    comp.creative = {};
    comp.creativeForm.get('url').setValue('any value');
    expect(comp.creativeForm.get('filename').value).toEqual('any value');
  });

  it('validates the mp3', () => {
    comp.creative = {};
    const urlField = comp.creativeForm.get('url');

    urlField.setValue('');
    expect(urlField.errors).toEqual({ required: true });

    urlField.setValue('http://this.looks/valid.mp3');
    expect(urlField.errors).toEqual(null);
    expect(urlField.hasError('invalidUrl')).toEqual(false);
    expect(urlField.hasError('notMp3')).toEqual(false);
    expect(urlField.hasError('error')).toEqual(false);

    urlField.setValue('ftp://this.is/invalid.mp3');
    expect(urlField.errors).toEqual({ invalidUrl: { value: 'ftp://this.is/invalid.mp3' } });
    expect(urlField.hasError('invalidUrl')).toEqual(true);

    urlField.setValue('http.this.is.invalid.mp3');
    expect(urlField.hasError('error')).toEqual(true);

    urlField.setValue('http://this.is/notaudio.jpg');
    expect(urlField.errors).toEqual({ notMp3: { value: 'http://this.is/notaudio.jpg' } });
    expect(urlField.hasError('notMp3')).toEqual(true);
  });

  it('validates the advertiser', () => {
    comp.advertisers = advertisersFixture;
    comp.creativeForm.get('set_advertiser_uri').setValue('invalid');
    expect(comp.creativeForm.get('set_advertiser_uri').errors).toEqual({ advertiserInvalid: true });
    comp.creativeForm.get('set_advertiser_uri').setValue(advertisersFixture[0].set_advertiser_uri);
    expect(comp.creativeForm.get('set_advertiser_uri').errors).toEqual(null);
  });
});
