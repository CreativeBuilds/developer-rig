import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './component.sass';
import { ExtensionFrame } from '../extension-frame';
import { IdentityOptions } from '../constants/identity-options';
import { ViewerTypes } from '../constants/viewer-types';
import { CONFIG_VIEW_DIMENSIONS, CONFIG_VIEW_WRAPPER_DIMENSIONS, PANEL_VIEW_DIMENSIONS } from '../constants/view_sizes';
import closeButton from '../img/close_icon.png';
import { ExtensionComponentView } from '../extension-component-view';
import { ExtensionMobileView } from '../extension-mobile-view/component';

const { ExtensionAnchor, ExtensionMode, ExtensionViewType, ExtensionPlatform} = window['extension-coordinator'];

export class ExtensionView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mousedOver: false,
    };
  }

  mouseEnter() {
    this.setState({
      mousedOver: true,
    });
  }

  mouseLeave() {
    this.setState({
      mousedOver: false
    });
  }

  renderView(extensionProps) {
    let view = null;
    switch (this.props.type) {
      case ExtensionAnchor.Component:
        view = (<ExtensionComponentView
          id={`component-${this.props.id}`}
          className="view"
          frameId={`frameid-${this.props.id}`}
          extension={this.props.extension}
          frameSize={this.props.frameSize}
          position={this.props.position}
        />);
        break;
      case ExtensionViewType.Mobile:
        view = (<ExtensionMobileView
          id={`mobile-${this.props.id}`}
          className="view"
          frameId={`frameid-${this.props.id}`}
          extension={this.props.extension}
          frameSize={this.props.frameSize}
          position={this.props.position}
          orientation={this.props.orientation}
        />);
        break;
      default:
        // standard view for overlays, panels, live config, and broadcaster config
        view = (<div
          className="view"
          style={extensionProps.viewStyles}>
          <ExtensionFrame
            className="view"
            frameId={`frameid-${this.props.id}`}
            extension={this.props.extension}
            type={this.props.type}
            mode={this.props.mode}
          />
        </div>)
        break;
    }
    return view;
  }

  renderLinkedOrUnlinked() {
    return this.props.linked ? IdentityOptions.Linked : IdentityOptions.Unlinked;
  }

  _isEditable() {
    return this.props.type === ExtensionAnchor.Component || this.props.type === ExtensionPlatform.Mobile;
  }

  render() {
    const extensionProps = {}
    let panelHeight = PANEL_VIEW_DIMENSIONS.height;
    if (this.props.extension.views.panel && this.props.extension.views.panel.height) {
      panelHeight = this.props.extension.views.panel.height;
    }
    switch(this.props.type) {
      case ExtensionAnchor.Panel:
        extensionProps.viewStyles = {
          height: panelHeight + 'px',
          width: PANEL_VIEW_DIMENSIONS.width + 'px',
        }
        break;
      case ExtensionAnchor.Overlay:
        extensionProps.viewStyles = {
          width: this.props.frameSize.width + 'px',
          height: this.props.frameSize.height + 'px'
        };
        break;
      case ExtensionMode.Config:
        extensionProps.viewStyles = CONFIG_VIEW_DIMENSIONS;
        extensionProps.viewWrapperStyles = CONFIG_VIEW_WRAPPER_DIMENSIONS;
        break;
      case ExtensionViewType.LiveConfig:
        extensionProps.viewStyles = {
          height: panelHeight + 'px',
          width: PANEL_VIEW_DIMENSIONS.width + 'px',
        }
        break;
      default:
        extensionProps.viewStyles = PANEL_VIEW_DIMENSIONS;
        break;
    }

    return (
      <div
        className={'view__wrapper'}
        onMouseEnter={() => { this.mouseEnter() }}
        onMouseLeave={() => { this.mouseLeave() }}
        style={extensionProps.viewWrapperStyles}>
        <div
          className={'view__header'}>
          {(this.props.deleteViewHandler !== undefined && this.state.mousedOver) &&
            (
            <div>
              <div className={'view__close_button'}
                onClick={() => { this.props.deleteViewHandler(this.props.id) }}>
              <img
                alt='Close'
                src={closeButton}
              />
              </div>
              { this._isEditable() &&
                <div className='view__edit_button'
                onClick={() => { this.props.openEditViewHandler(this.props.id) }}>
                Edit
                </div>}
            </div>
          )
          }
          <div className={'view__descriptor'}>
            { this.props.role }
          </div>
          <div className={'view__descriptor'}>
            {(this.props.role === ViewerTypes.LoggedIn) ?
              this.renderLinkedOrUnlinked() : null}
          </div>
        </div>
        {this.renderView(extensionProps)}
      </div>
    );
  }
}

ExtensionView.propTypes = {
  id: PropTypes.string.isRequired,
  extension: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  role: PropTypes.string,
  deleteViewHandler: PropTypes.func,
  openEditViewHandler: PropTypes.func,
  position: PropTypes.object,
  frameSize: PropTypes.object,
};
