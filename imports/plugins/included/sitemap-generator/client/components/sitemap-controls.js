import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "/imports/plugins/core/ui/client/components";

export default class SitemapControls extends Component {
  static propTypes = {
    lastGenerationDate: PropTypes.string,
    onGenerateClick: PropTypes.func.isRequired
  };

  render() {
    const { onGenerateClick, lastGenerationDate = "" } = this.props;
    return (
      <div className="form-group pull-left">
        <button type="button" className="btn btn-default pull-left" onClick={onGenerateClick}>
          <i className="rui font-icon fa fa-refresh" />&nbsp;
          <Translation defaultValue="Refresh sitemaps now" i18nKey={"shopSettings.refreshSitemapsNow"} />
        </button>
        <p className="pull-right" style={{ marginTop: 7 }}>
          <a href="/sitemap.xml" target="_blank">View sitemap</a>
        </p>
        <label className="pull-left" style={{ marginTop: 5 }}>Last generation finished: { lastGenerationDate }</label>
      </div>
    );
  }
}
