import { Template } from "meteor/templating";

Template.notFound.onCreated(() => {
  document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<meta name='prerender-status-code' content='404'>");
  // todo report not found source
});
