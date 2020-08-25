import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';
import { Env } from '../../../core/core.env';

export interface Creative {
  id?: number | string;
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

export const getCreativeId = (state?: CreativeState): string => {
  return (state && state.creative && state.creative.id && state.creative.id.toString()) || 'new';
};

export const docToCreative = (doc: HalDoc): Creative => {
  const creative = filterUnderscores(doc) as Creative;
  return {
    ...creative,
    createdAt: new Date(creative.createdAt),
    set_account_uri: doc['_links'] && doc['_links']['prx:account'] && doc['_links']['prx:account'].href,
    set_advertiser_uri: doc['_links'] && doc['_links']['prx:advertiser'] && Env.AUGURY_HOST + doc['_links']['prx:advertiser'].href
  };
};
