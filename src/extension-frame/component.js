import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './component.sass';

const { ExtensionPlatform, ExtensionViewType} = window['extension-coordinator'];

const IFRAME_CLASS = 'extension-frame';
const EXTENSION_FRAME_INIT_ACTION = 'extension-frame-init';

export class ExtensionFrame extends Component {
  componentDidMount() {
    if (this.iframe) {
      this.iframe.onload = this._extensionFrameInit;
    }
  }

  render() {
    return (
      <iframe
      ref={this._bindIframeRef}
        src={process.env.PUBLIC_URL + '/extension-frame.html'}
        frameBorder={0}
        className={'rig-frame ' + IFRAME_CLASS}
        title={this.props.frameId}/>
    );
  }

  _bindIframeRef = (iframe) => {
    this.iframe = iframe;
  }

  _extensionFrameInit = () => {
    const extension = {
      anchor: this.props.type,
      channelId: this.props.extension.channelId,
      loginId: null,
      extension: this.props.extension,
      mode: this.props.mode,
      platform: (this.props.type === ExtensionViewType.Mobile) ? ExtensionPlatform.Mobile : ExtensionPlatform.Web,
      trackingProperties: {},
      iframeClassName: IFRAME_CLASS,
    }
    const data = {
      extension: extension,
      action: EXTENSION_FRAME_INIT_ACTION,
      frameId: this.props.frameId,
    }
    this.iframe.contentWindow.postMessage(data, '*');
  }

  _onIdentityLinked(isLinked) {}

  _onFrameDoubleClick(evt) {
    evt.preventDefault();
  }

  _onModalRequested(confirmationRequest) {}
}

ExtensionFrame.propTypes = {
  className: PropTypes.string.isRequired,
  frameId: PropTypes.string.isRequired,
  extension: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};
