/* Open the prototype at the page currently selected in Figma. */
(() => {
  const openSelectedPage = () => {
    if (typeof openDetail !== 'function' || typeof categories === 'undefined') return;
    openDetail('蓝岛康城');
    currentCategory = '客服类';
    currentSheet = categories[currentCategory].tables.findIndex(table => table.name.includes('汇总表'));
    if (currentSheet < 0) currentSheet = 0;
    sheetPage = 1;
    renderCategoryTabs();
    renderSheetNav();
    renderSheet();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openSelectedPage);
  else openSelectedPage();
})();
