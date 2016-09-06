import React, { Component, PropTypes } from "react";
import CardTitle from "./cardTitle";
import { Translation } from "../translation";

class CardHeader extends Component {

  renderTitle() {
    if (this.props.title) {
      return (
        <CardTitle
          title={this.props.title}
          i18nKeyTitle={this.props.i18nKeyTitle}
        />
      )
    }
  }

  render() {
    return (
      <div className="panel-heading">
        {this.renderTitle()}
        {this.props.children}
      </div>
    );
  }
}

CardHeader.propTypes = {
  children: PropTypes.node
};

export default CardHeader;
