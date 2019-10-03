import SimpleSchema from "simpl-schema";

export const globalSettingsConfig = {};
export const shopSettingsConfig = {};

export const globalSettingsSchema = new SimpleSchema();
export const shopSettingsSchema = new SimpleSchema();

/**
 * @param {Object} settings The settings object
 * @returns {Object} Settings object with default values added
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
 * @returns {Object} Settings object with default values added
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
 * @returns {String[]} List of roles that can edit this setting.
 */
export function rolesThatCanEditGlobalSetting(field) {
  const config = globalSettingsSchema[field];
  if (!config) return [];

  return config.rolesThatCanEdit || [];
}

/**
 * @param {String} field The setting field name
 * @returns {String[]} List of roles that can edit this setting.
 */
export function rolesThatCanEditShopSetting(field) {
  const config = shopSettingsConfig[field];
  if (!config) return [];

  return config.rolesThatCanEdit || [];
}

/**
 * @summary Run all afterUpdate hooks that were registered for each updated setting
 * @param {Object} context App context
 * @param {Object} updates Object with setting name as key and new setting value as value
 * @param {String} [shopId] Shop ID. Pass `null` for global settings.
 * @return {undefined}
 */
export function runAfterUpdateHooks(context, updates, shopId) {
  Object.keys(updates).forEach((field) => {
    const config = shopId ? shopSettingsConfig[field] : globalSettingsSchema[field];
    if (!config || !config.afterUpdate) return;

    config.afterUpdate(context, { shopId, value: updates[field] });
  });
}

const configSchema = new SimpleSchema({
  "afterUpdate": {
    type: Function,
    optional: true
  },
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
 * @returns {undefined}
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
