import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Sitemaps } from "../../lib/collections/sitemaps";
import SitemapControls from "../components/sitemap-controls";

class SitemapControlsContainer extends Component {
  static propTypes = {
    lastGenerationDate: PropTypes.string
  };

  handleGenerateClick = (e) => {
    event.preventDefault();
    Meteor.call("sitemaps/generate", (error) => {
      if (error) {
        Alerts.toast(`${i18next.t("shopSettings.sitemapRefreshFailed")}: ${error}`, "error");
      } else {
        Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated"), "success");
      }
    });
  };

  render () {
    return (
      <SitemapControls {...this.props} onGenerateClick={this.handleGenerateClick} />
    );
  }
}

function composer(props, onData) {
  const subscription = Meteor.subscribe("sitemaps/index");
  if (subscription.ready()) {
    const sitemapIndex = Sitemaps.findOne();
    const { createdAt } = sitemapIndex || {};
    const lastGenerationDate = createdAt && createdAt.toLocaleString() || "Never";
    onData(null, { lastGenerationDate });
  }
}

export default compose(
  composeWithTracker(composer)
)(SitemapControlsContainer);
