import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Title, Menu, Item, Content, Missing } from "./misc";
import About from "./about";
import Demo from "./demo";

function App() {
  return (
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
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
