import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { ExtensionMobileView } from './component';
import { ViewerTypes } from '../constants/viewer-types';
import { createViewsForTest, ExtensionForTest } from '../tests/constants/extension';
import { MobileOrientation } from '../constants/mobile';
const { ExtensionViewType, ExtensionMode} = window['extension-coordinator'];

describe('<ExtensionMobileView />', () => {
  const setupShallow = setupShallowTest(ExtensionMobileView, () => ({
    id: '0',
    extension: ExtensionForTest,
    orientation: MobileOrientation.Portrait,
    frameSize: { width: 100, height: 100 },
    position: { x: 0, y: 0 },
    role: ExtensionMode.Viewer,
  }));

  it('renders correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper).toMatchSnapshot();
  });

  it('computes correct styles in portrait mode', () => {
    const { wrapper } = setupShallow();
    const expectedFrameStyles = {
      "bottom": 0,
      "height": "65px",
      "position": "absolute",
      "width": "100px"
    };
    const expectedViewStyles = {
      "background": "#322F37",
      "height": "100px",
      "width": "100px",
    };

    expect(wrapper.instance().computeFrameStyles()).toEqual(expectedFrameStyles);
    expect(wrapper.instance().computeViewStyles()).toEqual(expectedViewStyles);
  });

  it('computes correct styles in landscape mode', () => {
    const { wrapper } = setupShallow({
      orientation: MobileOrientation.Landscape
    });

    const expectedFrameStyles = {
      "height": "100px",
      "position": "absolute",
      "right": 0,
      "width": "28px"
    };

    const expectedViewStyles = {
      "background": "#322F37",
      "height": "100px",
      "width": "100px",
    };

    expect(wrapper.instance().computeFrameStyles()).toEqual(expectedFrameStyles);
    expect(wrapper.instance().computeViewStyles()).toEqual(expectedViewStyles);
  })
});
