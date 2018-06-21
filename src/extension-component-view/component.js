import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ExtensionFrame } from '../extension-frame';
const { ExtensionMode, ExtensionViewType, getComponentPositionFromView, getComponentSizeFromView } = window['extension-coordinator'];

export class ExtensionComponentView extends Component {
  computeViewStyles() {
    const extension = this.props.extension;
    const positionFromView = getComponentPositionFromView(
      this.props.frameSize.width,
      this.props.frameSize.height,
      {
        x: this.props.position.x * 100,
        y: this.props.position.y * 100,
      });
    const sizeFromView = getComponentSizeFromView(
      this.props.frameSize.width,
      this.props.frameSize.height,
      extension.views.component);

    let viewStyles = {
      border: '1px solid #7D55C7',
      position: 'absolute',
      left: positionFromView.x + 'px',
      top: positionFromView.y + 'px',
      width: `${sizeFromView.width}px`,
      height: `${sizeFromView.height}px`,
    }

    if (extension.views.component.zoom) {
      viewStyles = {
        ...viewStyles,
        width: `${sizeFromView.width / sizeFromView.zoomScale}px`,
        height: `${sizeFromView.height / sizeFromView.zoomScale}px`,
        transformOrigin: '0 0',
        transform: `scale(${sizeFromView.zoomScale})`,
      }
    }

    return viewStyles;
  }

  render() {
    return (
      <div
        className="view component-view"
        style={{
          width: this.props.frameSize.width + 'px',
          height: this.props.frameSize.height + 'px',
        }}>
          <div style={this.computeViewStyles()}>
          <ExtensionFrame
            className="view"
            frameId={`frameid-${this.props.id}`}
            extension={this.props.extension}
            type={ExtensionViewType.Component}
            mode={ExtensionMode.Viewer}
          />
        </div>
      </div>
    );
  }
}

ExtensionComponentView.propTypes = {
  id: PropTypes.string.isRequired,
  extension: PropTypes.object.isRequired,
  frameSize: PropTypes.object.isRequired,
  position: PropTypes.object.isRequired,
  role: PropTypes.string,
};
