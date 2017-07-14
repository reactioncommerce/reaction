import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction, i18next } from "/client/api";
import { CardGroup, SettingsCard, List, ListItem } from "/imports/plugins/core/ui/client/components";
class PermissionsList extends Component {
  static propTypes = {
    packages: PropTypes.array
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CardGroup>
        <SettingsCard
          i18nKeyTitle="admin.i18nSettings.enabledLanguages"
          name="languages"
          padded={false}
          packageName={"PACKAGE_NAME"}
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Languages"
        >
          <List>
            {this.props.packages.map((language, key) => {
              return (
                <ListItem
                  actionType={"switch"}
                  key={key}
                  label={language.label}
                  switchOn={language.enabled}
                  switchName={language.value}
                  onSwitchChange={() => {}}
                />
              );
            })}
          </List>
        </SettingsCard>
      </CardGroup>
    );
  }
}

export default PermissionsList;
