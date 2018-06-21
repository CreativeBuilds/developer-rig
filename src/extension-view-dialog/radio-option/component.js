import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './component.sass';

export class RadioOption extends Component {
  render() {
    return (
      <div className='option-div'>
        <label className="option-label">
            <input type="radio" name={this.props.name} value={this.props.value} onChange={this.props.onChange} defaultChecked={this.props.checked}/>
            <span className={this.props.checked ? 'dialog-selected': null}>{this.props.value}</span>
        </label>
      </div>
    )
  }
}

RadioOption.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool
}
