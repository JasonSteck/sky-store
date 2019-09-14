import React, { useRef } from "react";
import ReactDOM from "react-dom";

import { a, ex, Sky } from "./example/my-store";
import { useX, useStatus, useIncrement } from "./example/my-states";
import "./example/my-middlewares";
import "./example/my-styles.css";

function App() {
  return (
    <Sky.Store>
      <h1>SkyStore</h1>
      <div className="content">
        <Status />
        <Controls />
        <TooBig />
      </div>
    </Sky.Store>
  );
}

function Status() {
  const status = useStatus();
  return <Box>Status: {status}</Box>;
}

function Controls() {
  const x = useX();
  const increment = useIncrement();

  return (
    <Box>
      <button onClick={a.thing_was_clicked}>Thing</button>
      <button onClick={() => a.clicked_x(increment)}>X: {x}</button>
      <button onClick={ex.increment}>+{increment}</button>
    </Box>
  );
}

function TooBig() {
  const x = useX();
  const max = 5;
  const tooBig = x > max;

  return (
    <Box>
      <span>
        X > {max} ? {tooBig ? "yes" : "no"}
      </span>
      {tooBig && (
        <button onClick={() => a.drop_x(0)}>Drop X from {x} to 0</button>
      )}
    </Box>
  );
}

/**
 * Just flashes the circle whenever it gets rendered
 */
function Box({ children }) {
  const flash = useRef(0);
  return (
    <div>
      <span key={flash.current++} className="flash-circle" /> {children}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
