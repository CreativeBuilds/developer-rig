import React, { Component } from 'react';
import { ExtensionRigConsoleLog } from '../console-log';
import './component.sass';

export class ExtensionRigConsole extends Component {

  constructor(props) {
    super(props);
    window.rig.update = () => {
      this.updateConsole()
    }
    this.state = {
      logHistory: window.rig.history || []
    }
  }

  updateConsole() {
    this.setState({
      logHistory: window.rig.history
    });
  }

  componentWillMount() {
    this.updateConsole();
  }

  render() {
    const logs = this.state.logHistory.map((log, index) => {
      return <ExtensionRigConsoleLog key={index} log={log.log} frame={log.frame} />;
    });
    return (
      <div>
        <div className="console">
          {logs}
        </div>
      </div>
    );
  }
}
