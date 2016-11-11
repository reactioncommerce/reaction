import React, { Component, PropTypes } from "react";
import CardTitle from "./cardTitle";

class CardHeader extends Component {

  handleClick = (event) => {
    event.preventDefault();

    if (typeof this.props.onClick === "function") {
      this.props.onClick(event);
    }
  }

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
    if (this.props.actAsExpander) {
      return (
        <a
          className="panel-heading"
          href="#"
          onClick={this.handleClick}
        >
          {this.renderTitle()}
          {this.props.children}
        </a>
      );
    }

    return (
      <div className="panel-heading">
        {this.renderTitle()}
        {this.props.children}
      </div>
    );
  }
}

CardHeader.defaultProps = {
  actAsExpander: false,
  expandable: false
};

CardHeader.propTypes = {
  children: PropTypes.node,
  i18nKeyTitle: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string
};

export default CardHeader;
