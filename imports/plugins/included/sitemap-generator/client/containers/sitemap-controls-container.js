import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Sitemaps } from "../../lib/collections/sitemaps";
import SitemapControls from "../components/sitemap-controls";

class SitemapControlsContainer extends Component {
  handleGenerateClick = (event) => {
    event.preventDefault();
    Meteor.call("sitemaps/generate", (error) => {
      if (error) {
        Alerts.toast(`${i18next.t("shopSettings.sitemapRefreshFailed")}: ${error}`, "error");
      } else {
        Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated"), "success");
      }
    });
  };

  render() {
    return (
      <SitemapControls onGenerateClick={this.handleGenerateClick} />
    );
  }
}

export default SitemapControlsContainer;
