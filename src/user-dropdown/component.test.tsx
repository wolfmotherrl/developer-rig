import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { UserDropdownComponent } from './component';
import { LocalStorageKeys } from '../constants/rig';

describe('<UserDropdownComponent />', () => {
  const defaultGenerator = () => ({
    session: {
      authToken: 'test',
      displayName: 'test',
      id: 'test',
      login: 'test',
      profileImageUrl: 'test.png',
    },
    logout: jest.fn(),
  });
  const setupRenderer = setupShallowTest(UserDropdownComponent, defaultGenerator);

  it('renders correctly', () => {
    const { wrapper } = setupRenderer();
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render if session null', () => {
    const { wrapper } = setupRenderer({
      session: null,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when clicked', () => {
    const { wrapper } = setupRenderer();
    wrapper.simulate('click');
    expect(wrapper.find('.user-dropdown__menu.open')).toHaveLength(1);

    wrapper.simulate('click');
    expect(wrapper.find('.open')).toHaveLength(0);
  });

  it('signs out', () => {
    const { wrapper } = setupRenderer();
    wrapper.find('li').last().simulate('click');
    expect(localStorage.getItem(LocalStorageKeys.RigLogin)).toEqual(null);
    expect(wrapper.instance().props.logout).toHaveBeenCalledTimes(1);
  });
});
