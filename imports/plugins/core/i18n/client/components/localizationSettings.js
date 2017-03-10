import React, { Component, PropTypes } from "react";
import {
  CardGroup,
  CardToolbar,
  FlatButton,
  Form,
  List,
  ListItem,
  SettingsCard
} from "/imports/plugins/core/ui/client/components";

import { Shop as ShopSchema } from "/lib/collections/schemas/shops";

const PACKAGE_NAME = "reaction-i18n";

class LocalizationSettings extends Component {
  static propTypes = {
    currencies: PropTypes.array,
    currencyOptions: PropTypes.array,
    enabledLanguages: PropTypes.array,
    languages: PropTypes.array,
    onEnableAllCurrencies: PropTypes.func,
    onEnableAllLanguages: PropTypes.func,
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

  handleAllOn = (event, name) => {
    if (name === "language") {
      if (typeof this.props.onEnableAllLanguages === "function") {
        this.props.onEnableAllLanguages(true);
      }
    } else if (name === "currency") {
      if (typeof this.props.onEnableAllCurrencies === "function") {
        this.props.onEnableAllCurrencies(true);
      }
    }
  }

  handleAllOff = (event, name) => {
    if (name === "language") {
      if (typeof this.props.onEnableAllLanguages === "function") {
        this.props.onEnableAllLanguages(false);
      }
    } else if (name === "currency") {
      if (typeof this.props.onEnableAllCurrencies === "function") {
        this.props.onEnableAllCurrencies(false);
      }
    }
  }

  renderListControls(name) {
    return (
      <CardToolbar>
        <FlatButton
          i18nKeyLabel={"all.allOn"}
          label="All On"
          value={name}
          onClick={this.handleAllOn}
        />
        { "|" }
        <FlatButton
          i18nKeyLabel={"all.allOff"}
          label="All Off"
          value={name}
          onClick={this.handleAllOff}
        />
      </CardToolbar>
    );
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
                options: this.props.enabledLanguages
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
          {this.renderListControls("language")}
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
          {this.renderListControls("currency")}
          <List>
            {this.renderCurrencies()}
          </List>
        </SettingsCard>
      </CardGroup>
    );
  }
}

export default LocalizationSettings;
