import { Packages } from "/lib/collections";

export function getPackageSettings() {
  const packageInfo = Packages.findOne({
    name: "reaction-revisions"
  });

  if (packageInfo && packageInfo.settings) {
    return packageInfo.settings;
  }

  return null;
}

export function isRevisionControlEnabled() {
  const settings = getPackageSettings();
  return settings.general.enabled;
}
