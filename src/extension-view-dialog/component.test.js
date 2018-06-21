import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { ExtensionViewDialog } from './component';
import { DEFAULT_EXTENSION_TYPE } from '../constants/extension-types.js'
import { DEFAULT_OVERLAY_SIZE } from '../constants/overlay-sizes.js'
import { ViewerTypes, DEFAULT_VIEWER_TYPE } from '../constants/viewer-types.js'
const { ExtensionViewType } = window['extension-coordinator'];

describe('<ExtensionViewDialog />', () => {
  const setupShallow = setupShallowTest(ExtensionViewDialog, () => ({
    extensionViews: {
      panel: {},
      videoOverlay: {},
    },
    closeHandler: jest.fn(),
    saveHandler: jest.fn(),
    show: true
  }));

  it('when top nav close button is clicked closeHandler is called', () => {
    const { wrapper } = setupShallow();
    wrapper.find('.top-bar-container__escape').simulate('click');
    expect(wrapper.instance().props.closeHandler).toHaveBeenCalled();
  });

  it('when bottom bar close button is clicked closeHandler is called', () => {
    const { wrapper } = setupShallow();
    wrapper.find('.bottom-bar__cancel').simulate('click');
    expect(wrapper.instance().props.closeHandler).toHaveBeenCalled();
  });

  it('when save button is clicked saveHanler is called', () => {
    const { wrapper } = setupShallow();
    wrapper.find('.bottom-bar__save').simulate('click');
    expect(wrapper.instance().props.saveHandler).toHaveBeenCalled();
  });

  it('is null when show is false', () => {
    const { wrapper } = setupShallow({
      show: false
    });
    expect(wrapper.type()).toBe(null);
  });

  it('shows nothing if no supported views', () => {
    const { wrapper } = setupShallow({
      extensionViews: {}
    })
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correct identity options when logged in user type is selected', () => {
    const { wrapper } = setupShallow();
    wrapper.find('RadioOption').forEach((elem) => {
      if (elem.dive().instance().props.value === ViewerTypes.LoggedIn) {
        elem.simulate('click');
      }
    });
    wrapper.instance().onChange({
      target: {
        name: 'viewerType',
        value: ViewerTypes.LoggedIn,
      }
    })
    wrapper.update();
    expect(wrapper.find('RadioOption[name="identityOption"]')).toHaveLength(2);
  });

  it('renders opaque id input field correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper.find('.opaque_id-input')).toHaveLength(1);
  });

  describe('for an extension that supports video overlays and panels', () => {
    const { wrapper } = setupShallow();

    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('has the correct default state', () => {
      expect(wrapper.state('extensionViewType')).toBe(DEFAULT_EXTENSION_TYPE);
      expect(wrapper.state('frameSize')).toBe(DEFAULT_OVERLAY_SIZE);
      expect(wrapper.state('viewerType')).toBe(DEFAULT_VIEWER_TYPE);
    });

    it('has the correct selected UI elements', () => {
      expect(wrapper.find('DivOption[value="video_overlay"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('DivOption[checked=false]')).toHaveLength(1);

      expect(wrapper.find('RadioOption[value="640x480"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('RadioOption[name="frameSize"][checked=false]')).toHaveLength(4);

      expect(wrapper.find('RadioOption[value="Broadcaster"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('RadioOption[name="viewerType"][checked=false]')).toHaveLength(2);

      expect(wrapper.find('RadioOption[name="identityOption"]')).toHaveLength(0);
    });
  });

  describe('for an extension that only supports panels', () => {
    const { wrapper } = setupShallow({
      extensionViews: {
        panel: {},
      }
    });
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('has the correct default state', () => {
      expect(wrapper.state('extensionViewType')).toBe('panel');
      expect(wrapper.state('frameSize')).toBe(DEFAULT_OVERLAY_SIZE);
      expect(wrapper.state('viewerType')).toBe(DEFAULT_VIEWER_TYPE);
    });

    it('has the correct selected UI elements', () => {
      expect(wrapper.find('DivOption[value="panel"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('DivOption[checked=false]')).toHaveLength(0);

      expect(wrapper.find('RadioOption[value="Broadcaster"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('RadioOption[name="viewerType"][checked=false]')).toHaveLength(2);

      expect(wrapper.find('RadioOption[name="identityOption"]')).toHaveLength(0);
    });
  });


  describe('for an extension that only supports components', () => {
    const { wrapper } = setupShallow({
      extensionViews: {
        component: {}
      }
    });
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('has the correct default state', () => {
      expect(wrapper.state('extensionViewType')).toBe(ExtensionViewType.Component);
      expect(wrapper.state('frameSize')).toBe(DEFAULT_OVERLAY_SIZE);
      expect(wrapper.state('viewerType')).toBe(DEFAULT_VIEWER_TYPE);
    });

    it('has the correct selected UI elements', () => {
      expect(wrapper.find('DivOption[value="component"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('DivOption[checked=false]')).toHaveLength(0);

      expect(wrapper.find('RadioOption[value="Broadcaster"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('RadioOption[name="viewerType"][checked=false]')).toHaveLength(2);

      expect(wrapper.find('RadioOption[name="identityOption"]')).toHaveLength(0);
    });
  });


  describe('for an extension that only supports mobile', () => {
    const { wrapper } = setupShallow({
      extensionViews: {
        mobile: {},
      }
    });
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('has the correct default state', () => {
      expect(wrapper.state('extensionViewType')).toBe(ExtensionViewType.Mobile);
      expect(wrapper.state('frameSize')).toBe(DEFAULT_OVERLAY_SIZE);
      expect(wrapper.state('viewerType')).toBe(DEFAULT_VIEWER_TYPE);
    });

    it('has the correct selected UI elements', () => {
      expect(wrapper.find('DivOption[value="mobile"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('DivOption[checked=false]')).toHaveLength(0);

      expect(wrapper.find('RadioOption[value="Broadcaster"][checked=true]')).toHaveLength(1);
      expect(wrapper.find('RadioOption[name="viewerType"][checked=false]')).toHaveLength(2);

      expect(wrapper.find('RadioOption[name="identityOption"]')).toHaveLength(0);
    });
  });
});
