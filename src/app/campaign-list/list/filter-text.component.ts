import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'grove-filter-text',
  template: `
    <input type="text" placeholder="Search by {{textName}}"
      [value]="searchText || ''" (keyup)="onChange($event.target.value)">
      <button (click)="search.emit(null)" class="btn-link"><prx-icon size="1em" name="cancel"></prx-icon></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTextComponent implements OnInit, OnDestroy {
  @Input() textName: string;
  @Input() searchText: string;
  @Output() search = new EventEmitter<string>();
  searchStream = new Subject<string>();
  searchSubcription: Subscription;
  searchOutput$ = this.searchStream.pipe(
    filter(value => value.length > 2 || value === ''),
    debounceTime(300),
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

  onChange(value: string) {
    this.searchStream.next(value);
  }
}
