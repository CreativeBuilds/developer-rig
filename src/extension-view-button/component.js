import React, { Component } from 'react';
import PropTypes from 'prop-types';
import line from '../img/rig_line.png';
import plus from '../img/plus_icon.png';
import './component.sass'

export class ExtensionViewButton extends Component {
  render() {
    return (
      <div className='button-wrapper'>
        <img alt='line' className='background' src={line} />
        <div className="circle-button" onClick={this.props.onClick}>
          <img alt='Add new view' src={plus} />
        </div>
      </div>
    )
  }
}

ExtensionViewButton.propTypes = {
  onClick: PropTypes.func.isRequired
}
