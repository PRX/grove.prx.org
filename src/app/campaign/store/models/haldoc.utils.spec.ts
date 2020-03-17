import { filterUnderscores } from './haldoc.utils';
import { MockHalDoc } from 'ngx-prx-styleguide';

describe('Haldoc Utils', () => {
  it('filters underscores', () => {
    const doc = new MockHalDoc({ foo: 'bar', _under: 'scored' });
    expect(filterUnderscores(doc)).not.toHaveProperty('_under');
  });
});
