import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class ExtensionRigConsoleLog extends Component {
  render() {
    return (
      <div>
        {this.props.frame} $ {this.props.log}
      </div>
    )
  }
}

ExtensionRigConsoleLog.propTypes = {
  frame: PropTypes.string.isRequired,
  log: PropTypes.string.isRequired,
};
