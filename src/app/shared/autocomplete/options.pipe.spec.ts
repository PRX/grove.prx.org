import { OptionsPipe, OptionsTransform } from './options.pipe';

describe('OptionsPipe', () => {
  const pipe = new OptionsPipe();
  const data: OptionsTransform = {
    name: 'name',
    value: 'uri',
    options: [
      {name: 'Squarespace', uri: '/url/squarespace'},
      {name: 'Toyoda', uri: '/url/toyoda'}
    ]
  };
  it('should transform options from given OptionsTransform data', () => {
    const options = pipe.transform(data);
    expect(options.length).toEqual(2);
    expect(options[0].value).toEqual('/url/squarespace');
    expect(options[0].name).toEqual('Squarespace');
  });
});
