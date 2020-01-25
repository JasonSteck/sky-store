import { a, Sky } from "./demo-sky";

/**
 * isLoadingPage - true if a list of people is loading
 */
export const useIsLoadingPage = Sky(false, (state, action) => {
  switch (action.type) {
    case a.showPage:
      return true;
    case a.personPageLoaded:
      return false;
    default:
      return state;
  }
});

/**
 * pageNum - the current page number for the list of people
 */
export const usePageNum = Sky(null, a.showPage);

/**
 * shownPeople - a list of the people to show on screen
 */
export const useShownPeople = Sky(
  [],
  a.personPageLoaded,
  (state, action) => action.val.people
);

/**
 * allPeople - cached list of all people we know about
 */
export const useAllPeople = Sky({}, a.personPageLoaded, (state, action) => {
  const { people } = action.val;
  const newState = { ...state };

  people.forEach(p => {
    newState[p.id] = p;
  });

  return newState;
});

/**
 * Middleware to fetch new people
 */
Sky.middleware(a.showPage, stateOf => {
  let loading;

  return async action => {
    loading = action;
    const page = action.val;
    const json = await fetch("https://swapi.co/api/people/?page=" + page).then(
      res => res.json()
    );

    // If we're now loading a different page, discard this result
    if (loading !== action) return;
    const people = json.results.map((p, i) => ({
      id: 10 * (page - 1) + i + 1, // derive the id
      ...p,
    }));
    a.personPageLoaded({ people });
  };
});
