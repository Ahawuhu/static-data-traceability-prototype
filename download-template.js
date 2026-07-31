const templateFiles = {
  '小区概况': 'templates/小区概况数据填报模板.xlsx',
  '财务类': 'templates/财务类数据填报模板.docx',
  '环境类': 'templates/环境类数据填报模板.docx',
  '客服类': 'templates/客服类数据填报模板.xlsx',
  '行政类': 'templates/行政类数据填报模板.docx',
  '设施设备类': 'templates/设施设备类数据填报模板.docx',
  '秩序类': 'templates/秩序类数据填报模板.docx'
};

document.querySelector('#downloadTemplateBtn').addEventListener('click', () => {
  const path = templateFiles[currentCategory];
  if (!path) {
    toast('当前分类暂无可下载模板');
    return;
  }
  const link = document.createElement('a');
  link.href = path;
  link.download = path.split('/').pop();
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast(`${currentCategory}模板开始下载`);
});
