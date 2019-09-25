import { Pipe, PipeTransform } from '@angular/core';

export interface OptionsTransform {
  options: any[];
  name: string;
  value: string;
}

@Pipe({
  name: 'optionsTransform'
})
export class OptionsPipe implements PipeTransform {
  transform(data: OptionsTransform) {
    return data.options.map(opt => ({name: opt[data.name], value: opt[data.value]}));
  }
}
