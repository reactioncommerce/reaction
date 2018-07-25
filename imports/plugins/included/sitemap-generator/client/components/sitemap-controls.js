import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "/imports/plugins/core/ui/client/components";

export default class SitemapControls extends Component {
  static propTypes = {
    onGenerateClick: PropTypes.func.isRequired
  };

  render() {
    const { onGenerateClick } = this.props;
    return (
      <div className="form-group pull-left" style={{ width: "100%", marginBottom: 30 }}>
        <button type="button" className="btn btn-default pull-right" onClick={onGenerateClick}>
          <i className="rui font-icon fa fa-refresh" />&nbsp;
          <Translation defaultValue="Refresh sitemap" i18nKey={"shopSettings.refreshSitemapsNow"} />
        </button>
        <p className="pull-right" style={{ marginTop: 7, marginRight: 10 }}>
          <a href="/sitemap.xml" target="_blank">View sitemap</a>
        </p>
      </div>
    );
  }
}
