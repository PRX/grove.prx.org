import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface Account {
  id: number;
  name: string;
  self_uri: string;
}

export const docToAccount = (doc: HalDoc): Account => {
  const account = filterUnderscores(doc) as Account;
  account.self_uri = doc.expand('self');
  return account;
};
