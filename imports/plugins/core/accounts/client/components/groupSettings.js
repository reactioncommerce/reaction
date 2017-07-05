import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import _ from "lodash";
import { Shops } from "/lib/collections";
import { Card, CardHeader, CardBody, CardToolbar, FlatButton, List, ListItem, Loading, Switch } from "/imports/plugins/core/ui/client/components";
import GroupsList from "./groupsList";


class GroupsSettings extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      shopManagers: props.groups.shopManager
    };
  }

  renderShopManagers() {
    // console.log("yuyu", this.props.groups);
    // const { shopManagers } = this.props.groups;
    console.log("shop", Object.keys([this.props.groups].filter(group => group.length !== 0)));
    const groups = Object.keys(this.props.groups);
    // console.log(this.props.groups);
    return (
        <div>{Object.keys([this.props.groups].filter(group => group.length !== 0)).map((item, index) =>
            <Card
              expanded={true}
              key={index}
            >
                <CardHeader title={this.getGroupName(item)} actAsExpander={true}/>
                <CardBody expandable={true}>
                        <div className="rui card-toolbar" style={{ width: "", height: "37px", backgroundColor: "#f5f5f5" }}>
                            <Switch
                              checked
                              onChange={function e() {}}
                            />
                            <span>Default</span>
                            <FlatButton
                              i18nKeyLabel={"admin.i18nSettings.allOn"}
                              label="All On"
                              value={name}
                              onClick={this.handleAllOn}
                            />
                            { "|" }
                            <FlatButton
                              i18nKeyLabel={"admin.i18nSettings.allOff"}
                              label="All Off"
                              value={name}
                              onClick={this.handleAllOff}
                            />
                        </div>
                </CardBody>
            </Card>
            )
        }
        </div>
    );
  }

  getGroupName(key) {
    if (this.props.groups[key].length > 0) {
      return this.props.groups[key][0].groupName;
    }
    return;
  }

  renderMerchandisers() {
    if (this.props.merchandisers.length > 0) {
      return (
        <AccountsTable
          users={this.state.merchandisers}
          headerLabel="Merchandisers"
        />
      );
    }
    return null;
  }

  renderFufillment() {
    if (this.state.fufillment.length > 0) {
      return (
        <AccountsTable
          users={this.state.fufillment}
          headerLabel="Merchandisers"
        />
      );
    }
    return null;
  }

  renderGroupsList() {
    return (
        <div>
          {this.renderShopManagers()}
        </div>
    );
  }


  render() {
    return (
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            data-i18n="accountsUI.info.editGroups"
            title="Edit Groups"
          />
          <CardBody expandable={true}>
            <div className="settings">
                {this.renderGroupsList()}
            </div>
          </CardBody>
        </Card>
    );
  }
}

export default GroupsSettings;
