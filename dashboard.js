let dashboardMode = 'completion';
let dashboardLevel = 'enterprise';
let dashboardRegion = '';
let dashboardCompany = '';
let activeAnalysisGroup = '财务经营';
const dashboardCompanyName = '智慧城海南公司';

const completionModules = ['小区概况', '财务类', '环境类', '客服类', '行政类', '秩序类', '设施设备类'];
const analysisGroupColors = {'财务经营':'#3f8df6','环境绿化':'#22a06b','客服档案':'#8b5cf6','设施设备':'#d48b28','行政合规':'#da5f72','秩序安防':'#247d91','项目概况':'#657589'};

function dashboardRegions() {
  return [...new Set(communities.map(community => community.region))];
}

function dashboardScopeCommunities() {
  if (!dashboardRegion) return communities;
  return communities.filter(community => community.region === dashboardRegion);
}

function dashboardAverage(list, field) {
  return list.length ? Math.round(list.reduce((sum, item) => sum + item[field], 0) / list.length) : 0;
}

function dashboardScopeLabel() {
  if (dashboardLevel === 'company') return `${dashboardCompanyName} · 公司维度`;
  if (dashboardLevel === 'region') return `${dashboardRegion} · 区域维度`;
  return '智慧城科技 · 企业维度';
}

function renderDashboardSelectors() {
  const regionSelect = document.querySelector('#dashboardRegion');
  regionSelect.innerHTML = '<option value="">全部区域</option>' + dashboardRegions().map(region => `<option value="${esc(region)}" ${region === dashboardRegion ? 'selected' : ''}>${esc(region)}</option>`).join('');
  const companySelect = document.querySelector('#dashboardCompany');
  companySelect.disabled = !dashboardRegion;
  companySelect.innerHTML = `<option value="">全部公司</option>${dashboardRegion ? `<option value="${dashboardCompanyName}" ${dashboardLevel === 'company' ? 'selected' : ''}>${dashboardCompanyName}</option>` : ''}`;
  document.querySelector('#dashboardScopeText').textContent = dashboardScopeLabel();
}

function renderDashboardBreadcrumb() {
  const parts = [{level:'enterprise', label:'智慧城科技'}];
  if (dashboardRegion) parts.push({level:'region', label:dashboardRegion});
  if (dashboardLevel === 'company') parts.push({level:'company', label:dashboardCompanyName});
  document.querySelector('#dashboardBreadcrumb').innerHTML = parts.map((part,index) => `${index ? '<i data-lucide="chevron-right"></i>' : '<i data-lucide="map-pin"></i>'}<button class="${index === parts.length - 1 ? 'current' : ''}" data-scope-level="${part.level}">${esc(part.label)}</button>`).join('');
  document.querySelectorAll('[data-scope-level]').forEach(button => button.onclick = () => {
    if (button.dataset.scopeLevel === 'enterprise') { dashboardLevel = 'enterprise'; dashboardRegion = ''; dashboardCompany = ''; }
    if (button.dataset.scopeLevel === 'region') { dashboardLevel = 'region'; dashboardCompany = ''; }
    renderDashboard();
  });
}

function completionRateFor(moduleIndex, list) {
  const average = dashboardAverage(list, 'complete');
  const adjustments = [3, 0, -5, -2, -8, -4, -7];
  return Math.max(42, Math.min(100, average + adjustments[moduleIndex]));
}

function renderCompletionDashboard(list) {
  const filled = list.filter(community => community.cats > 0).length;
  const expected = list.length;
  const overall = dashboardAverage(list, 'complete');
  const timely = list.filter(community => community.time >= '2026-06-28').length;
  const timelyRate = expected ? Math.round(timely / expected * 100) : 0;
  const moduleRates = completionModules.map((name,index) => ({name, rate:completionRateFor(index,list)}));
  const avgModule = Math.round(moduleRates.reduce((sum,item) => sum + item.rate, 0) / moduleRates.length);
  const kpis = [
    ['项目填报总数', filled, `应填 ${expected} 个项目`, 'folder-check', '#3f8df6'],
    ['总体填报率', `${overall}%`, '已填项目 ÷ 应填项目', 'chart-no-axes-combined', '#22a06b'],
    ['模块平均完成率', `${avgModule}%`, '7 个数据模块', 'layers-3', '#8b5cf6'],
    ['数据更新及时率', `${timelyRate}%`, '30 天内更新', 'clock-3', '#d48b28']
  ];
  const keyTables = [
    ['物业服务费标准台账', overall], ['项目建设资料', Math.max(45,overall-8)],
    ['电梯系统', Math.max(45,overall-3)], ['视频监控系统', Math.max(45,overall-6)],
    ['小区绿化苗木', Math.max(45,overall-11)], ['资质证书管理台账', Math.max(45,overall-5)]
  ];
  document.querySelector('#dashboardBody').innerHTML = `<div class="dashboard-body-inner">
    <div class="dashboard-kpis">${kpis.map(item => `<div class="dashboard-kpi" style="--kpi-color:${item[4]}"><div><small>${item[0]}</small><strong>${item[1]}</strong><em>${item[2]}</em></div><span><i data-lucide="${item[3]}"></i></span></div>`).join('')}</div>
    <div class="dashboard-row"><section class="dashboard-block"><div class="dashboard-block-head"><strong>模块填报率</strong><span>按项目是否已填写汇总表或任一详细台账统计</span></div><div class="module-monitor">${moduleRates.map((item,index) => `<div class="module-monitor-row"><span>${item.name}</span><div class="monitor-track"><i style="width:${item.rate}%;--bar-color:${item.rate < 80 ? '#e58a24' : index === 0 ? '#22a06b' : '#3f8df6'}"></i></div><b>${item.rate}%</b></div>`).join('')}</div></section>
    <section class="dashboard-block"><div class="dashboard-block-head"><strong>总体填报进度</strong><span>${filled}/${expected} 个项目已启动</span></div><div class="dashboard-ring-wrap"><div class="dashboard-ring" style="background:conic-gradient(#3f8df6 0 ${overall}%,#e8edf3 ${overall}% 100%)"><div><strong>${overall}%</strong><span>总体填报率</span></div></div></div><div class="dashboard-legend"><span><i style="background:#3f8df6"></i>已完成</span><span><i style="background:#e8edf3"></i>待补充</span></div></section></div>
    <div class="dashboard-row"><section class="dashboard-block"><div class="dashboard-block-head"><strong>关键表格完成率</strong><span>重点台账填报情况</span></div><div class="table-scroll"><table class="completion-table"><thead><tr><th>表格</th><th>完成率</th><th>已填项目</th><th>状态</th></tr></thead><tbody>${keyTables.map(item => {const count=Math.round(expected*item[1]/100);return `<tr><td>${item[0]}</td><td><div class="inline-rate"><i style="--rate:${item[1]}%"></i><span>${item[1]}%</span></div></td><td>${count}/${expected}</td><td class="${item[1] >= 85 ? 'good-text' : 'risk-text'}">${item[1] >= 85 ? '达标' : '待提升'}</td></tr>`}).join('')}</tbody></table></div></section>
    <section class="dashboard-block"><div class="dashboard-block-head"><strong>区域完成情况</strong><span class="dashboard-drill-note"><i data-lucide="corner-right-down"></i>点击区域下钻查看</span></div>${renderRegionProgress()}</section></div>
  </div>`;
}

function renderRegionProgress() {
  const regions = dashboardRegions().map(region => {
    const list = communities.filter(community => community.region === region);
    return { region, list, rate: dashboardAverage(list, 'complete') };
  }).sort((a, b) => b.rate - a.rate);
  return `<div class="region-progress-list">${regions.map((item,index) => `<button class="region-progress-item ${dashboardRegion === item.region ? 'selected' : ''}" data-drill-level="region" data-drill-region="${esc(item.region)}"><span class="region-progress-rank">${index + 1}</span><span class="region-progress-info"><strong>${esc(item.region)}</strong><em>${item.list.length} 个项目</em></span><span class="region-progress-chart"><i><b style="width:${item.rate}%;--region-color:${item.rate >= 90 ? '#22a06b' : item.rate >= 80 ? '#3f8df6' : '#e58a24'}"></b></i><em>${item.rate >= 90 ? '完成良好' : item.rate >= 80 ? '稳步推进' : '需重点提升'}</em></span><strong class="region-progress-rate">${item.rate}%</strong><i data-lucide="chevron-right" class="region-progress-arrow"></i></button>`).join('')}</div>`;
}

function scaledNumber(base, list, decimals=0) {
  const factor = list.reduce((sum,item) => sum + item.complete / 96, 0);
  return (base * factor).toLocaleString('zh-CN',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
}

function analysisGroups(list) {
  const rate = dashboardAverage(list,'complete');
  const count = base => scaledNumber(base,list);
  const money = base => `¥${scaledNumber(base,list)}`;
  return {
    '财务经营': [
      ['月度物业费应收总额',money(91400),'元/月'],['月度车辆服务费总额',money(18900),'元/月'],['年度公共收益合同总额',money(216000),'元/年'],['代收代付月度总额',money(68400),'元/月'],['物业费平均单价（住宅/商业）','1.80 / 3.20','元/月·㎡'],['欠费违约金覆盖率',`${Math.max(0,rate-9)}%`,'项目覆盖']
    ],
    '环境绿化': [['垃圾分类容器总数',count(68),'个'],['公共卫生间总数',count(4),'间'],['乔木/灌木/草坪规模',`${count(326)} / ${count(520)} / ${count(6200)}`,'株 / 株 / ㎡'],['绿化灌溉设备数量',count(24),'台/套'],['古树名木数量',count(3),'株']],
    '客服档案': [['项目建设资料完整率',`${Math.max(0,rate-8)}%`,'已归档/应归档'],['承接查验资料完整率',`${Math.max(0,rate-5)}%`,'签订+查验资料'],['楼栋总数/总户数',`${count(3)} / ${count(434)}`,'栋 / 户'],['物业用房面积合计',count(160),'㎡']],
    '设施设备': [['电梯总数（乘客/货梯）',`${count(6)} / ${count(0)}`,'台'],['供水设备数量',count(18),'台/套'],['供电设备数量',count(31),'台/套'],['消防设备数量',count(146),'台/套/具'],['设备完好率',`${Math.min(99,rate+2)}%`,'在用设备/总设备'],['水表/电表总数',`${count(431)} / ${count(427)}`,'只']],
    '行政合规': [['有效合同数量',count(12),'份'],['资质证照有效比例',`${Math.max(0,rate-3)}%`,'有效证照/总证照'],['保险覆盖种类数',count(4),'种']],
    '秩序安防': [['视频监控摄像头总数',count(94),'台'],['单元门禁设备总数',count(6),'台'],['巡更点总数',count(32),'个'],['消防灭火器总具数',count(126),'具'],['汽车充电桩总数（快/慢）',`${count(2)} / ${count(18)}`,'个'],['二轮车充电桩接口数',count(80),'个'],['规划停车位总数',count(270),'个']],
    '项目概况': [['总占地面积',count(51323),'㎡'],['总建筑面积',count(51300),'㎡'],['容积率/绿地率','2.40 / 40%','平均值'],['总户数（住宅/商业/别墅）',`${count(414)} / ${count(20)} / ${count(0)}`,'户']]
  };
}

function renderContentDashboard(list) {
  const groups = analysisGroups(list);
  if (!groups[activeAnalysisGroup]) activeAnalysisGroup = Object.keys(groups)[0];
  const totalArea = scaledNumber(51300,list);
  const totalHomes = scaledNumber(434,list);
  const monthlyIncome = `¥${scaledNumber(110300,list)}`;
  const healthy = Math.min(99,dashboardAverage(list,'complete')+2);
  const selected = groups[activeAnalysisGroup];
  const color = analysisGroupColors[activeAnalysisGroup];
  document.querySelector('#dashboardBody').innerHTML = `<div class="dashboard-body-inner">
    <div class="analysis-summary"><div><span>物业与车辆月应收</span><strong>${monthlyIncome}</strong><em>物业费+车辆服务费</em></div><div><span>总建筑面积</span><strong>${totalArea} ㎡</strong><em>${list.length} 个项目汇总</em></div><div><span>总户数</span><strong>${totalHomes} 户</strong><em>住宅、商业、别墅</em></div><div><span>设备完好率</span><strong>${healthy}%</strong><em>状态为“在用”的设备</em></div></div>
    <div class="analysis-layout"><nav class="analysis-nav">${Object.entries(groups).map(([name,metrics]) => `<button class="${name === activeAnalysisGroup ? 'active' : ''}" data-analysis-group="${name}"><span>${name}</span><em>${metrics.length} 项</em></button>`).join('')}</nav><section class="analysis-content"><div class="analysis-content-head"><strong>${activeAnalysisGroup}</strong><span>${dashboardScopeLabel()} · ${selected.length} 项指标</span></div><div class="analysis-metric-grid">${selected.map(metric => `<div class="analysis-metric" style="--metric-color:${color}"><span>${metric[0]}</span><strong>${metric[1]}</strong><em>${metric[2]}</em></div>`).join('')}</div></section></div>
  </div>`;
  document.querySelectorAll('[data-analysis-group]').forEach(button => button.onclick = () => { activeAnalysisGroup = button.dataset.analysisGroup; renderDashboard(); });
}

function bindDashboardDrilldown() {
  document.querySelectorAll('[data-drill-level]').forEach(button => button.onclick = () => {
    dashboardRegion = button.dataset.drillRegion || dashboardRegion;
    dashboardLevel = button.dataset.drillLevel;
    dashboardCompany = dashboardLevel === 'company' ? dashboardCompanyName : '';
    renderDashboard();
  });
}

renderDashboard = function renderIndicatorDashboard() {
  renderDashboardSelectors();
  renderDashboardBreadcrumb();
  document.querySelectorAll('[data-dashboard-mode]').forEach(button => button.classList.toggle('active', button.dataset.dashboardMode === dashboardMode));
  const list = dashboardScopeCommunities();
  if (dashboardMode === 'completion') renderCompletionDashboard(list);
  else renderContentDashboard(list);
  bindDashboardDrilldown();
  iconRefresh();
};

document.querySelectorAll('[data-dashboard-mode]').forEach(button => button.onclick = () => { dashboardMode = button.dataset.dashboardMode; renderDashboard(); });
document.querySelector('#dashboardRegion').onchange = event => {
  dashboardRegion = event.target.value;
  dashboardLevel = dashboardRegion ? 'region' : 'enterprise';
  dashboardCompany = '';
  renderDashboard();
};
document.querySelector('#dashboardCompany').onchange = event => {
  dashboardCompany = event.target.value;
  dashboardLevel = dashboardCompany ? 'company' : 'region';
  renderDashboard();
};
