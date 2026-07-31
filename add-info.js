const addInfoButton = document.querySelector('#addInfoBtn');
const projectEditButton = document.querySelector('#projectEditBtn');
const originalRenderSheet = renderSheet;

function currentTableAllowsAdding() {
  const table = categories[currentCategory].tables[currentSheet];
  return currentSheet !== 0 && table.name !== '项目填报信息' && !table.name.includes('汇总表') && !(currentCategory === '小区概况' && table.name === '小区概况');
}

function refreshAddInfoButton() {
  const table = categories[currentCategory].tables[currentSheet];
  const isHouseType = currentCategory === '客服类' && table.name === '小区户型表';
  addInfoButton.classList.toggle('hidden', !currentTableAllowsAdding());
  addInfoButton.innerHTML = isHouseType ? '<i data-lucide="plus"></i>添加楼栋号' : '<i data-lucide="plus"></i>添加信息';
  projectEditButton.classList.toggle('hidden', currentSheet !== 0);
}

renderSheet = function renderSheetWithAddButton() {
  originalRenderSheet();
  refreshAddInfoButton();
  iconRefresh();
};

function openAddInfo() {
  const table = categories[currentCategory].tables[currentSheet];
  if (currentCategory === '客服类' && table.name === '小区户型表') {
    openHouseTypeBuilding();
    return;
  }
  const visibleColumns = table.columns
    .map((name, index) => ({ name, index }))
    .filter(column => column.name.trim() !== '序号');

  document.querySelector('#editTitle').textContent = `添加${currentCategory}信息 · ${table.name}`;
  document.querySelector('#editFields').dataset.mode = 'add';
  document.querySelector('#editFields').removeAttribute('data-row');
  document.querySelector('#editFields').innerHTML = visibleColumns
    .map(column => `<label><span class="required-label">${esc(column.name)}</span><input placeholder="请输入${esc(column.name)}" data-col="${column.index}"></label>`)
    .join('');
  document.querySelector('#editModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

addInfoButton.addEventListener('click', openAddInfo);

function houseTypeTable() {
  return categories['客服类'].tables.find(table => table.name === '小区户型表');
}

function isHouseTypeSection(row) {
  const values = row.filter(value => String(value).trim());
  return values.length > 1 && new Set(values).size === 1 && String(values[0]).startsWith('楼栋号：');
}

function houseTypeSectionTitle(building, unit, floors) {
  return `楼栋号： ${building} 单元号: ${unit} 单元 总层数： ${floors} 层`;
}

function parseHouseTypeSection(title) {
  const match = String(title).match(/^楼栋号：\s*(.*?)\s+单元号:\s*(.*?)\s+单元\s+总层数：\s*(.*?)\s+层$/);
  return match ? { building: match[1], unit: match[2], floors: match[3] } : { building: '', unit: '', floors: '' };
}

function renderHouseTypeSectionFields(values = {}) {
  document.querySelector('#editFields').innerHTML = [
    ['楼栋号', 'building', values.building || ''],
    ['单元号', 'unit', values.unit || ''],
    ['总层数', 'floors', values.floors || '']
  ].map(field => `<label><span class="required-label">${field[0]}</span><input value="${esc(field[2])}" placeholder="请输入${field[0]}" data-house-field="${field[1]}"></label>`).join('');
}

function openHouseTypeBuilding() {
  document.querySelector('#editTitle').textContent = '添加楼栋号';
  const fields = document.querySelector('#editFields');
  fields.dataset.mode = 'house-building';
  fields.removeAttribute('data-row');
  renderHouseTypeSectionFields();
  document.querySelector('#editModal').classList.remove('hidden');
  iconRefresh();
}

function openHouseTypeSectionEdit(rowIndex) {
  const table = houseTypeTable();
  document.querySelector('#editTitle').textContent = '编辑楼栋号';
  const fields = document.querySelector('#editFields');
  fields.dataset.mode = 'house-section-edit';
  fields.dataset.row = rowIndex;
  renderHouseTypeSectionFields(parseHouseTypeSection(table.rows[rowIndex][0]));
  document.querySelector('#editModal').classList.remove('hidden');
  iconRefresh();
}

function openHouseTypeUnit(sectionIndex) {
  const table = houseTypeTable();
  const visibleColumns = table.columns.map((name, index) => ({ name, index })).filter(column => column.name.trim() !== '序号');
  const section = parseHouseTypeSection(table.rows[sectionIndex][0]);
  document.querySelector('#editTitle').textContent = `添加户型 · ${section.building}`;
  const fields = document.querySelector('#editFields');
  fields.dataset.mode = 'house-unit';
  fields.dataset.sectionRow = sectionIndex;
  fields.innerHTML = visibleColumns.map(column => `<label><span class="required-label">${esc(column.name)}</span><input placeholder="请输入${esc(column.name)}" data-col="${column.index}"></label>`).join('');
  document.querySelector('#editModal').classList.remove('hidden');
  iconRefresh();
}

function deleteHouseTypeSection(rowIndex) {
  const table = houseTypeTable();
  const title = parseHouseTypeSection(table.rows[rowIndex][0]);
  if (!window.confirm(`确定删除「${title.building}」及该楼栋下的全部户型吗？`)) return;
  let end = rowIndex + 1;
  while (end < table.rows.length && !isHouseTypeSection(table.rows[end])) end += 1;
  const removed = end - rowIndex;
  table.rows.splice(rowIndex, removed);
  categories['客服类'].rowCount = Math.max(0, categories['客服类'].rowCount - removed);
  renderCategoryTabs();
  renderSheetNav();
  renderSheet();
  toast(`已删除 ${title.building} 及 ${removed - 1} 条户型数据`);
}

function localDateValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function projectDefaultValue(label, value) {
  if (/(填报时间|更新时间|更新日期)/.test(label) && (!value || value === '无')) return localDateValue();
  return value || '';
}

function openProjectEdit() {
  const table = categories[currentCategory].tables[currentSheet];
  const projectFields = [
    { label: table.columns[0], value: table.columns[1], target: 'column' },
    ...table.rows.map((row, index) => ({ label: row[0], value: row[1], target: 'row', row: index }))
  ];
  document.querySelector('#editTitle').textContent = `编辑${currentCategory} · 项目填报信息`;
  const fields = document.querySelector('#editFields');
  fields.dataset.mode = 'project';
  fields.innerHTML = projectFields.map(field => `<label>${esc(field.label)}<input value="${esc(projectDefaultValue(field.label, field.value))}" data-target="${field.target}" ${field.target === 'row' ? `data-row="${field.row}"` : ''}></label>`).join('');
  document.querySelector('#editModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

projectEditButton.addEventListener('click', openProjectEdit);

function deleteRow(rowIndex) {
  const table = categories[currentCategory].tables[currentSheet];
  if (!window.confirm('确定删除该条信息吗？删除后不可撤销。')) return;
  table.rows.splice(rowIndex, 1);
  categories[currentCategory].rowCount = Math.max(0, categories[currentCategory].rowCount - 1);
  sheetPage = Math.min(sheetPage, Math.max(1, Math.ceil(table.rows.length / 30)));
  renderCategoryTabs();
  renderSheetNav();
  renderSheet();
  toast('信息已删除');
}

const originalOpenEdit = openEdit;
openEdit = function openExistingRow(row) {
  originalOpenEdit(row);
  document.querySelector('#editFields').dataset.mode = 'edit';
};

document.querySelector('#saveEdit').onclick = () => {
  const table = categories[currentCategory].tables[currentSheet];
  const fields = document.querySelector('#editFields');
  const mode = fields.dataset.mode || 'edit';

  if (mode === 'house-building' || mode === 'house-section-edit') {
    const values = Object.fromEntries([...fields.querySelectorAll('[data-house-field]')].map(input => [input.dataset.houseField, input.value.trim()]));
    if (!values.building || !values.unit || !values.floors) {
      toast('请完整填写楼栋号、单元号和总层数');
      return;
    }
    const table = houseTypeTable();
    const title = houseTypeSectionTitle(values.building, values.unit, values.floors);
    const sectionRow = Array(table.columns.length).fill(title);
    if (mode === 'house-building') {
      table.rows.push(sectionRow);
      categories['客服类'].rowCount += 1;
      toast('楼栋号已添加');
    } else {
      table.rows[Number(fields.dataset.row)] = sectionRow;
      toast('楼栋号已更新');
    }
    closeEdit();
    renderCategoryTabs();
    renderSheetNav();
    renderSheet();
    return;
  }

  if (mode === 'house-unit') {
    const inputs = [...fields.querySelectorAll('[data-col]')];
    if (inputs.some(input => !input.value.trim())) {
      toast('请完整填写户型信息');
      return;
    }
    const table = houseTypeTable();
    const row = Array(table.columns.length).fill('');
    inputs.forEach(input => { row[Number(input.dataset.col)] = input.value.trim(); });
    let insertAt = Number(fields.dataset.sectionRow) + 1;
    while (insertAt < table.rows.length && !isHouseTypeSection(table.rows[insertAt])) insertAt += 1;
    table.rows.splice(insertAt, 0, row);
    categories['客服类'].rowCount += 1;
    closeEdit();
    renderCategoryTabs();
    renderSheetNav();
    renderSheet();
    toast('户型信息已添加');
    return;
  }

  if (mode === 'project') {
    fields.querySelectorAll('input').forEach(input => {
      if (input.dataset.target === 'column') table.columns[1] = input.value.trim() || '无';
      else table.rows[Number(input.dataset.row)][1] = input.value.trim() || '无';
    });
    currentCommunity.time = localDateValue() + ' ' + new Date().toTimeString().slice(0, 5);
    currentCommunity.user = '张志宣';
    localStorage.setItem('traceCommunities', JSON.stringify(communities));
    closeEdit();
    renderSheet();
    renderSummary();
    toast('项目填报信息已保存');
    return;
  }

  if (mode === 'add') {
    const inputs = [...fields.querySelectorAll('input')];
    if (inputs.some(input => !input.value.trim())) {
      toast('请完整填写新增信息');
      return;
    }
    const row = Array(table.columns.length).fill('');
    const sourceSequenceIndex = table.columns.findIndex(name => name.trim() === '序号');
    if (sourceSequenceIndex >= 0) row[sourceSequenceIndex] = String(table.rows.length + 1);
    inputs.forEach(input => { row[Number(input.dataset.col)] = input.value.trim(); });
    table.rows.push(row);
    categories[currentCategory].rowCount += 1;
    sheetPage = Math.max(1, Math.ceil(table.rows.length / 30));
    closeEdit();
    renderCategoryTabs();
    renderSheetNav();
    renderSheet();
    toast('信息添加成功');
    return;
  }

  const rowIndex = Number(fields.dataset.row);
  fields.querySelectorAll('input').forEach(input => {
    table.rows[rowIndex][Number(input.dataset.col)] = input.value.trim() || '无';
  });
  currentCommunity.time = '2026-07-28 ' + new Date().toTimeString().slice(0, 5);
  currentCommunity.user = '张志宣';
  localStorage.setItem('traceCommunities', JSON.stringify(communities));
  closeEdit();
  renderSheet();
  renderSummary();
  toast('数据修改已保存');
};
