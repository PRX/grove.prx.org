import { ZoneLabelPipe } from './zone-label.pipe';

describe('ZoneLabelPipe', () => {
  const pipe = new ZoneLabelPipe();

  it('displays zone labels', () => {
    const zones = [
      { id: '1', label: 'One' },
      { id: '2', label: 'Two' }
    ];
    expect(pipe.transform(zones)).toMatch('One, Two');
  });

  it('falls back to zone ids', () => {
    const zones = [{ id: '1' }, { id: '2', label: 'Two' }];
    expect(pipe.transform(zones)).toMatch('1, Two');
  });

  it('also allows the deprecated zone-name key', () => {
    const zones = [
      { id: '1', name: 'One' },
      { id: '2', zoneName: 'Two' }
    ];
    expect(pipe.transform(zones)).toMatch('One, Two');
  });

  it('handles single values', () => {
    expect(pipe.transform({ id: '1', label: 'One' })).toMatch('One');
  });

  it('handles insane input', () => {
    expect(pipe.transform(['One', 'Two'])).toMatch('One, Two');
    expect(pipe.transform('One')).toMatch('One');
    expect(pipe.transform([])).toMatch('');
    expect(pipe.transform(null)).toMatch('');
  });
});
