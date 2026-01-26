export const deleteCookie = (name) => {
  document.cookie = name + '=; expires=Thu, 01 Jan 2010 00:00:00 UTC; path=/;';
};
