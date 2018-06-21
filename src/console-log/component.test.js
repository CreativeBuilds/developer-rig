import React from 'react';
import { shallow } from 'enzyme';
import { ExtensionRigConsoleLog } from './component';

describe('<ExtensionRigConsoleLog />', () => {
  const frame = '1';
  const log = 'hello';
  const component = shallow(
  <ExtensionRigConsoleLog
    frame={frame}
    log={log} />
  );
  it('renders correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('has the correct props', () => {
    expect(component.instance().props.frame).toEqual(frame);
    expect(component.instance().props.log).toEqual(log);
  });
});
