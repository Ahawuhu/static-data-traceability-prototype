const syncTableNames = new Set([
  '项目楼栋',
  '小区绿化苗木 - 乔木',
  '小区绿化苗木 - 灌木/绿篱',
  '小区绿化苗木 - 地被植物/草坪植物/藤本植物',
  '古树名木台账',
  '电梯系统',
  '水表/专用部位水表',
  '水表/公共部位水表',
  '水表/公司自用水表',
  '电表/专用部位表',
  '电表/公共部位电表',
  '电表/公司自用电表'
]);

const syncNames = {
  '项目楼栋': ['4号楼', '5号楼', '6号楼'],
  '小区绿化苗木 - 乔木': ['凤凰木', '小叶榕', '木棉'],
  '小区绿化苗木 - 灌木/绿篱': ['三角梅', '黄金榕', '红继木'],
  '小区绿化苗木 - 地被植物/草坪植物/藤本植物': ['马尼拉草', '沿阶草', '爬山虎'],
  '古树名木台账': ['古榕树', '古木棉', '古荔枝'],
  '电梯系统': ['1号楼1单元电梯', '2号楼1单元电梯', '3号楼1单元电梯']
};

const meterPrefixes = {
  '水表/专用部位水表': 'ZS', '水表/公共部位水表': 'GS', '水表/公司自用水表': 'CS',
  '电表/专用部位表': 'ZD', '电表/公共部位电表': 'GD', '电表/公司自用电表': 'CD'
};

const syncDataButton = document.querySelector('#syncDataBtn');
const syncModal = document.querySelector('#syncModal');
let syncCandidates = [];

function syncSeedNames(tableName) {
  if (syncNames[tableName]) return syncNames[tableName];
  const prefix = meterPrefixes[tableName] || 'SYNC';
  return [1, 2, 3].map(index => `${prefix}-2026-${String(index).padStart(3, '0')}`);
}

function syncValue(column, name, index, tableName) {
  if (column.trim() === '序号') return '';
  if (/(名称|楼栋名称|苗木名称|树种|设备名称)/.test(column)) return name;
  if (/(编号|标号|编码)/.test(column)) return `${meterPrefixes[tableName] || 'SYNC'}-${String(index + 1).padStart(3, '0')}`;
  if (/(安装位置|分布位置|位置|区域|范围)/.test(column)) return `小区公共区域${index + 1}`;
  if (/(数量|总户数|总层数)/.test(column)) return String(index + 1);
  if (/单位/.test(column)) return tableName.includes('苗木') || tableName.includes('古树') ? '株' : '台';
  if (/(状态|现状)/.test(column)) return '正常';
  if (/(时间|日期)/.test(column)) return '2026-07-28';
  if (/(品牌|型号|规格)/.test(column)) return '待同步';
  if (/(照片|图片)/.test(column)) return '待补充';
  return '待同步';
}

function buildSyncCandidates(table) {
  return syncSeedNames(table.name).map((name, index) => ({
    id: `${table.name}-${index}`,
    values: table.columns.map(column => syncValue(column, name, index, table.name))
  }));
}

function updateSyncSelection() {
  const checks = [...document.querySelectorAll('.sync-row-check')];
  const selected = checks.filter(check => check.checked).length;
  document.querySelector('#syncSelectedCount').textContent = `已选 ${selected} 条`;
  document.querySelector('#confirmSync').disabled = selected === 0;
  const selectAll = document.querySelector('#syncSelectAll');
  selectAll.checked = selected === checks.length && checks.length > 0;
  selectAll.indeterminate = selected > 0 && selected < checks.length;
}

function openSyncModal() {
  const table = categories[currentCategory].tables[currentSheet];
  syncCandidates = buildSyncCandidates(table);
  document.querySelector('#syncTitle').textContent = `同步${table.name}数据`;
  document.querySelector('#syncSource').textContent = `数据来源：智慧城业务系统 · 蓝岛康城`;
  document.querySelector('#syncAvailableCount').textContent = `发现 ${syncCandidates.length} 条可同步数据`;
  document.querySelector('#syncHead').innerHTML = `<tr><th>选择</th>${table.columns.map(column => `<th>${esc(column)}</th>`).join('')}</tr>`;
  document.querySelector('#syncRows').innerHTML = syncCandidates.map((candidate, index) => `<tr><td><input class="sync-row-check" type="checkbox" data-index="${index}" aria-label="选择第${index + 1}条可同步数据"></td>${candidate.values.map(value => `<td title="${esc(value)}">${esc(value) || '-'}</td>`).join('')}</tr>`).join('');
  document.querySelector('#syncSelectAll').checked = false;
  document.querySelector('#syncSelectAll').indeterminate = false;
  document.querySelectorAll('.sync-row-check').forEach(check => check.addEventListener('change', updateSyncSelection));
  updateSyncSelection();
  syncModal.classList.remove('hidden');
  iconRefresh();
}

function closeSyncModal() {
  syncModal.classList.add('hidden');
  syncCandidates = [];
}

function refreshSyncButton() {
  const table = categories[currentCategory].tables[currentSheet];
  syncDataButton.classList.toggle('hidden', !syncTableNames.has(table.name));
}

const renderSheetBeforeSync = renderSheet;
renderSheet = function renderSheetWithSyncButton() {
  renderSheetBeforeSync();
  refreshSyncButton();
};

syncDataButton.addEventListener('click', openSyncModal);
document.querySelectorAll('.close-sync').forEach(button => button.addEventListener('click', closeSyncModal));
document.querySelector('#syncSelectAll').addEventListener('change', event => {
  document.querySelectorAll('.sync-row-check').forEach(check => { check.checked = event.target.checked; });
  updateSyncSelection();
});
document.querySelector('#confirmSync').addEventListener('click', () => {
  const table = categories[currentCategory].tables[currentSheet];
  const selected = [...document.querySelectorAll('.sync-row-check:checked')].map(check => syncCandidates[Number(check.dataset.index)]);
  selected.forEach(candidate => table.rows.push([...candidate.values]));
  categories[currentCategory].rowCount += selected.length;
  closeSyncModal();
  renderCategoryTabs();
  renderSheetNav();
  renderSheet();
  toast(`已以插入形式同步 ${selected.length} 条数据`);
});
