import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

/*
 * Workaround for setting CSS custom properties:
 * https://github.com/angular/angular/issues/9343
 *
 * Can work for any style properties.
 */
@Directive({
  // tslint:disable-next-line
  selector: '[cssProps]'
})
export class CSSPropsDirective implements OnChanges {
  @Input() cssProps: any;

  constructor(private element: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    const { cssProps } = changes;
    if (cssProps && cssProps.currentValue) {
      const { style } = this.element.nativeElement;
      for (const [k, v] of Object.entries(cssProps.currentValue)) {
        style.setProperty(k, v);
      }
    }
  }
}
