import * as React from 'react';
import { DeveloperRigUserId } from '../constants/rig';

interface Props {
  isUser?: boolean;
  name: string;
  value: string;
  labelClassName?: string;
  textClassName?: string;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

interface State {
  checked: boolean;
  lastChannelId: string;
}


export class ChannelIdOrNameInput extends React.Component<Props, State> {
  state: State = {
    checked: this.props.value === DeveloperRigUserId,
    lastChannelId: '',
  }

  public render() {
    return (
      <>
        <label className={this.props.labelClassName}>
          <span className={this.props.textClassName}>
            {this.props.isUser ? 'User' : 'Channel'} ID or Name
          </span>
          <input type="text" name={this.props.name} value={this.props.value} onChange={this.props.onChange} disabled={this.state.checked} />
        </label>
        <label className={this.props.labelClassName}>
          <input type="checkbox" name="wantsDeveloperRigUserId" onChange={this.onChange} checked={this.state.checked} />
          Use Developer Rig user
        </label>
      </>
    );
  }

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    if (checked) {
      this.setState({ lastChannelId: this.props.value });
      this.props.onChange({ currentTarget: { name: this.props.name, value: DeveloperRigUserId } } as React.FormEvent<HTMLInputElement>);
    } else {
      this.props.onChange({ currentTarget: { name: this.props.name, value: this.state.lastChannelId } } as React.FormEvent<HTMLInputElement>);
    }
    this.setState({ checked });
  }
}
