import { a, ex, Sky } from "./my-store";
import { useX } from "./my-states";

/**
 * Simple Action Logger
 */
Sky.middleware(state => action => {
  console.log(
    `Action "${action.type}" was dispatched with value: ${action.val}`
  );
});

/**
 * Async fetch
 */
Sky.middleware(a.thing_was_clicked, getState => async action => {
  const x = getState(useX);
  const data = await getData(x);
  a.fetched_data(data);
});

/**
 * Stateful middlware
 */
Sky.middleware(state => {
  let counter = 0;

  return action => {
    const num = counter++;
    console.log(`Starting action #${num}...`);

    return oldState => {
      console.log(`Finished action #${num}`);
    };
  };
}, ex.increment); // also listens to these exclusive action(s)

/**
 * State Change Logger
 */
let toWatch = [];
export const watch = (name, hook) => toWatch.push([name, hook]);

Sky.middleware(currentState => action => oldState => {
  toWatch.forEach(([name, hook]) => {
    const old = JSON.stringify(oldState(hook));
    const val = JSON.stringify(currentState(hook));
    if (old !== val)
      console.log(`"${action.type}" changed ${name} from: ${old} to ${val}`);
  });
});

// === helpers === //
let data = 0;
const getData = () => new Promise(res => setTimeout(res, 500, data++));
