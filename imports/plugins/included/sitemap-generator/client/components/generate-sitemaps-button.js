import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";

export default class GenerateSitemapsButton extends Component {
  handleClick = (event) => {
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
      <div className="clearfix">
        <button type="button" className="btn btn-default pull-left" onClick={this.handleClick}>
          <i className="rui font-icon fa fa-refresh" />&nbsp;
          <Translation defaultValue="Refresh sitemaps now" i18nKey={"shopSettings.refreshSitemapsNow"} />
        </button>
      </div>
    );
  }
}
