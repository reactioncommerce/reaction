import { Packages } from "/lib/collections";

export function getPackageSettings() {
  const packageInfo = Packages.findOne({
    name: "reaction-marketplace"
  });

  return packageInfo || null;
}

export function isMarketplaceEnabled() {
  const packageInfo = getPackageSettings();

  if (typeof packageInfo.enabled === "boolean") {
    return packageInfo.enabled;
  }

  return false;
}

export const MarketplaceApi = {
  isMarketplaceEnabled,
  getPackageSettings
};
