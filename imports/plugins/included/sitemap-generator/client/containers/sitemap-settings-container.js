import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import withGenerateSitemaps from "../hocs/withGenerateSitemaps";
import SitemapSettings from "../components/sitemap-settings";

class SitemapSettingsContainer extends Component {
  static propTypes = {
    generateSitemaps: PropTypes.func.isRequired,
    packageData: PropTypes.object
  };

  constructor(props) {
    super(props);
    const { packageData } = props;
    const { settings } = packageData;
    const { sitemaps: sitemapSettings = {} } = settings;

    this.state = {
      refreshPeriod: sitemapSettings.refreshPeriod || "every 24 hours"
    };
  }

  handleRefreshPeriodChange = (refreshPeriod) => {
    if (refreshPeriod) {
      this.setState({ refreshPeriod });
    }
  };

  handleGenerateClick = () => {
    this.props.generateSitemaps();
    Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated", {
      defaultValue: "Refreshing the sitemap can take up to 5 minutes. You will be notified when it is completed."
    }), "success");
  };

  render() {
    const { refreshPeriod } = this.state;
    return (
      <SitemapSettings
        onRefreshPeriodChange={this.handleRefreshPeriodChange}
        onGenerateClick={this.handleGenerateClick}
        refreshPeriod={refreshPeriod}
      />
    );
  }
}

export default withGenerateSitemaps(SitemapSettingsContainer);
