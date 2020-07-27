import { UniquePipe } from './unique.pipe';

describe('UniquePipe', () => {
  const pipe = new UniquePipe();

  it('should builds a unique set of `values[property]` where `property` is an object keyed by `key` on each of the `values`', () => {
    const values = [
      {
        property: [
          { id: 1, label: 'abc' },
          { id: 2, label: 'def' }
        ]
      },
      {
        property: [
          { id: 2, label: 'def' },
          { id: 3, label: 'ghi' }
        ]
      }
    ];
    expect(pipe.transform(values, 'property', 'id')).toEqual([
      { id: 1, label: 'abc' },
      { id: 2, label: 'def' },
      { id: 3, label: 'ghi' }
    ]);
  });
});
