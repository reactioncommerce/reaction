import { Template } from "meteor/templating";
import { PackageList } from "../../components";
import { PackageListContainer } from "../../containers";

Template.dashboardPackages.helpers({
  PackageListComponent() {
    return {
      component: PackageListContainer(PackageList)
    };
  }
});
