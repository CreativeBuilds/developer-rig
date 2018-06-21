import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ExtensionFrame } from '../extension-frame';
import { MobileOrientation } from '../constants/mobile';
const { ExtensionMode, ExtensionViewType } = window['extension-coordinator'];

const ViewBackgroundColor = '#322F37';
const AbsolutePosition = 'absolute';

export class ExtensionMobileView extends Component {
  computeFrameStyles() {
    let frameStyles;

    if (this.props.orientation === MobileOrientation.Portrait) {
      const height = Math.floor(this.props.frameSize.height * 0.65);
      frameStyles = {
        width: `${this.props.frameSize.width}px`,
        height: `${height}px`,
        bottom: 0
      }
    } else {
      const width = Math.floor(this.props.frameSize.height * 0.28);
      frameStyles = {
        width: `${width}px`,
        height: `${this.props.frameSize.width}px`,
        right: 0
      }
    }

    frameStyles.position = AbsolutePosition;
    return frameStyles;
  }

  computeViewStyles() {
    let viewStyles;
    if (this.props.orientation === MobileOrientation.Portrait) {
      viewStyles = {
        width: this.props.frameSize.width + 'px',
        height: this.props.frameSize.height + 'px',
      }
    } else {
      viewStyles = {
        width: this.props.frameSize.height + 'px',
        height: this.props.frameSize.width + 'px',
      }
    }

    viewStyles.background = ViewBackgroundColor;
    return viewStyles;
  }
  render() {
    return (
      <div
        className="view component-view"
        style={this.computeViewStyles()}>
          <div style={this.computeFrameStyles()}>
          <ExtensionFrame
            className="view"
            frameId={`frameid-${this.props.id}`}
            extension={this.props.extension}
            type={ExtensionViewType.Mobile}
            mode={ExtensionMode.Viewer}
          />
        </div>
      </div>
    );
  }
}

ExtensionMobileView.propTypes = {
  id: PropTypes.string.isRequired,
  orientation: PropTypes.string.isRequired,
  extension: PropTypes.object.isRequired,
  frameSize: PropTypes.object.isRequired,
  position: PropTypes.object.isRequired,
  role: PropTypes.string,
};
