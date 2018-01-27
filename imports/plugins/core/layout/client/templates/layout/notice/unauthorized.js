import { Template } from "meteor/templating";

Template.unauthorized.onCreated(() => {
  document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<meta name='prerender-status-code' content='403'>");
  // todo report not found source
});
