import React from "react";
import { groupBy } from "lodash";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";

/**
 * handleShowPackage - Push package into action view navigation stack
 * @param  {SyntheticEvent} event Original event
 * @param  {Object} app Package data
 * @return {undefined} No return value
 */
function handleShowPackage(event, app) {
  Reaction.pushActionView(app);
}

function composer(props, onData) {
  const settings = Reaction.Apps({ provides: "settings", enabled: true }) || [];

  const dashboard = Reaction.Apps({ provides: "dashboard", enabled: true }).filter((d) => typeof d.template !== "undefined") || [];

console.log(settings);

  // const packages = apps.map((packageData) => {
  //   const appData = Reaction.Apps({
  //     provides: "settings",
  //     name: packageData.packageName
  //   });
  //
  //   if ((!packageData.route || !packageData.template) && appData.length) {
  //     return {
  //       ...packageData,
  //       ...appData[0]
  //     };
  //   }
  //
  //   return packageData;
  // });

  // const groupedPackages = groupBy(packages, (app) => {
  //   return app.container || "misc";
  // });

  onData(null, {
    // packages,
    groupedPackages: {
      dashboard: dashboard,
      settings: settings
    },
    // groups: Object.keys(groupedPackages),

    // Callbacks
    handleShowPackage
  });
}

export default function PackageListContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <TranslationProvider>
        <Comp {...props} />
      </TranslationProvider>
    );
  }

  return composeWithTracker(composer, Loading)(CompositeComponent);
}
