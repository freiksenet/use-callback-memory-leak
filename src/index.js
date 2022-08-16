import "./style";
import * as React from "react";
import { render } from "react-dom";

const ChangingContext = React.createContext();

class LeakyClass {
  constructor(iteration) {
    this.marker = "LeakyClassMarker";
    this.iteration = iteration;
  }
}

export default function App() {
  const [state, updateState] = React.useState(new LeakyClass(0));
  return (
    <ChangingContext.Provider value={{ leakClass: state }}>
      <div className="App">
        <LeakyLeak leaky={state} />
        <button
          onClick={() =>
            updateState((state) => new LeakyClass(state.iteration + 1))
          }
        >
          Generate Leak
        </button>
      </div>
    </ChangingContext.Provider>
  );
}

function LeakyLeak({ leaky }) {
  let context = React.useContext(ChangingContext);
  // state to force refresh callback and release leaked momery
  let [releaser, releaseTheLeak] = React.useState(0);
  // this callback is fine, it depends on context and will get regenerated
  let enclosingCallback = React.useCallback(() => {
    return context;
  }, [context]);
  // this callback doesn't use context, but will not release it from it's lexical closure
  // until component is remounted
  let leakingCallback = React.useCallback(() => {
    return null;
  }, [releaser]);
  return (
    <div onHover={enclosingCallback} onClick={leakingCallback}>
      Leaky is iteration {leaky.iteration}
      <div>
        <button onClick={releaseTheLeak}>Clear leak</button>
      </div>
    </div>
  );
}

render(<App />, document.body);
