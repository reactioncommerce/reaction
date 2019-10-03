import React, { Component } from "react";
import PropTypes from "prop-types";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Tracker } from "meteor/tracker";
import { Components } from "@reactioncommerce/reaction-components";
import {
  FlatButton,
  Icon,
  VerticalDivider
} from "/imports/plugins/core/ui/client/components";
import { Translatable } from "/imports/plugins/core/ui/client/providers";
import { Reaction } from "/client/api";
import ShopSelect from "../components/shopSelect";

class PublishControls extends Component {
  static propTypes = {
    dashboardHeaderTemplate: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.string]),
    documentIds: PropTypes.arrayOf(PropTypes.string),
    documents: PropTypes.arrayOf(PropTypes.object),
    hasCreateProductAccess: PropTypes.bool,
    isEnabled: PropTypes.bool,
    onShopSelectChange: PropTypes.func,
    onVisibilityChange: PropTypes.func,
    packageButtons: PropTypes.arrayOf(PropTypes.object),
    shopId: PropTypes.string,
    shops: PropTypes.arrayOf(PropTypes.object),
    translation: PropTypes.shape({
      lang: PropTypes.string
    })
  }

  static defaultProps = {
    isEnabled: true
  }

  componentDidMount() {
    // Tracker is used to determine if a user has `hasShopSwitcherAccess` permission
    // If they do not, set the shop one time, and then not again
    // If the user does have hasShopSwitcherAccess` permission, shop is set by this.renderShopSelect()
    this.tracker = Tracker.autorun(() => {
      if (!Reaction.hasShopSwitcherAccess()) {
        this.onShopSelectChange(null, Reaction.getSellerShopId());
      }
    });
  }

  componentWillUnmount() {
    // Unmount the tracker that is checking for `hasShopSwitcherAccess` permission
    this.tracker.stop();
  }

  // Passthrough to shopSelectChange handler in container above
  onShopSelectChange = (event, shopId) => {
    if (typeof this.props.onShopSelectChange === "function") {
      this.props.onShopSelectChange(event, shopId);
    }
  }

  renderViewControls() {
    return (
      <FlatButton
        label="Private"
        i18nKeyLabel="app.private"
        i18nKeyToggleOnLabel="app.public"
        toggleOnLabel="Public"
        icon="fa fa-eye-slash"
        onIcon="fa fa-eye"
        toggle={true}
        value="public"
        onValue="private"
        toggleOn={this.isVisible === "public"}
        onToggle={this.handleVisibilityChange}
      />
    );
  }

  renderShopSelect() {
    // If a user has owner, admin, or marketplace permissions for more than one (1) shops
    // show the shop switcher to allow for easy switching between the shops
    if (Reaction.hasShopSwitcherAccess()) {
      return (
        <ShopSelect
          onShopSelectChange={this.onShopSelectChange}
          shopId={this.props.shopId}
          shops={this.props.shops}
        />
      );
    }

    return null;
  }

  renderAdminButton() {
    return (
      <div className="hidden-xs">
        <Components.ToolbarGroup visibleOnMobile={true}>
          <VerticalDivider key={"divder-2"} />
          <FlatButton
            key="dashboard-button"
            onClick={() => {
              Reaction.showActionView({
                i18nKeyTitle: "dashboard.coreTitle",
                title: "Dashboard",
                template: "dashboardPackages"
              });
            }}
          >
            <Icon icon="icon icon-reaction-logo" />
          </FlatButton>
        </Components.ToolbarGroup>
      </div>
    );
  }

  renderPackageButons() {
    if (Array.isArray(this.props.packageButtons)) {
      return this.props.packageButtons.map((packageButton, index) => (
        <FlatButton {...packageButton} key={index} />
      ));
    }

    return null;
  }

  renderCustomControls() {
    if (this.props.dashboardHeaderTemplate && this.props.hasCreateProductAccess) {
      if (this.props.isEnabled) {
        return [
          <div className="hidden-xs" key="customControlsVerticaldivider"><VerticalDivider/></div>,
          <Blaze key="customControls" template={this.props.dashboardHeaderTemplate} />
        ];
      }
      return [
        <Blaze key="customControls" template={this.props.dashboardHeaderTemplate} />
      ];
    }

    return null;
  }

  render() {
    return (
      <Components.Toolbar>
        <Components.ToolbarGroup firstChild={true}>
          {this.renderShopSelect()}
        </Components.ToolbarGroup>
        <Components.ToolbarGroup lastChild={true}>
          {this.renderPackageButons()}
          {this.renderCustomControls()}
        </Components.ToolbarGroup>
        {this.renderAdminButton()}
      </Components.Toolbar>
    );
  }
}

export default Translatable()(PublishControls);
