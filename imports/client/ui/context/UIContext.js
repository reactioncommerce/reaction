import { createContext } from "react";

export const UIContext = createContext({
  isPrimarySidebarOpen: true,
  onClosePrimarySidebar: () => { },
  onTogglePrimarySidebar: () => { }
});
