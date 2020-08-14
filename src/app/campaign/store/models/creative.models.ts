import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';
export interface Creative {
  id?: number;
  url?: string;
  filename?: string;
  set_account_uri?: string;
  set_advertiser_uri?: string;
  pingbacks?: string[];
  fileSize?: number;
  mimeType?: string;
  createdAt?: Date;
}

export interface CreativeState {
  doc?: HalDoc;
  creative: Creative;
  changed: boolean;
  valid: boolean;
  error?: any;
}

export const getCreativeId = (state: CreativeState): number => {
  return state.creative && state.creative.id;
};

export const docToCreative = (doc: HalDoc): Creative => {
  return filterUnderscores(doc) as Creative;
};
