import { createContext } from "react";

export const UIContext = createContext({
  isDetailDrawerOpen: false,
  isMobile: false,
  isPrimarySidebarOpen: true,
  onCloseDetailDrawer: () => { },
  onClosePrimarySidebar: () => { },
  onToggleDetailDrawer: () => { },
  onTogglePrimarySidebar: () => { }
});
