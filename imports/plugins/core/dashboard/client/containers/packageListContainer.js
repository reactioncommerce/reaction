import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { PackageList } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { MediaGalleryContainer } from "/imports/plugins/core/ui/client/containers";
import { DragDropProvider, TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { groupBt } from "lodash"

// function

function handleShowPackage(event, app) {
  console.log(app);
  Reaction.pushActionView(app);
}

function composer(props, onData) {
  const apps = Reaction.Apps({ provides: "dashboard", enabled: true }) || [];
  const packages = apps.map((packageData) => {
    const appData = Reaction.Apps({
      provides: "settings",
      name: packageData.packageName
    });

    if ((!packageData.route || !packageData.template) && appData.length) {
      return {
        ...packageData,
        ...appData[0]
      };
    }

    return packageData;
  });

  const groupedPackages = _.groupBy(packages, (app) => {
    return app.container || "misc";
  });


  // const instance = Template.instance();
  // const data = instance.data;
  // const apps = Reaction.Apps({
  //   provides: "settings",
  //   name: data.package.packageName
  // });
  //
  // const controls = [];
  //
  // if (data.package.priority > 1) {
  //   controls.push({
  //     icon: "fa fa-plus-square fa-fw",
  //     onIcon: "fa fa-check-square fa-fw",
  //     toggle: true,
  //     toggleOn: data.package.enabled,
  //     onClick() {
  //       if (instance.data.enablePackage) {
  //         instance.data.enablePackage(data.package, !data.package.enabled);
  //       }
  //     }
  //   });
  // }
  //
  // for (const app of apps) {
  //   controls.push({
  //     icon: app.icon || "fa fa-cog fa-fw",
  //     onClick() {
  //       Reaction.pushActionView(app);
  //     }
  //   });
  // }
  //
  // if (data.package.route) {
  //   controls.push({
  //     icon: "angle-right",
  //     onClick() {
  //       console.log("Data.package", data);
  //       Reaction.pushActionView(data.package);
  //       // showPackageDashboard(data.package);
  //     }
  //   });
  // }
  //
  // return {
  //   controls,
  //   onContentClick() {
  //     Reaction.pushActionView(data.package);
  //     // showPackageDashboard(data.package);
  //   }
  // };
  //





















  onData(null, {
    packages,
    groupedPackages,
    groups: Object.keys(groupedPackages),

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
