import React, { Component } from "react";

class NavBar extends Component {
  render() {
    return (
      <div>
         <div class="showmenu">{{> button icon="bars" onClick=onMenuButtonClick}}</div>
    {{> coreNavigationBrand}}
    <div class="menu">
      {{> tagNav tagNavProps}}
    </div>

    {{#if isSearchEnabled}}
      <div class="search">{{> React IconButtonComponent}}</div>
    {{/if}}
    {{#if hasPermission 'account/profile'}}
      <div>{{> React notificationButtonComponent }}</div>
    {{/if}}
    <div class="languages hidden-xs">{{> i18nChooser}}</div>
    <div class="currencies hidden-xs">{{> currencySelect}}</div>
    <div class="accounts">{{> accounts tpl="loginDropdown"}}</div>
    <div class="cart">{{> cartIcon}}</div>
    <div class="cart-alert">{{> React component=cartPanel}}</div>
  </div>
      </div>
    );
  }
}

export default NavBar;
