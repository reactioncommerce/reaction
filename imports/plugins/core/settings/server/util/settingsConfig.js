import SimpleSchema from "simpl-schema";

export const globalSettingsConfig = {};
export const shopSettingsConfig = {};

export const globalSettingsSchema = new SimpleSchema();
export const shopSettingsSchema = new SimpleSchema();

/**
 * @param {Object} settings The settings object
 * @return {Object} Settings object with default values added
 */
export function addGlobalSettingDefaults(settings) {
  Object.getOwnPropertyNames(globalSettingsSchema).forEach((field) => {
    const value = settings[field];
    if (value === undefined || value === null) {
      const config = globalSettingsSchema[field];
      if (config.defaultValue !== undefined) {
        settings[field] = config.defaultValue;
      }
    }
  });
  return settings;
}

/**
 * @param {Object} settings The settings object
 * @return {Object} Settings object with default values added
 */
export function addShopSettingDefaults(settings) {
  Object.getOwnPropertyNames(shopSettingsConfig).forEach((field) => {
    const value = settings[field];
    if (value === undefined || value === null) {
      const config = shopSettingsConfig[field];
      if (config.defaultValue !== undefined) {
        settings[field] = config.defaultValue;
      }
    }
  });
  return settings;
}

/**
 * @param {String} field The setting field name
 * @return {String[]} List of roles that can edit this setting.
 */
export function rolesThatCanEditGlobalSetting(field) {
  const config = globalSettingsSchema[field];
  if (!config) return [];

  return config.rolesThatCanEdit || [];
}

/**
 * @param {String} field The setting field name
 * @return {String[]} List of roles that can edit this setting.
 */
export function rolesThatCanEditShopSetting(field) {
  const config = shopSettingsConfig[field];
  if (!config) return [];

  return config.rolesThatCanEdit || [];
}

const configSchema = new SimpleSchema({
  "defaultValue": {
    type: SimpleSchema.oneOf(String, Number, Date, Boolean),
    optional: true
  },
  "rolesThatCanEdit": {
    type: Array,
    optional: true
  },
  "rolesThatCanEdit.$": String,
  "simpleSchema": {
    type: Object,
    blackbox: true
  }
});

/**
 * @summary Reads and merges `appSettingsConfig` from all plugin registration.
 * @return {undefined}
 */
export function registerPluginHandler({
  globalSettingsConfig: globalSettingsConfigFromPlugin,
  name,
  shopSettingsConfig: shopSettingsConfigFromPlugin
}) {
  if (globalSettingsConfigFromPlugin) {
    Object.getOwnPropertyNames(globalSettingsConfigFromPlugin).forEach((field) => {
      if (globalSettingsConfig[field]) {
        throw new Error(`Plugin ${name} has field "${field}" in "globalSettingsConfig" but another plugin already defined this field`);
      }

      const config = globalSettingsConfigFromPlugin[field];
      configSchema.validate(config);

      globalSettingsConfig[field] = config;

      globalSettingsSchema.extend({
        [field]: {
          ...config.simpleSchema,
          optional: true
        }
      });
    });
  }

  if (shopSettingsConfigFromPlugin) {
    Object.getOwnPropertyNames(shopSettingsConfigFromPlugin).forEach((field) => {
      if (shopSettingsConfig[field]) {
        throw new Error(`Plugin ${name} has field "${field}" in "shopSettingsConfig" but another plugin already defined this field`);
      }

      const config = shopSettingsConfigFromPlugin[field];
      configSchema.validate(config);

      shopSettingsConfig[field] = config;

      shopSettingsSchema.extend({
        [field]: {
          ...config.simpleSchema,
          optional: true
        }
      });
    });
  }
}
