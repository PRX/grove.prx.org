import { Component, ViewChild, AfterViewInit, OnDestroy, Injector, ViewEncapsulation, Input, forwardRef } from '@angular/core';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerInput } from '@angular/material';
import { OverlayRef, GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { Observable, Observer, CompletionObserver } from 'rxjs';
import { take } from 'rxjs/operators';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { DaterangePortalComponent } from './daterange-portal.component';
import { PORTAL_DATA } from './daterange-injection';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'grove-daterange',
  template: `
    <mat-form-field>
      <input
        matInput
        [value]="startDate"
        [matDatepicker]="fromPicker"
        (dateInput)="startDateChangeEvent('input', $event)"
        (dateChange)="startDateChangeEvent('change', $event)"
        placeholder="Start date"
        disabled
      />
      <mat-datepicker #fromPicker disabled="false"></mat-datepicker>
    </mat-form-field>
    <mat-form-field>
      <input
        matInput
        [value]="endDate"
        [matDatepicker]="toPicker"
        [matDatepickerFilter]="rangeFilter"
        (dateInput)="endDateChangeEvent('input', $event)"
        (dateChange)="endDateChangeEvent('change', $event)"
        placeholder="End date"
        disabled
      />
      <mat-datepicker [dateClass]="highlightStartDate" [startAt]="toPickerInitialDate" #toPicker disabled="false"></mat-datepicker>
    </mat-form-field>
    <button mat-raised-button (click)="openPicker(fromPicker)">Open</button>
    <grove-daterange-overlay [display]="showBackdrop"></grove-daterange-overlay>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaterangeComponent),
      multi: true
    }
  ],
  styleUrls: ['daterange.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DaterangeComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('fromPicker') fromPicker: MatDatepicker<Date>;
  @ViewChild('toPicker') toPicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) fromInput: MatDatepickerInput<Date>;
  @Input() _startDate = null;
  @Input() _endDate = null;

  set startDate(val: Date) {
    this._startDate = val;
    this.propagateChange({startDate: this.startDate, endDate: this.endDate});
  }

  get startDate() {
    return this._startDate;
  }

  set endDate(val: Date) {
    this._endDate = val;
    this.propagateChange({startDate: this.startDate, endDate: this.endDate});
  }

  get endDate() {
    return this._endDate;
  }

  authToken: string;
  rafRegistry = {};
  overlay: Overlay;
  overlays: OverlayRef[] = [];
  showBackdrop = false;
  get toPickerInitialDate() {
    if (this.startDate) { return this.startDate; }
    return new Date();
  }

  propagateChange = (_: any) => {};

  constructor(overlay: Overlay, private _injector: Injector) {
    this.overlay = overlay;
  }

  writeValue(val: {startDate?: Date, endDate?: Date} | null) {
    if (val && val.startDate) { this.startDate = val.startDate; }
    if (val && val.endDate) { this.endDate = val.endDate; }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {

  }

  startDateChangeEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value;
  }
  endDateChangeEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.endDate = event.value;
    this.overlays.forEach(overlay => overlay.dispose());
    this.showBackdrop = false;
  }
  // Ultimately, we'd like to keep both pickers open until both dates are
  // selected. This is an open feature request for Angular Material:
  // https://github.com/angular/components/issues/15295
  openPicker(fromPicker: MatDatepicker<Date>) {
    this.startDate = null;
    fromPicker.select(null);
    this.toPicker.select(null);
    fromPicker.open();
  }

  highlightStartDate = (d: Date) => {
    if (!this.startDate) {
      return undefined;
    }

    return this.checkDateEquality([d, this.startDate]) ? 'start-date' : undefined;
  };

  rangeFilter = (d: Date): boolean => {
    return this.startDate ? this.startDate <= d : false;
  };

  checkDateEquality = (dates: Date[]) => {
    return ['getDate', 'getMonth', 'getFullYear'].reduce((acc, fnc) => {
      const archetype = Date.prototype[fnc].call(dates[0]);
      return acc && dates.every((date) => Date.prototype[fnc].call(date) === archetype);
    }, true);
  };

  ngAfterViewInit() {
    this.fromPicker.openedStream.pipe(take(1)).subscribe(this.createPickerOpenObserver(this.fromPicker, this.layOutPickers.bind(this)));
  }

  layOutPickers(fromEl: HTMLElement) {
    this.showBackdrop = true;

    this.createPortal(fromEl.offsetHeight, fromEl.offsetWidth, `${fromEl.offsetWidth + 10}px`, 'Pick a start date');

    this.repositionCalendar(this.fromPicker, fromEl.offsetWidth, { posLeft: true });

    this.fromInput.dateChange.subscribe((date: MatDatepickerInputEvent<Date>) => {
      if (date.value) {
        this.createPortal(fromEl.offsetHeight, fromEl.offsetWidth, `-${fromEl.offsetWidth + 10}px`, date.value.toLocaleDateString());

        this.toPicker.openedStream.pipe(take(1)).subscribe(
          this.createPickerOpenObserver(this.toPicker, el => {
            this.repositionCalendar(this.toPicker, el.offsetWidth, { posLeft: false });
          })
        );
        this.toPicker.open();
      }
    });
  }

  ngOnDestroy() {
    Object.keys(this.rafRegistry).forEach(rafKey => window.cancelAnimationFrame(this.rafRegistry[rafKey]));
  }

  repositionCalendar(picker: MatDatepicker<Date>, calendarWidth: number, options: { posLeft: boolean }) {
    const pickerPopup: OverlayRef = picker._popupRef;
    pickerPopup.detachBackdrop();
    pickerPopup.updatePositionStrategy(
      new GlobalPositionStrategy().centerHorizontally(`${options.posLeft ? '-' : ''}${calendarWidth + 10}px`).centerVertically()
    );
  }

  createPickerOpenObserver(picker: MatDatepicker<Date>, callback: (el: HTMLElement) => any): CompletionObserver<void> {
    return {
      complete: () => {
        this.waitForElementWithId(picker.id).subscribe(pickerEl => {
          callback(pickerEl);
          picker.openedStream.pipe(take(1)).subscribe(this.createPickerOpenObserver(picker, callback));
        });
      }
    };
  }

  createPortal(height: number, width: number, offsetWidth: string, content: string) {
    const overlayRef = this.overlay.create({ hasBackdrop: false });
    this.overlays.push(overlayRef);

    const overlayPortal = new ComponentPortal(
      DaterangePortalComponent,
      null,
      // Would be ideal to use a service here, but the DI system instantiates separate instances
      // for our parent and the portal component: https://github.com/angular/components/issues/8322
      this.createInjector({ height, width, content })
    );

    overlayRef.attach(overlayPortal);
    overlayRef.updatePositionStrategy(new GlobalPositionStrategy().centerHorizontally(offsetWidth).centerVertically());
  }

  createInjector(dataToPass): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(PORTAL_DATA, dataToPass);
    return new PortalInjector(this._injector, injectorTokens);
  }

  waitForElementWithId(id: string): Observable<HTMLElement> {
    return Observable.create((observer: Observer<HTMLElement>) => {
      const rafLoop = () => {
        if (document.getElementById(id)) {
          observer.next(document.getElementById(id));
          observer.complete();
          return;
        }
        this.rafRegistry[id] = window.requestAnimationFrame(rafLoop);
      };
      rafLoop();
    });
  }
}
