import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { setupMountTest } from '../tests/enzyme-util/mount';
import { createExtensionForTest } from '../tests/constants/extension';
import { ExtensionFrame } from './component';
import { ExtensionViewType, ExtensionAnchor, ExtensionMode } from '../constants/extension-coordinator';

const defaultPropGenerator = () => ({
  channelId: 'twitch',
  className: 'view',
  configuration: {},
  frameId: '0',
  installationAbilities: {
    isChatEnabled: true,
  },
  extension: createExtensionForTest(),
  type: ExtensionAnchor.Panel,
  mode: ExtensionMode.Viewer,
  iframe: '',
  isLocal: false,
  isPopout: false,
  bindIframeToParent: jest.fn(),
});

const setupShallow = setupShallowTest(ExtensionFrame, defaultPropGenerator);
const setupMount = setupMountTest(ExtensionFrame, defaultPropGenerator);

describe('<ExtensionFrame />', () => {
  it('local onload postMessages data correctly', () => {
    const { wrapper } = setupMount({ isLocal: true });
    const mockIframeRef: any = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };
    const instance = wrapper.instance() as ExtensionFrame;
    instance.iframe = mockIframeRef;
    instance.extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith(createExpected('panel', true), '*');
  });

  it('online onload postMessages data correctly', () => {
    const { wrapper } = setupMount();
    const mockIframeRef: any = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };
    const instance = wrapper.instance() as ExtensionFrame;
    instance.iframe = mockIframeRef;
    instance.extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith(createExpected('panel'), '*');
  });

  it('local onload postMessages data correctly when platform is mobile', () => {
    const { wrapper } = setupMount({
      isLocal: true,
      type: ExtensionViewType.Mobile,
    });
    const mockIframeRef: any = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };
    const instance = wrapper.instance() as ExtensionFrame;
    instance.iframe = mockIframeRef;
    instance.extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith(createExpected('mobile', true), '*');
  });

  it('online onload postMessages data correctly when platform is mobile', () => {
    const { wrapper } = setupMount({
      type: ExtensionViewType.Mobile,
    });
    const mockIframeRef: any = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };
    const instance = wrapper.instance() as ExtensionFrame;
    instance.iframe = mockIframeRef;
    instance.extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith(createExpected('mobile'), '*');
  });

  describe('when in local live config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        isLocal: true,
        mode: ExtensionMode.Dashboard,
        type: ExtensionViewType.LiveConfig,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in online live config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        mode: ExtensionMode.Dashboard,
        type: ExtensionViewType.LiveConfig,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in local config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        isLocal: true,
        mode: ExtensionMode.Config,
        type: ExtensionViewType.Config,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in online config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        mode: ExtensionMode.Config,
        type: ExtensionViewType.Config,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in local panel mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        isLocal: true,
        mode: ExtensionMode.Viewer,
        type: ExtensionAnchor.Panel,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in online panel mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        mode: ExtensionMode.Viewer,
        type: ExtensionAnchor.Panel,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in local video overlay mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        isLocal: true,
        mode: ExtensionMode.Viewer,
        type: ExtensionAnchor.Overlay,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in online video overlay mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        mode: ExtensionMode.Viewer,
        type: ExtensionAnchor.Overlay,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  function createExpected(anchor: string, isLocal?: boolean) {
    const expected = {
      action: 'extension-frame-init',
      channelId: 'twitch',
      parameters: {
        anchor: anchor,
        channelId: NaN,
        configuration: {},
        extension: {
          authorName: 'test',
          bitsEnabled: false,
          clientId: 'mockClientId',
          description: 'description',
          hasChatSupport: false,
          iconUrl: 'iconUrl',
          iconUrls: { square100: '100x100' },
          id: 'id',
          name: 'name',
          requestIdentityLink: false,
          sku: 'sku',
          state: 'Released',
          summary: 'summary',
          token: 'token',
          vendorCode: 'vendorCode',
          version: '0.1',
          views: {
            config: {
              canLinkExternalContent: false,
              viewerUrl: 'https://test:8080',
            },
            component: {
              aspectHeight: 3000,
              aspectWidth: 2500,
              canLinkExternalContent: false,
              viewerUrl: 'https://test:8080',
              zoom: false,
              zoomPixels: 100,
            },
            liveConfig: {
              canLinkExternalContent: false,
              viewerUrl: 'https://test:8080',
            },
            mobile: {
              viewerUrl: 'https://test:8080',
            },
            panel: {
              canLinkExternalContent: false,
              height: 300,
              viewerUrl: 'https://test:8080',
            },
            videoOverlay: {
              canLinkExternalContent: false,
              viewerUrl: 'https://test:8080',
            },
          },
          whitelistedConfigUrls: ['foo'],
          whitelistedPanelUrls: ['bar'],
        },
        iframeClassName: 'extension-frame',
        installationAbilities: {
          isChatEnabled: true,
        },
        isPopout: false,
        loginId: null as null,
        mode: 'viewer',
        platform: anchor === 'mobile' ? 'mobile' : 'web',
        trackingProperties: {},
      },
      frameId: '0',
    };
    if (isLocal) {
      ['config', 'component', 'liveConfig', 'mobile', 'panel', 'videoOverlay'].forEach((viewName) => {
        const views: { [viewName: string]: { viewerUrl: string } } = expected.parameters.extension.views;
        views[viewName].viewerUrl += '?developer_rig=local';
      });
    }
    return expected;
  }
});
