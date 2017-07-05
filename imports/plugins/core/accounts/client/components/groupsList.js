import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import _ from "lodash";
import { Shops } from "/lib/collections";
import { Card, CardHeader, CardBody, CardGroup, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";


class GroupsList extends Component {
  static propTypes = {
    group: PropTypes.object,
    key: PropTypes.number
  }

  constructor(props) {
    super(props);

    // this.state = this.props.groups;
  }

//   renderShopManagers() {
//     if(this.props.groups.group)
//   }

  renderGroupItems() {
    return (
          <div>buyyy</div>
    );
  }


  render() {
    const { group, key } = this.props;
    return (
        <ListItem
          actionType={"switch"}
          key={key}
          label={group.groupName}
        />

    );
  }
}

export default GroupsList;
