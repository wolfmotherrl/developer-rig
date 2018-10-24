import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { ChannelIdOrNameInput } from './component';
import { DeveloperRigUserId } from '../constants/rig';

describe('<ChannelIdOrNameInput />', () => {
  const setupShallow = setupShallowTest(ChannelIdOrNameInput, () => ({
    name: 'test',
    value: 'test',
    onChange: jest.fn(),
  }));

  it('renders correctly', () => {
    const { wrapper } = setupShallow();
    expect(wrapper).toMatchSnapshot();
  });

  it('enables textbox', () => {
    const { wrapper } = setupShallow();
    wrapper.find('input[type="checkbox"]').simulate('change', { currentTarget: { checked: false } });
    expect(wrapper.instance().props.onChange).toHaveBeenCalledWith({ currentTarget: { name: "test", value: "" } });
  });

  it('disables textbox', () => {
    const { wrapper } = setupShallow();
    wrapper.find('input[type="checkbox"]').simulate('change', { currentTarget: { checked: true } });
    expect(wrapper.instance().props.onChange).toHaveBeenCalledWith({ currentTarget: { name: "test", value: DeveloperRigUserId } });
  });

  it('accepts input', () => {
    const { wrapper } = setupShallow();
    const event = { currentTarget: { value: 'test' } };
    wrapper.find('input[type="text"]').simulate('change', event);
    expect(wrapper.instance().props.onChange).toHaveBeenCalledWith(event);
  });
});
