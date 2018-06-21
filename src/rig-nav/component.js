import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './component.sass';
import { EXTENSION_VIEWS, BROADCASTER_CONFIG, LIVE_CONFIG, CONFIGURATIONS } from '../constants/nav-items'

export class RigNav extends Component {
  openConfigurationsHandler = () => {
    this.props.openConfigurationsHandler();
  }

  render() {
    if (this.props.error !== '') {
      return (
        <div className="top-nav-error">
          <a> {this.props.error} </a>
        </div>
      );
    } else {
      return (
        <div className="top-nav">
          <a
            className={this.props.selectedView === EXTENSION_VIEWS ? "top-nav-item top-nav-item__selected" : "top-nav-item"}
            onClick={this.props.viewerHandler}>Extension Views</a>
          <a
            className={this.props.selectedView === BROADCASTER_CONFIG ? "top-nav-item top-nav-item__selected" : "top-nav-item"}
            onClick={this.props.configHandler}>Broadcaster Config</a>
          <a
            className={this.props.selectedView === LIVE_CONFIG ? "top-nav-item top-nav-item__selected" : "top-nav-item"}
            onClick={this.props.liveConfigHandler}>Live Config</a>
          <a
            className={this.props.selectedView === CONFIGURATIONS ? "top-nav-item top-nav-item__selected" : "top-nav-item"}
            onClick={this.openConfigurationsHandler}>Configurations</a>
        </div>
      );
    }
  }
}

RigNav.propTypes = {
  openConfigurationsHandler: PropTypes.func,
  viewerHandler: PropTypes.func,
  configHandler: PropTypes.func,
  liveConfigHandler: PropTypes.func,
  selectedView: PropTypes.string,
  error: PropTypes.string,
};
