import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  CardGroup,
  SettingsCard,
  Form
} from "/imports/plugins/core/ui/client/components";
import { ReactionAnalyticsPackageConfig } from "/lib/collections/schemas/analytics";

const analyticsProviders = [
  {
    name: "segmentio",
    fields: ["api_key"]
  },
  {
    name: "googleAnalytics",
    fields: ["api_key"]
  },
  {
    name: "mixpanel",
    fields: ["api_key"]
  }
];

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
    if (Array.isArray(analyticsProviders)) {
      return analyticsProviders.map((provider, index) => {
        const doc = {
          settings: {
            ...this.props.packageData.settings
          }
        };
        const { enabled } = this.props;

        return (
          <SettingsCard
            key={index}
            i18nKeyTitle={`admin.settings.public.${provider.name}`}
            expandable={true}
            expanded={true}
            title={_.startCase(provider.name)}
            name={_.startCase(provider.name)}
            enabled={enabled[`${provider.name}`]}
          >
            <Form
              schema={ReactionAnalyticsPackageConfig}
              doc={doc}
              docPath={`settings.public.${provider.name}`}
              hideFields={[
                `settings.public.${provider.name}.enabled`
              ]}
              name={`settings.public.${provider.name}`}
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
        {this.renderCards() }
      </CardGroup>
    );
  }
}

export default AnalyticsSettings;
