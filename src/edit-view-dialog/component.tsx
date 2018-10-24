import * as React from 'react';
import * as closeButton from '../img/close_icon.png';
import './component.sass';
import { RadioOption } from '../extension-view-dialog/radio-option';
import { MobileOrientation } from '../constants/mobile';
import { RigExtensionView } from '../core/models/rig';
import { ExtensionViewType } from '../constants/extension-coordinator';

export interface EditViewProps {
  x?: number;
  y?: number;
  orientation?: string;
}

interface EditViewDialogProps {
  viewForEdit: RigExtensionView;
  closeHandler: () => void;
  saveViewHandler: (viewForEdit: RigExtensionView, newView: EditViewProps) => void;
}

interface State {
  x?: number;
  y?: number;
  orientation?: string;
  type?: string;
}

type Props = EditViewDialogProps;

export class EditViewDialog extends React.Component<Props, State> {
  public state: State = {
    x: this.props.viewForEdit.x,
    y: this.props.viewForEdit.y,
    orientation: this.props.viewForEdit.orientation,
    type: this.props.viewForEdit.type,
  }

  private renderOrientationComponents() {
    return Object.keys(MobileOrientation).map(option => {
      return <RadioOption
        key={option}
        name='orientation'
        value={MobileOrientation[option]}
        onChange={this.onChange}
        checked={option === this.state.orientation} />
    });
  }

  private onChange = (input: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      [input.currentTarget.name]: input.currentTarget.value,
    });
  }

  private editClassFromType() {
    return this.state.type === ExtensionViewType.Component ? 'edit-view__dialog-component' :
      this.state.type === ExtensionViewType.Mobile ? 'edit-view__dialog-mobile' : 'edit-view__dialog';
  }

  public render() {
    return (
      <div className='edit-view'>
        <div className="edit-view__background" />
        <div className={this.editClassFromType()}>
          <div className="dialog__top-bar-container">
            <div className="top-bar-container__title"> Edit View </div>
            <div className="top-bar-container__escape" onClick={this.props.closeHandler}><img alt="Close" src={closeButton} /></div>
          </div>
          <hr className="dialog__divider" />

          {this.state.type === ExtensionViewType.Component &&
            <div className="edit-view__content">
              <div className="type-and-size-container__type-title">
                Position (%)
              </div>
              <div className='overlay-custom-container'>
                <div className='overlay-custom-container'>
                  <div className="edit-subcontainer__input">
                    <label className="inputs__option-label">X</label>
                    <input type="text" name="x" value={this.state.x} onChange={this.onChange} />
                  </div>
                  <div className="edit-subcontainer__input">
                    <label className="inputs__option-label">Y</label>
                    <input type="text" name="y" value={this.state.y} onChange={this.onChange} />
                  </div>
                </div>
              </div>
            </div>}

          {this.state.type === ExtensionViewType.Mobile &&
            <div className="size-title__size-subcontainer">
              <div className="size-subcontainer__presets">
                <div className="type-and-size-container__type-title">
                  Orientation
                </div>
                <div className='overlay-custom-container'>
                  {this.renderOrientationComponents()}
                </div>
              </div>
            </div>}

          <hr className="dialog__divider" />
          <div className="dialog_bottom-bar">
            <div className="bottom-bar__save" onClick={() => this.props.saveViewHandler(this.props.viewForEdit, this.state)}> Save </div>
            <div className="bottom-bar__cancel" onClick={this.props.closeHandler}> Cancel </div>
          </div>
        </div>
      </div>
    );
  }
}
