import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { ConfigurationServiceView } from './component';
import { createExtensionManifestForTest } from '../tests/constants/extension';
import { DeveloperRigUserId } from '../constants/rig';

const globalAny = global as any;

function mockApiFunctions() {
  const original = require.requireActual('../util/api');
  return {
    ...original,
    fetchChannelConfigurationSegments: jest.fn().mockImplementation(() => Promise.resolve({})),
    fetchUser: jest.fn().mockImplementation((_, login) => Promise.resolve(login === 'developerrig' ? { id: '999999999' } : null)),
  }
}
jest.mock('../util/api', () => mockApiFunctions());
const api = require.requireMock('../util/api');

localStorage.setItem('rigLogin', JSON.stringify({ authToken: 1 }));

describe('<ConfigurationServiceView />', () => {
  const setupShallow = setupShallowTest(ConfigurationServiceView, () => ({
    authToken: 'authToken',
    configurations: {
      channelSegments: {},
      globalSegment: {
        content: '',
        version: '',
      },
    },
    rigProject: {
      extensionViews: [],
      isLocal: true,
      projectFolderPath: 'test',
      manifest: createExtensionManifestForTest(),
      secret: 'test',
      frontendFolderName: 'test',
      frontendCommand: 'test',
      backendCommand: 'test',
    },
    userId: DeveloperRigUserId,
    saveHandler: jest.fn(),
  }));

  it('renders correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper).toMatchSnapshot();
  });

  describe('fetchChannelConfiguration', () => {
    it('fetches by name', () => {
      const { wrapper } = setupShallow();
      [
        ['configurationType', 'select', 'developer'],
        ['channelId', 'input[name="channelId"]', 'developerrig'],
      ].forEach(([name, selector, value]) => {
        wrapper.find(selector).simulate('change', { currentTarget: { name, value } });
        wrapper.update();
      });
      wrapper.find('.configuration-service-view__button').first().simulate('click');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            expect(api.fetchUser).toHaveBeenCalled();
            expect(api.fetchChannelConfigurationSegments).toHaveBeenCalled();
            wrapper.update();
            const instance = wrapper.instance() as ConfigurationServiceView;
            expect(instance.state.fetchStatus).toEqual('');
            resolve();
          } catch (ex) {
            reject(ex.message);
          }
        });
      });
    });

    it('fails on unknown name', () => {
      const { wrapper } = setupShallow();
      wrapper.find('select').simulate('change', { currentTarget: { name: 'configurationType', value: 'developer' } });
      const value = 'unknown';
      wrapper.find('input[name="channelId"]').simulate('change', { currentTarget: { name: 'channelId', value } });
      wrapper.update();
      wrapper.find('.configuration-service-view__button').first().simulate('click');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            expect(api.fetchUser).toHaveBeenCalled();
            expect(api.fetchChannelConfigurationSegments).toHaveBeenCalled();
            wrapper.update();
            const instance = wrapper.instance() as ConfigurationServiceView;
            expect(instance.state.fetchStatus).toEqual(`Cannot fetch user "${value}"`);
            resolve();
          } catch (ex) {
            reject(ex.message);
          }
        });
      });
    });
  });

  it('invokes configuration type change handler', () => {
    const { wrapper } = setupShallow();
    const instance = wrapper.instance() as ConfigurationServiceView;
    const [name, value] = ['configurationType', 'global'];
    wrapper.find('select').simulate('change', { currentTarget: { name, value } });
    wrapper.update();
    expect(instance.state[name]).toEqual(value);
  });

  describe('save', () => {
    it('invokes save handler', () => {
      const { wrapper } = setupShallow();
      const instance = wrapper.instance() as ConfigurationServiceView;
      ['configuration', 'version'].forEach((name) => {
        const selector = name === 'configuration' ? 'textarea' : `input[name="${name}"]`;
        wrapper.find(selector).simulate('change', { currentTarget: { name, value: '{}' } });
      });
      wrapper.update();
      wrapper.find('.configuration-service-view__button').first().simulate('click');
      expect(instance.props.saveHandler).toHaveBeenCalledTimes(1);
    });

    it('fails on unknown name', () => {
      const { wrapper } = setupShallow();
      const instance = wrapper.instance() as ConfigurationServiceView;
      const value = 'broadcaster';
      [
        ['configurationType', 'select'],
        ['channelId', 'input[name="channelId"]'],
        ['configuration', 'textarea'],
        ['version', 'input[name="version"]'],
      ].forEach(([name, selector]) => {
        wrapper.find(selector).simulate('change', { currentTarget: { name, value } });
        wrapper.update();
      });
      wrapper.find('.configuration-service-view__button').at(1).simulate('click');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            wrapper.update();
            expect(instance.state.fetchStatus).toEqual(`Cannot fetch user "${value}"`);
            resolve();
          } catch (ex) {
            reject(ex.message);
          }
        });
      });
    });
  });

  describe('cancel', () => {
    it('invokes for channel', () => {
      const { wrapper } = setupShallow();
      const instance = wrapper.instance() as ConfigurationServiceView;
      const value = 'broadcaster';
      [
        ['configurationType', 'select'],
        ['channelId', 'input[name="channelId"]'],
        ['configuration', 'textarea'],
        ['version', 'input[name="version"]'],
      ].forEach(([name, selector]) => {
        wrapper.find(selector).simulate('change', { currentTarget: { name, value } });
        wrapper.update();
      });
      wrapper.find('.configuration-service-view__button').at(2).simulate('click');
      wrapper.update();
      expect(instance.state.configuration).toEqual('');
    });

    it('invokes for global', () => {
      const { wrapper } = setupShallow();
      const instance = wrapper.instance() as ConfigurationServiceView;
      ['configuration', 'version'].forEach((name) => {
        const selector = name === 'configuration' ? 'textarea' : `input[name="${name}"]`;
        wrapper.find(selector).simulate('change', { currentTarget: { name, value: '{}' } });
      });
      wrapper.update();
      wrapper.find('.configuration-service-view__button').at(1).simulate('click');
      wrapper.update();
      expect(instance.state.configuration).toEqual(instance.props.configurations.globalSegment.content);
    });
  });

  it('opens documentation window', () => {
    globalAny.open = jest.fn();
    const { wrapper } = setupShallow();
    wrapper.find('.configuration-service-view__button').last().simulate('click');
    expect(globalAny.open).toHaveBeenCalledWith('https://dev.twitch.tv/docs/extensions/building/#configuration-service', 'developer-rig-help');
  });

  it('opens tutorial window', () => {
    globalAny.open = jest.fn();
    const { wrapper } = setupShallow();
    wrapper.find('.configuration-service-view__button').at(2).simulate('click');
    expect(globalAny.open).toHaveBeenCalledWith('https://www.twitch.tv/videos/320483709', 'developer-rig-help');
  });
});
