/* Required-field markers and single-choice controls from the facility template. */
(() => {
  const choiceOptions = (table, index, label) => {
    const values = table.rows.map(row => String(row[index] || '').trim()).filter(Boolean);
    const defaults = label.includes('使用状态') ? ['在用', '停用', '故障', '正常', '报废'] : [];
    return [...new Set([...values, ...defaults])].slice(0, 30);
  };

  window.openEdit = function (rowIndex = 0) {
    const table = categories[currentCategory].tables[currentSheet];
    const data = table.rows[rowIndex] || [];
    const required = new Set(table.required || []);
    const visible = table.columns.map((column, index) => ({ column, index })).filter(item => item.column.trim() !== '序号');
    $('#editTitle').textContent = `编辑${currentCategory} · ${table.name}`;
    $('#editFields').dataset.row = rowIndex;
    $('#editFields').innerHTML = visible.map(({ column, index }) => {
      const marker = required.has(index) ? '<b class="required-mark">*</b>' : '';
      const isChoice = (table.fieldTypes && table.fieldTypes[index] === 'radio')
        || column.includes('设备名称')
        || column.includes('使用状态');
      if (isChoice) {
        const options = choiceOptions(table, index, column);
        return `<fieldset class="choice-field"><legend>${marker}${esc(column)}</legend><div class="choice-options">${options.map(option => `<label><input type="radio" name="field-${index}" value="${esc(option)}" data-col="${index}" ${String(data[index] || '') === option ? 'checked' : ''}><span>${esc(option)}</span></label>`).join('')}</div></fieldset>`;
      }
      return `<label>${marker}${esc(column)}<input value="${esc(data[index])}" data-col="${index}" ${required.has(index) ? 'data-required="true"' : ''}></label>`;
    }).join('');
    $('#editModal').classList.remove('hidden');
    iconRefresh();
  };

  $('#saveEdit').onclick = () => {
    const table = categories[currentCategory].tables[currentSheet];
    const rowIndex = Number($('#editFields').dataset.row);
    const required = new Set(table.required || []);
    const values = {};
    $('#editFields [data-col]').forEach(control => {
      const index = Number(control.dataset.col);
      if (control.type === 'radio') {
        if (control.checked) values[index] = control.value.trim();
      } else values[index] = control.value.trim();
    });
    const missing = [...required].filter(index => !String(values[index] || '').trim());
    if (missing.length) {
      toast('请填写所有标红必填字段');
      return;
    }
    Object.entries(values).forEach(([index, value]) => { table.rows[rowIndex][Number(index)] = value; });
    currentCommunity.time = '2026-07-27 ' + new Date().toTimeString().slice(0, 5);
    currentCommunity.user = '张志宣';
    localStorage.setItem('traceCommunities', JSON.stringify(communities));
    closeEdit();
    renderSheet();
    renderSummary();
    toast('数据修改已保存');
  };
})();
