import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
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
    onReloadTranslations: PropTypes.func,
    onUpdateCurrencyConfiguration: PropTypes.func,
    onUpdateLanguageConfiguration: PropTypes.func,
    onUpdateLocalization: PropTypes.func,
    shop: PropTypes.object, // Shop data
    timezoneOptions: PropTypes.array,
    uolOptions: PropTypes.array,
    uomOptions: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      currencies: props.currencies,
      languages: props.languages
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currencies: nextProps.currencies,
      languages: nextProps.languages
    });
  }

  handleUpdateCurrencyConfiguration = (event, isChecked, name) => {
    const currencyIndex = this.state.currencies.findIndex((currency) => currency.name === name);

    this.setState((state) => {
      const newStateCurrencies = state.currencies;
      newStateCurrencies[currencyIndex].enabled = isChecked;
      return { currencies: newStateCurrencies };
    }, () => {
      // Delaying to allow animation before sending data to server
      // If animation is not delayed, it twitches when actual update happens
      setTimeout(() => {
        this.props.onUpdateCurrencyConfiguration(event, isChecked, name);
      }, 200);
    });
  }

  handleUpdateLangaugeConfiguration = (event, isChecked, name) => {
    const languageIndex = this.state.languages.findIndex((language) => language.value === name);

    this.setState((state) => {
      const newStateLanguages = state.languages;
      newStateLanguages[languageIndex].enabled = isChecked;
      return { languages: newStateLanguages };
    }, () => {
      // Delaying to allow animation before sending data to server
      // If animation is not delayed, it twitches when actual update happens
      setTimeout(() => {
        this.props.onUpdateLanguageConfiguration(event, isChecked, name);
      }, 200);
    });
  }

  renderCurrencies() {
    return this.props.currencies.map((currency, key) => (
      <Components.ListItem
        actionType={"switch"}
        key={key}
        label={currency.label}
        switchOn={currency.enabled}
        switchName={currency.name}
        onSwitchChange={this.handleUpdateCurrencyConfiguration}
      />
    ));
  }

  renderLanguages() {
    return this.state.languages.map((language, key) => (
      <Components.ListItem
        actionType={"switch"}
        key={key}
        label={language.label}
        switchOn={language.enabled}
        switchName={language.value}
        onSwitchChange={this.handleUpdateLangaugeConfiguration}
      />
    ));
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

  handleReloadTranslations = (event) => {
    if (typeof this.props.onReloadTranslations === "function") {
      this.props.onReloadTranslations(event.altKey);
    }
  }

  renderListControls(name) {
    return (
      <Components.CardToolbar>
        <Components.FlatButton
          i18nKeyLabel={"admin.i18nSettings.allOn"}
          label="All On"
          value={name}
          onClick={this.handleAllOn}
        />
        { "|" }
        <Components.FlatButton
          i18nKeyLabel={"admin.i18nSettings.allOff"}
          label="All Off"
          value={name}
          onClick={this.handleAllOff}
        />
        {name === "language" && "|"}
        {name === "language" &&
          <Components.FlatButton
            i18nKeyTooltip={"admin.i18nSettings.reloadTranslations"}
            tooltip={"Reload translations asdasdasdasdasd"}
            tooltipAttachment="middle left"
            icon="fa fa-refresh"
            onClick={this.handleReloadTranslations}
          />
        }
      </Components.CardToolbar>
    );
  }

  render() {
    return (
      <Components.CardGroup>
        <Components.SettingsCard
          i18nKeyTitle="admin.i18nSettings.shopLocalization"
          name="localization"
          packageName={PACKAGE_NAME}
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Shop Localization"
        >
          <Components.Form
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
              baseUOL: {
                type: "select",
                options: this.props.uolOptions
              },
              language: {
                type: "select",
                options: this.props.enabledLanguages
              }
            }}
            name="localization"
            onSubmit={this.handleSubmit}
          />
        </Components.SettingsCard>
        <Components.SettingsCard
          i18nKeyTitle="admin.i18nSettings.enabledLanguages"
          name="languages"
          padded={false}
          packageName={PACKAGE_NAME}
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Languages"
        >
          {this.renderListControls("language")}
          <Components.List>
            {this.renderLanguages()}
          </Components.List>
        </Components.SettingsCard>
        <Components.SettingsCard
          i18nKeyTitle="admin.i18nSettings.enabledCurrencies"
          padded={false}
          packageName={PACKAGE_NAME}
          name="currencies"
          saveOpenStateToPreferences={true}
          showSwitch={false}
          title="Currencies"
        >
          {this.renderListControls("currency")}
          <Components.List>
            {this.renderCurrencies()}
          </Components.List>
        </Components.SettingsCard>
      </Components.CardGroup>
    );
  }
}

export default LocalizationSettings;
