import React, { Component } from 'react';
import PropTypes from 'prop-types';
import closeButton from '../img/close_icon.png';
import './component.sass';
import { RadioOption } from '../extension-view-dialog/radio-option';
import { DefaultMobileOrientation } from '../constants/mobile';
import { MobileOrientation} from '../constants/mobile';
const { ExtensionViewType } = window['extension-coordinator'];

export class EditViewDialog extends Component {
  constructor(args) {
    super(args);
    this.state = {
      x: 0,
      y: 0,
      orientation: DefaultMobileOrientation,
      type: '',
    }
  }

  renderOrientationComponents() {
    return Object.keys(MobileOrientation).map(option => {
      return <RadioOption key={option} name="orientation" value={MobileOrientation[option]} onChange={this.onChange} checked={option === this.state.orientation}/>
    });
  }

  onChange = (input) => {
    const newState = {};
    newState[input.target.name] = input.target.value;
    this.setState(newState);
  }

  componentDidMount() {
    this.props.views.forEach(element => {
      if (element.id === this.props.idToEdit) {
        this.setState({
          x: element.x,
          y: element.y,
          orientation: element.orientation,
          type: element.type
        });
      }
    });
  }

  editClassFromType() {
    let editClass;
    switch (this.state.type) {
      case ExtensionViewType.Component:
        editClass = 'edit-view__dialog-component';
        break;
      case ExtensionViewType.Mobile:
        editClass = 'edit-view__dialog-mobile';
        break;
      default:
        editClass = 'edit-view__dialog'
    }
    return editClass;
  }

  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className='edit-view'>
        <div className="edit-view__background"/>
        <div className={this.editClassFromType()}>
          <div className="dialog__top-bar-container">
            <div className="top-bar-container__title"> Edit View </div>
            <div className="top-bar-container__escape" onClick={this.props.closeHandler}><img alt="Close" src={closeButton}/></div>
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

          <hr className="dialog__divider"/>
          <div className="dialog_bottom-bar">
            <div className="bottom-bar__save" onClick={() => this.props.saveViewHandler(this.state)}> Save </div>
            <div className="bottom-bar__cancel" onClick={this.props.closeHandler}> Cancel </div>
          </div>
        </div>
      </div>
    );
  }
}

EditViewDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  idToEdit: PropTypes.string.isRequired,
  views: PropTypes.array.isRequired,
  closeHandler: PropTypes.func.isRequired,
  saveViewHandler: PropTypes.func.isRequired,
};
