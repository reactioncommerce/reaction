import React, { Component } from "react";
import PropTypes from "prop-types";
import Radium from "radium";
import { Button, Icon, DropDownMenu, MenuItem, TabList, TabItem } from "@reactioncommerce/reaction-ui";

const styles = {
  list: {
    display: "flex",
    height: 51
  },
  item: {
    display: "flex",
    flex: "1 1 auto",
    width: "33%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    display: "block"
  },
  stat: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
    // justifyContent: "center",
    alignItems: "center"
  }
};

class OrderActions extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    onActionClick: PropTypes.func,
    selectedIndex: PropTypes.number
  }

  handleActionClick = (event, value) => {
    if (typeof this.props.onActionClick === "function") {
      this.props.onActionClick(value);
    }
  }

  buttonElement() {
    return (
      <Button style={{ flex: "0 1 auto", marginLeft: "auto" }}>
        <i className="fa fa-filter" /> &nbsp;
        <i className="fa fa-chevron-down" />
      </Button>
    );
  }

  renderAction() {
    if (Array.isArray(this.props.filters)) {
      return this.props.filters.map((filter, index) => {
        return (
          <TabItem
            className="admin"
            key={index}
            style={styles.item}
            onClick={this.handleActionClick}
            value={filter}
          >
            <div style={styles.stat}>

              <span className="tab-item-title" style={{ fontSize: 16 }}>{filter.label}</span>
              {this.buttonElement()}
            </div>


          </TabItem>
        );
      });
    }

    return null;
  }

  render() {
    return (
      <TabList style={styles.list} className="admin" selectedTab={this.props.selectedIndex}>
        {this.renderAction()}
      </TabList>
    );
  }
}

export default Radium(OrderActions);
