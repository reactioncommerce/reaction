import { Packages } from "/lib/collections";

export function getPackageSettings() {
  const packageInfo = Packages.findOne({
    name: "reaction-revisions"
  });

  if (packageInfo && packageInfo.enabled && packageInfo.settings) {
    return packageInfo.settings;
  }

  return null;
}

export function isRevisionControlEnabled() {
  const settings = getPackageSettings();

  if (settings && settings.general && typeof settings.general.enabled === "boolean") {
    return settings.general.enabled;
  }

  return false;
}

export const RevisionApi = {
  isRevisionControlEnabled,
  getPackageSettings
};
