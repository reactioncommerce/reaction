import { FlowRouter as ReactionRouter } from "meteor/kadira:flow-router-ssr";

// server can defer loading
ReactionRouter.setDeferScriptLoading(true);

export default ReactionRouter;
