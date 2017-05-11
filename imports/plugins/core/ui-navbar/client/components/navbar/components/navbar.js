import React, { Component } from "react";
import BrandContainer from "../containers/brandContainer";

class NavBar extends Component {
  render() {
    return (
      <div>
        <BrandContainer />

        {{#if isSearchEnabled}}
          <div class="search"><IconButtonComponent /></div>
        {{/if}}
        {{#if hasPermission 'account/profile'}}
          <div><notificationButtonComponent /></div>
        {{/if}}

        <div class="accounts">{{> accounts tpl="loginDropdown"}}</div>
        <div class="cart">{{> cartIcon}}</div>
        <div class="cart-alert"><cartPanel/></div>
      </div>
    );
  }
}

export default NavBar;
