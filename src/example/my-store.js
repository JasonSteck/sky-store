import { createSky } from "../sky-store";

/**
 * A Sky allows us to define what reducers, middleware, and actions belong to a SkyStore.
 *
 * const useCounter = Sky((state = 0, action) => {
 *   switch(action.type) {
 *     case a.plus_one:
 *       return state + 1;
 *     case a.minus_one:
 *       return state - 1;
 *     default:
 *       return state;
 *   }
 * });
 *
 * It's safe to cache "Sky"s in modules (or wherever) because no "live" data
 * data is stored in them, only definitions like reducers. Live data (like the
 * current state of the store) is only stored in a <SkyStore> so there's no
 * spec pollution in tests from re-using the same Sky.
 */
export const Sky = createSky();

/**
 * This object magically generates (and dispatches) actions to the SkyStore.
 *
 * // Calling this (even without predefining 'thing_happened' anywhere):
 * a.thing_happened(5);
 * // will cause an action to be dispatched to every reducer in the SkyStore.
 *
 * // If you're familiar with redux, it's similar to doing this:
 * dispatch({
 *   type: a.thing_happened,
 *   val: 5
 * });
 * // Except instead of a string as the type, you get the action creator itself.
 * // If you really want a string (e.g. for logging) you can simply call .toString():
 * a.thing_happened.toString() === "thing_happened";
 *
 * // All of these are valid actions
 * a.thingHappened(7)
 * a.BUTTON_WAS_CLICKED({ x:0, y:1 })
 * a['4w sh!7, h3R3 w3 g0 4g41n']([2, true]);
 *
 * // Composing action names is discouraged because
 * // it can make it hard to find all uses of the action:
 * a.button_click({ val }); // easy to find when looking for "a.button_click"
 * a[name + state]({ val }); // hard to find when looking for "a.button_hover"
 */
export const a = Sky.actions();

/**
 * When an exclusive action is called/dispatched, it only triggers middleware and
 * state reducers if they're specifically subscribed to the exclusive action. This
 * can be used to increase performance when an action is dispatched a lot and
 * you don't want everything activating because of it.
 */
export const ex = Sky.exclusiveActions();

/**
 * If you want to be grammatically correct with certain action names:
 * an.event_happened(e);
 */
export const an = a;
