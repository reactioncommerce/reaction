import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class NavBar extends Component {
  static propTypes = {
    brandMedia: PropTypes.object,
    hasProperPermission: PropTypes.bool,
    searchEnabled: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    shop: PropTypes.object.isRequired,
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
      mainDropdown: true
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

    return null;
  }

  renderNotificationIcon() {
    if (this.props.hasProperPermission) {
      return (
        <div className="navbar-notification">
          <Components.Notification />
        </div>
      );
    }

    return null;
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
      <Components.TagNav
        isVisible={this.state.navBarVisible}
        closeNavbar={this.handleCloseNavbar}
        {...this.props}
      >
        <Components.Brand />
        {this.renderNotificationIcon()}
      </Components.TagNav>
    );
  }

  render() {
    return (
      <div className="rui navbar">
        {this.props.visibility.hamburger && this.renderHamburgerButton()}
        {this.props.visibility.brand && this.renderBrand()}
        <header className="menu" role="banner">
          {this.props.visibility.tags && this.renderTagNav()}
        </header>
        {this.props.visibility.search && this.renderSearchButton()}
        {this.props.visibility.notifications && this.renderNotificationIcon()}
        {this.props.visibility.currency && this.renderCurrency()}
        {this.props.visibility.mainDropdown && this.renderMainDropdown()}
      </div>
    );
  }
}

export default NavBar;
