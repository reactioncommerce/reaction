import React, { Component, PropTypes } from "react";
import Radium from "radium";

const styles = {
  list: {
    display: "flex"
  },
  item: {
    display: "flex",
    flex: "1 1 auto",
    height: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    display: "block"
  },
  stat: {
    textAlign: "center"
  }
};


class OrderActions extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    onActionClick: PropTypes.func
  }

  renderAction() {
    if (Array.isArray(this.props.filters)) {
      return this.props.filters.map((filter) => {
        return (
          <div style={styles.item} onClick={this.props.onActionClick.bind(this, filter)}>
            <div style={styles.stat}>
              <strong style={styles.title}>{filter.count}</strong>
              <span>{filter.label}</span>
            </div>
          </div>
        );
      });
    }

    return null;
  }

  render() {
    return (
      <div style={styles.list}>
        {this.renderAction()}
      </div>
    );
  }
}

export default Radium(OrderActions);
