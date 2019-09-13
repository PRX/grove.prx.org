import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

@Component({
  selector: 'grove-filter-text',
  template: `
    <mat-form-field>
      <input matInput type="text" placeholder="Search by {{textName}}"
        [value]="inputValue" (keyup)="onChange($event.target.value)">
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTextComponent implements OnInit, OnDestroy {
  @Input() textName: string;
  @Input() searchText: string;
  @Output() search = new EventEmitter<string>();
  // tslint:disable-next-line: variable-name
  _inputValue: string;
  searchStream = new Subject<string>();
  searchSubcription: Subscription;
  searchOutput$ = this.searchStream.pipe(
    // binding the input to what the user has typed rather than what gets thru
    tap(value => this._inputValue = value),
    // value must be > 2 chars or empty for clearing search
    filter(value => value.length > 2 || value === ''),
    // are they done typing?
    debounceTime(300),
    // only if changed
    distinctUntilChanged()
  );

  ngOnInit() {
    this.searchSubcription = this.searchOutput$.subscribe((value: string) =>
      this.search.emit(value)
    );
  }

  ngOnDestroy() {
    if (this.searchSubcription) {
      this.searchSubcription.unsubscribe();
    }
  }

  get inputValue(): string {
    if (this._inputValue || this._inputValue === '') {
      return this._inputValue;
    } else if (this.searchText) {
      return this.searchText;
    } else {
      return '';
    }
  }

  onChange(value: string) {
    this.searchStream.next(value);
  }
}
