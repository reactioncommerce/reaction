import { createContext } from "react";

export const UIContext = createContext({
  isMobile: false,
  isPrimarySidebarOpen: true,
  onClosePrimarySidebar: () => { },
  onTogglePrimarySidebar: () => { }
});
