import { registerComponent } from "@reactioncommerce/reaction-components";

import "./containers"; // For registering `ProductPublish`

import { Divider } from "/imports/plugins/core/ui/client/components";

import {
  AlertContainer,
  MediaGalleryContainer
} from "/imports/plugins/core/ui/client/containers";

// Register PDP components and some others
registerComponent("AlertContainer", AlertContainer);
registerComponent("MediaGalleryContainer", MediaGalleryContainer);
registerComponent("Divider", Divider);
