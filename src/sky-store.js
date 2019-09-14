import React, {
  Component,
  useEffect,
  useState,
  useRef,
  useContext,
  createContext
} from "react";

// warning: proof of concept, messy AF

const ACTION = "ACTION";
const ACTIONS = "ACTIONS";
const EXCLUSIVE_ACTION = "EXCLUSIVE_ACTION";
const EXCLUSIVE_ACTIONS = "EXCLUSIVE_ACTIONS";
const FUNCTION = "FUNCTION";
const VALUE = "VALUE";
const UNDEFINED = "UNDEFINED";

const defaultStoreMethods = {
  dispatch(type) {
    throw new Error(
      `SkyStore: Can't dispatch action "${type}" unless a <Sky.Store> is running.`
    );
  },
  subscribeToState() {
    throw new Error(
      "SkyStore: Can't subscribe to state unless a <Sky.Store> is running."
    );
  }
};

function trimUndefined(args) {
  let last = -1;
  args.forEach((a, i) => {
    if (a !== undefined) last = i;
  });
  return args.slice(0, last + 1);
}

export const createSky = () => {
  const allHooks = [];
  const regularHooks = [];
  const allMiddleware = [];
  const regularMiddleware = [];
  const storeContext = createContext({
    subscribeToState() {
      throw new Error("SkyStore: State hooks requires a <Sky.Store> ancestor");
    }
  });
  let storeMethods = defaultStoreMethods;

  // Hook Symbols
  const reducerSym = Symbol("reducerSym");
  const stateIndexSym = Symbol("stateIndexSym");
  const initialStateSym = Symbol("initialStateSym");

  // Action Symbols
  const subHookSym = Symbol("subHookSym");
  const subMiddlewareSym = Symbol("subMiddlewareSym");
  const isExActionSym = Symbol("isExActionSym");

  // ========================== State ========================== //

  const Sky = (...args) => {
    const useHook = () => {
      // Alllll of this is to avoid nesting a new provider in
      // the <Sky.Store> for every new reducer added to the store.
      // It would be so much simpler to do that but would look really
      // bad in React DevTools to have so many nested components top level.
      //
      // This could also be done with a single context containing
      // all state but then every component using any part of the state
      // would be re-rendered with every dispached action that changed something.
      const ctx = useContext(storeContext);
      const ref = useRef();
      if (!ref.current) {
        ref.current = ctx.subscribeToState(useHook, val => setState(val));
      }

      const { currentState, unsubscribe } = ref.current;
      const [state, setState] = useState(currentState);
      useEffect(() => unsubscribe, [unsubscribe]);
      return state;
    };

    let exclusiveState = false;
    useHook[reducerSym] = (_, action) => action.val; // Val becomes the new state by default
    useHook[initialStateSym] = undefined;

    const params = {
      val(type, arg) {
        if (type === VALUE || type === UNDEFINED) {
          useHook[initialStateSym] = arg;
          return true;
        }
        return false;
      },
      actions(type, arg) {
        switch (type) {
          case ACTION:
          case EXCLUSIVE_ACTION:
            exclusiveState = true;
            arg[subHookSym](useHook);
            return true;
          case ACTIONS:
          case EXCLUSIVE_ACTIONS:
            exclusiveState = true;
            arg.forEach(a => a[subHookSym](useHook));
            return true;
          default:
            return false;
        }
      },
      reducer(type, arg) {
        if (type === FUNCTION) {
          useHook[reducerSym] = arg;
          return true;
        }
        return false;
      },
      additionalActions(type, arg) {
        switch (type) {
          case ACTION:
          case ACTIONS:
            throw new Error(
              "SkyStore: Can only have EXCLUSIVE_ACTION(S) as the last argument. Please move all ACTION(S) to their proper place."
            );
          case EXCLUSIVE_ACTION:
            arg[subHookSym](useHook);
            return true;
          case EXCLUSIVE_ACTIONS:
            arg.forEach(a => a[subHookSym](useHook));
            return true;
          default:
            return false;
        }
      }
    };

    matchArgs(
      args,
      [params.val, params.actions, params.reducer, params.additionalActions],
      function onError(argTypes) {
        throw new Error(
          `SkyStore: Invalid state-creator argument order: Sky(${argTypes.join(
            ", "
          )}); Expected order: Sky(VALUE, ACTION(S) or EXCLUSIVE_ACTION(S), FUNCTION, EXCLUSIVE_ACTION(S));`
        );
      }
    );

    if (!exclusiveState) regularHooks.push(useHook);
    useHook[stateIndexSym] = allHooks.push(useHook) - 1;
    return useHook;
  };

  // ========================== Middleware ========================== //
  Sky.middleware = (...args) => {
    const mw = {
      isExclusive: false,
      index: null,
      func: null
    };

    const params = {
      actions(type, arg) {
        switch (type) {
          case ACTION:
          case EXCLUSIVE_ACTION:
            mw.isExclusive = true;
            arg[subMiddlewareSym](mw);
            return true;
          case ACTIONS:
          case EXCLUSIVE_ACTIONS:
            mw.isExclusive = true;
            arg.forEach(a => a[subMiddlewareSym](mw));
            return true;
          default:
            return false;
        }
      },
      function(type, arg) {
        if (type === FUNCTION) {
          mw.func = arg;
          return true;
        }
        return false;
      },
      additionalActions(type, arg) {
        switch (type) {
          case ACTION:
          case ACTIONS:
            throw new Error(
              "SkyStore: Can only have EXCLUSIVE_ACTION(S) as the last argument. Please move all ACTION(S) to their proper place."
            );
          case EXCLUSIVE_ACTION:
            arg[subMiddlewareSym](mw);
            return true;
          case EXCLUSIVE_ACTIONS:
            arg.forEach(a => a[subMiddlewareSym](mw));
            return true;
          default:
            return false;
        }
      }
    };

    matchArgs(
      args,
      [params.actions, params.function, params.additionalActions],
      function onError(argTypes) {
        throw new Error(
          `SkyStore: Invalid middleware argument order: Sky.middleware(${argTypes.join(
            ", "
          )}); Expected order: Sky.middleware(ACTION(S) or EXCLUSIVE_ACTION(S), FUNCTION, EXCLUSIVE_ACTION(S));`
        );
      }
    );

    if (!mw.func) throw new Error("SkyStore: Middleware must have a function");

    if (!mw.isExclusive) regularMiddleware.push(mw);
    mw.index = allMiddleware.push(mw) - 1;
  };

  // ============================ Store ============================ //
  Sky.Store = class Store extends Component {
    constructor() {
      super();
      const states = allHooks.map(hook => hook[initialStateSym]);
      const stateSubs = new Array(allHooks.length);

      const subscribeToState = (hook, update) => {
        const stateIndex = hook[stateIndexSym];

        // Again, this could all be greatly simplified if we created
        // a new context for every reducer in the <Sky.Store>
        const sub = { update, prev: null, next: null };

        const head = stateSubs[stateIndex];
        if (head) {
          const tail = head.last;
          tail.next = sub;
          sub.prev = tail;
          head.last = sub;
        } else {
          // initialize subscription list
          const newHead = { last: sub, next: sub };
          sub.prev = newHead;
          stateSubs[stateIndex] = newHead;
        }

        return {
          currentState: states[stateIndex],
          unsubscribe: () => {
            const { prev, next } = sub;
            if (!next) stateSubs[stateIndex].last = prev;
            sub.prev = next;
          }
        };
      };

      const getState = hook => states[hook[stateIndexSym]];
      getState.subscribe = subscribeToState;
      const activeMiddleware = allMiddleware.map(m => m.func(getState));

      const dispatch = (
        actionCreator,
        val,
        hookSubs,
        middlewareSubs,
        isExclusiveAction
      ) => {
        const action = { type: actionCreator, val };
        const oldStates = states.slice(0);

        function triggerMiddleware(mw) {
          const m = activeMiddleware[mw.index];
          return m && m(action);
        }

        const waitingSubMiddleware = middlewareSubs.map(triggerMiddleware);
        const waitingRegMiddleware = isExclusiveAction
          ? []
          : regularMiddleware.map(triggerMiddleware);

        function sendActionTo(hook) {
          const stateIndex = hook[stateIndexSym];
          const reducer = hook[reducerSym];

          const prevState = states[stateIndex];
          const newState = reducer(prevState, action);
          if (!Object.is(prevState, newState)) {
            states[stateIndex] = newState;
            // Defer notifying subscribers
            setTimeout(() => {
              // Update all subscribers
              let current = stateSubs[stateIndex].next;
              while (current) {
                current.update(newState, action);
                current = current.next;
              }
            }, 0);
          }
        }

        hookSubs.forEach(sendActionTo);
        if (!isExclusiveAction) regularHooks.forEach(sendActionTo);

        const getOldState = hook => oldStates[hook[stateIndexSym]];

        async function finishMiddleware(m) {
          const fn = await m;
          fn && fn(getOldState);
        }
        waitingSubMiddleware.forEach(finishMiddleware);
        waitingRegMiddleware.forEach(finishMiddleware);
      };
      storeMethods = {
        dispatch,
        subscribeToState
      };
      this.storeMethods = storeMethods;
    }

    componentWillUnmount() {
      // Only disable the dispatch/subscription if it was created by us.
      // If another <Sky.Store> is created then that will take over
      // the state so all actions will only go there.
      if (storeMethods === this.storeMethods) {
        storeMethods = defaultStoreMethods;
      }
    }

    render() {
      return (
        <storeContext.Provider value={this.storeMethods}>
          {this.props.children}
        </storeContext.Provider>
      );
    }
  };

  // =========================== Actions =========================== //
  function createActionSet(isExclusive) {
    return new Proxy(
      {},
      {
        get(t, name) {
          if (t.hasOwnProperty(name)) return t[name];
          const middlewareSubs = [];
          const hookSubs = [];
          const actionCreator = val => {
            storeMethods.dispatch(
              actionCreator,
              val,
              hookSubs,
              middlewareSubs,
              isExclusive
            );
          };
          const fullName = isExclusive ? `<exclusive>${name}` : name;
          actionCreator.toString = () => fullName;
          actionCreator[isExActionSym] = isExclusive;
          actionCreator[subMiddlewareSym] = mw => {
            middlewareSubs.push(mw);
          };
          actionCreator[subHookSym] = hook => {
            hookSubs.push(hook);
          };
          t[name] = actionCreator;
          return actionCreator;
        },
        set(t, name) {
          throw new Error(`SkyStore: Action "${name}" is read-only`);
        }
      }
    );
  }
  const actions = createActionSet(false);
  const exclusiveActions = createActionSet(true);

  Sky.actions = () => actions;
  Sky.exclusiveActions = () => exclusiveActions;

  // =========================== Helpers =========================== //

  function getType(arg) {
    if (arg === undefined) return UNDEFINED;
    if (typeof arg === "function") {
      if (arg[isExActionSym]) return EXCLUSIVE_ACTION;
      if (arg[subHookSym]) return ACTION;
      return FUNCTION;
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        let allXActions = 1;
        const allActions = arg.every(y => {
          if (typeof y === "function" && y[subHookSym]) {
            allXActions &= y[isExActionSym];
            return true;
          }
          return false;
        });

        if (allActions) {
          if (allXActions) {
            return EXCLUSIVE_ACTIONS;
          }
          return ACTIONS;
        }
      }
    }
    return VALUE;
  }

  function matchArgs(args, expectedArgs, onError) {
    let i = 0; // next arg
    let j = 0; // next expected arg
    const argTypes = args.map(getType);
    const minArgs = trimUndefined(args);

    // Match args to expected ags but ignore trailing "undefined"s
    while (i < minArgs.length) {
      const next = expectedArgs[j];
      if (!next) return onError(argTypes);
      const res = next(argTypes[i], minArgs[i]);
      if (res) {
        j++;
        i++;
      } else {
        j++;
      }
    }
  }

  return Sky;
};
