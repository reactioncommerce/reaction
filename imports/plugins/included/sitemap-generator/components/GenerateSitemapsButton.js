import { Meteor } from "meteor/meteor";
import React, { Component } from "react";

export default class GenerateSitemapsButton extends Component {

  handleClick = (e) => {
    e.preventDefault();
    Meteor.call("sitemaps/generate");
    // TODO i18n
    Alerts.toast("Sitemap regeneration started");
  };

  render () {
    return (
      <div className="clearfix">
        <button type="submit" className="btn btn-default pull-right" onClick={this.handleClick}>Regenerate Sitemaps</button>
      </div>
    )
  };
}
