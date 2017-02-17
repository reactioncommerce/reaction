import React, { Component, PropTypes } from "react";
import {
  CardGroup,
  Card,
  CardHeader,
  CardBody,
  TextField
} from "/imports/plugins/core/ui/client/components";
import { SocialPackageConfig } from "/lib/collections/schemas/social";
import { toCamelCase } from "/lib/api";

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
    preferences: PropTypes.object,
    providers: PropTypes.arrayOf(PropTypes.string),
    socialSettings: PropTypes.object
  }

  getSchemaForField(provider, field) {
    return SocialPackageConfig._schema[`settings.public.apps.${provider}.${field}`];
  }

  handleSettingChange = (event, value, name) => {
    if (typeof this.props.onSettingChange === "function") {
      const parts = name.split(".");
      this.props.onSettingChange(parts[0], parts[1], value);
    }
  }

  renderCards() {
    if (Array.isArray(socialProviders)) {
      return socialProviders.map((provider) => {
        const fields = provider.fields.map((field) => {
          const fieldSchema = this.getSchemaForField(provider.name, field);

          return (
            <TextField
              i18nKeyLabel={`settings.${toCamelCase(fieldSchema.label)}`}
              key={field}
              label={fieldSchema.label}
              name={`${provider.name}.${field}`}
              value={this.props.socialSettings.settings.apps[provider.name][field]}
              onChange={this.handleSettingChange}
            />
          );
        });

        return (
          <Card
            key={provider.name}
            expandable={true}
            onExpand={this.props.onSettingExpand}
            expanded={this.props.preferences[provider.name]}
            name={provider.name}
          >
            <CardHeader
              i18nKeyTitle={`settings.${provider.name}`}
              icon={provider.icon}
              title={provider.name}
              showSwitch={true}
              actAsExpander={true}
              switchOn={this.props.socialSettings.settings.apps[provider.name].enabled}
              switchName={provider.name}
              expandOnSwitchOn={true}
              onSwitchChange={this.props.onSettingEnableChange}
            />
            <CardBody expandable={true}>
              {fields}
            </CardBody>
          </Card>
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
