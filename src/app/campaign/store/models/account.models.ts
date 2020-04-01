import { HalDoc } from 'ngx-prx-styleguide';

export interface Account {
  id: number;
  name: string;
  self_uri: string;
}

export const docToAccount = (doc: HalDoc): Account => {
  const account = doc.asJSON() as Account;
  account.self_uri = doc.expand('self');
  return account;
};
