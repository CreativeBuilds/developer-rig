import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './component.sass';
import './component.css';

export class DivOption extends Component {
  render() {
    return (
      <div className="extension-container__block">
        <label className="extension-type-label">
          <input type="radio" name="extensionViewType" value={this.props.value} onChange={this.props.onChange} defaultChecked={this.props.checked}/>
          <div className="extension-type-box">
            <img
              className='extension-type-box__img'
              alt={this.props.value}
              src={this.props.img} />
          </div>
          <div className={this.props.checked ? 'extension-type-text dialog-selected': 'extension-type-text'}>{this.props.name}</div>
        </label>
      </div>
    );
  }
}

DivOption.propTypes = {
  img: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool,
};
