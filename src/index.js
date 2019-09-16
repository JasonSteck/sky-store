import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Switch,
} from "react-router-dom";

import { Sky } from "./example/my-sky-store";
import "./example/my-middlewares";

function App() {
  return (
    <Sky.Store>
      <Router>
        <Title>SkyStore</Title>
        <Menu>
          <Item to="/">About</Item>
          <Item to="/demo">Demo</Item>
        </Menu>
        <Content>
          <Route path="/" exact component={About} />
          <Route path="/demo" component={Demo} />
          <Route component={Missing} />
        </Content>
      </Router>
    </Sky.Store>
  );
}

function About() {
  return (
    <>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel
      neque est. Nunc tincidunt velit ac tortor facilisis, nec tempus massa
      maximus. Phasellus placerat imperdiet dolor at viverra. Quisque luctus
      augue sed eleifend egestas. Aliquam nec dictum elit, ac luctus leo. Nunc
      vel risus et nunc viverra mollis. Suspendisse luctus, magna non
      pellentesque blandit, neque nibh fermentum nibh, non scelerisque lectus
      quam at dolor. Aliquam eu nisl et lacus tempus lacinia a et nisi. Duis
      fringilla sapien leo, eu tempus mauris volutpat nec. Proin sit amet nisl
      ex. Aliquam nec purus sollicitudin, faucibus quam quis, efficitur est. Sed
      varius pharetra imperdiet.
      <br /> <br />
      Aliquam sit amet tempus mi. Etiam tortor metus, auctor sit amet justo
      quis, varius elementum est. Sed eget nibh vel massa gravida vulputate.
      Suspendisse vel lectus varius, dapibus sapien ac, dignissim ex. Morbi vel
      massa nec leo pretium viverra. Pellentesque vulputate molestie tempor. In
      at sapien non erat viverra luctus eu pellentesque risus. Pellentesque
      habitant morbi tristique senectus et netus et malesuada fames ac turpis
      egestas. Phasellus vitae aliquam mauris. Curabitur bibendum blandit
      mauris, ut finibus mauris blandit ut. Praesent elit orci, ullamcorper et
      vulputate nec, feugiat eu arcu. Quisque eu facilisis libero. Pellentesque
      habitant morbi tristique senectus et netus et malesuada fames ac turpis
      egestas. Aliquam erat volutpat. Praesent eleifend imperdiet nunc. Nam
      interdum placerat nulla, sed pharetra augue gravida vitae.
    </>
  );
}

function Demo() {
  return "TODO";
}

function Missing() {
  return "ಠ_ಠ";
}

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

const Title = styled.h1`
  text-align: center;
  color: white;
`;

const Menu = styled.ul`
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

const Item = styled(ListItem)`
  display: inline-block;
  padding: 0rem;
  line-height: 2rem;

  a {
    padding: 0.3rem 0.25rem;
    margin: 0 1rem;
    text-decoration: none;
    color: inherit;

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
const Content = props => (
  <Main>
    <Switch>{props.children}</Switch>
  </Main>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
