export const i18next = {
  t: (key, { defaultValue }) => {
    return defaultValue || key;
  }
};
