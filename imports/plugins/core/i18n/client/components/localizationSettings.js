import React, { Component, PropTypes } from "react";
import {
  CardGroup,
  SettingsCard,
  Form,
  List,
  ListItem
} from "/imports/plugins/core/ui/client/components";

import { Shop as ShopSchema } from "/lib/collections/schemas/shops";

const PACKAGE_NAME = "reaction-i18n";

class LocalizationSettings extends Component {
  static propTypes = {
    currencies: PropTypes.array,
    currencyOptions: PropTypes.array,
    enabledLanguages: PropTypes.array,
    languages: PropTypes.array,
    onUpdateCurrencyConfiguration: PropTypes.func,
    onUpdateLanguageConfiguration: PropTypes.func,
    onUpdateLocalization: PropTypes.func,
    shop: PropTypes.object, // Shop data
    timezoneOptions: PropTypes.array,
    uomOptions: PropTypes.array
  }

  renderCurrencies() {
    return this.props.currencies.map((currency, key) => {
      return (
        <ListItem
          actionType={"switch"}
          key={key}
          label={currency.label}
          switchOn={currency.enabled}
          switchName={currency.name}
          onSwitchChange={this.props.onUpdateCurrencyConfiguration}
        />
      );
    });
  }

  renderLanguages() {
    return this.props.languages.map((language, key) => {
      return (
        <ListItem
          actionType={"switch"}
          key={key}
          label={language.label}
          switchOn={language.enabled}
          switchName={language.value}
          onSwitchChange={this.props.onUpdateLanguageConfiguration}
        />
      );
    });
  }

  handleSubmit = (event, formData) => {
    if (typeof this.props.onUpdateLocalization === "function") {
      this.props.onUpdateLocalization(formData.doc);
    }
  }

  render() {
    return (
      <CardGroup>
        <SettingsCard
          i18nKeyTitle="i18nSettings.localization"
          name="localization"
          packageName={PACKAGE_NAME}
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Shop Localization"
        >
          <Form
            autoSave={true}
            schema={ShopSchema}
            doc={this.props.shop}
            fields={{
              timezone: {
                type: "select",
                options: this.props.timezoneOptions
              },
              currency: {
                type: "select",
                options: this.props.currencyOptions
              },
              baseUOM: {
                type: "select",
                options: this.props.uomOptions
              },
              language: {
                type: "select",
                options: this.props.currencyOptions
              }
            }}
            name="localization"
            onSubmit={this.handleSubmit}
          />
        </SettingsCard>
        <SettingsCard
          i18nKeyTitle="admin.i18nSettings.enabledLanguages"
          name="languages"
          padded={false}
          packageName={PACKAGE_NAME}
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Languages"
        >
          <List>
            {this.renderLanguages()}
          </List>
        </SettingsCard>
        <SettingsCard
          i18nKeyTitle="i18nSettings.enabledCurrencies"
          padded={false}
          packageName={PACKAGE_NAME}
          name="currencies"
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Currencies"
        >
          <List>
            {this.renderCurrencies()}
          </List>
        </SettingsCard>
      </CardGroup>
    );
  }
}

export default LocalizationSettings;
