import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Select from "@reactioncommerce/components/Select/v1";
import Button from "@reactioncommerce/components/Button/v1";
import { Translation } from "/imports/plugins/core/ui/client/components";

export default class SitemapSettings extends Component {
  static propTypes = {
    onGenerateClick: PropTypes.func.isRequired,
    onRefreshPeriodChange: PropTypes.func.isRequired,
    refreshPeriod: PropTypes.string.isRequired
  };

  render() {
    const { onRefreshPeriodChange, onGenerateClick, refreshPeriod } = this.props;
    const refreshOptions = [
      {
        label: "Every 24 hours",
        value: "every 24 hours"
      },
      {
        label: "Every 12 hours",
        value: "every 12 hours"
      },
      {
        label: "Every hour",
        value: "every 1 hour"
      }
    ];

    return (
      <Fragment>
        <div className="form-group" data-required="true">
          <label className="control-label" htmlFor="settings.sitemaps.refreshPeriod">Sitemap refresh period</label>
          <Select
            options={refreshOptions}
            onChange={onRefreshPeriodChange}
            value={refreshPeriod}
          />
          <input
            type="hidden"
            name="settings.sitemaps.refreshPeriod"
            data-schema-key="settings.sitemaps.refreshPeriod"
            value={refreshPeriod}
          />
        </div>
        <div className="form-group pull-left" style={{ width: "100%", marginBottom: 30 }}>
          <Button actionType="secondary" className="pull-right" isShortHeight onClick={onGenerateClick}>
            <i className="rui font-icon fa fa-refresh" />&nbsp;
            <Translation defaultValue="Refresh sitemap" i18nKey={"shopSettings.refreshSitemapsNow"} />
          </Button>
          <p className="pull-right" style={{ marginTop: 6, marginRight: 10 }}>
            <a href="/sitemap.xml" target="_blank">View sitemap</a>
          </p>
        </div>
      </Fragment>
    );
  }
}
