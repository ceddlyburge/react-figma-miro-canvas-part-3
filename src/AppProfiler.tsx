// import { Profiler } from "react";
import { App } from "./App";

export const AppProfiler = () => {

  // const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  //   console.log('actualDuration:', actualDuration);
  // }

  return (
    // <Profiler onRender={onRender} id="App">
    <App />
    // </Profiler>
  );
};
