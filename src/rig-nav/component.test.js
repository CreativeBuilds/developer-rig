import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { RigNav } from './component';
import { EXTENSION_VIEWS, BROADCASTER_CONFIG, LIVE_CONFIG, CONFIGURATIONS  } from '../constants/nav-items';

describe('<RigNav />', () => {
  const setupShallow = setupShallowTest(RigNav, () => ({
    openConfigurationsHandler: jest.fn(),
    viewerHandler: jest.fn(),
    configHandler: jest.fn(),
    liveConfigHandler: jest.fn(),
    selectedView: EXTENSION_VIEWS,
    error: '',
  }));

  it('renders correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders an error', () => {
    const { wrapper } = setupShallow({
      error: 'test error',
    });
    expect(wrapper.find('.top-nav-error').text().trim()).toBe('test error');
  });

  it('correctly handles clicks on each tab', () => {
    const { wrapper } = setupShallow();
    wrapper.find('a.top-nav-item').forEach(tab => {
      tab.simulate('click');
    });
    expect(wrapper.instance().props.viewerHandler).toHaveBeenCalled();
    expect(wrapper.instance().props.configHandler).toHaveBeenCalled();
    expect(wrapper.instance().props.liveConfigHandler).toHaveBeenCalled();
    expect(wrapper.instance().props.openConfigurationsHandler).toHaveBeenCalled();
  });

  it('correct css classes are set when things are selected', () => {
    const { wrapper } = setupShallow({
      selectedView: EXTENSION_VIEWS,
    });
    expect(wrapper.find('.top-nav-item__selected')).toHaveLength(1);

    wrapper.setProps({
      selectedView: BROADCASTER_CONFIG,
    });
    wrapper.update();
    expect(wrapper.find('.top-nav-item__selected')).toHaveLength(1);

    wrapper.setProps({
      selectedView: LIVE_CONFIG,
    });
    wrapper.update();
    expect(wrapper.find('.top-nav-item__selected')).toHaveLength(1);

    wrapper.setProps({
      selectedView: CONFIGURATIONS,
    });
    wrapper.update();
    expect(wrapper.find('.top-nav-item__selected')).toHaveLength(1);
  })
});
