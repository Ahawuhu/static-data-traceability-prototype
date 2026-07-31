const traceLayout = document.querySelector('#traceView');
const treeCollapse = document.querySelector('.tree-collapse');
const detailDataLayout = document.querySelector('#detailDataLayout');
const sheetCollapse = document.querySelector('.sheet-collapse');

function setCollapseButton(button, collapsed, target) {
  const action = collapsed ? '展开' : '收起';
  button.setAttribute('aria-label', `${action}${target}`);
  button.title = `${action}${target}`;
  button.innerHTML = `<i data-lucide="${collapsed ? 'panel-right-open' : 'panel-left-close'}"></i>`;
  if (window.lucide) lucide.createIcons();
}

treeCollapse.addEventListener('click', () => {
  const collapsed = traceLayout.classList.toggle('nav-collapsed');
  setCollapseButton(treeCollapse, collapsed, '数据导航');
});

sheetCollapse.addEventListener('click', () => {
  const collapsed = detailDataLayout.classList.toggle('sheet-collapsed');
  setCollapseButton(sheetCollapse, collapsed, '表单目录');
});
