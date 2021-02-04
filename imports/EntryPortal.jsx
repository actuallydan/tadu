/* Login and Registration views for Tadu
 *
 * User is presented with this view if there is no Meteor user set
 * either becaue they have not registered or have been logged out by Meteor
 * Tests should be done to make sure user's don't have to sign in too often if on the same device
 */
import React from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Menu from "./Menu.jsx";
import Policy from "./Policy.jsx";
import { withRouter } from "react-router-dom";

class EntryPortal extends React.Component {
  constructor(props) {
    super(props);
    /* Single state value to switch out login for register view or vice versa */
    this.state = {
      showLogin: true,
      showPolicy: false,
      loginStateData: {
        // 'loginEmail': "",
        loginEmail: "",
        loginPassword: "",
      },
      registerStateData: {
        // 'registerEmail' : "",
        registerPassword: "",
        registerEmail: "",
        registerBedHour: "",
      },
    };
  }
  /* Method that actually updates the state to show whichever form isn't present */
  handleChangeForm = () => {
    this.setState({ showLogin: !this.state.showLogin });
  };
  changeLoginState = (div) => {
    this.setState({
      loginStateData: {
        // 'loginEmail': div.email,
        loginEmail: div.email,
        loginPassword: div.password,
      },
    });
  };
  changeRegisterState = (div) => {
    this.setState({
      registerStateData: {
        // 'registerEmail' : div.email,
        registerPassword: div.password,
        registerEmail: div.email,
        registerBedHour: div.bedHour,
        registerPhone: div.phone,
      },
    });
  };
  /* After user submit's login form we attempt to sign them in */
  tryLogin = (event) => {
    event.preventDefault();
    /* Because this works weird in JS, make sure it points to the current component we're in, not a meteor method or something else */
    /* Grab, trim, and ideally sanitize user login data */
    // let email = this.state.loginStateData.loginEmail;
    let email = this.state.loginStateData.loginEmail;
    let password = this.state.loginStateData.loginPassword;

    /* Make sure both fields have data in them otherwise ignore it in case of errant enter or mouse click to prevent needless alerting of user */
    if (email !== "" && password !== "") {
      try {
        /* Attempt to login user with Meteor Account's method and exception will tell us what happened if thrown */
        Meteor.loginWithPassword(email, password, (err, data) => {
          if (err) {
            /* Account credentials are incorrect and/or fields are not of satisfactory length */
            swal("Oops...", err.reason, "error");
          } else {
            /* Login was a success, trigger state change in parent component */
            this.props.history.push("/app");
          }
        });
      } catch (e) {
        /* Something unforseen happened with the server request, possibly a poor connection issue */
        swal("Oops...", e, "error");
      }
    } else {
      /* The user tried to enter invalid email or password credentials. Email addresses should contain alphanumeric characters, @, ., _, and - only */
      swal(
        "Sorry",
        "Please enter a valid email and a valid email with at least 6 characters.",
        "error"
      );
    }
  };

  /* After user submit's registration form we attempt to sign them in */
  tryRegister = (event) => {
    /* Second verse, same as the first */
    event.preventDefault();
    let valid = true;
    /* Trim, validate, and sanitize user input */
    const bad = "~`,<>/?'\";:]}[{|+=)(*&^%$#!";

    for (var i = 0; i < bad.length; i++) {
      if (this.state.registerStateData.registerEmail.indexOf(bad[i]) >= 0) {
        valid = false;
        break;
      }
    }

    if (
      this.state.registerStateData.registerEmail == "" ||
      this.state.registerStateData.registerPassword == "" ||
      valid ||
      this.state.registerStateData.registerBedHour == ""
    ) {
      /* The user tried to enter invalid email or password credentials. Email addresses should contain alphanumeric characters, @, ., _, and - only */
      swal(
        "Sorry",
        "Please fill out all fields. Make sure you enter a valid email with at least 6 characters.",
        "error"
      );
    }
    /* Get the time the user ususally goes to bed to build their social circadian rhythm around that */

    // swal("Registration Success!", "Let's get started", "success");
    const user = {
      email: this.state.registerStateData.registerEmail,
      password: this.state.registerStateData.registerPassword,
      profile: {
        phone: this.state.registerStateData.registerPhone,
        pic: null,
        bedHour: this.state.registerStateData.registerBedHour,
        tut: {
          login: false,
          schedule: false,
          addTasks: false,
        },
      },
    };
    const userProfile = {
      phone: this.state.registerStateData.registerPhone,
      pic: null,
      bedHour: this.state.registerStateData.registerBedHour,
      tut: {
        login: false,
        schedule: false,
        addTasks: false,
      },
    };

    try {
      /* Try to create a new user with Meteor's account package */
      Accounts.createUser(user, (err) => {
        if (err) {
          /* There was an issue with existing accounts, parameter length wasn't sufficient etc.*/
          swal("Oops...", err.reason, "error");
        } else {
          /* Meteor will automagically sign in users after successful account creation so we can trigger state update in parent to escape this prison */
          // Meteor.apply("addProfile", [userProfile, Meteor.user()]);

          Meteor.call("addDefaultSchedule", Meteor.user(), (err) => {
            if (err) {
              swal("Awkward...", err.reason, "error");
            }
            Meteor.call("addDefaultTags", Meteor.user(), (err) => {
              if (err) {
                swal("Awkward...", err.reason, "error");
              } else {
                this.props.history.push("/app");
              }
            });
          });
        }
      });
    } catch (e) {
      /* There was a non-meteor related issue, likely Error: 500 */
      swal("Oops...", e, "error");
    }
  };
  togglePolicy = () => {
    this.setState({
      showPolicy: !this.state.showPolicy,
    });
  };
  render() {
    return (
      <div id="entry-portal">
        {this.state.showLogin ? (
          <Login
            showLogin={this.state.showLogin}
            tryLogin={this.tryLogin}
            handleChangeForm={this.handleChangeForm}
            loggedInChange={this.props.loggedInChange}
            changeLoginState={this.changeLoginState}
            loginStateData={this.state.loginStateData}
          />
        ) : (
          <Register
            showLogin={this.state.showLogin}
            tryRegister={this.tryRegister}
            handleChangeForm={this.handleChangeForm}
            showPolicy={this.togglePolicy}
            loggedInChange={this.props.loggedInChange}
            changeRegisterState={this.changeRegisterState}
            registerStateData={this.state.registerStateData}
          />
        )}
        <Menu show={this.state.showPolicy} toggleMenu={this.togglePolicy}>
          <Policy />
        </Menu>
      </div>
    );
  }
}

export default withRouter(EntryPortal);
