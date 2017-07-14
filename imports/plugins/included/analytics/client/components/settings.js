import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  CardGroup,
  SettingsCard,
  Form
} from "/imports/plugins/core/ui/client/components";
import { ReactionAnalyticsPackageConfig } from "/lib/collections/schemas/analytics";

class AnalyticsSettings extends Component {
  static propTypes = {
    enabled: PropTypes.object,
    onSave: PropTypes.func,
    packageData: PropTypes.object
  }

  handleSubmit = (event, data, formName) => {
    if (typeof this.props.onSave === "function") {
      this.props.onSave(formName, data.doc);
    }
  }

  renderCards() {
    const { settings } = this.props.packageData;
    return Object.keys(settings.public).map((provider, index) => {
      const doc = {
        settings: {
          ...settings
        }
      };
      const { enabled } = this.props;

      return (
        <SettingsCard
          key={index}
          i18nKeyTitle={`admin.settings.public.${provider}`}
          expandable={true}
          expanded={true}
          title={settings.public[provider].name}
          name={settings.public[provider].name}
          // enabled={enabled[`${provider.name}`]}
        >
          <Form
            schema={ReactionAnalyticsPackageConfig}
            doc={doc}
            docPath={`settings.public.${provider}`}
            hideFields={[
              `settings.public.${provider}.enabled`
            ]}
            name={`settings.public.${provider.name}`}
            onSubmit={this.handleSubmit}
          />
        </SettingsCard>
      );
    });
  }

  render() {
    return (
      <CardGroup>
        {this.renderCards() }
      </CardGroup>
    );
  }
}

export default AnalyticsSettings;
