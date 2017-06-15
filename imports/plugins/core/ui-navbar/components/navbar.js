import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { FlatButton, Button } from "/imports/plugins/core/ui/client/components";
import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";
import CartIconContainer from "/imports/plugins/core/checkout/client/container/cartIconContainer";
import CartPanel from "/imports/plugins/core/checkout/client/templates/cartPanel/container/cartPanelContainer";
import MainDropdown from "/client/modules/accounts/containers/dropdown/mainDropdownContainer";
import LanguageContainer from "/client/modules/i18n/templates/header/containers/i18nContainer";
import CurrencyContainer from "/client/modules/i18n/templates/currency/containers/currencyContainer";
import TagNavContainer from "/imports/plugins/core/ui-tagnav/client/containers/tagNavContainer";
import Brand from "./brand";

// TODO: Delete this, and do it the react way
async function openSearchModalLegacy(props) {
  if (Meteor.isClient) {
    const { Blaze } = await import("meteor/blaze");
    const { Template } = await import("meteor/templating");
    const { default: $ } = await import(thing);

    const searchTemplate = Template[props.searchTemplate];

    Blaze.renderWithData(searchTemplate, {}, $("html").get(0));

    $("body").css("overflow", "hidden");
    $("#search-input").focus();
  }
}

class NavBar extends Component {
  static propTypes = {
    hasProperPermission: PropTypes.bool,
    searchEnabled: PropTypes.bool
  }

  state = {
    navBarVisible: false
  }

  toggleNavbarVisibility = () => {
    const isVisible = this.state.navBarVisible;
    this.setState({ navBarVisible: !isVisible });
  }

  handleCloseNavbar = () => {
    this.setState({ navBarVisible: false });
  }

  handleOpenSearchModal = () => {
    openSearchModalLegacy(this.props);
  }

  renderLanguage() {
    return (
      <div className="languages hidden-xs">
        <LanguageContainer />
      </div>
    );
  }

  renderCurrency() {
    return (
      <div className="currencies hidden-xs">
        <CurrencyContainer />
      </div>
    );
  }

  renderBrand() {
    return (
      <Brand />
    );
  }

  renderSearchButton() {
    if (this.props.searchEnabled) {
      return (
        <div className="search">
          <FlatButton
            icon="fa fa-search"
            kind="flat"
            onClick={this.handleOpenSearchModal}
          />
        </div>
      );
    }
  }

  renderNotificationIcon() {
    if (this.props.hasProperPermission) {
      return (
        <NotificationContainer />
      );
    }
  }

  renderCartContainerAndPanel() {
    return (
      <div className="cart-container">
        <div className="cart">
          <CartIconContainer />
        </div>
        <div className="cart-alert">
          <CartPanel />
        </div>
      </div>
    );
  }

  renderMainDropdown() {
    return (
      <MainDropdown />
    );
  }

  renderHamburgerButton() {
    return (
      <div className="showmenu"><Button icon="bars" onClick={this.toggleNavbarVisibility} /></div>
    );
  }

  renderTagNav() {
    return (
      <div className="menu">
        <TagNavContainer
          isVisible={this.state.navBarVisible}
          closeNavbar={this.handleCloseNavbar}
        >
          <Brand />
        </TagNavContainer>
      </div>
    );
  }

  render() {
    return (
      <div className="rui navbar">
        {this.renderHamburgerButton()}
        {this.renderBrand()}
        {this.renderTagNav()}
        {this.renderSearchButton()}
        {this.renderNotificationIcon()}
        {this.renderLanguage()}
        {this.renderCurrency()}
        {this.renderMainDropdown()}
        {this.renderCartContainerAndPanel()}
      </div>
    );
  }
}

export default NavBar;
