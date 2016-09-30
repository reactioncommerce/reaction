import React, { Component, PropTypes } from "react";
import CardTitle from "./cardTitle";

class CardHeader extends Component {

  renderTitle() {
    if (this.props.title) {
      return (
        <CardTitle
          i18nKeyTitle={this.props.i18nKeyTitle}
          title={this.props.title}
        />
      );
    }
    return null;
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
  children: PropTypes.node,
  i18nKeyTitle: PropTypes.string,
  title: PropTypes.string
};

export default CardHeader;
