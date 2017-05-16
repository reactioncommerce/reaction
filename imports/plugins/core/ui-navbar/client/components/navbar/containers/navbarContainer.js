import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import NavBar from "../components/navbar";

class NavBarContainer extends Component {
  render() {
    return (
      <div>
        <NavBar />
      </div>
    );
  }
}

export default NavBarContainer;
