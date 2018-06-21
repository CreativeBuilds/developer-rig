import React, { Component } from 'react';
import PropTypes from 'prop-types';
import closeButton from '../img/close_icon.png';
import './component.sass';

export class RigConfigurationsDialog extends Component {
  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className="rig-configurations-view">
        <div className="rig-configurations-view__background"/>
        <div className="rig-configurations-view__dialog">
          <div className="dialog__top-bar-container">
            <div className="top-bar-container__title"> Dev Rig Configurations </div>
            <div className="top-bar-container__escape" onClick={this.props.closeConfigurationsHandler}><img alt="Close" src={closeButton}/></div>
          </div>
          <hr className="dialog__divider"/>
          <div className="rig-configurations-view__content"> {JSON.stringify(this.props.config, null, 2)} </div>
          <hr className="dialog__divider"/>
          <div className="dialog_bottom-bar">
            <div className="bottom-bar__refresh" onClick={this.props.refreshConfigurationsHandler}> Refresh </div>
            <div className="bottom-bar__cancel" onClick={this.props.closeConfigurationsHandler}> Cancel </div>
          </div>
        </div>
      </div>
    );
  }
}

RigConfigurationsDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
  closeConfigurationsHandler: PropTypes.func.isRequired,
  refreshConfigurationsHandler: PropTypes.func.isRequired,
};
