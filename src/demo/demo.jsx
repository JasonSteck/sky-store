import React, { useEffect } from "react";
import { a, Sky } from "./demo-sky";
import { usePageNum, useShownPeople, useIsLoadingPage } from "./demo-state";

export default () => (
  <Sky.Store>
    <Demo />
  </Sky.Store>
);

function Demo() {
  const page = usePageNum();

  useEffect(() => {
    // Using an Imperative action for convenience.
    // Declarative would be something like: a.startedDemo();
    a.showPage(1);
  }, []);

  return (
    <div>
      Page: {page}
      <People />
    </div>
  );
}

function People() {
  const people = useShownPeople();
  const isLoading = useIsLoadingPage();

  if (isLoading) return <Loading />;

  return (
    <ul>
      {people.map(p => (
        <li key={p.id}>
          {p.id}: {p.name}
        </li>
      ))}
    </ul>
  );
}

const Loading = () => (
  <div>
    <img
      alt="loading"
      src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
    />
  </div>
);
