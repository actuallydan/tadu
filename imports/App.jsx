import React, { Component } from "react";
import MainLayout from "./MainLayout.jsx";
import EntryPortal from "./EntryPortal.jsx";
import SplashPage from "./SplashPage.jsx";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

/* CSS Standardization */
import "normalize-css";
/* Import Custom CSS */
import "./styles/main.css";
/* 3rd party imports */
import "react-toastify/dist/ReactToastify.min.css";
/* Fix to change alerts to fit theme */
import "./styles/swaloverride.css";

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: Meteor.userId() === null ? false : true,
      showLogin: false,
    };
  }
  loggedInChange = (flag) => {
    /* Tell out app that we're changing our logged in state and that Meteor knows we're logged in / out and need to change views
     * Methods that log the user in should provide true as a parameter or false if they're logging out
     */
    this.setState({
      loggedIn: flag,
    });
  };
  showLogin = () => {
    this.setState({
      showLogin: !this.state.showLogin,
    });
  };

  /* Render method should only switch our logged in state */
  render() {
    document.getElementsByTagName("body")[0].style.overflow = !this.state
      .loggedIn
      ? "visible"
      : "hidden";
    return (
      <div className="wrapper">
        <Router>
          <Switch>
            <Route path="/app">
              <MainLayout loggedInChange={this.loggedInChange} />
            </Route>
            <Route path="/login">
              <EntryPortal loggedInChange={this.loggedInChange} />
            </Route>
            <Route path="/">
              <SplashPage />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
