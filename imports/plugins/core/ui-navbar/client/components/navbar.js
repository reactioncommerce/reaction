import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";

// TODO: Delete this, and do it the react way - Mike M.
async function openSearchModalLegacy(props) {
  if (Meteor.isClient) {
    const { Blaze } = await import("meteor/blaze");
    const { Template } = await import("meteor/templating");
    const { $ } = await import("meteor/jquery");

    const searchTemplate = Template[props.searchTemplate];

    Blaze.renderWithData(searchTemplate, {}, $("html").get(0));

    $("body").css("overflow", "hidden");
    $("#search-input").focus();
  }
}

class NavBar extends Component {
  static propTypes = {
    brandMedia: PropTypes.object,
    hasProperPermission: PropTypes.bool,
    searchEnabled: PropTypes.bool,
    shop: PropTypes.object,
    visibility: PropTypes.object.isRequired
  };

  static defaultProps = {
    visibility: {
      hamburger: true,
      brand: true,
      tags: true,
      search: true,
      notifications: true,
      languages: true,
      currency: true,
      mainDropdown: true,
      cartContainer: true
    }
  };

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
        <Components.LanguageDropdown />
      </div>
    );
  }

  renderCurrency() {
    return (
      <div className="currencies hidden-xs">
        <Components.CurrencyDropdown />
      </div>
    );
  }

  renderBrand() {
    const shop = this.props.shop || { name: "" };
    const logo = this.props.brandMedia && this.props.brandMedia.url();

    return (
      <Components.Brand
        logo={logo}
        title={shop.name}
      />
    );
  }

  renderSearchButton() {
    if (this.props.searchEnabled) {
      return (
        <div className="search">
          <Components.FlatButton
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
        <Components.Notification />
      );
    }
  }

  renderCartContainerAndPanel() {
    return (
      <div className="cart-container">
        <div className="cart">
          <Components.CartIcon />
        </div>
        <div className="cart-alert">
          <Components.CartPanel />
        </div>
      </div>
    );
  }

  renderMainDropdown() {
    return (
      <Components.MainDropdown />
    );
  }

  renderHamburgerButton() {
    return (
      <div className="showmenu"><Components.Button icon="bars" onClick={this.toggleNavbarVisibility} /></div>
    );
  }

  renderTagNav() {
    return (
      <div className="menu">
        <Components.TagNav
          isVisible={this.state.navBarVisible}
          closeNavbar={this.handleCloseNavbar}
        >
          <Components.Brand />
        </Components.TagNav>
      </div>
    );
  }

  render() {
    return (
      <div className="rui navbar">
        {this.props.visibility.hamburger && this.renderHamburgerButton()}
        {this.props.visibility.brand && this.renderBrand()}
        {this.props.visibility.tags && this.renderTagNav()}
        {this.props.visibility.search && this.renderSearchButton()}
        {this.props.visibility.notifications && this.renderNotificationIcon()}
        {this.props.visibility.languages && this.renderLanguage()}
        {this.props.visibility.currency && this.renderCurrency()}
        {this.props.visibility.mainDropdown && this.renderMainDropdown()}
        {this.props.visibility.cartContainer && this.renderCartContainerAndPanel()}
      </div>
    );
  }
}

export default NavBar;
