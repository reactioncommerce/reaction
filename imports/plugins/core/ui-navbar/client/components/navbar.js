import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

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
    navBarVisible: false,
    searchModalOpen: false
  }

  toggleNavbarVisibility = () => {
    const isVisible = this.state.navBarVisible;
    this.setState({ navBarVisible: !isVisible });
  }

  handleCloseNavbar = () => {
    this.setState({ navBarVisible: false });
  }

  handleOpenSearchModal = () => {
    this.setState({ searchModalOpen: true });
  }

  handleCloseSearchModal = () => {
    this.setState({ searchModalOpen: false });
  }

  renderLanguage() {
    return (
      <div className="languages">
        <Components.LanguageDropdown />
      </div>
    );
  }

  renderCurrency() {
    return (
      <div className="currencies">
        <Components.CurrencyDropdown />
      </div>
    );
  }

  renderBrand() {
    const { brandMedia, shop } = this.props;

    const { name } = shop || {};
    const logo = brandMedia && brandMedia.url({ store: "large" });

    return (
      <Components.Brand
        logo={logo}
        title={name || ""}
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
          <Components.SearchSubscription
            open={this.state.searchModalOpen}
            onClose={this.handleCloseSearchModal}
          />
        </div>
      );
    }
  }

  renderNotificationIcon() {
    if (this.props.hasProperPermission) {
      return (
        <div className="navbar-notification">
          <Components.Notification />
        </div>
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
      <header className="menu" role="banner">
        <Components.TagNav
          isVisible={this.state.navBarVisible}
          closeNavbar={this.handleCloseNavbar}
          {...this.props}
        >
          <Components.Brand />
          {this.renderNotificationIcon()}
          {this.renderLanguage()}
          {this.renderCurrency()}
        </Components.TagNav>
      </header>
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
