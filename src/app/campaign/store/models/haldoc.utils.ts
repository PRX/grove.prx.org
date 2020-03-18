import { HalDoc } from 'ngx-prx-styleguide';

export const filterUnderscores = (doc: HalDoc): {} => {
  return Object.keys(doc.asJSON())
    .filter(key => !key.startsWith('_'))
    .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {});
};
