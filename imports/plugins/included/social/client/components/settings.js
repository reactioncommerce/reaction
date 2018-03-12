import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  CardGroup,
  SettingsCard,
  Form
} from "/imports/plugins/core/ui/client/components";
import { SocialPackageConfig } from "/lib/collections/schemas/social";

const socialProviders = [
  {
    name: "facebook",
    icon: "fa fa-facebook",
    fields: ["appId", "appSecret", "profilePage"]
  },
  {
    name: "twitter",
    icon: "fa fa-twitter",
    fields: ["username", "profilePage"]
  },
  {
    name: "pinterest",
    icon: "fa fa-pinterest",
    fields: ["profilePage"]
  },
  {
    name: "googleplus",
    icon: "fa fa-google-plus",
    fields: ["profilePage"]
  }
];

class SocialSettings extends Component {
  static propTypes = {
    onSettingChange: PropTypes.func,
    onSettingEnableChange: PropTypes.func,
    onSettingExpand: PropTypes.func,
    onSettingsSave: PropTypes.func,
    packageData: PropTypes.object,
    preferences: PropTypes.object,
    providers: PropTypes.arrayOf(PropTypes.string),
    socialSettings: PropTypes.object
  }

  getSchemaForField(provider, field) {
    return SocialPackageConfig.getDefinition(`settings.public.apps.${provider}.${field}`);
  }

  handleSettingChange = (event, value, name) => {
    if (typeof this.props.onSettingChange === "function") {
      const parts = name.split(".");
      this.props.onSettingChange(parts[0], parts[1], value);
    }
  }

  handleSubmit = (event, data, formName) => {
    if (typeof this.props.onSettingsSave === "function") {
      this.props.onSettingsSave(formName, data.doc);
    }
  }

  renderCards() {
    if (Array.isArray(socialProviders)) {
      return socialProviders.map((provider, index) => {
        const doc = {
          settings: {
            ...this.props.packageData.settings
          }
        };

        return (
          <SettingsCard
            key={index}
            i18nKeyTitle={`admin.settings.public.apps.${provider.name}.title`}
            expandable={true}
            onExpand={this.props.onSettingExpand}
            expanded={this.props.preferences[provider.name]}
            title={provider.name}
            name={provider.name}
            enabled={this.props.socialSettings.settings.apps[provider.name].enabled}
            icon={provider.icon}
            onSwitchChange={this.props.onSettingEnableChange}
          >
            <Form
              schema={SocialPackageConfig}
              doc={doc}
              docPath={`settings.public.apps.${provider.name}`}
              hideFields={[
                `settings.public.apps.${provider.name}.enabled`
              ]}
              name={`settings.public.apps.${provider.name}`}
              onSubmit={this.handleSubmit}
            />
          </SettingsCard>
        );
      });
    }

    return null;
  }

  render() {
    return (
      <CardGroup>
        {this.renderCards()}
      </CardGroup>
    );
  }
}

export default SocialSettings;
