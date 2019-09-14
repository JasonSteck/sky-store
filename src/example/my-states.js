import { a, ex, Sky } from "./my-store";
import { watch } from "./my-middlewares";

export const useX = Sky(0, (state, action) => {
  switch (action.type) {
    case a.clicked_x:
      return state + action.val;
    case a.drop_x:
      return action.val;
    default:
      return state;
  }
});
watch("X", useX);

export const useStatus = Sky(
  "todo: filtered middleware",
  (state, action) => {
    switch (action.type) {
      case a.thing_was_clicked:
        return "Clicked Thing";
      case a.clicked_x:
        return "Increased X by " + action.val;
      case ex.increment:
        return "Clicked increment";
      case a.drop_x:
        return "Dropping X down to " + action.val;
      default:
        return state;
    }
  },
  ex.increment
);
watch("Status", useStatus);

export const useIncrement = Sky(1, ex.increment, state => state + 1);
watch("Increment", useIncrement); // Note! Exclusive actions won't trigger regular middleware so this watch does nothing.
