import * as React from 'react';
import './component.sass';

interface ConsoleEntry {
  frame: string;
  log: string;
}

interface State {
  logHistory: ConsoleEntry[];
}

export class Console extends React.Component<{}, State> {
  private console: React.RefObject<HTMLDivElement>;

  public state: State = {
    logHistory: window.rig.history || [],
  }

  constructor(props: {}) {
    super(props);
    this.console = React.createRef();
  }

  private updateConsole() {
    setTimeout(() => {
      const console = this.console.current;
      if (console) {
        const { offsetHeight, scrollHeight } = console;
        console.scrollTop = Math.max(0, scrollHeight - offsetHeight);
      }
    });
    this.setState({
      logHistory: window.rig.history
    });
  }

  public componentDidMount() {
    window.rig.update = () => {
      this.updateConsole();
    }

    this.updateConsole();
  }

  public render() {
    const logs = this.state.logHistory.map((entry, index) => (
      <div key={index}>{entry.frame} $ {entry.log}</div>
    ));

    return (
      <div className="console" ref={this.console}>{logs}</div>
    );
  }
}
