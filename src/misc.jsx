import React from "react";
import styled from "styled-components";
import { NavLink, Switch } from "react-router-dom";

const box = `
  box-sizing: border-box;
  max-width: 75rem;
  padding: 1rem;
  margin: 1rem auto;
  border: 3px solid rgba(68, 127, 198, 0.6);
  border-radius: 10px;
  box-shadow: 6px 6px 20px 6px rgba(0, 0, 0, 0.5);
  background-color: white;
`;

export const Title = styled.h1`
  text-align: center;
  color: white;
`;

export const Menu = styled.ul`
  ${box}
  list-style-type: none;
  padding: 0.75rem 0;
`;

const ListItem = props => (
  <li className={props.className}>
    <NavLink exact to={props.to}>
      {props.children}
    </NavLink>
  </li>
);

export const Item = styled(ListItem)`
  display: inline-block;
  padding: 0rem;
  line-height: 2rem;

  a {
    padding: 0.3rem 0.25rem;
    margin: 0 1rem;
    color: inherit;
    text-decoration: none;

    &.active {
      border-bottom: 2px solid rgb(140, 175, 217);
    }
  }

  & + &::before {
    content: " ";
    position: absolute;
    width: 0;
    height: 3.8rem;
    border-left: 2px solid rgb(140, 175, 217);
    -webkit-transform: translateY(-0.5rem) translateX(0) rotate(18deg);
    transform: translateY(-0.9rem) translateX(0) rotate(15deg);
  }
`;

const Main = styled.main`
  ${box}
`;
export const Content = props => (
  <Main>
    <Switch>{props.children}</Switch>
  </Main>
);

export function Missing() {
  return "♪~ ᕕ(ᐛ)ᕗ Well howdy there, partner! Welcome to the land of the lost.";
}
