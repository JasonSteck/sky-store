import React, { useEffect } from "react";
import { a, Sky } from "./demo-sky";
import { usePageNum, useShownPeople, useIsLoadingPage } from "./demo-state";

export default () => {
  return (
    <Sky.Store>
      <List />
    </Sky.Store>
  );
};

function List() {
  const page = usePageNum();
  const people = useShownPeople();
  const isLoading = useIsLoadingPage();

  useEffect(() => {
    a.showPage(1);
  }, []);

  return (
    <>
      <div>Page: {page}</div>
      {isLoading ? (
        <img
          alt="loading"
          src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
        />
      ) : (
        <ul>
          {people.map(p => (
            <li key={p.id}>
              {p.id}: {p.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
