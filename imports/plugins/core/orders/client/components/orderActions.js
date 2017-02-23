import React, { Component, PropTypes } from "react";
import Radium from "radium";
import { TabList, TabItem } from "/imports/plugins/core/ui/client/components";

const styles = {
  list: {
    display: "flex",
    height: 100
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
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
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
              <strong style={styles.title}>{filter.count}</strong>
              <span>{filter.label}</span>
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
