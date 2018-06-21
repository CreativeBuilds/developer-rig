import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { ExtensionRigConsole } from './component';

describe('<ExtensionRigConsole />', () => {
  const setupShallow = setupShallowTest(ExtensionRigConsole, () => ({}));

  it('renders correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper).toMatchSnapshot();
  });

  it('calling window.rig.update correctly updates the console.', () => {
    const { wrapper } = setupShallow();
    wrapper.setState({
      logHistory: [
        {
          log: 'test',
          frame: 'test-frame',
        },
      ],
    });
    window.rig.update();
    expect(wrapper.find('ExtensionRigConsoleLog').dive().instance().props.log).toBe('test');
  });

  it('renders log messages correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper.find('ExtensionRigConsoleLog').exists()).toEqual(false);
    wrapper.setState({
      logHistory: [
        {
          log: 'test',
          frame: 'test-frame',
        },
      ],
    });
    wrapper.update();
    expect(wrapper.find('ExtensionRigConsoleLog').exists()).toEqual(true);
  });
});
