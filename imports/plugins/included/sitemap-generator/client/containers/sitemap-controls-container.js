import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import SitemapControls from "../components/sitemap-controls";

class SitemapControlsContainer extends Component {
  handleGenerateClick = (event) => {
    event.preventDefault();
    Meteor.call("sitemaps/generate", (error) => {
      if (error) {
        Alerts.toast(`${i18next.t("shopSettings.sitemapRefreshFailed", {
          defaultValue: "Sitemap refresh failed"
        })}: ${error}`, "error");
      } else {
        Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated", {
          defaultValue: "Refreshing the sitemap can take up to 5 minutes. You will be notified when it is completed."
        }), "success");
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
