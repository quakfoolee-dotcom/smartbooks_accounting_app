// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V9: Final dashboard cash-flow axis, month labels, and tab-specific legend override ----------
  function injectV9CashFlowStyles(){
    if(document.getElementById('v9-cashflow-final-styles')) return;
    const style=document.createElement('style');
    style.id='v9-cashflow-final-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0!important;overflow:hidden!important;border-radius:18px;background:var(--card,#fff)}
      body.v8-ui .v9-cash-card{display:grid;gap:0;background:var(--card,#fff)}
      body.v8-ui .v9-cash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px 4px}
      body.v8-ui .v9-cash-title{display:grid;gap:3px;min-width:220px}
      body.v8-ui .v9-cash-title .eyebrow{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .v9-cash-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em;color:var(--text,#071b36);margin-top:3px}
      body.v8-ui .v9-cash-title .cash-caption{font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .v9-cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .v9-cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .v9-cash-toggle button.active{background:var(--card,#fff);color:#007a3d;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .v9-chart-shell{padding:0 24px 4px;position:relative;overflow:visible}
      body.v8-ui .v9-chart-legend{display:flex;justify-content:flex-end;align-items:center;gap:20px;min-height:26px;margin:0 0 2px;color:var(--muted,#667085);font-size:13px;font-weight:900;white-space:nowrap}
      body.v8-ui .v9-chart-legend span{display:inline-flex;align-items:center;gap:8px}.v9-dot{display:inline-block;flex:0 0 auto}.v9-dot.in,.v9-dot.out{width:10px;height:10px;border-radius:999px}.v9-dot.in{background:#42b30b}.v9-dot.out{background:#0da8ad}.v9-dot.balance{width:22px;height:0;border-radius:0;border-top:3px solid #42b30b;background:transparent}
      body.v8-ui .v9-chart-grid{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-rows:248px 32px 22px;column-gap:8px;overflow:visible}
      body.v8-ui .v9-y-axis{position:relative;height:248px;color:var(--muted,#667085);font-size:13px;font-weight:900;text-align:right;overflow:visible}
      body.v8-ui .v9-y-axis span{position:absolute;right:8px;transform:translateY(-50%);line-height:1;white-space:nowrap}
      body.v8-ui .v9-plot{position:relative;height:248px;border-bottom:1px solid var(--line,#dfe7ee);overflow:visible}
      body.v8-ui .v9-gridline{position:absolute;left:0;right:0;height:1px;background:rgba(148,163,184,.26);transform:translateY(-.5px)}
      body.v8-ui .v9-gridline.baseline{background:var(--line,#dfe7ee)}
      body.v8-ui .v9-bar-series{position:absolute;inset:0;display:flex;align-items:stretch}
      body.v8-ui .v9-month-col{flex:1;min-width:0;position:relative;height:100%}
      body.v8-ui .v9-bar-pair{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center;gap:7px;height:100%;width:44px}
      body.v8-ui .v9-bar{width:16px;min-height:0;border:0;box-shadow:none;border-radius:2px 2px 0 0}.v9-bar.in{background:#42b30b}.v9-bar.out{background:#0da8ad}
      body.v8-ui .v9-line-svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}.v9-line-svg path{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.v9-line-svg circle{fill:#42b30b;stroke:var(--card,#fff);stroke-width:3}
      body.v8-ui .v9-x-labels{grid-column:2/3;display:flex;align-items:flex-start;justify-content:stretch;color:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase;padding-top:9px;overflow:visible}
      body.v8-ui .v9-x-labels span{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow:visible;line-height:1.1}
      body.v8-ui .v9-axis-title{grid-column:2/3;text-align:center;color:var(--muted,#667085);font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;line-height:1.1;padding-top:2px}
      body.v8-ui .dashboard-cash-hero .cash-source-link{margin:8px 24px 22px!important;padding:0!important;border:0!important;background:transparent!important;color:#0875b8!important;font-weight:900!important;display:inline-flex!important;text-decoration:none!important;box-shadow:none!important;cursor:pointer!important}
      body.v8-ui .dashboard-cash-hero .cash-source-link:hover{text-decoration:underline!important}
      body.v8-ui .cash-chart-legend,body.v8-ui .cash-legend,body.v8-ui .v821-chart-legend,body.v8-ui .v822-chart-legend,body.v8-ui .v823-legend,body.v8-ui .v824-legend{display:none!important}
      body.v8-ui .v9-expense-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}.v9-expense-top select{border:0;background:transparent;color:var(--muted,#667085);font-weight:800;cursor:pointer;padding:2px 0}.v9-expense-total{font-size:28px;font-weight:950;letter-spacing:-.03em;margin:6px 0 0}
      body.v8-ui .v9-expense-title{margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:.03em;color:var(--text,#071b36)}
      body.v8-ui .v9-expense-content{display:grid;grid-template-columns:145px 1fr;gap:18px;align-items:center;margin-top:10px}.v9-expense-donut{width:132px;height:132px;border-radius:50%;position:relative}.v9-expense-donut:after{content:"";position:absolute;inset:34px;background:var(--card,#fff);border-radius:50%}
      body.v8-ui .v9-expense-list{display:grid;gap:10px}.v9-expense-row{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}.v9-expense-row .dot{width:9px;height:9px;border-radius:50%;background:#0da8ad;margin-top:6px}.v9-expense-row:nth-child(2) .dot{background:#22c7bd}.v9-expense-row:nth-child(3) .dot{background:#5dd6cf}.v9-expense-row:nth-child(4) .dot{background:#cbd5e1}.v9-expense-row strong{font-size:16px}.v9-expense-row span{display:block;color:var(--muted,#667085);font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}.v9-expense-empty{color:var(--muted,#667085);font-weight:700}
      body.v8-ui.dark-mode .v9-cash-title .cash-balance{color:#f8fafc}body.v8-ui.dark-mode .v9-cash-toggle{background:#0f172a;border-color:#334155}body.v8-ui.dark-mode .v9-cash-toggle button.active{background:#1e293b;color:#86efac}body.v8-ui.dark-mode .v9-chart-legend,body.v8-ui.dark-mode .v9-y-axis,body.v8-ui.dark-mode .v9-x-labels,body.v8-ui.dark-mode .v9-axis-title{color:#cbd5e1}body.v8-ui.dark-mode .v9-gridline{background:rgba(148,163,184,.18)}body.v8-ui.dark-mode .v9-gridline.baseline,body.v8-ui.dark-mode .v9-plot{border-bottom-color:#334155;background-color:transparent}body.v8-ui.dark-mode .v9-line-svg path{stroke:#86efac}body.v8-ui.dark-mode .v9-line-svg circle{fill:#86efac;stroke:#172033}body.v8-ui.dark-mode .v9-dot.balance{border-top-color:#86efac}body.v8-ui.dark-mode .v9-expense-donut:after{background:#172033}
      @media(max-width:980px){body.v8-ui .v9-bar{width:12px}.v9-bar-pair{gap:5px}.v9-expense-content{grid-template-columns:1fr}.v9-expense-donut{width:116px;height:116px}.v9-expense-row span{max-width:none}}
      @media(max-width:760px){body.v8-ui .v9-cash-head{flex-direction:column}.v9-cash-toggle{width:100%}.v9-cash-toggle button{flex:1;justify-content:center}.v9-chart-shell{padding-inline:12px}.v9-chart-grid{grid-template-columns:58px minmax(0,1fr);grid-template-rows:230px 30px 22px}.v9-y-axis,.v9-plot{height:230px}.v9-y-axis,.v9-chart-legend{font-size:11px}.v9-x-labels{font-size:10px}.v9-bar{width:8px}.v9-bar-pair{gap:4px;width:28px}.v9-expense-content{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function v9FormatAxis(v){ return Math.abs(v)>=1000 ? `$${Math.round(v/1000)}K` : money(v).replace('.00',''); }
  function v9AxisMax(raw){
    const n=Math.max(1, Number(raw)||1);
    if(n<=5000) return 5000;
    if(n<=10000) return 10000;
    if(n<=15000) return 15000;
    if(n<=20000) return 20000;
    if(n<=25000) return 25000;
    if(n<=50000) return Math.ceil(n/5000)*5000;
    return Math.ceil(n/10000)*10000;
  }
  function v9MonthYearLabel(m,idx){
    const key=String(m?.key||m?.month||m?.date||'');
    if(/^\d{4}-\d{2}/.test(key)){
      const ym=key.slice(0,7); const [y,mo]=ym.split('-').map(Number);
      const d=new Date(y,mo-1,1);
      return d.toLocaleString('en-US',{month:'short'}).toUpperCase()+" '"+String(y).slice(-2);
    }
    const label=String(m?.label||'').trim();
    if(label) return label.toUpperCase();
    try{
      const keys=typeof last12MonthKeys==='function' ? last12MonthKeys() : [];
      const k=keys[idx]||'';
      if(/^\d{4}-\d{2}$/.test(k)){
        const [y,mo]=k.split('-').map(Number); const d=new Date(y,mo-1,1);
        return d.toLocaleString('en-US',{month:'short'}).toUpperCase()+" '"+String(y).slice(-2);
      }
    }catch(e){}
    return '';
  }
  function v9ChartHtml(series,view,axisMax){
    const safeSeries=(series||[]).map((m,i)=>({...m,_label:v9MonthYearLabel(m,i)}));
    const axisVals=[axisMax,axisMax*.8,axisMax*.6,axisMax*.4,axisMax*.2,0];
    const pct=v=>Math.max(0,Math.min(100,(Number(v)||0)/(Number(axisMax)||1)*100));
    const yTop=v=>(100-pct(v)).toFixed(4)+'%';
    const yLabels=axisVals.map(v=>`<span style="top:${yTop(v)}">${v9FormatAxis(v)}</span>`).join('');
    const gridLines=axisVals.map(v=>`<i class="v9-gridline ${v===0?'baseline':''}" style="top:${yTop(v)}"></i>`).join('');
    const xLabels=safeSeries.map(m=>`<span>${escapeHTML(m._label)}</span>`).join('');
    const legend=view==='balance'
      ? `<div class="v9-chart-legend" aria-label="Cash flow legend"><span><i class="v9-dot balance"></i>Cash balance</span></div>`
      : `<div class="v9-chart-legend" aria-label="Cash flow legend"><span><i class="v9-dot in"></i>Money in</span><span><i class="v9-dot out"></i>Money out</span></div>`;
    let plot='';
    if(view==='balance'){
      const W=1000,H=248,n=safeSeries.length||1;
      const points=safeSeries.map((m,i)=>({x:(i+.5)*W/n,y:H-(pct(Math.max(0,num(m.balance)))/100*H),m}));
      const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const dots=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${escapeHTML(p.m._label)}: ${money(num(p.m.balance))}</title></circle>`).join('');
      plot=`<svg class="v9-line-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Cash balance by month"><path d="${path}"></path>${dots}</svg>`;
    }else{
      plot=`<div class="v9-bar-series">${safeSeries.map(m=>`<div class="v9-month-col"><div class="v9-bar-pair"><div class="v9-bar in" title="${escapeHTML(m._label)} money in ${money(num(m.in))}" style="height:${pct(num(m.in)).toFixed(2)}%"></div><div class="v9-bar out" title="${escapeHTML(m._label)} money out ${money(num(m.out))}" style="height:${pct(num(m.out)).toFixed(2)}%"></div></div></div>`).join('')}</div>`;
    }
    return `${legend}<div class="v9-chart-grid"><div class="v9-y-axis" aria-hidden="true">${yLabels}</div><div class="v9-plot">${gridLines}${plot}</div><div></div><div class="v9-x-labels" aria-hidden="true">${xLabels}</div><div></div><div class="v9-axis-title">Month / Year</div></div>`;
  }
  function renderCashFlowHero(){
    injectV9CashFlowStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView = state.settings.cashFlowHeroView==='balance' ? 'balance' : 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=typeof cashFlowSeries==='function' ? cashFlowSeries() : [];
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.max(0,num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v9AxisMax(rawMax);
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance=num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    el.innerHTML=`<div class="v9-cash-card"><div class="v9-cash-head"><div class="v9-cash-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="v9-cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-v9-cashflow-view="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-v9-cashflow-view="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="v9-chart-shell">${v9ChartHtml(series,view,axisMax)}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button></div>`;
  }
  function v9ExpenseEntries(entries){
    const source=Array.isArray(entries) ? entries.filter(([,v])=>num(v)>0) : [];
    if(source.length<=4) return source;
    const top3=source.slice(0,3);
    const other=source.slice(3).reduce((s,[,v])=>s+num(v),0);
    return other>0 ? [...top3,['Other',other]] : top3;
  }
  function v9DonutGradient(entries,total){
    if(!total || !entries.length) return 'conic-gradient(#dfe7ee 0 100%)';
    const colors=['#0da8ad','#22c7bd','#5dd6cf','#cbd5e1']; let acc=0; const parts=[];
    entries.slice(0,4).forEach(([k,v],i)=>{ const start=acc; acc+=num(v)/total*100; parts.push(`${colors[i]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`); });
    if(acc<100) parts.push(`#dfe7ee ${acc.toFixed(2)}% 100%`);
    return `conic-gradient(${parts.join(',')})`;
  }
  function renderExpensesCard(){
    injectV9CashFlowStyles();
    const el=document.getElementById('expensesCard'); if(!el) return;
    el.className = (el.className || '').replace(/\bdashboard-expense-card\b/g,'').trim() + ' dashboard-expense-card';
    const data=typeof v822ExpenseCategoryData==='function' ? v822ExpenseCategoryData() : {entries:[],total:0,range:{label:'This month'}};
    const entries=v9ExpenseEntries(data.entries);
    const total=entries.reduce((s,[,v])=>s+num(v),0);
    const range=state.settings?.dashboardExpenseRange || 'this-month';
    const rows=entries.map(([name,value])=>`<div class="v9-expense-row"><i class="dot"></i><div><strong>${money(value)}</strong><span>${escapeHTML(name)}</span></div></div>`).join('') || `<div class="v9-expense-empty">No expenses in this period.</div>`;
    el.innerHTML=`<div class="v9-expense-top"><div><h3 class="v9-expense-title">Expenses</h3><div class="v9-expense-total">${money(data.total)}</div><div class="muted small">${escapeHTML(data.range.label)}</div></div><select aria-label="Expense period" data-dashboard-expense-range><option value="last-month" ${range==='last-month'?'selected':''}>Last month</option><option value="this-month" ${range==='this-month'?'selected':''}>This month</option><option value="last-30" ${range==='last-30'?'selected':''}>Last 30 days</option><option value="ytd" ${range==='ytd'?'selected':''}>Year to date</option></select></div><div class="v9-expense-content"><div class="v9-expense-donut" style="background:${v9DonutGradient(entries,total||data.total)}"></div><div class="v9-expense-list">${rows}</div></div>`;
  }
  document.addEventListener('click', function(e){
    const btn=e.target.closest('[data-v9-cashflow-view]');
    if(!btn) return;
    e.preventDefault(); e.stopImmediatePropagation();
    state.settings ||= {}; state.settings.cashFlowHeroView = btn.getAttribute('data-v9-cashflow-view')==='balance' ? 'balance' : 'flow';
    saveState(); renderCashFlowHero();
  }, true);
  const renderDashboardBeforeV9 = renderDashboard;
  renderDashboard = function(){ injectV9CashFlowStyles(); renderDashboardBeforeV9(); renderCashFlowHero(); renderInvoiceSummaryCard(); renderExpensesCard(); };
  injectV9CashFlowStyles();



  // ---------- V10: Get Things Done Workflow Hub as a dedicated menu page ----------
  function injectV10GetThingsDoneStyles(){
    if(document.getElementById('v10-get-things-done-styles')) return;
    const style=document.createElement('style');
    style.id='v10-get-things-done-styles';
    style.textContent=`
      body.v8-ui .gtd-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}
      body.v8-ui .gtd-hero h2{font-size:28px;margin:0 0 6px;letter-spacing:-.03em}
      body.v8-ui .gtd-hero p{margin:0;color:var(--muted,#667085);line-height:1.45;max-width:780px}
      body.v8-ui .gtd-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
      body.v8-ui .gtd-tab{border:1px solid var(--line,#d8dee4);background:var(--card,#fff);border-radius:999px;padding:9px 14px;font-weight:900;color:var(--muted,#667085);cursor:pointer;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .gtd-tab.active{background:var(--green,#0a8f3c);border-color:var(--green,#0a8f3c);color:#fff;box-shadow:0 4px 12px rgba(10,143,60,.16)}
      body.v8-ui .gtd-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
      body.v8-ui .gtd-kpi{background:var(--card,#fff);border:1px solid var(--line,#d8dee4);border-radius:16px;padding:14px;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .gtd-kpi h3{margin:0 0 5px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .gtd-kpi strong{display:block;font-size:24px;letter-spacing:-.03em}.gtd-kpi span{display:block;margin-top:4px;color:var(--muted,#667085);font-size:12px;font-weight:700}
      body.v8-ui .gtd-workspace{background:var(--card,#fff);border:1px solid var(--line,#d8dee4);border-radius:18px;box-shadow:0 3px 14px rgba(16,24,40,.05);padding:18px;margin-bottom:16px}
      body.v8-ui .gtd-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
      body.v8-ui .gtd-workspace-head h3{margin:0;font-size:16px;text-transform:uppercase;letter-spacing:.03em;color:var(--text,#202124)}
      body.v8-ui .gtd-workspace-head p{margin:5px 0 0;color:var(--muted,#667085);line-height:1.4}
      body.v8-ui .gtd-lanes{display:grid;gap:12px}
      body.v8-ui .gtd-lane{display:grid;grid-template-columns:132px minmax(0,1fr);border:1px solid #e4ebf2;border-radius:16px;overflow:hidden;background:#fbfcfd}
      body.v8-ui .gtd-lane-label{background:#eef2f6;display:flex;align-items:center;justify-content:center;padding:14px;text-align:center;font-weight:950;color:#344054;line-height:1.25}
      body.v8-ui .gtd-lane-flow{display:flex;align-items:center;gap:8px;overflow-x:auto;padding:18px 16px;scrollbar-width:thin}
      body.v8-ui .gtd-step{border:1px solid #d9e3ec;background:var(--card,#fff);border-radius:16px;min-width:142px;max-width:166px;min-height:126px;padding:12px 10px;text-align:center;color:var(--text,#202124);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;position:relative;transition:.15s;text-decoration:none;cursor:pointer}
      body.v8-ui .gtd-step:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(16,24,40,.10);border-color:var(--green,#0a8f3c)}
      body.v8-ui .gtd-step-icon{width:48px;height:48px;border-radius:50%;border:2px solid #63ad52;color:#0a8f3c;background:#f8fffb;display:grid;place-items:center;font-size:22px;font-weight:900;flex:0 0 auto}
      body.v8-ui .gtd-step.is-muted .gtd-step-icon{border-color:#d7dfe7;color:#98a2b3;background:#f8fafc}.gtd-step.is-attention .gtd-step-icon{border-color:#f59e0b;color:#b45309;background:#fffbeb}
      body.v8-ui .gtd-step strong{font-size:13px;line-height:1.2}.gtd-step small{font-size:11px;color:var(--muted,#667085);line-height:1.25}
      body.v8-ui .gtd-badge{position:absolute;right:8px;top:8px;min-width:20px;height:20px;border-radius:999px;background:#d94141;color:#fff;font-size:11px;font-weight:950;display:grid;place-items:center;padding:0 6px;box-shadow:0 2px 8px rgba(217,65,65,.22)}
      body.v8-ui .gtd-badge.good{background:var(--green,#0a8f3c)}.gtd-badge.info{background:#0a62a3}.gtd-badge.warn{background:#f59e0b;color:#111827}
      body.v8-ui .gtd-arrow{color:#9aa7b4;font-weight:950;font-size:22px;flex:0 0 auto}
      body.v8-ui .gtd-task-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:16px;align-items:start}
      body.v8-ui .gtd-task-list{display:grid;gap:10px}.gtd-task{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line,#d8dee4);border-radius:16px;background:var(--card,#fff);padding:13px;box-shadow:0 2px 10px rgba(16,24,40,.035)}
      body.v8-ui .gtd-task-icon{width:40px;height:40px;border-radius:14px;background:#eef6f6;color:var(--green,#0a8f3c);display:grid;place-items:center;font-size:19px;font-weight:900}.gtd-task.priority .gtd-task-icon{background:#fff7ed;color:#c2410c}.gtd-task.good .gtd-task-icon{background:#ecfdf3;color:#067647}
      body.v8-ui .gtd-task strong{display:block}.gtd-task span{display:block;color:var(--muted,#667085);font-size:12px;line-height:1.3;margin-top:2px}.gtd-task .btn{padding:7px 10px;font-size:12px}
      body.v8-ui .gtd-template-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.gtd-template{border:1px solid var(--line,#d8dee4);border-radius:18px;background:var(--card,#fff);padding:16px;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .gtd-template h3{margin:0 0 8px;font-size:16px;color:var(--text,#202124);text-transform:none}.gtd-template p{margin:0 0 12px;color:var(--muted,#667085);line-height:1.4}.gtd-template-steps{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 14px}.gtd-template-steps span{border:1px solid #d9e3ec;background:#fbfcfd;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:800;color:#344054}
      body.v8-ui .gtd-note{border:1px solid #cfe6f7;background:#f4faff;color:#18476b;border-radius:16px;padding:13px 14px;line-height:1.45;margin-top:14px}
      body.v8-ui.dark-mode .gtd-workspace,body.v8-ui.dark-mode .gtd-kpi,body.v8-ui.dark-mode .gtd-step,body.v8-ui.dark-mode .gtd-task,body.v8-ui.dark-mode .gtd-template{background:#14202d;border-color:#2a3c4f;color:#e8edf3}.dark-mode .gtd-lane{background:#101b27;border-color:#2a3c4f}.dark-mode .gtd-lane-label{background:#1d2b3a;color:#e8edf3}.dark-mode .gtd-template-steps span{background:#101b27;border-color:#2a3c4f;color:#e8edf3}.dark-mode .gtd-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      @media(max-width:1120px){body.v8-ui .gtd-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gtd-task-grid,.gtd-template-grid{grid-template-columns:1fr}.gtd-lane{grid-template-columns:110px minmax(0,1fr)}}
      @media(max-width:720px){body.v8-ui .gtd-hero{flex-direction:column}.gtd-kpi-grid{grid-template-columns:1fr}.gtd-lane{grid-template-columns:1fr}.gtd-lane-label{justify-content:flex-start;text-align:left}.gtd-task{grid-template-columns:42px minmax(0,1fr)}.gtd-task .btn{grid-column:1/-1;width:100%}}
    `;
    document.head.appendChild(style);
  }
  function ensureV10GetThingsDonePage(){
    injectV10GetThingsDoneStyles();
    if(document.getElementById('page-getthingsdone')) return;
    const content=document.querySelector('.content');
    const section=document.createElement('section');
    section.className='page';
    section.id='page-getthingsdone';
    const dashboard=document.getElementById('page-dashboard');
    if(content && dashboard && dashboard.nextSibling) content.insertBefore(section,dashboard.nextSibling); else if(content) content.appendChild(section);
  }
  function v10MoneyValue(v){ return money(Number(v)||0); }
  function v10Today(){ return typeof todayISO==='function' ? todayISO() : new Date().toISOString().slice(0,10); }
  function v10Summary(){
    const openInvoices=(state.invoices||[]).filter(i=>typeof openAmount==='function' ? openAmount(i)>0.005 : Number(i.paid||0)<Number(i.subtotal||0)+Number(i.tax||0));
    const draftInvoices=(state.invoices||[]).filter(i=>String(i.status||'').toLowerCase()==='draft' || !i.sentDate);
    const openAmountTotal=openInvoices.reduce((s,i)=>s+(typeof openAmount==='function'?openAmount(i):Math.max(0,Number(i.subtotal||0)+Number(i.tax||0)-Number(i.paid||0))),0);
    const openBills=(state.bills||[]).filter(b=>typeof billOpenAmount==='function' ? billOpenAmount(b)>0.005 : Number(b.paid||0)<Number(b.amount||0)+Number(b.tax||0));
    const openBillTotal=openBills.reduce((s,b)=>s+(typeof billOpenAmount==='function'?billOpenAmount(b):Math.max(0,Number(b.amount||0)+Number(b.tax||0)-Number(b.paid||0))),0);
    const dueBills=openBills.filter(b=>b.dueDate && b.dueDate<=v10Today());
    const bankToReview=(state.bankTransactions||[]).filter(tx=>!['Reviewed','Matched'].includes(tx.status||''));
    const latestRec=[...(state.reconciliations||[])].sort((a,b)=>String(b.statementDate||b.date||'').localeCompare(String(a.statementDate||a.date||'')))[0];
    const recLabel=latestRec ? `Last statement ${latestRec.statementDate||latestRec.date||'saved'}` : 'No reconciliation saved yet';
    return {
      openInvoices, draftInvoices, openAmountTotal, openBills, openBillTotal, dueBills, bankToReview, latestRec, recLabel,
      customers:(state.customers||[]).length, products:(state.products||[]).length, estimates:(state.estimates||[]).length,
      payments:(state.payments||[]).length, deposits:(state.deposits||[]).length
    };
  }
  function v10StepBadge(value,type='info'){
    const n=Number(value)||0;
    if(n<=0) return '';
    const label=n>99?'99+':String(n);
    return `<span class="gtd-badge ${type}">${label}</span>`;
  }
  function v10Step(step){
    const attrs=step.modal ? `data-modal="${step.modal}"` : step.nav ? `data-nav="${step.nav}"` : '';
    const cls=step.attention?'is-attention':step.muted?'is-muted':'';
    return `<button type="button" class="gtd-step ${cls}" ${attrs}><span class="gtd-step-icon">${step.icon}</span>${step.badge||''}<strong>${escapeHTML(step.title)}</strong><small>${escapeHTML(step.sub||'')}</small></button>`;
  }
  function v10FlowRow(label,steps){
    return `<div class="gtd-lane"><div class="gtd-lane-label">${escapeHTML(label)}</div><div class="gtd-lane-flow">${steps.map((s,i)=>v10Step(s)+(i<steps.length-1?'<span class="gtd-arrow">→</span>':'')).join('')}</div></div>`;
  }
  function renderGetThingsDoneFlow(){
    const s=v10Summary();
    const moneyIn=[
      {title:'Add products & services',sub:`${s.products} active items`,icon:'▣',nav:'inventory',badge:v10StepBadge(s.products,'good')},
      {title:'Manage customers',sub:`${s.customers} customer records`,icon:'☘',nav:'customers',badge:v10StepBadge(s.customers,'good')},
      {title:'Create estimates',sub:`${s.estimates} estimates`,icon:'▤',modal:'estimate',badge:v10StepBadge(s.estimates,'info')},
      {title:'Send invoices',sub:`${s.draftInvoices.length} draft or unsent`,icon:'▧',modal:'invoice',attention:s.draftInvoices.length>0,badge:v10StepBadge(s.draftInvoices.length,'warn')},
      {title:'Receive payments',sub:`${v10MoneyValue(s.openAmountTotal)} open A/R`,icon:'▣',modal:'payment',attention:s.openInvoices.length>0,badge:v10StepBadge(s.openInvoices.length,'warn')},
      {title:'Deposit to bank',sub:`${s.deposits} deposits recorded`,icon:'◉',modal:'deposit',badge:v10StepBadge(s.deposits,'good')}
    ];
    const moneyOut=[
      {title:'Add vendors',sub:`${(state.vendors||[]).length} vendor records`,icon:'□',modal:'vendor',badge:v10StepBadge((state.vendors||[]).length,'good')},
      {title:'Record bill / expense',sub:'Capture purchases and tax',icon:'▸',modal:'bill'},
      {title:'Pay bills',sub:`${v10MoneyValue(s.openBillTotal)} open A/P`,icon:'▣',modal:'payBill',attention:s.openBills.length>0,badge:v10StepBadge(s.dueBills.length || s.openBills.length,'warn')},
      {title:'Review bank feed',sub:`${s.bankToReview.length} to review`,icon:'⇄',nav:'banking',attention:s.bankToReview.length>0,badge:v10StepBadge(s.bankToReview.length,'warn')}
    ];
    const accounting=[
      {title:'Connect / manage bank',sub:'Bank accounts and feeds',icon:'◉',nav:'banking'},
      {title:'Review transactions',sub:`${s.bankToReview.length} review items`,icon:'✓',nav:'transactions',attention:s.bankToReview.length>0,badge:v10StepBadge(s.bankToReview.length,'warn')},
      {title:'Reconcile',sub:s.recLabel,icon:'◎',modal:'reconcile',muted:!s.latestRec},
      {title:'See reports & trends',sub:'P&L, Balance Sheet, A/R, A/P',icon:'↗',nav:'reports'}
    ];
    return `<div class="gtd-workspace"><div class="gtd-workspace-head"><div><h3>Workspace</h3><p>Follow the main accounting flow from setup to cash collection, vendor payment, bank review, reconciliation, and reporting.</p></div><button class="btn" data-modal="customize">Customize menu</button></div><div class="gtd-lanes">${v10FlowRow('Money in',moneyIn)}${v10FlowRow('Money out',moneyOut)}${v10FlowRow('Accounting and reports',accounting)}</div></div><div class="gtd-note"><strong>Design intent:</strong> this page keeps the dashboard clean while giving non-accounting users a guided place to start common workflows.</div>`;
  }
  function renderGetThingsDoneTasks(){
    const s=v10Summary();
    const tasks=[
      {cls:s.bankToReview.length?'priority':'good',icon:'⇄',title:'Review bank transactions',desc:`${s.bankToReview.length} bank-feed transactions need matching, categorization, or review.`,nav:'banking',label:'Review'},
      {cls:s.openInvoices.length?'priority':'good',icon:'▣',title:'Receive customer payments',desc:`${s.openInvoices.length} open invoices totaling ${v10MoneyValue(s.openAmountTotal)}.`,modal:'payment',label:'Receive payment'},
      {cls:s.openBills.length?'priority':'good',icon:'▸',title:'Pay vendor bills',desc:`${s.openBills.length} open bills totaling ${v10MoneyValue(s.openBillTotal)}; ${s.dueBills.length} due or overdue.`,modal:'payBill',label:'Pay bill'},
      {cls:s.draftInvoices.length?'priority':'good',icon:'▧',title:'Send draft invoices',desc:`${s.draftInvoices.length} invoices appear draft or not yet sent.`,nav:'sales',label:'Open sales'},
      {cls:!s.latestRec?'priority':'good',icon:'◎',title:'Bank reconciliation',desc:s.recLabel,modal:'reconcile',label:'Reconcile'},
      {cls:'good',icon:'↗',title:'Run management reports',desc:'Review profit and loss, balance sheet, A/R aging, A/P aging, and tax summary.',nav:'reports',label:'Reports'}
    ];
    return `<div class="gtd-task-grid"><div class="card"><h3>Priority tasks</h3><div class="gtd-task-list">${tasks.map(t=>`<div class="gtd-task ${t.cls}"><span class="gtd-task-icon">${t.icon}</span><div><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(t.desc)}</span></div><button class="btn" ${t.modal?`data-modal="${t.modal}"`:`data-nav="${t.nav}"`}>${escapeHTML(t.label)}</button></div>`).join('')}</div></div><div class="card"><h3>Task summary</h3><div class="report-line"><span>Open A/R</span><strong>${v10MoneyValue(s.openAmountTotal)}</strong></div><div class="report-line"><span>Open A/P</span><strong>${v10MoneyValue(s.openBillTotal)}</strong></div><div class="report-line"><span>Bank items to review</span><strong>${s.bankToReview.length}</strong></div><div class="report-line"><span>Reconciliation</span><strong>${escapeHTML(s.latestRec?'Started':'Not started')}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn" data-nav="banking">Banking</button><button class="btn" data-nav="sales">Sales</button><button class="btn" data-nav="expenses">Expenses</button></div></div></div>`;
  }
  function renderGetThingsDoneTemplates(){
    const templates=[
      {title:'Sales to cash',desc:'Create the sellable item, customer, estimate or invoice, record payment, then deposit and reconcile.',steps:['Products','Customers','Estimate','Invoice','Payment','Deposit'],nav:'sales'},
      {title:'Purchase to payment',desc:'Set up vendor, capture the bill or expense, pay it, then match the bank feed.',steps:['Vendor','Bill / Expense','Pay bill','Bank match','Reconcile'],nav:'expenses'},
      {title:'Bank feed to reconciliation',desc:'Review imported transactions, match source documents, clear items, and complete reconciliation.',steps:['Bank feed','Categorize','Match','Clear','Reconcile'],nav:'banking'},
      {title:'Month-end close',desc:'Review A/R and A/P, reconcile bank accounts, review tax, then run financial reports.',steps:['A/R Aging','A/P Aging','Reconcile','Tax summary','Reports'],nav:'reports'}
    ];
    return `<div class="gtd-template-grid">${templates.map(t=>`<div class="gtd-template"><h3>${escapeHTML(t.title)}</h3><p>${escapeHTML(t.desc)}</p><div class="gtd-template-steps">${t.steps.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div><button class="btn primary" data-nav="${t.nav}">Start workflow</button></div>`).join('')}</div>`;
  }
  function renderGetThingsDone(){
    ensureV10GetThingsDonePage();
    const el=document.getElementById('page-getthingsdone'); if(!el) return;
    if(currentPage==='getthingsdone') el.classList.add('active');
    state.settings ||= {}; state.settings.getThingsDoneTab ||= 'overview';
    const tab=['overview','tasks','workflows'].includes(state.settings.getThingsDoneTab) ? state.settings.getThingsDoneTab : 'overview';
    const s=v10Summary();
    const body=tab==='tasks' ? renderGetThingsDoneTasks() : tab==='workflows' ? renderGetThingsDoneTemplates() : renderGetThingsDoneFlow();
    el.innerHTML=`<div class="gtd-hero"><div><h2>Get Things Done</h2><p>Guided workflows for money in, money out, banking, reconciliation, and reporting. This page is a navigation hub, so the dashboard can stay clean and lean.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="invoice">Create invoice</button><button class="btn" data-modal="expense">Record expense</button><button class="btn primary" data-nav="banking">Review banking</button></div></div><div class="gtd-tabs"><button class="gtd-tab ${tab==='overview'?'active':''}" data-action="gtd-tab" data-id="overview">▦ Get things done</button><button class="gtd-tab ${tab==='tasks'?'active':''}" data-action="gtd-tab" data-id="tasks">✓ Tasks</button><button class="gtd-tab ${tab==='workflows'?'active':''}" data-action="gtd-tab" data-id="workflows">↝ Workflows</button></div><div class="gtd-kpi-grid"><div class="gtd-kpi"><h3>Open A/R</h3><strong>${v10MoneyValue(s.openAmountTotal)}</strong><span>${s.openInvoices.length} invoices to collect</span></div><div class="gtd-kpi"><h3>Open A/P</h3><strong>${v10MoneyValue(s.openBillTotal)}</strong><span>${s.openBills.length} bills to manage</span></div><div class="gtd-kpi"><h3>Bank review</h3><strong>${s.bankToReview.length}</strong><span>transactions to review</span></div><div class="gtd-kpi"><h3>Reconciliation</h3><strong>${s.latestRec?'Active':'Start'}</strong><span>${escapeHTML(s.recLabel)}</span></div></div>${body}`;
  }
  const v10RenderMenuBase = renderMenu;
  renderMenu = function(){
    ensureV10GetThingsDonePage();
    v10RenderMenuBase();
    const list=document.getElementById('menuList'); if(!list) return;
    const existing=list.querySelector('[data-nav="getthingsdone"]');
    if(existing) existing.remove();
    list.insertAdjacentHTML('afterbegin',`<button class="nav-item ${currentPage==='getthingsdone'?'active':''}" data-nav="getthingsdone"><span class="dot">✓</span>Get Things Done<span class="nav-chevron">›</span></button>`);
  };
  const v10RenderPageBase = renderPage;
  renderPage = function(page){
    ensureV10GetThingsDonePage();
    if(page==='getthingsdone'){ renderGetThingsDone(); renderMenu(); return; }
    return v10RenderPageBase(page);
  };
  const v10HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='gtd-tab'){
      state.settings ||= {}; state.settings.getThingsDoneTab = ['overview','tasks','workflows'].includes(id) ? id : 'overview';
      saveState(); renderGetThingsDone(); renderMenu(); return;
    }
    return v10HandleActionBase(action,id);
  };
  const v10RenderAllBase = renderAll;
  renderAll = function(){ injectV10GetThingsDoneStyles(); ensureV10GetThingsDonePage(); v10RenderAllBase(); if(currentPage==='getthingsdone') renderGetThingsDone(); };
  injectV10GetThingsDoneStyles();
  ensureV10GetThingsDonePage();


  // ---------- V11: Replace + New placeholder modals with real basic forms ----------
  const v11ModalTypes = new Set([
    'statement','creditMemo','shippingLabel','refundReceipt','delayedCredit','delayedCharge',
    'check','vendorCredit','creditCardCredit','printChecks','payroll','singleActivity',
    'weeklyTimesheet','reviewTime','employee','contractor','payDownCreditCard'
  ]);
  function ensureV11State(){
    state.statements ||= [];
    state.creditMemos ||= [];
    state.shippingLabels ||= [];
    state.refundReceipts ||= [];
    state.delayedCredits ||= [];
    state.delayedCharges ||= [];
    state.checks ||= [];
    state.vendorCredits ||= [];
    state.creditCardCredits ||= [];
    state.checkPrintRuns ||= [];
    state.payrollRuns ||= [];
    state.weeklyTimesheets ||= [];
    state.timeApprovals ||= [];
    state.employees ||= [
      {id:'EMP-1', name:'Alex Chen', email:'alex@example.com', phone:'', title:'Operations Coordinator', payType:'Hourly', rate:32, department:'Operations', status:'Active'}
    ];
    state.contractors ||= [];
    state.creditCardPayments ||= [];
  }
  function v11Text(v){ return escapeHTML(v ?? ''); }
  function v11CustomerInvoiceOptions(){
    const opts=(state.invoices||[]).map(i=>`<option value="${i.id}">${v11Text(i.id)} · ${v11Text(getCustomer(i.customerId).name)} · open ${money(openAmount(i))}</option>`).join('');
    return `<option value="">Do not apply now</option>${opts}`;
  }
  function v11OpenBillOptions(){
    const opts=(state.bills||[]).filter(b=>billOpenAmount(b)>0.005).map(b=>`<option value="${b.id}">${v11Text(b.id)} · ${v11Text(getVendor(b.vendorId).name)} · open ${money(billOpenAmount(b))}</option>`).join('');
    return `<option value="">Do not apply now</option>${opts}`;
  }
  function v11EmployeeOptions(){
    ensureV11State();
    const employees=(state.employees||[]).map(e=>`<option value="${v11Text(e.name)}">${v11Text(e.name)}${e.title?` · ${v11Text(e.title)}`:''}</option>`).join('');
    const existingTimeNames=[...new Set((state.timeEntries||[]).map(t=>t.employee).filter(Boolean))].map(n=>`<option value="${v11Text(n)}">${v11Text(n)}</option>`).join('');
    return employees || existingTimeNames || '<option value="Alex Chen">Alex Chen</option>';
  }
  function v11CreditCardAccountOptions(){
    const opts=(state.chartOfAccounts||[]).filter(a=>a.type==='Liability' || a.detail==='Credit Card').map(a=>`<option value="${a.id}">${v11Text(a.code)} · ${v11Text(a.name)}</option>`).join('');
    return opts || accountOptions(['Liability']);
  }
  function v11CheckNumber(){
    ensureV11State();
    const existing=(state.checks||[]).map(c=>parseInt(c.checkNo,10)).filter(Number.isFinite);
    return String((existing.length?Math.max(...existing):1000)+1);
  }
  function v11WeekdayInputs(){
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>`<div class="field"><label>${d} hours</label><input type="number" step="0.25" min="0" name="${d.toLowerCase()}Hours" value="${i<5?'8':'0'}"></div>`).join('');
  }
  function v11StatementPreviewNote(){
    return `<div class="tax-form-note"><strong>Preview logic:</strong> this statement records the selected period, delivery method, and customer scope. It can later be connected to a printable statement template and email delivery.</div>`;
  }
  const v11ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    ensureV11State();
    if(type==='statement') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Statement date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Start period</label><input type="date" name="startDate" value="${addDaysISO(-30)}"></div><div class="field"><label>End period</label><input type="date" name="endDate" value="${todayISO()}"></div><div class="field"><label>Include</label><select name="includeMode"><option>Open invoices only</option><option>All activity in period</option><option>Open invoices plus payments</option></select></div><div class="field"><label>Delivery method</label><select name="delivery"><option>Email</option><option>Print / PDF</option><option>Internal preview only</option></select></div><div class="field full"><label>Customer message</label><textarea name="message">Please find your account statement attached. Thank you for your business.</textarea></div></div>${v11StatementPreviewNote()}`;
    if(type==='creditMemo') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field full"><label>Apply to invoice</label><select name="invoiceId">${v11CustomerInvoiceOptions()}</select></div><div class="field"><label>Product / service</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Income account</label><select name="incomeAccountId">${accountOptions(['Income'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax adjustment</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Reason</label><input name="reason" value="Customer credit / service adjustment"></div></div><div class="tax-form-note">A credit memo reduces customer receivables when applied to an open invoice. If not applied now, it stays available as an unapplied customer credit.</div>`;
    if(type==='shippingLabel') return `<div class="form-grid"><div class="field"><label>Customer / order</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Ship date</label><input type="date" name="shipDate" value="${todayISO()}"></div><div class="field full"><label>Ship from</label><input name="shipFrom" value="${v11Text(state.company.name || 'Your Company')}, BC, Canada"></div><div class="field full"><label>Ship to</label><input name="shipTo" value="Customer shipping address"></div><div class="field"><label>Carrier</label><select name="carrier"><option>Canada Post</option><option>UPS</option><option>FedEx</option><option>DHL</option><option>Local courier</option></select></div><div class="field"><label>Service level</label><select name="serviceLevel"><option>Ground</option><option>Express</option><option>Priority</option><option>Pickup / local delivery</option></select></div><div class="field"><label>Package weight kg</label><input type="number" step="0.01" min="0" name="weightKg" value="1.00"></div><div class="field"><label>Dimensions L×W×H cm</label><input name="dimensions" value="30 x 20 x 10"></div><div class="field full"><label>Tracking number</label><input name="trackingNo" value=""></div></div>`;
    if(type==='refundReceipt') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Refund from</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Product / service</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax refunded</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Reason</label><input name="reason" value="Customer refund"></div></div><div class="tax-form-note">Refund receipt records money returned to the customer from the selected bank account.</div>`;
    if(type==='delayedCredit') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Product / service</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field"><label>Status</label><select name="status"><option>Available</option><option>Applied</option><option>Void</option></select></div><div class="field full"><label>Reason</label><input name="reason" value="Credit to apply later"></div></div>`;
    if(type==='delayedCharge') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Product / service</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field"><label>Billable</label><select name="billable"><option>Yes, add to future invoice</option><option>No, internal only</option></select></div><div class="field full"><label>Description</label><input name="description" value="Charge to add to next invoice"></div></div>`;
    if(type==='check') return `<div class="form-grid"><div class="field"><label>Payee / vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Bank account</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field"><label>Check number</label><input name="checkNo" value="${v11CheckNumber()}"></div><div class="field"><label>Category / account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS','Asset'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax / ITC</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Memo</label><input name="memo" value="Check payment"></div></div>`;
    if(type==='vendorCredit') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field full"><label>Apply to open bill</label><select name="billId">${v11OpenBillOptions()}</select></div><div class="field"><label>Expense / category</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax adjustment</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Reason</label><input name="reason" value="Vendor credit / return"></div></div><div class="tax-form-note">Vendor credit reduces A/P when applied to an open bill. If not applied now, it stays available as unapplied vendor credit.</div>`;
    if(type==='creditCardCredit') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Credit card account</label><select name="creditCardAccountId">${v11CreditCardAccountOptions()}</select></div><div class="field"><label>Category / account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax recovered</label><input type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Memo</label><input name="memo" value="Credit card vendor credit"></div></div>`;
    if(type==='printChecks') return `<div class="form-grid"><div class="field"><label>Bank account</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field"><label>Starting check number</label><input name="startNo" value="${v11CheckNumber()}"></div><div class="field"><label>Check date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Print format</label><select name="format"><option>Voucher check</option><option>Standard 3-per-page</option><option>Preprinted cheque stock</option></select></div><div class="field full"><label>Bills/checks to print</label><select name="billId">${v11OpenBillOptions()}</select></div><div class="field full"><label><input type="checkbox" name="markPrinted" checked> Mark selected checks as printed</label></div></div><div class="tax-form-note">This creates a print run record and can later connect to a PDF/check layout engine.</div>`;
    if(type==='payroll') return `<div class="form-grid"><div class="field"><label>Pay period start</label><input type="date" name="periodStart" value="${addDaysISO(-14)}"></div><div class="field"><label>Pay period end</label><input type="date" name="periodEnd" value="${todayISO()}"></div><div class="field"><label>Pay date</label><input type="date" name="payDate" value="${todayISO()}"></div><div class="field"><label>Employee</label><select name="employee">${v11EmployeeOptions()}</select></div><div class="field"><label>Hours / salary units</label><input type="number" step="0.01" min="0" name="hours" value="80"></div><div class="field"><label>Gross pay</label><input type="number" step="0.01" min="0" name="grossPay" value="2500"></div><div class="field"><label>Deductions</label><input type="number" step="0.01" min="0" name="deductions" value="500"></div><div class="field"><label>Employer costs</label><input type="number" step="0.01" min="0" name="employerCosts" value="250"></div><div class="field full"><label>Pay from bank</label><select name="bankAccountId">${bankOptions()}</select></div></div><div class="tax-form-note">Payroll form stores a payroll run summary. Full statutory payroll remittance rules can be added later by province/jurisdiction.</div>`;
    if(type==='singleActivity') return `<div class="form-grid"><div class="field"><label>Team member</label><select name="employee">${v11EmployeeOptions()}</select></div><div class="field"><label>Customer / project</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Service item</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Hours</label><input type="number" step="0.25" min="0" name="hours" value="1"></div><div class="field"><label>Hourly rate</label><input type="number" step="0.01" min="0" name="rate" value="125"></div><div class="field"><label>Billable</label><select name="billable"><option value="true">Billable</option><option value="false">Non-billable</option></select></div><div class="field full"><label>Notes</label><input name="notes" value="Single time activity"></div></div>`;
    if(type==='weeklyTimesheet') return `<div class="form-grid"><div class="field"><label>Week start date</label><input type="date" name="weekStart" value="${todayISO()}"></div><div class="field"><label>Team member</label><select name="employee">${v11EmployeeOptions()}</select></div><div class="field full"><label>Customer / project</label><select name="customerId">${customerOptions()}</select></div>${v11WeekdayInputs()}<div class="field"><label>Billable</label><select name="billable"><option value="true">Billable</option><option value="false">Non-billable</option></select></div><div class="field full"><label>Notes</label><input name="notes" value="Weekly timesheet"></div></div>`;
    if(type==='reviewTime'){
      const entries=(state.timeEntries||[]).filter(t=>t.status!=='Approved').slice(0,8);
      const rows=entries.map(t=>`<label class="check-row"><input type="checkbox" name="timeEntryIds" value="${v11Text(t.id)}" checked><div><strong>${v11Text(t.employee||'Team member')} · ${v11Text(t.date||'No date')}</strong><div class="muted small">${num(t.hours)} hours · ${t.billable?'Billable':'Non-billable'} · ${v11Text(getCustomer(t.customerId||'').name||'No customer')}</div></div><span class="tag open">${v11Text(t.status||'Submitted')}</span></label>`).join('');
      return `<div class="form-grid"><div class="field"><label>Review action</label><select name="reviewAction"><option value="Approved">Approve selected</option><option value="Rejected">Reject selected</option><option value="Needs revision">Needs revision</option></select></div><div class="field"><label>Reviewer</label><input name="reviewer" value="Quak"></div><div class="field full"><label>Reviewer notes</label><input name="notes" value="Reviewed from + New workflow"></div></div><div class="checklist" style="margin-top:14px">${rows || '<div class="empty">No submitted time entries to review.</div>'}</div>`;
    }
    if(type==='employee') return `<div class="form-grid"><div class="field"><label>Full name</label><input name="name" required></div><div class="field"><label>Email</label><input type="email" name="email"></div><div class="field"><label>Phone</label><input name="phone"></div><div class="field"><label>Start date</label><input type="date" name="startDate" value="${todayISO()}"></div><div class="field"><label>Job title</label><input name="title" value="Team member"></div><div class="field"><label>Department</label><input name="department" value="Operations"></div><div class="field"><label>Pay type</label><select name="payType"><option>Hourly</option><option>Salary</option><option>Commission</option></select></div><div class="field"><label>Pay rate</label><input type="number" step="0.01" min="0" name="rate" value="30"></div><div class="field"><label>Status</label><select name="status"><option>Active</option><option>Onboarding</option><option>Inactive</option></select></div></div>`;
    if(type==='contractor') return `<div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Email</label><input type="email" name="email"></div><div class="field"><label>Phone</label><input name="phone"></div><div class="field"><label>Service type</label><input name="serviceType" value="Professional services"></div><div class="field"><label>Rate type</label><select name="rateType"><option>Hourly</option><option>Project</option><option>Retainer</option></select></div><div class="field"><label>Rate</label><input type="number" step="0.01" min="0" name="rate" value="75"></div><div class="field"><label>Payment terms</label><select name="terms"><option>Net 15</option><option>Net 30</option><option>Due on receipt</option></select></div><div class="field full"><label><input type="checkbox" name="createVendor" checked> Create vendor profile for this contractor</label></div></div>`;
    if(type==='payDownCreditCard') return `<div class="form-grid"><div class="field"><label>Credit card account</label><select name="creditCardAccountId">${v11CreditCardAccountOptions()}</select></div><div class="field"><label>Pay from bank</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field"><label>Payment date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Amount</label><input type="number" step="0.01" min="0" name="amount" value="500"></div><div class="field full"><label>Memo</label><input name="memo" value="Credit card payment"></div></div><div class="tax-form-note">Records the payment workflow from operating bank to credit-card liability. A detailed credit-card register can be added in a later version.</div>`;
    return v11ModalBodyBase(type);
  };
  const v11OpenModalBase = openModal;
  openModal = function(type){
    ensureV11State();
    if(!v11ModalTypes.has(type)) return v11OpenModalBase(type);
    currentModal = type;
    const titles = {
      statement:['Prepare customer statement','Generate a customer statement for a selected date range and delivery method.'],
      creditMemo:['Create credit memo','Record a customer credit and optionally apply it to an open invoice.'],
      shippingLabel:['Create shipping label','Capture carrier, service, package, and tracking details.'],
      refundReceipt:['Create refund receipt','Record money returned to a customer.'],
      delayedCredit:['Create delayed credit','Record a customer credit to apply to a future invoice.'],
      delayedCharge:['Create delayed charge','Record a customer charge to add to a future invoice.'],
      check:['Write check','Record a check payment from a bank account.'],
      vendorCredit:['Create vendor credit','Record a supplier credit and optionally apply it to an open bill.'],
      creditCardCredit:['Create credit card credit','Record a vendor refund or credit against a credit-card account.'],
      printChecks:['Print checks','Prepare a check print run and mark selected checks or bills for printing.'],
      payroll:['Run payroll summary','Capture a payroll run summary for one employee or pay group.'],
      singleActivity:['Single time activity','Capture a one-off billable or non-billable time entry.'],
      weeklyTimesheet:['Weekly timesheet','Capture weekly time by day for one team member.'],
      reviewTime:['Review time','Approve, reject, or request revision on submitted time.'],
      employee:['Add employee','Create an employee record for payroll and time tracking.'],
      contractor:['Add contractor','Create a contractor profile and optional vendor record.'],
      payDownCreditCard:['Pay down credit card','Record a payment from bank to credit-card liability.']
    };
    document.getElementById('modalTitle').textContent = titles[type][0];
    document.getElementById('modalSubtitle').textContent = titles[type][1];
    document.getElementById('modalBody').innerHTML = modalBodyContent(type);
    document.getElementById('modalFooter').innerHTML = '<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').classList.add('open');
    bindModalLiveCalculations(type);
  };
  const v11SubmitModalBase = submitModal;
  submitModal = function(e){
    if(!v11ModalTypes.has(currentModal)) return v11SubmitModalBase(e);
    e.preventDefault();
    ensureV11State();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    const total = () => num(data.amount) + num(data.tax);
    switch(currentModal){
      case 'statement': {
        const openInvoices=(state.invoices||[]).filter(i=>i.customerId===data.customerId && openAmount(i)>0.005);
        const rec={id:uid('STMT'), customerId:data.customerId, date:data.date, startDate:data.startDate, endDate:data.endDate, includeMode:data.includeMode, delivery:data.delivery, message:data.message, openBalance:openInvoices.reduce((s,i)=>s+openAmount(i),0), invoiceCount:openInvoices.length, status:'Prepared'};
        state.statements.unshift(rec); audit(`Statement ${rec.id} prepared for ${getCustomer(data.customerId).name}`); showToast('Customer statement prepared.'); break;
      }
      case 'creditMemo': {
        const rec={id:uid('CM'), customerId:data.customerId, invoiceId:data.invoiceId||'', date:data.date, productId:data.productId, incomeAccountId:data.incomeAccountId, amount:num(data.amount), tax:num(data.tax), total:total(), reason:data.reason, status:data.invoiceId?'Applied':'Unapplied'};
        if(data.invoiceId){ const inv=state.invoices.find(i=>i.id===data.invoiceId); if(inv){ inv.paid=Math.min(invoiceTotal(inv), num(inv.paid)+rec.total); if(openAmount(inv)<=0.01) inv.status='Paid'; } }
        state.creditMemos.unshift(rec); audit(`Credit memo ${rec.id} saved: ${money(rec.total)}`); showToast('Credit memo saved.'); break;
      }
      case 'shippingLabel': {
        const rec={id:uid('SHIP'), customerId:data.customerId, shipDate:data.shipDate, shipFrom:data.shipFrom, shipTo:data.shipTo, carrier:data.carrier, serviceLevel:data.serviceLevel, weightKg:num(data.weightKg), dimensions:data.dimensions, trackingNo:data.trackingNo, status:data.trackingNo?'Ready':'Draft'};
        state.shippingLabels.unshift(rec); audit(`Shipping label ${rec.id} created for ${getCustomer(data.customerId).name}`); showToast('Shipping label saved.'); break;
      }
      case 'refundReceipt': {
        const rec={id:uid('REF'), customerId:data.customerId, date:data.date, accountId:data.accountId, productId:data.productId, amount:num(data.amount), tax:num(data.tax), total:total(), reason:data.reason, status:'Refunded'};
        state.refundReceipts.unshift(rec); audit(`Refund receipt ${rec.id} recorded: ${money(rec.total)}`); showToast('Refund receipt recorded.'); break;
      }
      case 'delayedCredit': {
        const rec={id:uid('DC'), customerId:data.customerId, date:data.date, productId:data.productId, amount:num(data.amount), tax:num(data.tax), total:total(), status:data.status, reason:data.reason};
        state.delayedCredits.unshift(rec); audit(`Delayed credit ${rec.id} saved: ${money(rec.total)}`); showToast('Delayed credit saved.'); break;
      }
      case 'delayedCharge': {
        const rec={id:uid('DCH'), customerId:data.customerId, date:data.date, productId:data.productId, amount:num(data.amount), tax:num(data.tax), total:total(), billable:data.billable, description:data.description, status:'Pending invoice'};
        state.delayedCharges.unshift(rec); audit(`Delayed charge ${rec.id} saved: ${money(rec.total)}`); showToast('Delayed charge saved.'); break;
      }
      case 'check': {
        const rec={id:uid('CHK'), vendorId:data.vendorId, date:data.date, bankAccountId:data.bankAccountId, checkNo:data.checkNo, expenseAccountId:data.expenseAccountId, amount:num(data.amount), tax:num(data.tax), total:total(), memo:data.memo, printed:false, status:'Issued'};
        state.checks.unshift(rec);
        state.expenses.unshift({id:uid('EXP'), vendorId:data.vendorId, date:data.date, expenseAccountId:data.expenseAccountId, account:getAccount(data.expenseAccountId).name, memo:`Check ${data.checkNo}: ${data.memo||''}`, amount:num(data.amount), tax:num(data.tax), paymentMethod:'Check', bankAccountId:data.bankAccountId});
        audit(`Check ${rec.checkNo} recorded: ${money(rec.total)}`); showToast('Check recorded and expense posted.'); break;
      }
      case 'vendorCredit': {
        const rec={id:uid('VC'), vendorId:data.vendorId, billId:data.billId||'', date:data.date, expenseAccountId:data.expenseAccountId, amount:num(data.amount), tax:num(data.tax), total:total(), reason:data.reason, status:data.billId?'Applied':'Unapplied'};
        if(data.billId){ const bill=state.bills.find(b=>b.id===data.billId); if(bill){ bill.paid=Math.min(billTotal(bill), num(bill.paid)+rec.total); if(billOpenAmount(bill)<=0.01) bill.status='Paid'; } }
        state.vendorCredits.unshift(rec); audit(`Vendor credit ${rec.id} saved: ${money(rec.total)}`); showToast('Vendor credit saved.'); break;
      }
      case 'creditCardCredit': {
        const rec={id:uid('CCC'), vendorId:data.vendorId, date:data.date, creditCardAccountId:data.creditCardAccountId, expenseAccountId:data.expenseAccountId, amount:num(data.amount), tax:num(data.tax), total:total(), memo:data.memo, status:'Recorded'};
        state.creditCardCredits.unshift(rec); audit(`Credit card credit ${rec.id} recorded: ${money(rec.total)}`); showToast('Credit card credit recorded.'); break;
      }
      case 'printChecks': {
        const rec={id:uid('PRN'), bankAccountId:data.bankAccountId, startNo:data.startNo, date:data.date, format:data.format, billId:data.billId||'', markPrinted:f.has('markPrinted'), status:'Prepared'};
        if(rec.markPrinted){ (state.checks||[]).filter(c=>!c.printed).slice(0,10).forEach((c,i)=>{ c.printed=true; c.checkNo=String(num(rec.startNo)+i); }); }
        state.checkPrintRuns.unshift(rec); audit(`Check print run ${rec.id} prepared`); showToast('Check print run prepared.'); break;
      }
      case 'payroll': {
        const rec={id:uid('PAY'), periodStart:data.periodStart, periodEnd:data.periodEnd, payDate:data.payDate, employee:data.employee, hours:num(data.hours), grossPay:num(data.grossPay), deductions:num(data.deductions), employerCosts:num(data.employerCosts), netPay:num(data.grossPay)-num(data.deductions), bankAccountId:data.bankAccountId, status:'Calculated'};
        state.payrollRuns.unshift(rec); audit(`Payroll run ${rec.id} saved for ${data.employee}`); showToast('Payroll summary saved.'); break;
      }
      case 'singleActivity': {
        const rec={id:uid('T'), employee:data.employee, customerId:data.customerId, productId:data.productId, date:data.date, hours:num(data.hours), rate:num(data.rate), billable:data.billable==='true', notes:data.notes, status:'Submitted'};
        state.timeEntries.unshift(rec); audit(`Time activity ${rec.id} added: ${rec.hours} hours`); showToast('Single time activity added.'); break;
      }
      case 'weeklyTimesheet': {
        const dayKeys=['monHours','tueHours','wedHours','thuHours','friHours','satHours','sunHours'];
        const totalHours=dayKeys.reduce((s,k)=>s+num(data[k]),0);
        const rec={id:uid('TS'), weekStart:data.weekStart, employee:data.employee, customerId:data.customerId, hours:{mon:num(data.monHours),tue:num(data.tueHours),wed:num(data.wedHours),thu:num(data.thuHours),fri:num(data.friHours),sat:num(data.satHours),sun:num(data.sunHours)}, totalHours, billable:data.billable==='true', notes:data.notes, status:'Submitted'};
        state.weeklyTimesheets.unshift(rec);
        state.timeEntries.unshift({id:uid('T'), employee:data.employee, customerId:data.customerId, date:data.weekStart, hours:totalHours, billable:rec.billable, notes:`Weekly timesheet ${rec.id}: ${data.notes||''}`, status:'Submitted'});
        audit(`Weekly timesheet ${rec.id} added: ${totalHours} hours`); showToast('Weekly timesheet submitted.'); break;
      }
      case 'reviewTime': {
        const selected=f.getAll('timeEntryIds');
        (state.timeEntries||[]).forEach(t=>{ if(selected.includes(t.id)) t.status=data.reviewAction; });
        const rec={id:uid('TREV'), date:todayISO(), reviewer:data.reviewer, action:data.reviewAction, timeEntryIds:selected, notes:data.notes};
        state.timeApprovals.unshift(rec); audit(`Time review ${rec.id}: ${data.reviewAction} ${selected.length} entries`); showToast(`Time review saved for ${selected.length} entries.`); break;
      }
      case 'employee': {
        const rec={id:uid('EMP'), name:data.name, email:data.email, phone:data.phone, startDate:data.startDate, title:data.title, department:data.department, payType:data.payType, rate:num(data.rate), status:data.status};
        state.employees.unshift(rec); audit(`Employee added: ${data.name}`); showToast('Employee added.'); break;
      }
      case 'contractor': {
        const rec={id:uid('CTR'), name:data.name, email:data.email, phone:data.phone, serviceType:data.serviceType, rateType:data.rateType, rate:num(data.rate), terms:data.terms, vendorId:''};
        if(f.has('createVendor')){ const vendor={id:uid('V'), name:data.name, email:data.email, phone:data.phone, category:data.serviceType}; state.vendors.unshift(vendor); rec.vendorId=vendor.id; }
        state.contractors.unshift(rec); audit(`Contractor added: ${data.name}`); showToast('Contractor added.'); break;
      }
      case 'payDownCreditCard': {
        const rec={id:uid('CCP'), creditCardAccountId:data.creditCardAccountId, bankAccountId:data.bankAccountId, date:data.date, amount:num(data.amount), memo:data.memo, status:'Posted'};
        state.creditCardPayments.unshift(rec); audit(`Credit card payment ${rec.id} posted: ${money(rec.amount)}`); showToast('Credit card payment recorded.'); break;
      }
    }
    saveState(); closeModal(); renderAll();
  };
  ensureV11State();

  // ---------- V12: Saved records + workflow integration ----------
  function injectV12RecordStyles(){
    if(document.getElementById('v12-saved-records-styles')) return;
    const style=document.createElement('style');
    style.id='v12-saved-records-styles';
    style.textContent=`
      body.v8-ui .v12-section-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:18px 0 10px}
      body.v8-ui .v12-section-title h3{margin:0;font-size:16px;text-transform:none;letter-spacing:-.01em;color:var(--ink,#202124)}
      body.v8-ui .v12-section-title p{margin:4px 0 0;color:var(--muted,#667085);font-size:12px;line-height:1.35}
      body.v8-ui .v12-record-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 16px}
      body.v8-ui .v12-record-card{background:var(--panel,#fff);border:1px solid #e2e8ee;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(16,24,40,.035)}
      body.v8-ui .v12-record-card h4{margin:0 0 6px;font-size:12px;color:var(--muted,#667085);text-transform:uppercase;letter-spacing:.04em}
      body.v8-ui .v12-record-card strong{display:block;font-size:24px;letter-spacing:-.03em}.v12-record-card span{color:var(--muted,#667085);font-size:12px}
      body.v8-ui .v12-action-strip{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}
      body.v8-ui .v12-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #d0d7de;background:#fff;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:900;color:#344054;white-space:nowrap}
      body.v8-ui .v12-chip.warn{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.v12-chip.good{background:#ecfdf3;border-color:#abefc6;color:#067647}.v12-chip.info{background:#eff6ff;border-color:#bfdbfe;color:#155eef}
      body.v8-ui .v12-workflow-card{border:1px solid #dfe7ee;border-radius:18px;background:linear-gradient(180deg,#fff,#fbfdff);padding:16px;margin-bottom:16px}
      body.v8-ui .v12-workflow-card h3{margin:0 0 6px}.v12-workflow-card p{margin:0;color:var(--muted,#667085);line-height:1.4}
      body.v8-ui .v12-task-callout{border-left:5px solid var(--green,#0a8f3c);background:#f6fff8;border-radius:14px;padding:12px 14px;margin:10px 0;display:flex;align-items:center;justify-content:space-between;gap:12px}
      body.v8-ui .v12-task-callout.warn{border-left-color:#f59e0b;background:#fffaf2}.v12-task-callout strong{display:block}.v12-task-callout span{display:block;color:var(--muted,#667085);font-size:12px;margin-top:2px}
      body.v8-ui.dark-mode .v12-section-title h3{color:#f3f7fb}body.v8-ui.dark-mode .v12-record-card,body.v8-ui.dark-mode .v12-workflow-card{background:#14202d;border-color:#2a3c4f;color:#e8edf3}body.v8-ui.dark-mode .v12-chip{background:#101b27;border-color:#34495e;color:#e8edf3}body.v8-ui.dark-mode .v12-task-callout{background:#10291d}body.v8-ui.dark-mode .v12-task-callout.warn{background:#2a2112}
      @media(max-width:1100px){body.v8-ui .v12-record-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:680px){body.v8-ui .v12-record-grid{grid-template-columns:1fr}.v12-section-title{display:block}}
    `;
    document.head.appendChild(style);
  }
  function ensureV12State(){
    if(typeof ensureV11State==='function') ensureV11State();
    state.settings ||= {};
    state.statements ||= []; state.creditMemos ||= []; state.shippingLabels ||= []; state.refundReceipts ||= [];
    state.delayedCredits ||= []; state.delayedCharges ||= []; state.checks ||= []; state.vendorCredits ||= [];
    state.creditCardCredits ||= []; state.checkPrintRuns ||= []; state.payrollRuns ||= []; state.weeklyTimesheets ||= [];
    state.timeApprovals ||= []; state.employees ||= []; state.contractors ||= []; state.creditCardPayments ||= [];
  }
  function v12Date(v){ return escapeHTML(v || '—'); }
  function v12Status(s){ return tagForStatus(s || 'Draft'); }
  function v12CustomerName(id){ return escapeHTML((getCustomer(id)||{}).name || '—'); }
  function v12VendorName(id){ return escapeHTML((getVendor(id)||{}).name || '—'); }
  function v12MetricCards(cards){
    return `<div class="v12-record-grid">${cards.map(c=>`<div class="v12-record-card"><h4>${escapeHTML(c.label)}</h4><strong>${c.value}</strong><span>${escapeHTML(c.sub||'')}</span></div>`).join('')}</div>`;
  }
  function v12SectionTitle(title,subtitle,actions=''){
    return `<div class="v12-section-title"><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(subtitle||'')}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div></div>`;
  }
  function v12SafeRows(arr, mapper){ return (arr||[]).map(mapper); }
  function v12SalesRecordHub(){
    ensureV12State();
    const pendingDelayed=(state.delayedCharges||[]).filter(x=>String(x.status||'').toLowerCase().includes('pending'));
    const unappliedCredits=(state.creditMemos||[]).filter(x=>String(x.status||'').toLowerCase().includes('unapplied')).length + (state.delayedCredits||[]).filter(x=>String(x.status||'').toLowerCase().includes('available')).length;
    const totalAdjustments=[...(state.creditMemos||[]),...(state.refundReceipts||[]),...(state.delayedCredits||[]),...(state.delayedCharges||[])].reduce((s,x)=>s+num(x.total || (num(x.amount)+num(x.tax))),0);
    return v12SectionTitle('Saved sales workflow records','Records created from the + New menu are now visible in the related sales workflow.',`<button class="btn" data-modal="statement">Statement</button><button class="btn" data-modal="creditMemo">Credit memo</button><button class="btn" data-modal="delayedCharge">Delayed charge</button>`)+
      v12MetricCards([
        {label:'Statements',value:(state.statements||[]).length,sub:'prepared customer statements'},
        {label:'Adjustments',value:money(totalAdjustments),sub:'credits, refunds and delayed items'},
        {label:'Pending charges',value:pendingDelayed.length,sub:'ready to add to future invoice'},
        {label:'Unapplied credits',value:unappliedCredits,sub:'available customer credits'}
      ])+
      `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Statements</h3><div class="muted small">Customer statements prepared from + New.</div></div></div>${table(['Statement','Customer','Period','Open balance','Delivery','Status'], v12SafeRows(state.statements, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),`${v12Date(r.startDate)} → ${v12Date(r.endDate)}`,`<span class="amount">${money(r.openBalance)}</span>`,escapeHTML(r.delivery||'—'),v12Status(r.status)]))}</div>`+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Customer credits, refunds, and delayed items</h3><div class="muted small">Credit memos, refund receipts, delayed credits, and delayed charges.</div></div></div>${table(['Type','Reference','Customer','Date','Amount','Status'], [
        ...v12SafeRows(state.creditMemos, r=>['Credit memo',`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]),
        ...v12SafeRows(state.refundReceipts, r=>['Refund receipt',`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]),
        ...v12SafeRows(state.delayedCredits, r=>['Delayed credit',`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]),
        ...v12SafeRows(state.delayedCharges, r=>['Delayed charge',`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)])
      ].sort((a,b)=>String(b[3]).localeCompare(String(a[3]))))}</div></div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Shipping labels</h3><div class="muted small">Shipment records created from + New.</div></div><button class="btn" data-modal="shippingLabel">Create label</button></div>${table(['Label','Customer','Ship date','Carrier','Service','Tracking','Status'], v12SafeRows(state.shippingLabels, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.shipDate),escapeHTML(r.carrier||'—'),escapeHTML(r.serviceLevel||'—'),escapeHTML(r.trackingNo||'—'),v12Status(r.status)]))}</div>`;
  }
  function v12ExpenseRecordHub(){
    ensureV12State();
    const unprinted=(state.checks||[]).filter(c=>!c.printed).length;
    const unappliedVendor=(state.vendorCredits||[]).filter(x=>String(x.status||'').toLowerCase().includes('unapplied')).length;
    const ccPayments=(state.creditCardPayments||[]).reduce((s,x)=>s+num(x.amount),0);
    return v12SectionTitle('Saved expense and vendor workflow records','Checks, vendor credits, credit-card credits, print runs, and credit-card payments are now tracked after saving.',`<button class="btn" data-modal="check">Write check</button><button class="btn" data-modal="vendorCredit">Vendor credit</button><button class="btn" data-modal="payDownCreditCard">Pay down credit card</button>`)+
      v12MetricCards([
        {label:'Checks',value:(state.checks||[]).length,sub:`${unprinted} not printed`},
        {label:'Vendor credits',value:(state.vendorCredits||[]).length,sub:`${unappliedVendor} unapplied`},
        {label:'Card payments',value:money(ccPayments),sub:'credit-card paydown recorded'},
        {label:'Print runs',value:(state.checkPrintRuns||[]).length,sub:'prepared check batches'}
      ])+
      `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Checks and print runs</h3><div class="muted small">Checks posted from + New and optional check print batches.</div></div><button class="btn" data-action="v12-mark-checks-printed">Mark all printed</button></div>${table(['Check','Vendor','Date','No.','Total','Printed','Status'], v12SafeRows(state.checks, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12VendorName(r.vendorId),v12Date(r.date),escapeHTML(r.checkNo||'—'),`<span class="amount">${money(r.total)}</span>`,r.printed?'Yes':'No',v12Status(r.status)]))}</div>`+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Vendor and credit-card credits</h3><div class="muted small">Credits and card-credit records saved from + New.</div></div></div>${table(['Type','Reference','Vendor','Date','Amount','Status'], [
        ...v12SafeRows(state.vendorCredits, r=>['Vendor credit',`<strong>${escapeHTML(r.id)}</strong>`,v12VendorName(r.vendorId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]),
        ...v12SafeRows(state.creditCardCredits, r=>['Credit-card credit',`<strong>${escapeHTML(r.id)}</strong>`,v12VendorName(r.vendorId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]),
        ...v12SafeRows(state.creditCardPayments, r=>['Card payment',`<strong>${escapeHTML(r.id)}</strong>`,escapeHTML(accountLabel(r.creditCardAccountId)||'Credit card'),v12Date(r.date),`<span class="amount">${money(r.amount)}</span>`,v12Status(r.status)])
      ].sort((a,b)=>String(b[3]).localeCompare(String(a[3]))))}</div></div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Check print runs</h3><div class="muted small">Prepared check printing batches.</div></div><button class="btn" data-modal="printChecks">Print checks</button></div>${table(['Run','Date','Bank','Starting no.','Format','Marked printed','Status'], v12SafeRows(state.checkPrintRuns, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12Date(r.date),escapeHTML(getBank(r.bankAccountId).name||'—'),escapeHTML(r.startNo||'—'),escapeHTML(r.format||'—'),r.markPrinted?'Yes':'No',v12Status(r.status)]))}</div>`;
  }
  function v12TimeRecordHub(){
    ensureV12State();
    const submitted=(state.timeEntries||[]).filter(t=>String(t.status||'Submitted').toLowerCase()==='submitted');
    const totalHours=(state.timeEntries||[]).reduce((s,t)=>s+num(t.hours),0);
    const billableHours=(state.timeEntries||[]).filter(t=>t.billable).reduce((s,t)=>s+num(t.hours),0);
    return v12SectionTitle('Saved time workflow records','Single time activities, weekly timesheets, and review decisions are connected here.',`<button class="btn" data-modal="singleActivity">Single activity</button><button class="btn" data-modal="weeklyTimesheet">Weekly timesheet</button><button class="btn primary" data-modal="reviewTime">Review time</button>`)+
      v12MetricCards([
        {label:'Total hours',value:totalHours.toFixed(2),sub:'all captured time'},
        {label:'Billable hours',value:billableHours.toFixed(2),sub:'available for billing workflow'},
        {label:'Needs review',value:submitted.length,sub:'submitted time entries'},
        {label:'Timesheets',value:(state.weeklyTimesheets||[]).length,sub:'weekly submissions'}
      ])+
      (submitted.length?`<div class="v12-task-callout warn"><div><strong>${submitted.length} time entries need review</strong><span>Approve submitted time or reject entries before billing/payroll.</span></div><button class="btn primary" data-modal="reviewTime">Review time</button></div>`:'')+
      `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Weekly timesheets</h3><div class="muted small">Weekly submissions from + New.</div></div></div>${table(['Timesheet','Team member','Week start','Customer','Hours','Billable','Status'], v12SafeRows(state.weeklyTimesheets, r=>[`<strong>${escapeHTML(r.id)}</strong>`,escapeHTML(r.employee||'—'),v12Date(r.weekStart),v12CustomerName(r.customerId),num(r.totalHours).toFixed(2),r.billable?'Yes':'No',v12Status(r.status)]))}</div>`+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Time reviews</h3><div class="muted small">Approval/rejection history.</div></div></div>${table(['Review','Date','Reviewer','Action','Entries','Notes'], v12SafeRows(state.timeApprovals, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12Date(r.date),escapeHTML(r.reviewer||'—'),v12Status(r.action),Array.isArray(r.timeEntryIds)?r.timeEntryIds.length:0,escapeHTML(r.notes||'')]))}</div></div>`;
  }
  function v12PayrollHub(){
    ensureV12State();
    const gross=(state.payrollRuns||[]).reduce((s,p)=>s+num(p.grossPay),0), net=(state.payrollRuns||[]).reduce((s,p)=>s+num(p.netPay),0);
    return header('Payroll', 'Payroll runs, employees, contractors, and pay setup records created from + New.', `<button class="btn" data-modal="employee">Add employee</button><button class="btn" data-modal="contractor">Add contractor</button><button class="btn primary" data-modal="payroll">Run payroll</button>`)+
      v12MetricCards([
        {label:'Employees',value:(state.employees||[]).length,sub:'active or setup records'},
        {label:'Contractors',value:(state.contractors||[]).length,sub:'contractor profiles'},
        {label:'Gross payroll',value:money(gross),sub:'saved payroll runs'},
        {label:'Net pay',value:money(net),sub:'after deductions'}
      ])+
      `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Payroll runs</h3><div class="muted small">Pay summaries saved from + New.</div></div></div>${table(['Run','Employee','Pay date','Period','Gross','Deductions','Net','Status'], v12SafeRows(state.payrollRuns, r=>[`<strong>${escapeHTML(r.id)}</strong>`,escapeHTML(r.employee||'—'),v12Date(r.payDate),`${v12Date(r.periodStart)} → ${v12Date(r.periodEnd)}`,`<span class="amount">${money(r.grossPay)}</span>`,`<span class="amount">${money(r.deductions)}</span>`,`<span class="amount">${money(r.netPay)}</span>`,v12Status(r.status)]))}</div>`+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Employees</h3><div class="muted small">Employee setup records.</div></div></div>${table(['Employee','Title','Department','Pay type','Rate','Status'], v12SafeRows(state.employees, r=>[`<strong>${escapeHTML(r.name||'—')}</strong><div class="muted small">${escapeHTML(r.email||'')}</div>`,escapeHTML(r.title||'—'),escapeHTML(r.department||'—'),escapeHTML(r.payType||'—'),`<span class="amount">${money(r.rate)}</span>`,v12Status(r.status||'Active')]))}</div></div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Contractors</h3><div class="muted small">Contractor records and optional vendor links.</div></div><button class="btn" data-modal="contractor">Add contractor</button></div>${table(['Contractor','Service type','Rate type','Rate','Payment terms','Vendor link'], v12SafeRows(state.contractors, r=>[`<strong>${escapeHTML(r.name||'—')}</strong><div class="muted small">${escapeHTML(r.email||'')}</div>`,escapeHTML(r.serviceType||'—'),escapeHTML(r.rateType||'—'),`<span class="amount">${money(r.rate)}</span>`,escapeHTML(r.terms||'—'),r.vendorId?escapeHTML(getVendor(r.vendorId).name):'—']))}</div>`;
  }
  const v12RenderSalesBase=renderSales;
  renderSales=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderSalesBase(); document.getElementById('page-sales')?.insertAdjacentHTML('beforeend', v12SalesRecordHub()); };
  const v12RenderCustomersBase=renderCustomers;
  renderCustomers=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderCustomersBase(); const el=document.getElementById('page-customers'); el?.insertAdjacentHTML('beforeend', v12SectionTitle('Customer statement history','Prepared statements are connected to customer records.',`<button class="btn" data-modal="statement">Prepare statement</button>`)+`<div class="card table-card">${table(['Statement','Customer','Date','Period','Open balance','Status'], v12SafeRows(state.statements, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12CustomerName(r.customerId),v12Date(r.date),`${v12Date(r.startDate)} → ${v12Date(r.endDate)}`,`<span class="amount">${money(r.openBalance)}</span>`,v12Status(r.status)]))}</div>`); };
  const v12RenderExpensesBase=renderExpenses;
  renderExpenses=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderExpensesBase(); document.getElementById('page-expenses')?.insertAdjacentHTML('beforeend', v12ExpenseRecordHub()); };
  const v12RenderVendorsBase=renderVendors;
  renderVendors=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderVendorsBase(); const el=document.getElementById('page-vendors'); el?.insertAdjacentHTML('beforeend', v12SectionTitle('Vendor credit history','Vendor credits and check payments linked to vendor workflows.',`<button class="btn" data-modal="vendorCredit">Vendor credit</button><button class="btn" data-modal="check">Write check</button>`)+`<div class="grid two"><div class="card table-card">${table(['Credit','Vendor','Date','Amount','Status'], v12SafeRows(state.vendorCredits, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12VendorName(r.vendorId),v12Date(r.date),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]))}</div><div class="card table-card">${table(['Check','Vendor','Date','No.','Total','Status'], v12SafeRows(state.checks, r=>[`<strong>${escapeHTML(r.id)}</strong>`,v12VendorName(r.vendorId),v12Date(r.date),escapeHTML(r.checkNo||'—'),`<span class="amount">${money(r.total)}</span>`,v12Status(r.status)]))}</div></div>`); };
  const v12RenderTimeBase=renderTime;
  renderTime=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderTimeBase(); document.getElementById('page-time')?.insertAdjacentHTML('beforeend', v12TimeRecordHub()); };
  renderPayroll=function(){ injectV12RecordStyles(); ensureV12State(); const el=document.getElementById('page-payroll'); if(el) el.innerHTML=v12PayrollHub(); };
  const v12RenderTransactionsBase=renderTransactions;
  renderTransactions=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderTransactionsBase(); const records=[
      ...v12SafeRows(state.creditMemos, r=>({date:r.date,source:'Credit memo',ref:r.id,name:(getCustomer(r.customerId)||{}).name,amount:-num(r.total),status:r.status})),
      ...v12SafeRows(state.refundReceipts, r=>({date:r.date,source:'Refund receipt',ref:r.id,name:(getCustomer(r.customerId)||{}).name,amount:-num(r.total),status:r.status})),
      ...v12SafeRows(state.delayedCharges, r=>({date:r.date,source:'Delayed charge',ref:r.id,name:(getCustomer(r.customerId)||{}).name,amount:num(r.total),status:r.status})),
      ...v12SafeRows(state.vendorCredits, r=>({date:r.date,source:'Vendor credit',ref:r.id,name:(getVendor(r.vendorId)||{}).name,amount:num(r.total),status:r.status})),
      ...v12SafeRows(state.checks, r=>({date:r.date,source:'Check',ref:r.id,name:(getVendor(r.vendorId)||{}).name,amount:-num(r.total),status:r.status})),
      ...v12SafeRows(state.creditCardPayments, r=>({date:r.date,source:'Credit-card payment',ref:r.id,name:accountLabel(r.creditCardAccountId),amount:-num(r.amount),status:r.status}))
    ].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    document.getElementById('page-transactions')?.insertAdjacentHTML('beforeend', v12SectionTitle('Additional + New records','Additional records created from + New are visible here.')+`<div class="card table-card">${table(['Date','Source','Reference','Name / Memo','Status','Amount'], records.map(r=>[v12Date(r.date),escapeHTML(r.source),`<strong>${escapeHTML(r.ref)}</strong>`,escapeHTML(r.name||'—'),v12Status(r.status),`<span class="amount">${money(r.amount)}</span>`]))}</div>`); };
  function v12Summary(){
    const base=typeof v10Summary==='function'?v10Summary():{};
    ensureV12State();
    return {...base,
      submittedTime:(state.timeEntries||[]).filter(t=>String(t.status||'Submitted').toLowerCase()==='submitted'),
      pendingDelayedCharges:(state.delayedCharges||[]).filter(x=>String(x.status||'').toLowerCase().includes('pending')),
      unappliedCredits:[...(state.creditMemos||[]),...(state.delayedCredits||[])].filter(x=>String(x.status||'').toLowerCase().includes('unapplied')||String(x.status||'').toLowerCase().includes('available')),
      unappliedVendorCredits:(state.vendorCredits||[]).filter(x=>String(x.status||'').toLowerCase().includes('unapplied')),
      unprintedChecks:(state.checks||[]).filter(c=>!c.printed),
      payrollRuns:(state.payrollRuns||[]), employees:(state.employees||[]), contractors:(state.contractors||[])
    };
  }
  renderGetThingsDoneTasks=function(){
    injectV12RecordStyles(); ensureV12State();
    const s=v12Summary();
    const tasks=[
      {cls:s.bankToReview?.length?'priority':'good',icon:'⇄',title:'Review bank transactions',desc:`${s.bankToReview?.length||0} bank-feed transactions need matching, categorization, or review.`,nav:'banking',label:'Review'},
      {cls:s.openInvoices?.length?'priority':'good',icon:'▣',title:'Receive customer payments',desc:`${s.openInvoices?.length||0} open invoices totaling ${v10MoneyValue(s.openAmountTotal||0)}.`,modal:'payment',label:'Receive payment'},
      {cls:s.pendingDelayedCharges.length?'priority':'good',icon:'＋',title:'Invoice delayed charges',desc:`${s.pendingDelayedCharges.length} delayed charges are ready to add to future invoices.`,modal:'invoice',label:'Create invoice'},
      {cls:s.unappliedCredits.length?'priority':'good',icon:'↩',title:'Apply customer credits',desc:`${s.unappliedCredits.length} customer credit records are available or unapplied.`,nav:'sales',label:'Open sales'},
      {cls:s.openBills?.length?'priority':'good',icon:'▸',title:'Pay vendor bills',desc:`${s.openBills?.length||0} open bills totaling ${v10MoneyValue(s.openBillTotal||0)}; ${s.dueBills?.length||0} due or overdue.`,modal:'payBill',label:'Pay bill'},
      {cls:s.unappliedVendorCredits.length?'priority':'good',icon:'□',title:'Apply vendor credits',desc:`${s.unappliedVendorCredits.length} vendor credits are unapplied.`,nav:'expenses',label:'Open expenses'},
      {cls:s.submittedTime.length?'priority':'good',icon:'◷',title:'Review time entries',desc:`${s.submittedTime.length} submitted time entries are waiting for review.`,modal:'reviewTime',label:'Review time'},
      {cls:s.unprintedChecks.length?'priority':'good',icon:'☑',title:'Print or mark checks',desc:`${s.unprintedChecks.length} checks have not been marked printed.`,modal:'printChecks',label:'Print checks'},
      {cls:!s.latestRec?'priority':'good',icon:'◎',title:'Bank reconciliation',desc:s.recLabel||'No reconciliation saved yet',modal:'reconcile',label:'Reconcile'},
      {cls:'good',icon:'↗',title:'Run management reports',desc:'Review profit and loss, balance sheet, A/R aging, A/P aging, and tax summary.',nav:'reports',label:'Reports'}
    ];
    return `<div class="gtd-task-grid"><div class="card"><h3>Priority tasks</h3><div class="gtd-task-list">${tasks.map(t=>`<div class="gtd-task ${t.cls}"><span class="gtd-task-icon">${t.icon}</span><div><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(t.desc)}</span></div><button class="btn" ${t.modal?`data-modal="${t.modal}"`:`data-nav="${t.nav}"`}>${escapeHTML(t.label)}</button></div>`).join('')}</div></div><div class="card"><h3>Workflow summary</h3><div class="report-line"><span>Delayed charges</span><strong>${s.pendingDelayedCharges.length}</strong></div><div class="report-line"><span>Customer credits</span><strong>${s.unappliedCredits.length}</strong></div><div class="report-line"><span>Vendor credits</span><strong>${s.unappliedVendorCredits.length}</strong></div><div class="report-line"><span>Time entries to review</span><strong>${s.submittedTime.length}</strong></div><div class="report-line"><span>Employees / contractors</span><strong>${s.employees.length} / ${s.contractors.length}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn" data-nav="sales">Sales records</button><button class="btn" data-nav="expenses">Expense records</button><button class="btn" data-nav="time">Time</button><button class="btn" data-nav="payroll">Payroll</button></div></div></div>`;
  };
  const v12RenderGetThingsDoneFlowBase=renderGetThingsDoneFlow;
  renderGetThingsDoneFlow=function(){
    const s=v12Summary();
    const callouts=`<div class="v12-workflow-card"><h3>Connected workflow records</h3><p>Records created from + New are connected to Sales, Expenses, Time, Payroll, Transactions, and this Get Things Done task hub.</p><div class="v12-action-strip"><span class="v12-chip ${s.pendingDelayedCharges.length?'warn':'good'}">${s.pendingDelayedCharges.length} delayed charges</span><span class="v12-chip ${s.submittedTime.length?'warn':'good'}">${s.submittedTime.length} time entries to review</span><span class="v12-chip ${s.unappliedVendorCredits.length?'warn':'good'}">${s.unappliedVendorCredits.length} vendor credits</span><span class="v12-chip info">${s.payrollRuns.length} payroll runs</span></div></div>`;
    return callouts + v12RenderGetThingsDoneFlowBase();
  };
  const v12HandleActionBase=handleAction;
  handleAction=function(action,id){
    if(action==='v12-mark-checks-printed'){
      ensureV12State(); let count=0; (state.checks||[]).forEach(c=>{ if(!c.printed){ c.printed=true; count++; } }); saveState(); renderAll(); showToast(`${count} checks marked as printed.`); return;
    }
    return v12HandleActionBase(action,id);
  };
  const v12SubmitModalBase=submitModal;
  submitModal=function(e){
    if(typeof v11ModalTypes!=='undefined' && v11ModalTypes.has(currentModal)){
      const f=new FormData(e.target);
      const amountRequired=new Set(['creditMemo','refundReceipt','delayedCredit','delayedCharge','check','vendorCredit','creditCardCredit','singleActivity','payDownCreditCard']);
      if(amountRequired.has(currentModal)){
        const field=currentModal==='singleActivity'?'hours':'amount';
        if(num(f.get(field))<=0){ e.preventDefault(); showToast(`${field==='hours'?'Hours':'Amount'} must be greater than zero.`); return; }
      }
      if(currentModal==='weeklyTimesheet'){
        const total=['monHours','tueHours','wedHours','thuHours','friHours','satHours','sunHours'].reduce((s,k)=>s+num(f.get(k)),0);
        if(total<=0){ e.preventDefault(); showToast('Weekly timesheet must include at least one hour.'); return; }
      }
      if(['employee','contractor'].includes(currentModal) && !String(f.get('name')||'').trim()){
        e.preventDefault(); showToast('Name is required.'); return;
      }
    }
    return v12SubmitModalBase(e);
  };
  const v12RenderAllBase=renderAll;
  renderAll=function(){ injectV12RecordStyles(); ensureV12State(); v12RenderAllBase(); if(currentPage==='getthingsdone') renderGetThingsDone(); };
  injectV12RecordStyles();
  ensureV12State();


  // ---------- V13: Get Things Done visibility and workflow organization ----------
  function injectV13GetThingsDoneStyles(){
    if(document.getElementById('v13-get-things-done-visibility-styles')) return;
    const style=document.createElement('style');
    style.id='v13-get-things-done-visibility-styles';
    style.textContent=`
      body.v8-ui .v13-summary-card{background:linear-gradient(180deg,var(--card,#fff),#fbfcfd);border:1px solid var(--line,#d8dee4);border-radius:18px;padding:16px 18px;margin-bottom:16px;box-shadow:0 3px 14px rgba(16,24,40,.05)}
      body.v8-ui .v13-summary-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
      body.v8-ui .v13-summary-head h3{margin:0;font-size:16px;text-transform:uppercase;letter-spacing:.03em;color:var(--text,#202124)}
      body.v8-ui .v13-summary-head p{margin:5px 0 0;color:var(--muted,#667085);line-height:1.4;max-width:760px}
      body.v8-ui .v13-summary-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
      body.v8-ui .v13-mini-stat{border:1px solid #e1e8ef;background:var(--card,#fff);border-radius:16px;padding:12px;display:grid;gap:6px;min-height:116px;position:relative;overflow:hidden}
      body.v8-ui .v13-mini-stat:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:#cbd5e1}
      body.v8-ui .v13-mini-stat.warn:before{background:#f59e0b}.v13-mini-stat.good:before{background:var(--green,#0a8f3c)}.v13-mini-stat.info:before{background:#0a62a3}
      body.v8-ui .v13-mini-stat .icon{width:32px;height:32px;border-radius:12px;background:#eef6f6;color:var(--green,#0a8f3c);display:grid;place-items:center;font-size:17px;font-weight:950}
      body.v8-ui .v13-mini-stat.warn .icon{background:#fff7ed;color:#b45309}.v13-mini-stat.info .icon{background:#e8f2ff;color:#0a62a3}
      body.v8-ui .v13-mini-stat strong{font-size:24px;letter-spacing:-.03em;line-height:1;color:var(--text,#202124)}
      body.v8-ui .v13-mini-stat span{font-size:12px;line-height:1.25;color:var(--muted,#667085);font-weight:800}
      body.v8-ui .v13-action-strip{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      body.v8-ui .v13-workflow-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      body.v8-ui .v13-workflow-card{border:1px solid var(--line,#d8dee4);border-radius:18px;background:var(--card,#fff);padding:16px;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .v13-workflow-card h3{margin:0 0 8px;font-size:16px;color:var(--text,#202124);text-transform:none}
      body.v8-ui .v13-workflow-card p{margin:0 0 12px;color:var(--muted,#667085);line-height:1.4}
      body.v8-ui .v13-workflow-steps{display:grid;gap:8px;margin:12px 0 14px;counter-reset:v13step}
      body.v8-ui .v13-workflow-steps span{border:1px solid #d9e3ec;background:#fbfcfd;border-radius:13px;padding:8px 10px 8px 38px;font-size:12px;font-weight:850;color:#344054;position:relative;line-height:1.25}
      body.v8-ui .v13-workflow-steps span:before{counter-increment:v13step;content:counter(v13step);position:absolute;left:10px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:#eef6f6;color:var(--green,#0a8f3c);display:grid;place-items:center;font-size:11px;font-weight:950}
      body.v8-ui .v13-task-summary-card .report-line strong{font-size:14px}
      body.v8-ui.dark-mode .v13-summary-card,body.v8-ui.dark-mode .v13-mini-stat,body.v8-ui.dark-mode .v13-workflow-card{background:#14202d;border-color:#2a3c4f;color:#e8edf3}
      body.v8-ui.dark-mode .v13-summary-card{background:linear-gradient(180deg,#14202d,#101b27)}
      body.v8-ui.dark-mode .v13-workflow-steps span{background:#101b27;border-color:#2a3c4f;color:#e8edf3}
      @media(max-width:1280px){body.v8-ui .v13-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:980px){body.v8-ui .v13-workflow-grid{grid-template-columns:1fr}}
      @media(max-width:720px){body.v8-ui .v13-summary-grid{grid-template-columns:1fr}.v13-summary-head{display:block}}
    `;
    document.head.appendChild(style);
  }
  function v13Summary(){
    const s=typeof v12Summary==='function' ? v12Summary() : (typeof v10Summary==='function' ? v10Summary() : {});
    return {
      openInvoices:s.openInvoices||[], draftInvoices:s.draftInvoices||[], openAmountTotal:num(s.openAmountTotal),
      openBills:s.openBills||[], openBillTotal:num(s.openBillTotal), dueBills:s.dueBills||[], bankToReview:s.bankToReview||[], latestRec:s.latestRec, recLabel:s.recLabel||'No reconciliation saved yet',
      customers:num(s.customers), products:num(s.products), estimates:num(s.estimates), payments:num(s.payments), deposits:num(s.deposits),
      submittedTime:s.submittedTime||[], pendingDelayedCharges:s.pendingDelayedCharges||[], unappliedCredits:s.unappliedCredits||[], unappliedVendorCredits:s.unappliedVendorCredits||[], unprintedChecks:s.unprintedChecks||[], payrollRuns:s.payrollRuns||[], employees:s.employees||[], contractors:s.contractors||[]
    };
  }
  function v13MiniStat({icon,label,value,type='good'}){
    return `<div class="v13-mini-stat ${type}"><span class="icon">${icon}</span><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></div>`;
  }
  function v13WorkflowSummaryCard(s){
    const stats=[
      {icon:'＋',label:'Delayed charges ready to invoice',value:s.pendingDelayedCharges.length,type:s.pendingDelayedCharges.length?'warn':'good'},
      {icon:'↩',label:'Customer credits to apply',value:s.unappliedCredits.length,type:s.unappliedCredits.length?'warn':'good'},
      {icon:'□',label:'Vendor credits to apply',value:s.unappliedVendorCredits.length,type:s.unappliedVendorCredits.length?'warn':'good'},
      {icon:'◷',label:'Submitted time entries to review',value:s.submittedTime.length,type:s.submittedTime.length?'warn':'good'},
      {icon:'☑',label:'Checks not marked printed',value:s.unprintedChecks.length,type:s.unprintedChecks.length?'warn':'good'},
      {icon:'♢',label:`Payroll runs; ${s.employees.length} employees / ${s.contractors.length} contractors`,value:s.payrollRuns.length,type:'info'}
    ];
    return `<div class="v13-summary-card"><div class="v13-summary-head"><div><h3>Workflow summary</h3><p>Key follow-up records from + New are now visible on the first Get Things Done page, not hidden only in the Tasks tab.</p></div><div class="v13-action-strip"><button class="btn" data-nav="sales">Sales records</button><button class="btn" data-nav="expenses">Expense records</button><button class="btn" data-nav="time">Time</button><button class="btn" data-nav="payroll">Payroll</button></div></div><div class="v13-summary-grid">${stats.map(v13MiniStat).join('')}</div></div>`;
  }
  function v13Badge(n,type){ return typeof v10StepBadge==='function' ? v10StepBadge(n,type) : (num(n)>0?`<span class="gtd-badge ${type||'info'}">${escapeHTML(String(n))}</span>`:''); }
  renderGetThingsDoneFlow=function(){
    injectV13GetThingsDoneStyles();
    const s=v13Summary();
    const moneyIn=[
      {title:'Add products & services',sub:`${s.products} active items`,icon:'▣',nav:'inventory',badge:v13Badge(s.products,'good')},
      {title:'Manage customers',sub:`${s.customers} customer records`,icon:'☘',nav:'customers',badge:v13Badge(s.customers,'good')},
      {title:'Create estimates',sub:`${s.estimates} estimates`,icon:'▤',modal:'estimate',badge:v13Badge(s.estimates,'info')},
      {title:'Send invoices',sub:`${s.draftInvoices.length} draft or unsent`,icon:'▧',modal:'invoice',attention:s.draftInvoices.length>0,badge:v13Badge(s.draftInvoices.length,'warn')},
      {title:'Invoice delayed charges',sub:`${s.pendingDelayedCharges.length} pending charges`,icon:'＋',modal:'invoice',attention:s.pendingDelayedCharges.length>0,badge:v13Badge(s.pendingDelayedCharges.length,'warn')},
      {title:'Apply customer credits',sub:`${s.unappliedCredits.length} credits available`,icon:'↩',nav:'sales',attention:s.unappliedCredits.length>0,badge:v13Badge(s.unappliedCredits.length,'warn')},
      {title:'Receive payments',sub:`${v10MoneyValue(s.openAmountTotal)} open A/R`,icon:'▣',modal:'payment',attention:s.openInvoices.length>0,badge:v13Badge(s.openInvoices.length,'warn')},
      {title:'Deposit to bank',sub:`${s.deposits} deposits recorded`,icon:'◉',modal:'deposit',badge:v13Badge(s.deposits,'good')}
    ];
    const moneyOut=[
      {title:'Add vendors',sub:`${(state.vendors||[]).length} vendor records`,icon:'□',modal:'vendor',badge:v13Badge((state.vendors||[]).length,'good')},
      {title:'Record bill / expense',sub:'Capture purchases and tax',icon:'▸',modal:'bill'},
      {title:'Apply vendor credits',sub:`${s.unappliedVendorCredits.length} credits available`,icon:'↩',nav:'expenses',attention:s.unappliedVendorCredits.length>0,badge:v13Badge(s.unappliedVendorCredits.length,'warn')},
      {title:'Pay bills',sub:`${v10MoneyValue(s.openBillTotal)} open A/P`,icon:'▣',modal:'payBill',attention:s.openBills.length>0,badge:v13Badge(s.dueBills.length || s.openBills.length,'warn')},
      {title:'Print checks',sub:`${s.unprintedChecks.length} checks not printed`,icon:'☑',modal:'printChecks',attention:s.unprintedChecks.length>0,badge:v13Badge(s.unprintedChecks.length,'warn')},
      {title:'Review bank feed',sub:`${s.bankToReview.length} to review`,icon:'⇄',nav:'banking',attention:s.bankToReview.length>0,badge:v13Badge(s.bankToReview.length,'warn')}
    ];
    const timePayroll=[
      {title:'Add employee',sub:`${s.employees.length} employees`,icon:'♙',modal:'employee',badge:v13Badge(s.employees.length,'good')},
      {title:'Add contractor',sub:`${s.contractors.length} contractors`,icon:'♢',modal:'contractor',badge:v13Badge(s.contractors.length,'good')},
      {title:'Single time activity',sub:'Capture one-off time',icon:'◷',modal:'singleActivity'},
      {title:'Weekly timesheet',sub:'Capture weekly hours',icon:'▦',modal:'weeklyTimesheet'},
      {title:'Review time',sub:`${s.submittedTime.length} entries submitted`,icon:'✓',modal:'reviewTime',attention:s.submittedTime.length>0,badge:v13Badge(s.submittedTime.length,'warn')},
      {title:'Run payroll',sub:`${s.payrollRuns.length} payroll runs`,icon:'♢',modal:'payroll',badge:v13Badge(s.payrollRuns.length,'info')}
    ];
    const accounting=[
      {title:'Connect / manage bank',sub:'Bank accounts and feeds',icon:'◉',nav:'banking'},
      {title:'Review transactions',sub:`${s.bankToReview.length} review items`,icon:'✓',nav:'transactions',attention:s.bankToReview.length>0,badge:v13Badge(s.bankToReview.length,'warn')},
      {title:'Reconcile',sub:s.recLabel,icon:'◎',modal:'reconcile',muted:!s.latestRec},
      {title:'See reports & trends',sub:'P&L, Balance Sheet, A/R, A/P',icon:'↗',nav:'reports'}
    ];
    return `${v13WorkflowSummaryCard(s)}<div class="gtd-workspace"><div class="gtd-workspace-head"><div><h3>Workspace</h3><p>Follow the full accounting flow, including delayed charges, credits, time review, check printing, and payroll.</p></div><button class="btn" data-nav="setup">Setup</button></div><div class="gtd-lanes">${v10FlowRow('Money in',moneyIn)}${v10FlowRow('Money out',moneyOut)}${v10FlowRow('Time and payroll',timePayroll)}${v10FlowRow('Accounting and reports',accounting)}</div></div><div class="gtd-note"><strong>Workflow hub:</strong> use this page for guided, action-oriented accounting tasks while the dashboard stays focused on key metrics.</div>`;
  };
  renderGetThingsDoneTasks=function(){
    injectV13GetThingsDoneStyles();
    const s=v13Summary();
    const tasks=[
      {cls:s.bankToReview.length?'priority':'good',icon:'⇄',title:'Review bank transactions',desc:`${s.bankToReview.length} bank-feed transactions need matching, categorization, or review.`,nav:'banking',label:'Review'},
      {cls:s.openInvoices.length?'priority':'good',icon:'▣',title:'Receive customer payments',desc:`${s.openInvoices.length} open invoices totaling ${v10MoneyValue(s.openAmountTotal)}.`,modal:'payment',label:'Receive payment'},
      {cls:s.pendingDelayedCharges.length?'priority':'good',icon:'＋',title:'Invoice delayed charges',desc:`${s.pendingDelayedCharges.length} delayed charges are ready to add to future invoices.`,modal:'invoice',label:'Create invoice'},
      {cls:s.unappliedCredits.length?'priority':'good',icon:'↩',title:'Apply customer credits',desc:`${s.unappliedCredits.length} customer credit records are available or unapplied.`,nav:'sales',label:'Open sales'},
      {cls:s.openBills.length?'priority':'good',icon:'▸',title:'Pay vendor bills',desc:`${s.openBills.length} open bills totaling ${v10MoneyValue(s.openBillTotal)}; ${s.dueBills.length} due or overdue.`,modal:'payBill',label:'Pay bill'},
      {cls:s.unappliedVendorCredits.length?'priority':'good',icon:'□',title:'Apply vendor credits',desc:`${s.unappliedVendorCredits.length} vendor credits are unapplied.`,nav:'expenses',label:'Open expenses'},
      {cls:s.submittedTime.length?'priority':'good',icon:'◷',title:'Review time entries',desc:`${s.submittedTime.length} submitted time entries are waiting for review.`,modal:'reviewTime',label:'Review time'},
      {cls:s.unprintedChecks.length?'priority':'good',icon:'☑',title:'Print or mark checks',desc:`${s.unprintedChecks.length} checks have not been marked printed.`,modal:'printChecks',label:'Print checks'},
      {cls:(s.employees.length||s.contractors.length||s.payrollRuns.length)?'good':'priority',icon:'♢',title:'Payroll records',desc:`${s.employees.length} employees, ${s.contractors.length} contractors, and ${s.payrollRuns.length} payroll runs recorded.`,nav:'payroll',label:'Open payroll'},
      {cls:!s.latestRec?'priority':'good',icon:'◎',title:'Bank reconciliation',desc:s.recLabel||'No reconciliation saved yet',modal:'reconcile',label:'Reconcile'},
      {cls:'good',icon:'↗',title:'Run management reports',desc:'Review profit and loss, balance sheet, A/R aging, A/P aging, and tax summary.',nav:'reports',label:'Reports'}
    ];
    return `<div class="gtd-task-grid"><div class="card"><h3>Priority tasks</h3><div class="gtd-task-list">${tasks.map(t=>`<div class="gtd-task ${t.cls}"><span class="gtd-task-icon">${t.icon}</span><div><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(t.desc)}</span></div><button class="btn" ${t.modal?`data-modal="${t.modal}"`:`data-nav="${t.nav}"`}>${escapeHTML(t.label)}</button></div>`).join('')}</div></div><div class="card v13-task-summary-card"><h3>Workflow summary</h3><div class="report-line"><span>Delayed charges</span><strong>${s.pendingDelayedCharges.length}</strong></div><div class="report-line"><span>Customer credits</span><strong>${s.unappliedCredits.length}</strong></div><div class="report-line"><span>Vendor credits</span><strong>${s.unappliedVendorCredits.length}</strong></div><div class="report-line"><span>Time entries to review</span><strong>${s.submittedTime.length}</strong></div><div class="report-line"><span>Checks to print</span><strong>${s.unprintedChecks.length}</strong></div><div class="report-line"><span>Payroll runs</span><strong>${s.payrollRuns.length}</strong></div><div class="report-line"><span>Employees / contractors</span><strong>${s.employees.length} / ${s.contractors.length}</strong></div><div class="v13-action-strip"><button class="btn" data-nav="sales">Sales records</button><button class="btn" data-nav="expenses">Expense records</button><button class="btn" data-nav="time">Time</button><button class="btn" data-nav="payroll">Payroll</button></div></div></div>`;
  };
  renderGetThingsDoneTemplates=function(){
    injectV13GetThingsDoneStyles();
    const workflows=[
      {title:'Sales workflow',desc:'From sellable item setup to collections, including delayed charges and customer credits.',steps:['Products / services','Customers','Estimate or invoice','Add delayed charges','Apply customer credits','Receive payment','Deposit'],nav:'sales'},
      {title:'Vendor payment workflow',desc:'From vendor setup to payment completion, including credits and check printing.',steps:['Vendor','Bill or expense','Apply vendor credit','Pay bill','Print checks','Match bank transaction'],nav:'expenses'},
      {title:'Time and payroll workflow',desc:'Capture team time, review it, and connect it to payroll records.',steps:['Employee / contractor','Single time activity','Weekly timesheet','Review time','Run payroll','Review payroll records'],nav:'payroll'},
      {title:'Month-end close workflow',desc:'Complete the accounting cycle before management reporting.',steps:['Review bank feed','A/R and A/P review','Credits and delayed charges','Reconcile bank','Review tax','Run reports'],nav:'reports'}
    ];
    return `<div class="v13-workflow-grid">${workflows.map(w=>`<div class="v13-workflow-card"><h3>${escapeHTML(w.title)}</h3><p>${escapeHTML(w.desc)}</p><div class="v13-workflow-steps">${w.steps.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div><button class="btn primary" data-nav="${w.nav}">Start workflow</button></div>`).join('')}</div>`;
  };
  const renderGetThingsDoneBeforeV13 = renderGetThingsDone;
  renderGetThingsDone=function(){ injectV13GetThingsDoneStyles(); renderGetThingsDoneBeforeV13(); };
  injectV13GetThingsDoneStyles();




  // User-facing language cleanup
  function cleanUserFacingLanguage(root=document){
    try{
      const replacements = [
        [/\bV\d+(?:\.\d+)?\s*workflow summary\b/gi, 'Workflow summary'],
        [/\bV\d+(?:\.\d+)?\s*workflow integration\b/gi, 'Connected workflow records'],
        [/\bincluding\s+V\d+(?:\.\d+)?\/V\d+(?:\.\d+)?\s+records\s+such\s+as\s+/gi, 'including '],
        [/\bSupplemental workflow records created in V\d+(?:\.\d+)?\/V\d+(?:\.\d+)? are visible here\./gi, 'Additional records created from + New are visible here.'],
        [/\bThis V\d+(?:\.\d+)?\s+prototype stores data\b/gi, 'Your company data is stored'],
        [/\bprototype\b/gi, 'workspace'],
        [/\bplaceholder action in V\d+(?:\.\d+)?\b/gi, 'action not available yet'],
        [/\bPlaceholder page\./gi, 'This workspace is available for setup.'],
        [/\bThis workflow is planned for a future version\./gi, 'Choose an available action or complete the related setup.'],
        [/\bThis page is ready for future workflow expansion\./gi, 'This workspace is ready for setup.'],
        [/\bV\d+(?:\.\d+)?\s+logo fix:/gi, 'Branding note:'],
        [/\bV\d+(?:\.\d+)?\s+Backup export started\./gi, 'Backup export started.'],
        [/\bV\d+(?:\.\d+)?\s+demo data reset\./gi, 'Company data reset.']
      ];
      const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
          const parent=node.parentElement;
          if(!parent || ['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes=[];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node=>{
        let value=node.nodeValue;
        replacements.forEach(([pattern, replacement])=>{ value=value.replace(pattern, replacement); });
        node.nodeValue=value;
      });
    }catch(e){}
  }
  const renderAllBeforeLanguageCleanup = renderAll;
  renderAll = function(){ renderAllBeforeLanguageCleanup(); cleanUserFacingLanguage(document.body); };
  const openModalBeforeLanguageCleanup = openModal;
  openModal = function(type){ openModalBeforeLanguageCleanup(type); cleanUserFacingLanguage(document.getElementById('modalBackdrop') || document.body); };
  const showToastBeforeLanguageCleanup = showToast;
  showToast = function(message){
    let msg = String(message ?? '')
      .replace(/\bV\d+(?:\.\d+)?\s+Backup export started\./gi,'Backup export started.')
      .replace(/\bV\d+(?:\.\d+)?\s+demo data reset\./gi,'Company data reset.')
      .replace(/\bprototype\b/gi,'workspace');
    showToastBeforeLanguageCleanup(msg);
  };


  // ---------- Estimate workflow upgrade ----------
  function injectEstimateWorkflowStyles(){
    if(document.getElementById('estimate-workflow-styles')) return;
    const style=document.createElement('style');
    style.id='estimate-workflow-styles';
    style.textContent=`
      body.v8-ui .estimate-form-shell{display:grid;gap:16px}
      body.v8-ui .estimate-doc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      body.v8-ui .estimate-doc-grid .full{grid-column:1/-1}
      body.v8-ui .estimate-lines-wrap{border:1px solid #dce5ec;border-radius:16px;background:#fbfcfd;overflow:auto}
      body.v8-ui .estimate-lines-table{min-width:860px;width:100%;border-collapse:collapse}
      body.v8-ui .estimate-lines-table th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#667085;background:#f1f5f8;padding:9px;border-bottom:1px solid #dce5ec}
      body.v8-ui .estimate-lines-table td{padding:8px;border-bottom:1px solid #e8edf2;background:#fff;vertical-align:top}
      body.v8-ui .estimate-lines-table input,body.v8-ui .estimate-lines-table select{width:100%;border:1px solid #cbd5df;border-radius:9px;padding:7px 8px;background:#fff;font:inherit;min-width:0}
      body.v8-ui .estimate-lines-table .num{text-align:right}
      body.v8-ui .estimate-line-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;align-items:center;margin-top:8px}
      body.v8-ui .estimate-summary-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:16px;align-items:start}
      body.v8-ui .estimate-summary-box{border:1px solid #dce5ec;border-radius:16px;background:#fff;padding:14px;display:grid;gap:8px}
      body.v8-ui .estimate-summary-box .report-line{padding:6px 0}
      body.v8-ui .estimate-summary-box .total{font-size:18px}
      body.v8-ui .estimate-textareas{display:grid;gap:12px}
      body.v8-ui .estimate-textareas textarea{min-height:78px}
      body.v8-ui .estimate-hub{margin-top:16px}
      body.v8-ui .estimate-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
      body.v8-ui .estimate-kpi{border:1px solid #e1e8ef;border-radius:16px;background:#fff;padding:14px}
      body.v8-ui .estimate-kpi span{display:block;color:#667085;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
      body.v8-ui .estimate-kpi strong{font-size:22px;letter-spacing:-.03em}
      body.v8-ui .estimate-actions{display:flex;gap:6px;flex-wrap:wrap}
      body.v8-ui .estimate-actions .btn{font-size:12px;padding:6px 9px}
      body.v8-ui.dark-mode .estimate-lines-wrap,body.v8-ui.dark-mode .estimate-summary-box,body.v8-ui.dark-mode .estimate-kpi{background:#14202d;border-color:#2a3c4f;color:#e8edf3}
      body.v8-ui.dark-mode .estimate-lines-table th{background:#101b27;color:#d4e0ec;border-bottom-color:#2a3c4f}
      body.v8-ui.dark-mode .estimate-lines-table td{background:#14202d;border-bottom-color:#27394b}
      body.v8-ui.dark-mode .estimate-lines-table input,body.v8-ui.dark-mode .estimate-lines-table select{background:#0f1924;border-color:#3a5065;color:#edf3f8}
      @media(max-width:980px){body.v8-ui .estimate-doc-grid,body.v8-ui .estimate-summary-grid,body.v8-ui .estimate-kpi-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function estimateNextNumber(){
    const nums=(state.estimates||[]).map(e=>String(e.estimateNumber||e.id||'').match(/(\d+)$/)?.[1]).filter(Boolean).map(Number);
    const next=(nums.length?Math.max(...nums):5000)+1;
    return `EST-${next}`;
  }
  function estimateDefaultLine(line={}){
    const products=(state.products||[]);
    const first=products[0]||{};
    const productId=line.productId || first.id || '';
    const product=products.find(p=>p.id===productId) || first || {};
    const desc=line.desc || line.description || product.name || 'Service item';
    const qty=num(line.qty || 1);
    const rate=num(line.rate ?? product.price ?? 0);
    const taxRate=num(line.taxRate ?? state.company?.salesTax ?? 5);
    return {productId, desc, qty, rate, taxRate};
  }
  function estimateLineRow(line={}, idx=0){
    const l=estimateDefaultLine(line);
    return `<tr class="estimate-line-row">
      <td style="width:190px"><select name="lineProductId" data-estimate-product>${productOptions().replace(`value="${escapeHTML(l.productId)}"`, `value="${escapeHTML(l.productId)}" selected`)}</select></td>
      <td><input name="lineDesc" value="${escapeHTML(l.desc)}" placeholder="Describe the work, product, or service"></td>
      <td style="width:88px"><input class="num" data-estimate-qty name="lineQty" type="number" min="0" step="0.01" value="${l.qty}"></td>
      <td style="width:110px"><input class="num" data-estimate-rate name="lineRate" type="number" min="0" step="0.01" value="${l.rate}"></td>
      <td style="width:92px"><input class="num" data-estimate-tax name="lineTaxRate" type="number" min="0" step="0.01" value="${l.taxRate}"></td>
      <td style="width:120px"><input class="num" data-estimate-line-amount value="${money(l.qty*l.rate)}" readonly></td>
      <td style="width:70px;text-align:center"><button class="btn square" type="button" data-estimate-remove-line title="Remove line">×</button></td>
    </tr>`;
  }
  function estimateFormHTML(record=null){
    injectEstimateWorkflowStyles();
    const e=record || {};
    const lines=(e.items&&e.items.length?e.items:[estimateDefaultLine(), estimateDefaultLine({desc:'Optional materials / deliverables', qty:0, rate:0})]);
    const customer=getCustomer(e.customerId || (state.customers?.[0]||{}).id) || {};
    const customerEmail=e.customerEmail || customer.email || '';
    const defaultExpiry=(()=>{ const d=new Date((e.date||todayISO())+'T00:00:00'); d.setDate(d.getDate()+30); return d.toISOString().slice(0,10); })();
    return `<div class="estimate-form-shell">
      <div class="estimate-doc-grid">
        <div class="field"><label>Customer</label><select name="customerId" data-estimate-customer required>${customerOptions()}</select></div>
        <div class="field"><label>Estimate #</label><input name="estimateNumber" value="${escapeHTML(e.estimateNumber || e.id || estimateNextNumber())}" required></div>
        <div class="field"><label>Estimate date</label><input type="date" name="date" value="${escapeHTML(e.date || todayISO())}" required></div>
        <div class="field"><label>Expiry date</label><input type="date" name="expiryDate" value="${escapeHTML(e.expiryDate || defaultExpiry)}"></div>
        <div class="field"><label>Status</label><select name="status"><option ${e.status==='Draft'?'selected':''}>Draft</option><option ${e.status==='Sent'?'selected':''}>Sent</option><option ${e.status==='Accepted'?'selected':''}>Accepted</option><option ${e.status==='Declined'?'selected':''}>Declined</option><option ${e.status==='Closed'?'selected':''}>Closed</option></select></div>
        <div class="field"><label>Project / job name</label><input name="projectName" value="${escapeHTML(e.projectName || '')}" placeholder="Optional project or job"></div>
        <div class="field"><label>Customer email</label><input type="email" name="customerEmail" value="${escapeHTML(customerEmail)}" placeholder="customer@example.com"></div>
        <div class="field"><label>Prepared by</label><input name="preparedBy" value="${escapeHTML(e.preparedBy || state.company?.name || 'SmartBooks user')}"></div>
        <div class="field full"><label>Billing address</label><input name="billingAddress" value="${escapeHTML(e.billingAddress || '')}" placeholder="Customer billing address"></div>
        <div class="field full"><label>Shipping / service address</label><input name="serviceAddress" value="${escapeHTML(e.serviceAddress || '')}" placeholder="Where products/services will be delivered"></div>
      </div>
      <div>
        <h4 style="margin:0 0 8px">Estimate line items</h4>
        <div class="estimate-lines-wrap">
          <table class="estimate-lines-table">
            <thead><tr><th>Product / Service</th><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Amount</th><th></th></tr></thead>
            <tbody id="estimateLineBody">${lines.map(estimateLineRow).join('')}</tbody>
          </table>
        </div>
        <div class="estimate-line-actions">
          <button class="btn" type="button" data-estimate-add-line>＋ Add line</button>
          <span class="muted small">Amounts update automatically from quantity, rate, discount, tax, and deposit.</span>
        </div>
      </div>
      <div class="estimate-summary-grid">
        <div class="estimate-textareas">
          <div class="field"><label>Customer message</label><textarea name="customerMessage" placeholder="Message shown on the estimate">${escapeHTML(e.customerMessage || 'Thank you for the opportunity to provide this estimate.')}</textarea></div>
          <div class="field"><label>Scope of work / assumptions</label><textarea name="scope" placeholder="Describe scope, assumptions, exclusions, or delivery terms">${escapeHTML(e.scope || '')}</textarea></div>
          <div class="field"><label>Terms and conditions</label><textarea name="terms" placeholder="Payment terms, validity, acceptance terms">${escapeHTML(e.terms || 'This estimate is valid until the expiry date above. Work starts after written acceptance.')}</textarea></div>
          <div class="field"><label>Internal memo</label><textarea name="memo" placeholder="Internal notes not shown to the customer">${escapeHTML(e.memo || '')}</textarea></div>
        </div>
        <div class="estimate-summary-box">
          <div class="field"><label>Discount</label><input id="estimateDiscount" name="discount" type="number" min="0" step="0.01" value="${num(e.discount || 0)}"></div>
          <div class="field"><label>Deposit required</label><input id="estimateDeposit" name="deposit" type="number" min="0" step="0.01" value="${num(e.deposit || 0)}"></div>
          <div class="report-line"><span>Subtotal</span><strong id="estimateSubtotalPreview">${money(num(e.subtotal||0))}</strong></div>
          <div class="report-line"><span>Tax</span><strong id="estimateTaxPreview">${money(num(e.tax||0))}</strong></div>
          <div class="report-line"><span>Discount</span><strong id="estimateDiscountPreview">${money(num(e.discount||0))}</strong></div>
          <div class="report-line total"><span>Total estimate</span><span id="estimateTotalPreview">${money(num(e.total||0))}</span></div>
          <div class="report-line"><span>Balance after deposit</span><strong id="estimateBalancePreview">${money(Math.max(0,num(e.total)-num(e.deposit)))}</strong></div>
        </div>
      </div>
    </div>`;
  }
  function estimateCollectForm(form){
    const f=new FormData(form);
    const productIds=f.getAll('lineProductId');
    const descs=f.getAll('lineDesc');
    const qtys=f.getAll('lineQty');
    const rates=f.getAll('lineRate');
    const taxRates=f.getAll('lineTaxRate');
    const items=productIds.map((productId,i)=>({
      productId,
      desc:String(descs[i]||'').trim() || 'Estimate line',
      qty:num(qtys[i]),
      rate:num(rates[i]),
      taxRate:num(taxRates[i])
    })).filter(x=>x.qty>0 || x.rate>0 || x.desc);
    const subtotal=items.reduce((s,x)=>s+(num(x.qty)*num(x.rate)),0);
    const tax=items.reduce((s,x)=>s+(num(x.qty)*num(x.rate)*num(x.taxRate)/100),0);
    const discount=Math.min(num(f.get('discount')), subtotal+tax);
    const total=Math.max(0, subtotal + tax - discount);
    const deposit=Math.min(num(f.get('deposit')), total);
    return {
      customerId:String(f.get('customerId')||''),
      estimateNumber:String(f.get('estimateNumber')||'').trim(),
      date:String(f.get('date')||todayISO()),
      expiryDate:String(f.get('expiryDate')||''),
      status:String(f.get('status')||'Draft'),
      projectName:String(f.get('projectName')||'').trim(),
      customerEmail:String(f.get('customerEmail')||'').trim(),
      preparedBy:String(f.get('preparedBy')||'').trim(),
      billingAddress:String(f.get('billingAddress')||'').trim(),
      serviceAddress:String(f.get('serviceAddress')||'').trim(),
      customerMessage:String(f.get('customerMessage')||'').trim(),
      scope:String(f.get('scope')||'').trim(),
      terms:String(f.get('terms')||'').trim(),
      memo:String(f.get('memo')||'').trim(),
      items, subtotal, tax, discount, total, deposit, balance:Math.max(0,total-deposit)
    };
  }
  function bindEstimateForm(){
    injectEstimateWorkflowStyles();
    const body=document.getElementById('estimateLineBody');
    if(!body) return;
    const recalc=()=>{
      let subtotal=0, tax=0;
      body.querySelectorAll('.estimate-line-row').forEach(row=>{
        const qty=num(row.querySelector('[data-estimate-qty]')?.value);
        const rate=num(row.querySelector('[data-estimate-rate]')?.value);
        const taxRate=num(row.querySelector('[data-estimate-tax]')?.value);
        const amount=qty*rate;
        subtotal+=amount; tax+=amount*taxRate/100;
        const amountEl=row.querySelector('[data-estimate-line-amount]');
        if(amountEl) amountEl.value=money(amount);
      });
      const discount=Math.min(num(document.getElementById('estimateDiscount')?.value), subtotal+tax);
      const total=Math.max(0, subtotal+tax-discount);
      const deposit=Math.min(num(document.getElementById('estimateDeposit')?.value), total);
      const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=money(val); };
      set('estimateSubtotalPreview',subtotal); set('estimateTaxPreview',tax); set('estimateDiscountPreview',discount); set('estimateTotalPreview',total); set('estimateBalancePreview',Math.max(0,total-deposit));
    };
    const syncProduct=row=>{
      const sel=row.querySelector('[data-estimate-product]');
      const opt=sel?.selectedOptions?.[0];
      if(!opt) return;
      const rate=row.querySelector('[data-estimate-rate]');
      const desc=row.querySelector('input[name="lineDesc"]');
      if(rate && !num(rate.value)) rate.value=Number(opt.dataset.price||0).toFixed(2);
      if(desc && (!desc.value || desc.value==='Service item')) desc.value=(opt.textContent||'').split(' · ')[0];
      recalc();
    };
    body.addEventListener('input', recalc);
    body.addEventListener('change', e=>{ if(e.target.matches('[data-estimate-product]')) syncProduct(e.target.closest('tr')); });
    document.querySelector('[data-estimate-add-line]')?.addEventListener('click', ()=>{
      body.insertAdjacentHTML('beforeend', estimateLineRow({qty:1, rate:0, taxRate:state.company?.salesTax||5}));
      recalc();
    });
    body.addEventListener('click', e=>{
      const btn=e.target.closest('[data-estimate-remove-line]');
      if(btn){
        const rows=body.querySelectorAll('.estimate-line-row');
        if(rows.length<=1){ showToast('Estimate needs at least one line.'); return; }
        btn.closest('tr')?.remove(); recalc();
      }
    });
    document.querySelector('[data-estimate-customer]')?.addEventListener('change', e=>{
      const customer=getCustomer(e.target.value)||{};
      const email=document.querySelector('input[name="customerEmail"]');
      if(email && !email.value) email.value=customer.email||'';
    });
    ['estimateDiscount','estimateDeposit'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc));
    recalc();
  }
  const estimateModalBodyBase = modalBodyContent;
  modalBodyContent=function(type){
    if(type==='estimate') return estimateFormHTML();
    if(String(type).startsWith('estimateEdit:')){
      const id=String(type).split(':')[1];
      const record=(state.estimates||[]).find(e=>e.id===id || e.estimateNumber===id);
      return estimateFormHTML(record);
    }
    return estimateModalBodyBase(type);
  };
  const estimateBindModalBase = bindModalLiveCalculations;
  bindModalLiveCalculations=function(type){
    estimateBindModalBase(type);
    if(type==='estimate' || String(type).startsWith('estimateEdit:')) bindEstimateForm();
  };
  const estimateOpenModalBase = openModal;
  openModal=function(type){
    estimateOpenModalBase(type);
    if(type==='estimate' || String(type).startsWith('estimateEdit:')){
      document.getElementById('modalTitle').textContent = String(type).startsWith('estimateEdit:') ? 'Edit estimate' : 'Create estimate';
      document.getElementById('modalSubtitle').textContent = 'Prepare a detailed non-posting quote with line items, tax, terms, and acceptance workflow.';
      const modal=document.querySelector('#modalBackdrop .modal');
      if(modal) modal.classList.add('wide');
    }
  };
  const estimateSubmitModalBase = submitModal;
  submitModal=function(e){
    if(currentModal==='estimate' || String(currentModal).startsWith('estimateEdit:')){
      e.preventDefault();
      const data=estimateCollectForm(e.target);
      if(!data.customerId){ showToast('Customer is required.'); return; }
      if(!data.items.length){ showToast('Estimate needs at least one line item.'); return; }
      if(data.total<=0){ showToast('Estimate total must be greater than zero.'); return; }
      if(String(currentModal).startsWith('estimateEdit:')){
        const id=String(currentModal).split(':')[1];
        const idx=(state.estimates||[]).findIndex(x=>x.id===id || x.estimateNumber===id);
        if(idx>=0){
          state.estimates[idx]={...state.estimates[idx],...data, id:state.estimates[idx].id, estimateNumber:data.estimateNumber||state.estimates[idx].estimateNumber||state.estimates[idx].id, updatedAt:new Date().toISOString()};
          audit(`Estimate ${state.estimates[idx].estimateNumber||state.estimates[idx].id} updated`);
          showToast('Estimate updated. View it under Sales → Estimates.');
        }
      }else{
        const est={id:uid('EST'), ...data, estimateNumber:data.estimateNumber||estimateNextNumber(), createdAt:new Date().toISOString()};
        state.estimates.unshift(est);
        audit(`Estimate ${est.estimateNumber||est.id} created for ${getCustomer(est.customerId).name}`);
        showToast('Estimate saved. View it under Sales → Estimates.');
      }
      saveState(); closeModal(); renderAll(); return;
    }
    return estimateSubmitModalBase(e);
  };
  function estimateAmount(e){ return num(e.total ?? e.amount ?? 0); }
  function estimateStatusTag(status){
    const s=String(status||'Draft');
    if(s==='Accepted') return '<span class="tag paid">Accepted</span>';
    if(s==='Sent') return '<span class="tag sent">Sent</span>';
    if(s==='Declined' || s==='Closed') return '<span class="tag overdue">'+escapeHTML(s)+'</span>';
    return '<span class="tag draft">'+escapeHTML(s)+'</span>';
  }
  function renderEstimateHub(){
    injectEstimateWorkflowStyles();
    const estimates=(state.estimates||[]);
    const draft=estimates.filter(e=>String(e.status||'Draft')==='Draft').length;
    const sent=estimates.filter(e=>String(e.status||'')==='Sent').length;
    const accepted=estimates.filter(e=>String(e.status||'')==='Accepted').length;
    const total=estimates.reduce((s,e)=>s+estimateAmount(e),0);
    const rows=estimates.map(e=>[
      `<strong>${escapeHTML(e.estimateNumber||e.id)}</strong><div class="muted small">${escapeHTML(e.projectName||'')}</div>`,
      escapeHTML(getCustomer(e.customerId).name),
      escapeHTML(e.date||''),
      escapeHTML(e.expiryDate||''),
      estimateStatusTag(e.status),
      `<span class="amount">${money(estimateAmount(e))}</span>`,
      `<div class="estimate-actions">
        <button class="btn" data-action="edit-estimate" data-id="${escapeHTML(e.id)}">Edit</button>
        <button class="btn" data-action="mark-estimate-sent" data-id="${escapeHTML(e.id)}">Sent</button>
        <button class="btn" data-action="mark-estimate-accepted" data-id="${escapeHTML(e.id)}">Accept</button>
        <button class="btn" data-action="mark-estimate-declined" data-id="${escapeHTML(e.id)}">Decline</button>
        <button class="btn primary" data-action="convert-estimate-invoice" data-id="${escapeHTML(e.id)}">Convert</button>
      </div>`
    ]);
    return `<div class="estimate-hub">
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid">
        <div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div>
        <div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div>
        <div class="estimate-kpi"><span>Sent</span><strong>${sent}</strong></div>
        <div class="estimate-kpi"><span>Accepted</span><strong>${accepted}</strong></div>
      </div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div>
    </div>`;
  }
  const estimateRenderSalesBase=renderSales;
  renderSales=function(){
    estimateRenderSalesBase();
    const el=document.getElementById('page-sales');
    if(el && !el.querySelector('.estimate-hub')) el.insertAdjacentHTML('beforeend', renderEstimateHub());
  };
  function estimateCustomerActivityHTML(){
    const estimates=(state.estimates||[]).slice(0,8);
    if(!estimates.length) return '';
    return `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Recent estimates by customer</h3><div class="muted small">Estimates created from + New are visible here and under Sales → Estimates.</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total'], estimates.map(e=>[`<strong>${escapeHTML(e.estimateNumber||e.id)}</strong>`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),estimateStatusTag(e.status),`<span class="amount">${money(estimateAmount(e))}</span>`]))}</div>`;
  }
  const estimateRenderCustomersBase=renderCustomers;
  renderCustomers=function(){
    estimateRenderCustomersBase();
    const el=document.getElementById('page-customers');
    if(el && !el.querySelector('[data-estimate-customer-activity]')){
      el.insertAdjacentHTML('beforeend', `<div data-estimate-customer-activity>${estimateCustomerActivityHTML()}</div>`);
    }
  };
  function convertEstimateToInvoice(id){
    const e=(state.estimates||[]).find(x=>x.id===id);
    if(!e){ showToast('Estimate not found.'); return; }
    const inv={id:uid('INV'), customerId:e.customerId, date:todayISO(), dueDate:addDaysISO(30), status:'Draft', subtotal:num(e.subtotal), tax:num(e.tax), paid:0, incomeAccountId:(e.items?.[0]?.incomeAccountId)||'4000', items:(e.items||[]).map(x=>({desc:x.desc, qty:num(x.qty), rate:num(x.rate)})), sourceEstimateId:e.id};
    state.invoices.unshift(inv);
    e.status='Accepted';
    e.convertedInvoiceId=inv.id;
    audit(`Estimate ${e.estimateNumber||e.id} converted to invoice ${inv.id}`);
    saveState(); renderAll(); showToast(`Estimate converted to draft invoice ${inv.id}.`);
  }
  const estimateHandleActionBase=handleAction;
  handleAction=function(action,id){
    if(action==='edit-estimate'){ openModal('estimateEdit:'+id); return; }
    if(action==='mark-estimate-sent' || action==='mark-estimate-accepted' || action==='mark-estimate-declined'){
      const e=(state.estimates||[]).find(x=>x.id===id);
      if(!e){ showToast('Estimate not found.'); return; }
      e.status=action==='mark-estimate-sent'?'Sent':action==='mark-estimate-accepted'?'Accepted':'Declined';
      e.updatedAt=new Date().toISOString();
      audit(`Estimate ${e.estimateNumber||e.id} marked ${e.status}`);
      saveState(); renderAll(); showToast(`Estimate marked ${e.status}.`); return;
    }
    if(action==='convert-estimate-invoice'){ convertEstimateToInvoice(id); return; }
    return estimateHandleActionBase(action,id);
  };
  const estimateRenderGetThingsDoneTasksBase = renderGetThingsDoneTasks;
  renderGetThingsDoneTasks=function(){
    const base=estimateRenderGetThingsDoneTasksBase();
    const accepted=(state.estimates||[]).filter(e=>String(e.status||'')==='Accepted' && !e.convertedInvoiceId);
    if(!accepted.length) return base;
    const card=`<div class="card" style="margin-top:16px"><h3>Estimate follow-up</h3><div class="gtd-task-list">${accepted.map(e=>`<div class="gtd-task priority"><span class="gtd-task-icon">▤</span><div><strong>${escapeHTML(e.estimateNumber||e.id)} is accepted</strong><span>Convert this estimate for ${escapeHTML(getCustomer(e.customerId).name)} into a draft invoice.</span></div><button class="btn primary" data-action="convert-estimate-invoice" data-id="${escapeHTML(e.id)}">Convert</button></div>`).join('')}</div></div>`;
    return base + card;
  };
  injectEstimateWorkflowStyles();



  // ---------- Estimate-to-payment workflow hub ----------
  function injectEstimateToPaymentWorkflowStyles(){
    if(document.getElementById('estimate-to-payment-workflow-styles')) return;
    const style=document.createElement('style');
    style.id='estimate-to-payment-workflow-styles';
    style.textContent=`
      body.v8-ui .estimate-payment-card{border:1px solid #dce8df;background:linear-gradient(180deg,#ffffff,#f8fffb);border-radius:20px;padding:18px;margin:0 0 16px;box-shadow:0 4px 18px rgba(16,24,40,.055)}
      body.v8-ui .estimate-payment-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
      body.v8-ui .estimate-payment-head h3{margin:0;font-size:18px;letter-spacing:-.02em;color:#172033}
      body.v8-ui .estimate-payment-head p{margin:5px 0 0;color:var(--muted,#667085);line-height:1.45;max-width:760px}
      body.v8-ui .estimate-payment-summary{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:12px 0 16px}
      body.v8-ui .estimate-payment-stat{border:1px solid #e1e8ef;background:#fff;border-radius:14px;padding:12px;min-height:82px}
      body.v8-ui .estimate-payment-stat span{display:block;color:var(--muted,#667085);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;line-height:1.25}
      body.v8-ui .estimate-payment-stat strong{display:block;font-size:22px;margin-top:5px;letter-spacing:-.03em;color:#172033}
      body.v8-ui .estimate-payment-flow{display:grid;grid-template-columns:repeat(7,minmax(108px,1fr));gap:10px;align-items:stretch}
      body.v8-ui .estimate-payment-step{position:relative;border:1px solid #e1e8ef;background:#fff;border-radius:16px;padding:13px 10px;min-height:132px;display:grid;grid-template-rows:auto auto 1fr auto;gap:6px;text-align:center;box-shadow:0 2px 8px rgba(16,24,40,.035)}
      body.v8-ui .estimate-payment-step:after{content:"→";position:absolute;right:-13px;top:48%;transform:translateY(-50%);color:#98a2b3;font-weight:950;font-size:18px;z-index:2}
      body.v8-ui .estimate-payment-step:last-child:after{display:none}
      body.v8-ui .estimate-payment-icon{width:42px;height:42px;border-radius:50%;border:2px solid #63ad52;background:#f8fffb;color:#0a8f3c;display:grid;place-items:center;margin:0 auto;font-weight:950;font-size:18px}
      body.v8-ui .estimate-payment-step strong{font-size:13px;line-height:1.2;color:#172033}
      body.v8-ui .estimate-payment-step small{display:block;color:var(--muted,#667085);font-size:11px;line-height:1.25}
      body.v8-ui .estimate-payment-step .btn{font-size:11px;padding:6px 8px;align-self:end;justify-self:center}
      body.v8-ui .estimate-payment-step.attention{border-color:#fed7aa;background:#fffbeb}.estimate-payment-step.attention .estimate-payment-icon{border-color:#f59e0b;background:#fff7ed;color:#b45309}
      body.v8-ui .estimate-payment-step.done{border-color:#bbf7d0;background:#f7fef9}.estimate-payment-step.done .estimate-payment-icon{border-color:#22c55e;color:#15803d}
      body.v8-ui .estimate-payment-followups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
      body.v8-ui .estimate-payment-followup{border:1px solid #e1e8ef;border-radius:14px;background:#fff;padding:12px}
      body.v8-ui .estimate-payment-followup strong{display:block}.estimate-payment-followup span{display:block;color:var(--muted,#667085);font-size:12px;margin-top:3px;line-height:1.3}
      body.v8-ui.dark-mode .estimate-payment-card{background:#14202d;border-color:#2a3c4f}.v8-ui.dark-mode .estimate-payment-stat,.v8-ui.dark-mode .estimate-payment-step,.v8-ui.dark-mode .estimate-payment-followup{background:#101b27;border-color:#2a3c4f;color:#e8edf3}.v8-ui.dark-mode .estimate-payment-head h3,.v8-ui.dark-mode .estimate-payment-step strong,.v8-ui.dark-mode .estimate-payment-stat strong{color:#f8fafc}
      @media(max-width:1280px){body.v8-ui .estimate-payment-summary{grid-template-columns:repeat(3,minmax(0,1fr))}body.v8-ui .estimate-payment-flow{grid-template-columns:repeat(4,minmax(108px,1fr))}.estimate-payment-step:after{display:none}}
      @media(max-width:760px){body.v8-ui .estimate-payment-summary,body.v8-ui .estimate-payment-flow,body.v8-ui .estimate-payment-followups{grid-template-columns:1fr}.estimate-payment-head{display:block}}
    `;
    document.head.appendChild(style);
  }
  function estimatePaymentWorkflowSummary(){
    const estimates=(state.estimates||[]);
    const invoices=(state.invoices||[]);
    const payments=(state.payments||[]);
    const draftEst=estimates.filter(e=>String(e.status||'Draft')==='Draft');
    const sentEst=estimates.filter(e=>String(e.status||'')==='Sent');
    const acceptedWaiting=estimates.filter(e=>String(e.status||'')==='Accepted' && !e.convertedInvoiceId);
    const converted=estimates.filter(e=>e.convertedInvoiceId);
    const draftInv=invoices.filter(i=>String(i.status||'Draft')==='Draft');
    const openInv=invoices.filter(i=>typeof openAmount==='function' ? openAmount(i)>0.005 : num(i.total||i.subtotal||0)>num(i.paid||0));
    const unpaidOpenTotal=openInv.reduce((s,i)=>s+(typeof openAmount==='function'?openAmount(i):Math.max(0,num(i.total||i.subtotal||0)-num(i.paid||0))),0);
    const paymentsToDeposit=payments.filter(p=>{
      const a=String(p.accountId||p.depositTo||'').toLowerCase();
      return !a || a.includes('undeposited') || a==='1400';
    });
    const depositedPayments=payments.filter(p=>!paymentsToDeposit.includes(p));
    return {estimates,draftEst,sentEst,acceptedWaiting,converted,draftInv,openInv,unpaidOpenTotal,paymentsToDeposit,depositedPayments};
  }
  function estimatePaymentStepClass(count){
    return count>0 ? 'attention' : 'done';
  }
  function estimatePaymentWorkflowCard(){
    injectEstimateToPaymentWorkflowStyles();
    const s=estimatePaymentWorkflowSummary();
    const acceptedText=s.acceptedWaiting.length ? `${s.acceptedWaiting.length} waiting for invoice` : 'No accepted estimates waiting';
    const openInvoiceText=s.openInv.length ? `${s.openInv.length} open invoice${s.openInv.length===1?'':'s'}` : 'No open invoices';
    const depositText=s.paymentsToDeposit.length ? `${s.paymentsToDeposit.length} payment${s.paymentsToDeposit.length===1?'':'s'} to deposit` : 'Payments deposited to bank';
    const steps=[
      {icon:'▤',title:'Create estimate',desc:`${s.draftEst.length} draft estimate${s.draftEst.length===1?'':'s'}`,cls:estimatePaymentStepClass(s.draftEst.length),button:'Create',modal:'estimate'},
      {icon:'✉',title:'Send estimate',desc:`${s.sentEst.length} sent estimate${s.sentEst.length===1?'':'s'}`,cls:estimatePaymentStepClass(s.sentEst.length),button:'Open estimates',nav:'sales'},
      {icon:'✓',title:'Customer accepts',desc:acceptedText,cls:estimatePaymentStepClass(s.acceptedWaiting.length),button:'Review',nav:'sales'},
      {icon:'⇢',title:'Convert to invoice',desc:`${s.converted.length} converted estimate${s.converted.length===1?'':'s'}`,cls:estimatePaymentStepClass(s.acceptedWaiting.length),button:'Convert',nav:'sales'},
      {icon:'▧',title:'Send invoice',desc:`${s.draftInv.length} draft invoice${s.draftInv.length===1?'':'s'}`,cls:estimatePaymentStepClass(s.draftInv.length),button:'Invoices',nav:'sales'},
      {icon:'$',title:'Receive payment',desc:openInvoiceText,cls:estimatePaymentStepClass(s.openInv.length),button:'Receive',modal:'payment'},
      {icon:'◉',title:'Deposit to bank',desc:depositText,cls:estimatePaymentStepClass(s.paymentsToDeposit.length),button:'Deposit',modal:'deposit'}
    ];
    const stat = (label,value)=>`<div class="estimate-payment-stat"><span>${escapeHTML(label)}</span><strong>${escapeHTML(String(value))}</strong></div>`;
    return `<div class="estimate-payment-card" data-estimate-payment-workflow>
      <div class="estimate-payment-head">
        <div><h3>Estimate to payment workflow</h3><p>Follow the full money-in path from quote creation to invoice, payment, deposit, and cash-flow update.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="estimate">Create estimate</button><button class="btn primary" data-nav="sales">View sales records</button></div>
      </div>
      <div class="estimate-payment-summary">
        ${stat('Draft estimates',s.draftEst.length)}
        ${stat('Sent estimates',s.sentEst.length)}
        ${stat('Accepted to invoice',s.acceptedWaiting.length)}
        ${stat('Draft invoices',s.draftInv.length)}
        ${stat('Open invoice amount',money(s.unpaidOpenTotal))}
        ${stat('Payments to deposit',s.paymentsToDeposit.length)}
      </div>
      <div class="estimate-payment-flow">
        ${steps.map(step=>`<div class="estimate-payment-step ${step.cls}"><span class="estimate-payment-icon">${step.icon}</span><strong>${escapeHTML(step.title)}</strong><small>${escapeHTML(step.desc)}</small><button class="btn ${step.modal==='payment'||step.modal==='deposit'?'primary':''}" ${step.modal?`data-modal="${step.modal}"`:`data-nav="${step.nav}"`}>${escapeHTML(step.button)}</button></div>`).join('')}
      </div>
      <div class="estimate-payment-followups">
        <div class="estimate-payment-followup"><strong>Where estimates go</strong><span>Saved estimates appear in Sales → Estimates and in customer activity.</span></div>
        <div class="estimate-payment-followup"><strong>Next action after acceptance</strong><span>Accepted estimates should be converted into draft invoices before billing.</span></div>
        <div class="estimate-payment-followup"><strong>Cash-flow impact</strong><span>Cash flow updates after payment is received and deposited to a bank account.</span></div>
      </div>
    </div>`;
  }
  const estimatePaymentRenderGetThingsDoneFlowBase = renderGetThingsDoneFlow;
  renderGetThingsDoneFlow=function(){
    const base=estimatePaymentRenderGetThingsDoneFlowBase();
    return estimatePaymentWorkflowCard() + base;
  };
  const estimatePaymentRenderGetThingsDoneTemplatesBase = renderGetThingsDoneTemplates;
  renderGetThingsDoneTemplates=function(){
    const workflow=`<div class="gtd-template" style="margin-bottom:14px"><h3>Estimate to payment</h3><p>Create the estimate, send it, mark it accepted, convert it to invoice, receive payment, then deposit it to the bank.</p><div class="gtd-template-steps"><span>Create estimate</span><span>Send</span><span>Accept</span><span>Convert</span><span>Invoice</span><span>Payment</span><span>Deposit</span></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-modal="estimate">Create estimate</button><button class="btn primary" data-nav="sales">Open Sales</button></div></div>`;
    return workflow + estimatePaymentRenderGetThingsDoneTemplatesBase();
  };
  const estimatePaymentRenderGetThingsDoneTasksBase = renderGetThingsDoneTasks;
  renderGetThingsDoneTasks=function(){
    const base=estimatePaymentRenderGetThingsDoneTasksBase();
    const s=estimatePaymentWorkflowSummary();
    const rows=[];
    if(s.draftEst.length) rows.push({icon:'▤',title:'Send draft estimates',desc:`${s.draftEst.length} draft estimate${s.draftEst.length===1?'':'s'} can be reviewed and sent from Sales → Estimates.`,nav:'sales',label:'Open estimates'});
    if(s.acceptedWaiting.length) rows.push({icon:'⇢',title:'Convert accepted estimates',desc:`${s.acceptedWaiting.length} accepted estimate${s.acceptedWaiting.length===1?'':'s'} should be converted to invoice.`,nav:'sales',label:'Convert'});
    if(s.draftInv.length) rows.push({icon:'▧',title:'Send draft invoices',desc:`${s.draftInv.length} draft invoice${s.draftInv.length===1?'':'s'} need to be sent to customers.`,nav:'sales',label:'Open invoices'});
    if(s.paymentsToDeposit.length) rows.push({icon:'◉',title:'Deposit received payments',desc:`${s.paymentsToDeposit.length} payment${s.paymentsToDeposit.length===1?'':'s'} should be deposited to a bank account.`,modal:'deposit',label:'Deposit'});
    if(!rows.length) return base;
    const card=`<div class="card" style="margin-top:16px"><h3>Estimate-to-payment actions</h3><div class="gtd-task-list">${rows.map(r=>`<div class="gtd-task priority"><span class="gtd-task-icon">${r.icon}</span><div><strong>${escapeHTML(r.title)}</strong><span>${escapeHTML(r.desc)}</span></div><button class="btn ${r.modal?'primary':''}" ${r.modal?`data-modal="${r.modal}"`:`data-nav="${r.nav}"`}>${escapeHTML(r.label)}</button></div>`).join('')}</div></div>`;
    return base + card;
  };
  injectEstimateToPaymentWorkflowStyles();





  // ---------- V17: Estimate-to-payment workflow hardening ----------
  function injectV17WorkflowStyles(){
    if(document.getElementById('v17-estimate-payment-hardening-styles')) return;
    const style=document.createElement('style');
    style.id='v17-estimate-payment-hardening-styles';
    style.textContent=`
      body.v8-ui .v17-route-note{border:1px solid #cfe6f7;background:#f4faff;color:#18476b;border-radius:14px;padding:10px 12px;line-height:1.4;margin:0 0 14px;font-weight:700}
      body.v8-ui .v17-estimate-converted{display:inline-flex;align-items:center;border-radius:999px;padding:5px 9px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:900}
      body.v8-ui .v17-payment-choice{border:1px solid #e1e8ef;border-radius:14px;background:#fbfcfd;padding:12px;margin:8px 0 12px}
      body.v8-ui .v17-undeposited-list{display:grid;gap:8px;max-height:220px;overflow:auto;border:1px solid #e1e8ef;border-radius:14px;background:#fff;padding:10px}
      body.v8-ui .v17-undeposited-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:center;border-bottom:1px solid #eef2f6;padding:8px 0}.v17-undeposited-row:last-child{border-bottom:0}
      body.v8-ui .v17-undeposited-row strong{display:block}.v17-undeposited-row span{display:block;color:var(--muted,#667085);font-size:12px;margin-top:2px}
      body.v8-ui .estimate-actions .btn[disabled], body.v8-ui .btn[disabled]{opacity:.45;cursor:not-allowed;transform:none!important;box-shadow:none!important}
      body.v8-ui.dark-mode .v17-route-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}.v8-ui.dark-mode .v17-payment-choice,.v8-ui.dark-mode .v17-undeposited-list{background:#101b27;border-color:#2a3c4f}.v8-ui.dark-mode .v17-undeposited-row{border-bottom-color:#2a3c4f}
    `;
    document.head.appendChild(style);
  }
  function v17EnsureState(){
    state.settings ||= {};
    state.payments ||= [];
    state.deposits ||= [];
    state.estimates ||= [];
    (state.estimates||[]).forEach(e=>{ if(e.convertedInvoiceId && e.status!=='Converted') e.status='Converted'; });
  }
  const v17GetBankBase = getBank;
  getBank = function(id){
    if(String(id)==='1400' || String(id).toLowerCase().includes('undeposited')) return {id:'1400', name:'Undeposited Funds', accountId:'1400'};
    return v17GetBankBase(id);
  };
  const v17BankAccountIdToLedgerBase = bankAccountIdToLedger;
  bankAccountIdToLedger = function(id){
    if(String(id)==='1400' || String(id).toLowerCase().includes('undeposited')) return '1400';
    return v17BankAccountIdToLedgerBase(id);
  };
  function v17BankAndUndepositedOptions(selected='1400'){
    const opts=[`<option value="1400" ${String(selected)==='1400'?'selected':''}>Undeposited Funds</option>`]
      .concat((state.bankAccounts||[]).map(b=>`<option value="${escapeHTML(b.id)}" ${String(selected)===String(b.id)?'selected':''}>${escapeHTML(b.name)} · ${money(normalBalance(b.accountId))}</option>`));
    return opts.join('');
  }
  function v17CustomerOptionsSelected(selected){
    return (state.customers||[]).map(c=>`<option value="${escapeHTML(c.id)}" ${String(c.id)===String(selected)?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  }
  function v17SelectEstimateCustomer(html, record){
    if(!record || !record.customerId) return html;
    return html.replace(/<select name="customerId" data-estimate-customer required>[\s\S]*?<\/select>/,
      `<select name="customerId" data-estimate-customer required>${v17CustomerOptionsSelected(record.customerId)}</select>`);
  }
  const v17ModalBodyContentBase = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='payment'){
      const open=(state.invoices||[]).filter(i=>openAmount(i)>0.005 && !invoiceIsVoid?.(i));
      const opts=open.map(i=>`<option value="${escapeHTML(i.id)}" data-open="${openAmount(i)}">${escapeHTML(i.id)} · ${escapeHTML(getCustomer(i.customerId).name)} · open ${money(openAmount(i))}</option>`).join('') || '<option value="">No open invoices</option>';
      return `<div class="form-grid"><div class="field full"><label>Open invoice</label><select name="invoiceId" id="paymentInvoiceSelect">${opts}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Deposit to</label><select name="accountId">${v17BankAndUndepositedOptions('1400')}</select></div><div class="field"><label>Amount</label><input id="paymentAmount" type="number" step="0.01" min="0" name="amount" value="0"></div><div class="field full"><label>Memo</label><input name="memo" value="Customer payment"></div></div><div class="v17-payment-choice"><strong>Recommended workflow</strong><div class="muted small">Use Undeposited Funds when payments need to be grouped and deposited later. Use a bank account when the payment is already deposited.</div></div>`;
    }
    if(type==='deposit'){
      const undep=(state.payments||[]).filter(p=>String(p.accountId||'')==='1400' && !p.depositId);
      const rows=undep.map(p=>`<label class="v17-undeposited-row"><input type="checkbox" name="paymentIds" value="${escapeHTML(p.id)}" data-payment-amount="${num(p.amount)}"><div><strong>${escapeHTML(p.id)} · ${escapeHTML(getCustomer(p.customerId).name)}</strong><span>${escapeHTML(p.date||'')} · ${escapeHTML(p.invoiceId||'No invoice')} · ${escapeHTML(p.memo||'')}</span></div><strong>${money(p.amount)}</strong></label>`).join('') || '<div class="muted">No undeposited payments are waiting for bank deposit.</div>';
      return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Deposit to bank account</label><select name="accountId">${bankOptions()}</select></div><div class="field full"><label>Select received payments to deposit</label><div class="v17-undeposited-list">${rows}</div></div><div class="field"><label>Additional deposit account</label><select name="incomeAccountId">${accountOptions(['Income','Equity','Liability'])}</select></div><div class="field"><label>Additional amount</label><input type="number" step="0.01" min="0" name="amount" value="0"></div><div class="field full"><label>Memo</label><input name="memo" value="Bank deposit"></div></div><div class="v17-payment-choice"><strong>How this works</strong><div class="muted small">Selected payments move from Undeposited Funds into the selected bank account. Use Additional amount for other deposits not linked to customer payments.</div></div>`;
    }
    if(type==='estimate') return estimateFormHTML();
    if(String(type).startsWith('estimateEdit:')){
      const id=String(type).split(':')[1];
      const record=(state.estimates||[]).find(e=>e.id===id || e.estimateNumber===id);
      return v17SelectEstimateCustomer(estimateFormHTML(record), record);
    }
    return v17ModalBodyContentBase(type);
  };
  function v17InvoiceStatusText(inv){ return typeof invoiceDisplayStatus==='function' ? invoiceDisplayStatus(inv) : String(inv.status||'Draft'); }
  function v17EstimateDisplayStatus(e){ return e?.convertedInvoiceId || String(e?.status||'')==='Converted' ? 'Converted' : String(e?.status||'Draft'); }
  function v17EstimateStatusTag(e){
    const s=v17EstimateDisplayStatus(e);
    if(s==='Converted') return '<span class="v17-estimate-converted">Converted</span>';
    return estimateStatusTag(s);
  }
  function v17EstimateActionButtons(e){
    const s=v17EstimateDisplayStatus(e);
    const id=escapeHTML(e.id);
    const buttons=[`<button class="btn" data-action="edit-estimate" data-id="${id}">Edit</button>`];
    if(s==='Converted'){
      buttons.push(`<button class="btn primary" data-action="open-converted-invoice" data-id="${escapeHTML(e.convertedInvoiceId||'')}">Open invoice</button>`);
    }else if(s==='Accepted'){
      buttons.push(`<button class="btn primary" data-action="convert-estimate-invoice" data-id="${id}">Convert</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(s==='Sent'){
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(s==='Draft'){
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Mark sent</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
      buttons.push(`<button class="btn" disabled title="Convert after acceptance">Convert</button>`);
    }else{
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Reopen</button>`);
    }
    return `<div class="estimate-actions">${buttons.join('')}</div>`;
  }
  renderEstimateHub = function(){
    injectEstimateWorkflowStyles(); injectV17WorkflowStyles(); v17EnsureState();
    const estimates=(state.estimates||[]);
    const draft=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Draft').length;
    const sent=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Sent').length;
    const accepted=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Accepted').length;
    const converted=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Converted').length;
    const total=estimates.reduce((s,e)=>s+estimateAmount(e),0);
    const rows=estimates.map(e=>[
      `<strong>${escapeHTML(e.estimateNumber||e.id)}</strong><div class="muted small">${escapeHTML(e.projectName||'')}</div>`,
      escapeHTML(getCustomer(e.customerId).name),
      escapeHTML(e.date||''),
      escapeHTML(e.expiryDate||''),
      `${v17EstimateStatusTag(e)}${e.convertedInvoiceId?`<div class="muted small">Invoice ${escapeHTML(e.convertedInvoiceId)}</div>`:''}`,
      `<span class="amount">${money(estimateAmount(e))}</span>`,
      v17EstimateActionButtons(e)
    ]);
    return `<div class="estimate-hub"><div class="v17-route-note">Saved estimates appear here and in customer activity. Accepted estimates can be converted to draft invoices.</div>
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid">
        <div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div>
        <div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div>
        <div class="estimate-kpi"><span>Sent / accepted</span><strong>${sent+accepted}</strong></div>
        <div class="estimate-kpi"><span>Converted</span><strong>${converted}</strong></div>
      </div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div>
    </div>`;
  };
  function v17SalesTabs(){
    const active=state.settings.salesTab || 'overview';
    const tabs=[['overview','Overview'],['transactions','Sales Transactions'],['estimates','Estimates'],['invoices','Invoices'],['paymentLinks','Payment Links'],['recurring','Recurring Payments'],['salesOrders','Sales Orders'],['salesChannels','Sales Channels'],['payouts','Payouts'],['productsServices','Products & Services']];
    return `<div class="tabbar">${tabs.map(([id,label])=>`<button class="tab-btn ${active===id?'active':''}" data-action="set-sales-tab" data-id="${id}">${label}</button>`).join('')}</div>`;
  }
  function v17CleanUserText(root=document){
    if(!root) return;
    root.querySelectorAll('*').forEach(el=>{
      if(el.children.length===0 && el.textContent){
        el.textContent=el.textContent.replace(/Demo links that can be sent to customers for fast collection\.?/g,'Payment links can be sent to customers for fast collection.')
          .replace(/Demo only/g,'Available after setup')
          .replace(/placeholder/gi,'setup');
      }
    });
    root.querySelectorAll('button').forEach(btn=>{ if(/^Configure$/i.test(btn.textContent.trim()) && !btn.dataset.action && !btn.dataset.modal && !btn.dataset.nav){ btn.disabled=true; btn.title='Connect this channel before configuration.'; } });
  }
  const v17RenderSalesBase = renderSales;
  renderSales = function(){
    injectV17WorkflowStyles(); v17EnsureState();
    const active=state.settings.salesTab || 'overview';
    const el=document.getElementById('page-sales');
    if(active==='estimates'){
      el.innerHTML = header('Sales & Get Paid', 'Manage estimates, invoices, customer payments, and sales records.', `<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-modal="invoice">Create invoice</button><button class="btn primary" data-modal="estimate">Create estimate</button>`) + v17SalesTabs() + renderEstimateHub();
      return;
    }
    v17RenderSalesBase();
    const page=document.getElementById('page-sales');
    page?.querySelectorAll('.estimate-hub').forEach(x=>x.remove());
    const tabbar=page?.querySelector('.tabbar');
    if(tabbar && !tabbar.querySelector('[data-id="estimates"]')){
      const btn=document.createElement('button'); btn.className='tab-btn'; btn.dataset.action='set-sales-tab'; btn.dataset.id='estimates'; btn.textContent='Estimates';
      const before=tabbar.querySelector('[data-id="invoices"]'); before ? tabbar.insertBefore(btn,before) : tabbar.appendChild(btn);
    }
    v17CleanUserText(page);
  };
  convertEstimateToInvoice = function(id){
    v17EnsureState();
    const e=(state.estimates||[]).find(x=>x.id===id);
    if(!e){ showToast('Estimate not found.'); return; }
    if(e.convertedInvoiceId || String(e.status||'')==='Converted'){
      state.settings.salesTab='invoices'; state.settings.activeInvoiceId=e.convertedInvoiceId; saveState(); renderAll(); showToast(`Estimate is already converted to invoice ${e.convertedInvoiceId}.`); return;
    }
    if(String(e.status||'Draft')!=='Accepted'){
      showToast('Mark the estimate as Accepted before converting it to an invoice.'); return;
    }
    const items=(e.items||[]).map(x=>{
      const amount=num(x.qty)*num(x.rate);
      const taxAmount=amount*num(x.taxRate||state.company?.salesTax||0)/100;
      return {productId:x.productId, desc:x.desc, qty:num(x.qty), rate:num(x.rate), amount, taxRate:num(x.taxRate||state.company?.salesTax||0), taxAmount, taxCodeId:x.taxCodeId||'GST5'};
    });
    const inv={id:uid('INV'), customerId:e.customerId, date:todayISO(), dueDate:addDaysISO(30), status:'Draft', subtotal:Math.max(0,num(e.subtotal)-num(e.discount)), tax:num(e.tax), paid:0, incomeAccountId:(items[0]?.incomeAccountId)||'4000', taxCodeId:'GST5', items, sourceEstimateId:e.id, estimateNumber:e.estimateNumber||e.id, customerMessage:e.customerMessage, terms:e.terms, scope:e.scope, projectName:e.projectName, discount:num(e.discount), estimateSubtotal:num(e.subtotal), estimateDeposit:num(e.deposit), emailStatus:'Draft'};
    state.invoices.unshift(inv);
    e.status='Converted'; e.convertedInvoiceId=inv.id; e.convertedAt=new Date().toISOString();
    audit(`Estimate ${e.estimateNumber||e.id} converted to invoice ${inv.id}`);
    state.settings.salesTab='invoices'; state.settings.activeInvoiceId=inv.id;
    saveState(); renderAll(); showToast(`Estimate converted to draft invoice ${inv.id}.`);
  };
  function v17UndepositedPayments(){ return (state.payments||[]).filter(p=>String(p.accountId||'')==='1400' && !p.depositId); }
  const v17SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='payment'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries());
      const inv=(state.invoices||[]).find(i=>i.id===data.invoiceId); const amt=data.amount && num(data.amount)>0?num(data.amount):(inv?openAmount(inv):0);
      if(inv && amt>0){
        inv.paid=Math.min(invoiceTotal(inv), num(inv.paid)+amt); inv.status=openAmount(inv)<=0.01?'Paid':'Sent';
        const acct=data.accountId||'1400'; const p={id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:data.date||todayISO(), accountId:acct, amount:amt, memo:data.memo||('Payment for '+inv.id), depositId:acct==='1400'?null:'direct'};
        state.payments.unshift(p); audit(`Payment received for ${inv.id}: ${money(amt)}`); state.settings.salesTab='invoices'; saveState(); closeModal(); renderAll(); showToast(acct==='1400'?'Payment received to Undeposited Funds. Use Bank Deposit to deposit it.':'Payment received and deposited to bank.');
      }else showToast('Select an open invoice and enter an amount greater than zero.');
      return;
    }
    if(currentModal==='deposit'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()); const paymentIds=f.getAll('paymentIds');
      const selected=(state.payments||[]).filter(p=>paymentIds.includes(p.id) && !p.depositId);
      const linkedTotal=selected.reduce((s,p)=>s+num(p.amount),0); const extra=num(data.amount); const total=linkedTotal+extra;
      if(total<=0){ showToast('Select payments to deposit or enter an additional deposit amount.'); return; }
      const dep={id:uid('DEP'), date:data.date||todayISO(), accountId:data.accountId||'BA-1', incomeAccountId:selected.length?'1400':(data.incomeAccountId||'4100'), amount:total, memo:data.memo||'Bank deposit', paymentIds:selected.map(p=>p.id)};
      state.deposits.unshift(dep); selected.forEach(p=>{ p.depositId=dep.id; p.depositedToAccountId=dep.accountId; p.depositedDate=dep.date; });
      audit(`Deposit ${dep.id} posted: ${money(total)}`); state.settings.salesTab='transactions'; saveState(); closeModal(); renderAll(); showToast(selected.length?`Deposited ${selected.length} payment${selected.length===1?'':'s'} to bank.`:'Deposit added and posted.'); return;
    }
    return v17SubmitModalBase(e);
  };
  const v17HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-sales-tab'){ state.settings.salesTab=id||'overview'; saveState(); navigate('sales'); return; }
    if(action==='open-converted-invoice'){
      state.settings.salesTab='invoices'; state.settings.activeInvoiceId=id; saveState(); navigate('sales'); showToast(id?`Invoice ${id} opened in Invoice Center.`:'Invoice Center opened.'); return;
    }
    if(action==='mark-estimate-sent' || action==='mark-estimate-accepted' || action==='mark-estimate-declined'){
      const e=(state.estimates||[]).find(x=>x.id===id); if(!e){ showToast('Estimate not found.'); return; }
      if(e.convertedInvoiceId || String(e.status||'')==='Converted'){ showToast('Converted estimates cannot be changed. Open the linked invoice instead.'); return; }
      e.status=action==='mark-estimate-sent'?'Sent':action==='mark-estimate-accepted'?'Accepted':'Declined'; e.updatedAt=new Date().toISOString();
      audit(`Estimate ${e.estimateNumber||e.id} marked ${e.status}`); state.settings.salesTab='estimates'; saveState(); renderAll(); showToast(`Estimate marked ${e.status}.`); return;
    }
    if(action==='convert-estimate-invoice'){ convertEstimateToInvoice(id); return; }
    return v17HandleActionBase(action,id);
  };
  estimatePaymentWorkflowSummary = function(){
    const estimates=(state.estimates||[]), invoices=(state.invoices||[]), payments=(state.payments||[]);
    const draftEst=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Draft');
    const sentEst=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Sent');
    const acceptedWaiting=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Accepted' && !e.convertedInvoiceId);
    const converted=estimates.filter(e=>v17EstimateDisplayStatus(e)==='Converted');
    const draftInv=invoices.filter(i=>String(i.status||'Draft')==='Draft' || !i.sentDate);
    const openInv=invoices.filter(i=>openAmount(i)>0.005 && !(typeof invoiceIsVoid==='function' && invoiceIsVoid(i)));
    const unpaidOpenTotal=openInv.reduce((s,i)=>s+openAmount(i),0);
    const paymentsToDeposit=v17UndepositedPayments();
    const depositedPayments=payments.filter(p=>p.depositId);
    return {estimates,draftEst,sentEst,acceptedWaiting,converted,draftInv,openInv,unpaidOpenTotal,paymentsToDeposit,depositedPayments};
  };
  estimatePaymentWorkflowCard = function(){
    injectEstimateToPaymentWorkflowStyles(); injectV17WorkflowStyles();
    const s=estimatePaymentWorkflowSummary();
    const steps=[
      {icon:'▤',title:'Create estimate',desc:`${s.draftEst.length} draft estimate${s.draftEst.length===1?'':'s'}`,cls:s.draftEst.length?'attention':'done',button:'Create',modal:'estimate'},
      {icon:'✉',title:'Send estimate',desc:`${s.sentEst.length} sent estimate${s.sentEst.length===1?'':'s'}`,cls:s.draftEst.length?'attention':'done',button:'Open estimates',action:'estimates'},
      {icon:'✓',title:'Customer accepts',desc:s.acceptedWaiting.length?`${s.acceptedWaiting.length} waiting for invoice`:'No accepted estimates waiting',cls:s.acceptedWaiting.length?'attention':'done',button:'Review',action:'estimates'},
      {icon:'⇢',title:'Convert to invoice',desc:`${s.converted.length} converted estimate${s.converted.length===1?'':'s'}`,cls:s.acceptedWaiting.length?'attention':'done',button:'Convert',action:'estimates'},
      {icon:'▧',title:'Send invoice',desc:`${s.draftInv.length} draft invoice${s.draftInv.length===1?'':'s'}`,cls:s.draftInv.length?'attention':'done',button:'Invoices',action:'invoices'},
      {icon:'$',title:'Receive payment',desc:s.openInv.length?`${s.openInv.length} open invoice${s.openInv.length===1?'':'s'}`:'No open invoices',cls:s.openInv.length?'attention':'done',button:'Receive',modal:'payment'},
      {icon:'◉',title:'Deposit to bank',desc:s.paymentsToDeposit.length?`${s.paymentsToDeposit.length} payment${s.paymentsToDeposit.length===1?'':'s'} to deposit`:'No payments waiting',cls:s.paymentsToDeposit.length?'attention':'done',button:'Deposit',modal:'deposit'}
    ];
    const stat=(label,value)=>`<div class="estimate-payment-stat"><span>${escapeHTML(label)}</span><strong>${escapeHTML(String(value))}</strong></div>`;
    const stepBtn=step=>step.modal?`data-modal="${step.modal}"`:`data-action="open-sales-tab" data-id="${step.action}"`;
    return `<div class="estimate-payment-card" data-estimate-payment-workflow>
      <div class="estimate-payment-head"><div><h3>Estimate to payment workflow</h3><p>Follow the full money-in path from quote creation to invoice, payment, deposit, and cash-flow update.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="estimate">Create estimate</button><button class="btn primary" data-action="open-sales-tab" data-id="estimates">View estimates</button></div></div>
      <div class="estimate-payment-summary">${stat('Draft estimates',s.draftEst.length)}${stat('Sent estimates',s.sentEst.length)}${stat('Accepted to invoice',s.acceptedWaiting.length)}${stat('Draft invoices',s.draftInv.length)}${stat('Open invoice amount',money(s.unpaidOpenTotal))}${stat('Payments to deposit',s.paymentsToDeposit.length)}</div>
      <div class="estimate-payment-flow">${steps.map(step=>`<div class="estimate-payment-step ${step.cls}"><span class="estimate-payment-icon">${step.icon}</span><strong>${escapeHTML(step.title)}</strong><small>${escapeHTML(step.desc)}</small><button class="btn ${step.modal==='payment'||step.modal==='deposit'?'primary':''}" ${stepBtn(step)}>${escapeHTML(step.button)}</button></div>`).join('')}</div>
      <div class="estimate-payment-followups"><div class="estimate-payment-followup"><strong>Where estimates go</strong><span>Saved estimates appear in Sales → Estimates and in customer activity.</span></div><div class="estimate-payment-followup"><strong>Next action after acceptance</strong><span>Accepted estimates should be converted into draft invoices before billing.</span></div><div class="estimate-payment-followup"><strong>Cash-flow impact</strong><span>Cash flow updates after payment is received and deposited to a bank account.</span></div></div>
    </div>`;
  };
  const v17RenderGetThingsDoneTasksBase = renderGetThingsDoneTasks;
  renderGetThingsDoneTasks = function(){
    const base=v17RenderGetThingsDoneTasksBase(); const s=estimatePaymentWorkflowSummary();
    const extra=[];
    if(s.acceptedWaiting.length) extra.push({icon:'⇢',title:'Convert accepted estimates',desc:`${s.acceptedWaiting.length} accepted estimate${s.acceptedWaiting.length===1?'':'s'} should be converted to invoice.`,label:'Open estimates',action:'estimates'});
    if(s.draftInv.length) extra.push({icon:'▧',title:'Send draft invoices',desc:`${s.draftInv.length} draft invoice${s.draftInv.length===1?'':'s'} need to be sent to customers.`,label:'Open invoices',action:'invoices'});
    if(s.paymentsToDeposit.length) extra.push({icon:'◉',title:'Deposit received payments',desc:`${s.paymentsToDeposit.length} payment${s.paymentsToDeposit.length===1?'':'s'} should be deposited to a bank account.`,label:'Deposit',modal:'deposit'});
    if(!extra.length) return base;
    return base + `<div class="card" style="margin-top:16px"><h3>Estimate-to-payment actions</h3><div class="gtd-task-list">${extra.map(r=>`<div class="gtd-task priority"><span class="gtd-task-icon">${r.icon}</span><div><strong>${escapeHTML(r.title)}</strong><span>${escapeHTML(r.desc)}</span></div><button class="btn ${r.modal?'primary':''}" ${r.modal?`data-modal="${r.modal}"`:`data-action="open-sales-tab" data-id="${r.action}"`}>${escapeHTML(r.label)}</button></div>`).join('')}</div></div>`;
  };
  const v17RenderAllBase = renderAll;
  renderAll = function(){ injectV17WorkflowStyles(); v17EnsureState(); v17RenderAllBase(); v17CleanUserText(document); };
  injectV17WorkflowStyles(); v17EnsureState();


  // ---------- V18: Payment, deposit, and workflow consistency cleanup ----------
  function injectV18WorkflowStyles(){
    if(document.getElementById('v18-workflow-consistency-styles')) return;
    const style=document.createElement('style');
    style.id='v18-workflow-consistency-styles';
    style.textContent=`
      body.v8-ui .v18-focus-note{border:1px solid #bfe3d0;background:#f2fbf5;color:#0b5f32;border-radius:14px;padding:11px 13px;margin:0 0 12px;font-weight:800;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      body.v8-ui .v18-active-invoice{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:#eefaf2;color:#067032;border:1px solid #bfe3d0}
      body.v8-ui .v18-readonly-note{border:1px solid #d9e2ea;background:#fbfcfd;border-radius:14px;padding:12px;margin-bottom:12px;color:#344054;font-weight:700}
      body.v8-ui .v18-deposit-preview{border:1px solid #cfe6f7;background:#f4faff;border-radius:14px;padding:12px;margin:10px 0 0;display:grid;gap:6px}
      body.v8-ui .v18-deposit-preview .report-line{padding:4px 0}.v18-deposit-preview .total{font-size:16px}
      body.v8-ui .v18-info-pill{display:inline-flex;align-items:center;border:1px solid #d0d7de;border-radius:999px;padding:4px 8px;background:#fff;color:#344054;font-size:12px;font-weight:900;margin-top:4px}
      body.v8-ui.dark-mode .v18-focus-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui.dark-mode .v18-active-invoice{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui.dark-mode .v18-readonly-note,body.v8-ui.dark-mode .v18-deposit-preview{background:#101b27;border-color:#2a3c4f;color:#e8edf3}
      body.v8-ui.dark-mode .v18-info-pill{background:#101b27;border-color:#2a3c4f;color:#e8edf3}
    `;
    document.head.appendChild(style);
  }
  function v18IsUndepositedPayment(p){ return String(p?.accountId||'')==='1400'; }
  function v18IsDepositedPayment(p){ return !!p && (!v18IsUndepositedPayment(p) || !!p.depositId); }
  invoiceDepositedAmount = function(inv){
    return (state.payments||[]).filter(p=>p.invoiceId===inv.id && v18IsDepositedPayment(p)).reduce((s,p)=>s+num(p.amount),0);
  };
  function v18InvoicePaidAmount(inv){
    return (state.payments||[]).filter(p=>p.invoiceId===inv.id).reduce((s,p)=>s+num(p.amount),0);
  }
  invoiceStatusMatch = function(inv,status){
    const st=invoiceDisplayStatus(inv), open=openAmount(inv), total=invoiceTotal(inv), deposited=invoiceDepositedAmount(inv);
    if(status==='all') return true;
    if(status==='draft') return st==='Draft';
    if(status==='sent') return ['Sent','Viewed'].includes(st) || (inv.emailStatus==='Sent' && open>0 && st!=='Overdue');
    if(status==='unpaid') return open>0 && st!=='Draft' && st!=='Void';
    if(status==='overdue') return st==='Overdue';
    if(status==='paid') return total>0 && open<=0.01 && st!=='Void';
    if(status==='deposited') return deposited>0 && open<=0.01 && st!=='Void';
    if(status==='void') return st==='Void';
    return true;
  };
  invoiceBucketStats = function(){
    const bucket=(status)=>(state.invoices||[]).filter(i=>invoiceStatusMatch(i,status));
    const total=(rows,mode='total')=>rows.reduce((s,i)=>s+(mode==='open'?openAmount(i):mode==='deposited'?invoiceDepositedAmount(i):invoiceTotal(i)),0);
    const buckets={draft:bucket('draft'),sent:bucket('sent'),unpaid:bucket('unpaid'),overdue:bucket('overdue'),paid:bucket('paid'),deposited:bucket('deposited')};
    return Object.fromEntries(Object.entries(buckets).map(([k,rows])=>[k,{count:rows.length,amount:total(rows,k==='unpaid'||k==='overdue'?'open':k==='deposited'?'deposited':'total')} ]));
  };
  const v18CashFlowSeriesBase = typeof cashFlowSeries==='function' ? cashFlowSeries : null;
  cashFlowSeries = function(){
    const arr = v18CashFlowSeriesBase ? v18CashFlowSeriesBase() : [];
    if(!Array.isArray(arr) || !arr.length) return arr;
    const byMonth={};
    (state.payments||[]).filter(v18IsUndepositedPayment).forEach(p=>{ const k=String(p.date||'').slice(0,7); byMonth[k]=(byMonth[k]||0)+num(p.amount); });
    const result=arr.map(m=>{
      const k=String(m.key||m.month||m.date||'').slice(0,7);
      return {...m, in:Math.max(0,num(m.in)-num(byMonth[k]))};
    });
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : null;
    const ending=num(cash?.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    let future=0;
    for(let i=result.length-1;i>=0;i--){ result[i].balance=ending-future; future += num(result[i].in)-num(result[i].out); }
    return result;
  };
  function v18EstimateDisplayStatus(e){ return e?.convertedInvoiceId || String(e?.status||'')==='Converted' ? 'Converted' : String(e?.status||'Draft'); }
  v17EstimateActionButtons = function(e){
    const s=v18EstimateDisplayStatus(e), id=escapeHTML(e.id);
    const buttons=[];
    if(s==='Converted'){
      buttons.push(`<button class="btn" data-action="view-estimate" data-id="${id}">View</button>`);
      buttons.push(`<button class="btn primary" data-action="open-converted-invoice" data-id="${escapeHTML(e.convertedInvoiceId||'')}">Open invoice</button>`);
    }else{
      buttons.push(`<button class="btn" data-action="edit-estimate" data-id="${id}">Edit</button>`);
      if(s==='Accepted'){
        buttons.push(`<button class="btn primary" data-action="convert-estimate-invoice" data-id="${id}">Convert</button>`);
        buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
      }else if(s==='Sent'){
        buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
        buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
      }else if(s==='Draft'){
        buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Mark sent</button>`);
        buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
        buttons.push(`<button class="btn" disabled title="Convert after acceptance">Convert</button>`);
      }else{
        buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Reopen</button>`);
      }
    }
    return `<div class="estimate-actions">${buttons.join('')}</div>`;
  };
  function v18EstimateReadOnlyHTML(record){
    const e=record||{}, cust=getCustomer(e.customerId)||{};
    const rows=(e.items||[]).map(x=>[escapeHTML(x.desc||'Item'),num(x.qty),money(num(x.rate)),`${num(x.taxRate)}%`,money(num(x.qty)*num(x.rate))]);
    return `<div class="v18-readonly-note">This estimate has been converted to an invoice, so financial fields are locked. Open the linked invoice to continue billing and payment.</div>
      <div class="grid two"><div class="card"><h3>${escapeHTML(e.estimateNumber||e.id||'Estimate')}</h3><div class="report-line"><span>Customer</span><strong>${escapeHTML(cust.name||'')}</strong></div><div class="report-line"><span>Date</span><strong>${escapeHTML(e.date||'')}</strong></div><div class="report-line"><span>Expiry</span><strong>${escapeHTML(e.expiryDate||'')}</strong></div><div class="report-line"><span>Status</span><strong>${escapeHTML(v18EstimateDisplayStatus(e))}</strong></div><div class="report-line"><span>Linked invoice</span><strong>${escapeHTML(e.convertedInvoiceId||'—')}</strong></div></div><div class="card"><h3>Amounts</h3><div class="report-line"><span>Subtotal</span><strong>${money(e.subtotal)}</strong></div><div class="report-line"><span>Tax</span><strong>${money(e.tax)}</strong></div><div class="report-line"><span>Discount</span><strong>${money(e.discount)}</strong></div><div class="report-line total"><span>Total</span><span>${money(estimateAmount(e))}</span></div><div class="report-line"><span>Deposit required</span><strong>${money(e.deposit)}</strong></div></div></div>
      <div class="card table-card" style="margin-top:14px">${table(['Description','Qty','Rate','Tax','Amount'], rows)}</div>
      <div class="grid two" style="margin-top:14px"><div class="card"><h3>Scope</h3><p class="muted">${escapeHTML(e.scope||'No scope entered.')}</p></div><div class="card"><h3>Terms</h3><p class="muted">${escapeHTML(e.terms||'No terms entered.')}</p></div></div>`;
  }
  const v18ModalBodyContentBase = modalBodyContent;
  modalBodyContent = function(type){
    if(String(type).startsWith('estimateView:')){
      const id=String(type).split(':')[1];
      const record=(state.estimates||[]).find(e=>e.id===id || e.estimateNumber===id);
      return v18EstimateReadOnlyHTML(record);
    }
    if(type==='deposit'){
      const undep=(state.payments||[]).filter(p=>v18IsUndepositedPayment(p) && !p.depositId);
      const rows=undep.map(p=>`<label class="v17-undeposited-row"><input type="checkbox" name="paymentIds" value="${escapeHTML(p.id)}" data-payment-amount="${num(p.amount)}"><div><strong>${escapeHTML(p.id)} · ${escapeHTML(getCustomer(p.customerId).name)}</strong><span>${escapeHTML(p.date||'')} · ${escapeHTML(p.invoiceId||'No invoice')} · ${escapeHTML(p.memo||'')}</span></div><strong>${money(p.amount)}</strong></label>`).join('') || '<div class="muted">No undeposited payments are waiting for bank deposit.</div>';
      return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Deposit to bank account</label><select name="accountId">${bankOptions()}</select></div><div class="field full"><label>Select received payments to deposit</label><div class="v17-undeposited-list">${rows}</div></div><div class="field"><label>Additional deposit account</label><select name="incomeAccountId">${accountOptions(['Income','Equity','Liability'])}</select></div><div class="field"><label>Additional amount</label><input id="v18DepositExtraAmount" type="number" step="0.01" min="0" name="amount" value="0"></div><div class="field full"><label>Memo</label><input name="memo" value="Bank deposit"></div></div><div class="v18-deposit-preview"><strong>Deposit total preview</strong><div class="report-line"><span>Selected payments</span><strong id="v18DepositSelectedTotal">${money(0)}</strong></div><div class="report-line"><span>Additional amount</span><strong id="v18DepositExtraPreview">${money(0)}</strong></div><div class="report-line total"><span>Total deposit</span><span id="v18DepositTotalPreview">${money(0)}</span></div></div><div class="v17-payment-choice"><strong>How this works</strong><div class="muted small">Selected payments move from Undeposited Funds into the selected bank account. Cash flow counts the bank deposit once.</div></div>`;
    }
    return v18ModalBodyContentBase(type);
  };
  const v18BindModalBase = bindModalLiveCalculations;
  bindModalLiveCalculations = function(type){
    v18BindModalBase(type);
    if(type==='deposit'){
      const update=()=>{
        const selected=[...document.querySelectorAll('input[name="paymentIds"]:checked')].reduce((s,x)=>s+num(x.dataset.paymentAmount),0);
        const extra=num(document.getElementById('v18DepositExtraAmount')?.value);
        const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=money(val); };
        set('v18DepositSelectedTotal',selected); set('v18DepositExtraPreview',extra); set('v18DepositTotalPreview',selected+extra);
      };
      document.querySelectorAll('input[name="paymentIds"]').forEach(x=>x.addEventListener('change',update));
      document.getElementById('v18DepositExtraAmount')?.addEventListener('input',update);
      update();
    }
  };
  const v18OpenModalBase = openModal;
  openModal = function(type){
    v18OpenModalBase(type);
    if(String(type).startsWith('estimateView:')){
      document.getElementById('modalTitle').textContent='View estimate';
      document.getElementById('modalSubtitle').textContent='Converted estimates are locked to protect the invoice audit trail.';
      const footer=document.getElementById('modalFooter');
      if(footer) footer.innerHTML='<button type="button" class="btn primary" id="cancelModal">Close</button>';
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    }
  };
  convertEstimateToInvoice = function(id){
    v17EnsureState?.();
    const e=(state.estimates||[]).find(x=>x.id===id);
    if(!e){ showToast('Estimate not found.'); return; }
    if(e.convertedInvoiceId || String(e.status||'')==='Converted'){
      state.settings.salesTab='invoices'; state.settings.activeInvoiceId=e.convertedInvoiceId; saveState(); renderAll(); showToast(`Estimate is already converted to invoice ${e.convertedInvoiceId}.`); return;
    }
    if(String(e.status||'Draft')!=='Accepted'){ showToast('Mark the estimate as Accepted before converting it to an invoice.'); return; }
    const items=(e.items||[]).map(x=>{
      const amount=num(x.qty)*num(x.rate), taxRate=num(x.taxRate||state.company?.salesTax||0), taxAmount=amount*taxRate/100;
      const product=(state.products||[]).find(p=>p.id===x.productId)||{};
      return {productId:x.productId, desc:x.desc, qty:num(x.qty), rate:num(x.rate), amount, taxRate, taxAmount, taxCodeId:x.taxCodeId||'GST5', incomeAccountId:x.incomeAccountId||product.incomeAccountId||'4000', sourceEstimateLine:true};
    });
    const inv={id:uid('INV'), customerId:e.customerId, date:todayISO(), dueDate:addDaysISO(30), status:'Draft', emailStatus:'Draft', subtotal:Math.max(0,num(e.subtotal)-num(e.discount)), tax:num(e.tax), paid:0, incomeAccountId:(items[0]?.incomeAccountId)||'4000', taxCodeId:'GST5', items, sourceEstimateId:e.id, estimateNumber:e.estimateNumber||e.id, customerMessage:e.customerMessage, terms:e.terms, scope:e.scope, projectName:e.projectName, discount:num(e.discount), estimateSubtotal:num(e.subtotal), depositRequired:num(e.deposit), depositNote:num(e.deposit)>0?'Deposit required on estimate; not recorded as paid until payment is received.':'', paymentInstructions:e.terms, memo:`Created from estimate ${e.estimateNumber||e.id}`};
    state.invoices.unshift(inv); e.status='Converted'; e.convertedInvoiceId=inv.id; e.convertedAt=new Date().toISOString();
    audit(`Estimate ${e.estimateNumber||e.id} converted to invoice ${inv.id}`);
    state.settings.salesTab='invoices'; state.settings.activeInvoiceId=inv.id; getInvoiceCenterFilters().status='all';
    saveState(); renderAll(); showToast(`Estimate converted to draft invoice ${inv.id}.`);
  };
  const v18SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='estimate' || String(currentModal).startsWith('estimateEdit:')){
      e.preventDefault();
      const data=estimateCollectForm(e.target);
      if(!data.customerId){ showToast('Customer is required.'); return; }
      if(!data.items.length){ showToast('Estimate needs at least one line item.'); return; }
      if(data.total<=0){ showToast('Estimate total must be greater than zero.'); return; }
      if(String(currentModal).startsWith('estimateEdit:')){
        const id=String(currentModal).split(':')[1];
        const idx=(state.estimates||[]).findIndex(x=>x.id===id || x.estimateNumber===id);
        if(idx>=0){
          if(v18EstimateDisplayStatus(state.estimates[idx])==='Converted'){ showToast('Converted estimates are locked. Open the linked invoice instead.'); return; }
          state.estimates[idx]={...state.estimates[idx],...data,id:state.estimates[idx].id,estimateNumber:data.estimateNumber||state.estimates[idx].estimateNumber||state.estimates[idx].id,updatedAt:new Date().toISOString()};
          audit(`Estimate ${state.estimates[idx].estimateNumber||state.estimates[idx].id} updated`);
          showToast('Estimate updated.');
        }
      }else{
        const est={id:uid('EST'),...data,estimateNumber:data.estimateNumber||estimateNextNumber(),createdAt:new Date().toISOString()};
        state.estimates.unshift(est); audit(`Estimate ${est.estimateNumber||est.id} created for ${getCustomer(est.customerId).name}`); showToast('Estimate saved in Sales → Estimates.');
      }
      state.settings.salesTab='estimates'; saveState(); closeModal(); navigate('sales'); renderAll(); return;
    }
    return v18SubmitModalBase(e);
  };
  const v18SubmitModalPaymentsBase = submitModal;
  submitModal = function(e){
    if(currentModal==='payment'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries());
      const inv=(state.invoices||[]).find(i=>i.id===data.invoiceId); const amt=data.amount && num(data.amount)>0?num(data.amount):(inv?openAmount(inv):0);
      if(inv && amt>0){
        inv.paid=Math.min(invoiceTotal(inv), num(inv.paid)+amt); inv.status=openAmount(inv)<=0.01?'Paid':'Sent';
        const acct=data.accountId||'1400'; const direct=String(acct)!=='1400'; const p={id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:data.date||todayISO(), accountId:acct, amount:amt, memo:data.memo||('Payment for '+inv.id), depositId:direct?'direct':null, depositedToAccountId:direct?acct:null, depositedDate:direct?(data.date||todayISO()):null};
        state.payments.unshift(p); audit(`Payment received for ${inv.id}: ${money(amt)}`); state.settings.salesTab='invoices'; saveState(); closeModal(); renderAll(); showToast(direct?'Payment received and deposited to bank.':'Payment received to Undeposited Funds. Use Bank Deposit to deposit it.');
      }else showToast('Select an open invoice and enter an amount greater than zero.');
      return;
    }
    if(currentModal==='deposit'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()); const paymentIds=f.getAll('paymentIds');
      const selected=(state.payments||[]).filter(p=>paymentIds.includes(p.id) && !p.depositId);
      const linkedTotal=selected.reduce((s,p)=>s+num(p.amount),0), extra=num(data.amount), total=linkedTotal+extra;
      if(total<=0){ showToast('Select payments to deposit or enter an additional deposit amount.'); return; }
      const dep={id:uid('DEP'), date:data.date||todayISO(), accountId:data.accountId||'BA-1', incomeAccountId:selected.length?'1400':(data.incomeAccountId||'4100'), amount:total, memo:data.memo||'Bank deposit', paymentIds:selected.map(p=>p.id), linkedPaymentTotal:linkedTotal, additionalAmount:extra};
      state.deposits.unshift(dep); selected.forEach(p=>{ p.depositId=dep.id; p.depositedToAccountId=dep.accountId; p.depositedDate=dep.date; });
      audit(`Deposit ${dep.id} posted: ${money(total)}`); state.settings.salesTab='transactions'; saveState(); closeModal(); renderAll(); showToast(selected.length?`Deposited ${selected.length} payment${selected.length===1?'':'s'} to bank.`:'Deposit added and posted.'); return;
    }
    return v18SubmitModalPaymentsBase(e);
  };
  renderInvoiceActions = function(inv){
    const open=openAmount(inv), st=invoiceDisplayStatus(inv);
    const markSent=(st==='Draft' || !inv.sentDate) ? `<button class="btn square" data-action="send-invoice" data-id="${inv.id}">Mark sent</button>` : '';
    const receive=open>0 && st!=='Draft' ? `<button class="btn square primary" data-action="mark-paid" data-id="${inv.id}">Receive</button>` : (open>0 ? `<button class="btn square" disabled title="Mark sent before receiving payment">Receive</button>` : '');
    const moreActions = `<button class="btn square" data-action="edit-invoice" data-id="${inv.id}">Edit</button>${markSent}<button class="btn square" data-action="print-invoice" data-id="${inv.id}">Print/PDF</button>${st!=='Void'?`<button class="btn square danger" data-action="void-invoice" data-id="${inv.id}">Void</button>`:''}`;
    return `<div class="invoice-actions"><button class="btn square" data-action="view-invoice" data-id="${inv.id}">View</button>${receive}<details class="invoice-more"><summary class="btn square">More ▾</summary><div class="invoice-more-menu">${moreActions}</div></details></div>`;
  };
  renderInvoiceCenter = function(){
    const rows=getInvoiceCenterInvoices(), s=invoiceSettings(), activeId=state.settings.activeInvoiceId;
    const focus=activeId?`<div class="v18-focus-note"><span>Active invoice: <strong>${escapeHTML(activeId)}</strong></span><button class="btn" data-action="clear-active-invoice">Clear focus</button></div>`:'';
    return `<div class="card"><div class="toolbar"><div><h3 style="margin:0">Invoice Center</h3><div class="muted small">View sent invoices, apply templates, track delivery, print/PDF, receive payments, and export invoice reports.</div></div><div class="right"><button class="btn" data-action="clear-invoice-filters">Clear filters</button><button class="btn" data-action="export-invoices-csv">Export CSV</button><button class="btn" data-modal="invoiceCustomize">Customize invoice</button><button class="btn primary" data-modal="invoice">Create invoice</button></div></div>${focus}<div class="invoice-center-controls"><span class="template-chip">Current template: ${templateName(s.template)}</span><select data-invoice-template>${invoiceTemplateOptions(s.template)}</select><button class="btn soft" data-action="preview-template">Preview template</button></div>${renderInvoiceMoneybar()}${renderInvoiceFilters()}<div class="table-card">${table(['Invoice','Customer','Invoice date','Due date','Template','Status','Sent tracking','Total','Open balance','Deposit status','Actions'], rows.map(i=>{ const customer=getCustomer(i.customerId); const isActive=activeId===i.id; const invCell=`<strong class="${isActive?'v18-active-invoice':''}">${escapeHTML(i.id)}</strong>${i.sourceEstimateId?`<div class="muted small">From estimate ${escapeHTML(i.estimateNumber||i.sourceEstimateId)}</div>`:''}${num(i.depositRequired)>0?`<div class="v18-info-pill">Deposit required: ${money(i.depositRequired)} not paid</div>`:''}`; const paid=v18InvoicePaidAmount(i), dep=invoiceDepositedAmount(i); const depStatus=paid>0?`${money(dep)} deposited of ${money(paid)} paid`:'No payment'; const track=`<div><span class="tracking-chip">${escapeHTML(i.emailStatus||'Draft')}</span><div class="muted small" style="margin-top:4px">Sent: ${escapeHTML(i.sentDate||'—')} · Viewed: ${escapeHTML(i.lastViewed||'—')} · Reminders: ${num(i.reminderCount)}</div></div>`; return [invCell,escapeHTML(customer.name),i.date,i.dueDate,templateName(i.template||s.template),tagForStatus(invoiceDisplayStatus(i)),track,`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`,escapeHTML(depStatus),renderInvoiceActions(i)]; }))}</div>${invoiceReportsHTML(rows)}</div>`;
  };
  const v18HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='view-estimate'){ openModal('estimateView:'+id); return; }
    if(action==='edit-estimate'){
      const e=(state.estimates||[]).find(x=>x.id===id); if(e && v18EstimateDisplayStatus(e)==='Converted'){ openModal('estimateView:'+id); return; }
    }
    if(action==='clear-active-invoice'){ state.settings.activeInvoiceId=null; saveState(); renderAll(); return; }
    if(action==='open-sales-tab'){ state.settings.salesTab=id||'overview'; saveState(); navigate('sales'); return; }
    return v18HandleActionBase(action,id);
  };
  exportInvoicesCSV = function(){
    const headers=['Invoice','Customer','Invoice date','Due date','Status','Email status','Sent date','Viewed date','Reminders','Subtotal','Tax','Total','Paid','Deposited','Open balance','Income account'];
    const rows=getInvoiceCenterInvoices();
    const csv=[headers, ...rows.map(i=>[i.id,getCustomer(i.customerId).name,i.date,i.dueDate,invoiceDisplayStatus(i),i.emailStatus||'',i.sentDate||'',i.lastViewed||'',num(i.reminderCount),num(i.subtotal).toFixed(2),num(i.tax).toFixed(2),invoiceTotal(i).toFixed(2),v18InvoicePaidAmount(i).toFixed(2),invoiceDepositedAmount(i).toFixed(2),openAmount(i).toFixed(2),accountLabel(i.incomeAccountId||'4000')])].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-invoice-list.csv'; a.click(); URL.revokeObjectURL(url); showToast('Invoice CSV export started.');
  };
  renderInvoiceSummaryCard = function(){
    const el=document.getElementById('invoiceSummaryCard'); if(!el) return;
    el.className=(el.className||'').replace(/\bdashboard-invoice-card\b/g,'').trim()+' dashboard-invoice-card';
    const end=typeof v822LatestBusinessDate==='function'?v822LatestBusinessDate():todayISO();
    const start365=typeof v822DaysAgo==='function'?v822DaysAgo(end,365):'1900-01-01';
    const start30=typeof v822DaysAgo==='function'?v822DaysAgo(end,30):'1900-01-01';
    const inRange=(d,s,e)=>typeof v822InRange==='function'?v822InRange(d,s,e):(String(d||'')>=s&&String(d||'')<=e);
    const unpaidInvoices=(state.invoices||[]).filter(i=>inRange(i.date,start365,end)&&openAmount(i)>0.005);
    const unpaid=unpaidInvoices.reduce((s,i)=>s+openAmount(i),0);
    const overdue=unpaidInvoices.filter(i=>invoiceDisplayStatus(i)==='Overdue'||(i.dueDate&&i.dueDate<end)).reduce((s,i)=>s+openAmount(i),0);
    const notDue=Math.max(0,unpaid-overdue);
    const paid30=(state.payments||[]).filter(p=>inRange(p.date,start30,end)).reduce((s,p)=>s+num(p.amount),0);
    const deposited30=(state.payments||[]).filter(p=>inRange(p.depositedDate||p.date,start30,end)&&v18IsDepositedPayment(p)).reduce((s,p)=>s+num(p.amount),0);
    const notDeposited=Math.max(0,paid30-deposited30);
    el.innerHTML=`<h3 class="v823-invoice-title">Invoices</h3><div class="v823-invoice-line"><strong>${money(unpaid)} Unpaid</strong><span class="period">Last 365 days</span></div><div class="v823-invoice-split"><div><strong>${money(overdue)}</strong><span>Overdue</span></div><div><strong>${money(notDue)}</strong><span>Not due yet</span></div></div>${v823StatusBar(overdue,notDue,'overdue','notdue')}<div class="v823-invoice-line"><strong>${money(paid30)} Paid</strong><span class="period">Last 30 days</span></div><div class="invoice-amount-split"><div><strong>${money(notDeposited)}</strong><span>Received, not deposited</span></div><div><strong>${money(deposited30)}</strong><span>Deposited</span></div></div>${v823StatusBar(notDeposited,deposited30,'notdep','deposited')}`;
  };
  const v18RenderAllBase = renderAll;
  renderAll = function(){ injectV18WorkflowStyles(); v18RenderAllBase(); v17CleanUserText?.(document); };
  injectV18WorkflowStyles();



  // ---------- V19 estimate-to-invoice line integrity fix ----------
  // Fixes phantom estimate lines carrying into invoices and ensures invoice totals are
  // calculated from the same cleaned line items shown on the customer-facing invoice.
  function v19IsPhantomOptionalLine(line){
    const text=String(line?.desc || line?.description || line?.product || line?.item || '').toLowerCase();
    return /optional\s+materials|optional\s*\/\s*deliverables|materials\s*\/\s*deliverables/.test(text);
  }
  function v19LineAmount(line){
    const explicit = line && line.amount !== undefined && line.amount !== null && line.amount !== '' ? num(line.amount) : null;
    const calc = num(line?.qty) * num(line?.rate);
    return explicit !== null ? explicit : calc;
  }
  function v19CleanEstimateItems(items){
    return (items||[]).map(raw=>{
      const product=(state.products||[]).find(p=>p.id===raw?.productId) || {};
      const qty=num(raw?.qty);
      const rate=num(raw?.rate);
      const amount=qty*rate;
      const taxRate=num(raw?.taxRate ?? getTaxCode(raw?.taxCodeId||'GST5').rate ?? state.company?.salesTax ?? 0);
      const taxAmount=amount*taxRate/100;
      return {
        productId: raw?.productId || '',
        product: raw?.product || product.name || '',
        sku: raw?.sku || product.sku || product.id || '',
        desc: String(raw?.desc || raw?.description || product.name || '').trim(),
        qty, rate, amount, taxRate, taxAmount,
        taxCodeId: raw?.taxCodeId || 'GST5',
        incomeAccountId: raw?.incomeAccountId || product.incomeAccountId || '4000'
      };
    }).filter(line=>{
      if(v19IsPhantomOptionalLine(line)) return false;
      return num(line.qty)>0 && num(line.rate)>0 && num(line.amount)>0;
    });
  }
  function v19CleanInvoiceItems(items, sourceEstimate=null){
    const estimateClean = sourceEstimate ? v19CleanEstimateItems(sourceEstimate.items||[]) : [];
    const estimateDescriptions = new Set(estimateClean.map(x=>String(x.desc||'').trim().toLowerCase()).filter(Boolean));
    return (items||[]).map(raw=>{
      const product=(state.products||[]).find(p=>p.id===raw?.productId) || {};
      const qty=num(raw?.qty || 0);
      const rate=num(raw?.rate || 0);
      const amount=v19LineAmount(raw) || (qty*rate);
      const taxRate=num(raw?.taxRate ?? getTaxCode(raw?.taxCodeId||'GST5').rate ?? state.company?.salesTax ?? 0);
      const taxAmount = raw?.taxAmount !== undefined && raw?.taxAmount !== null && raw?.taxAmount !== '' ? num(raw.taxAmount) : amount*taxRate/100;
      const desc=String(raw?.desc || raw?.description || product.name || raw?.product || '').trim();
      return {
        ...raw,
        productId: raw?.productId || product.id || '',
        product: raw?.product || product.name || desc || 'Service',
        sku: raw?.sku || product.sku || product.id || '',
        desc,
        qty, rate, amount, taxRate, taxAmount,
        taxCodeId: raw?.taxCodeId || 'GST5',
        incomeAccountId: raw?.incomeAccountId || product.incomeAccountId || '4000'
      };
    }).filter(line=>{
      if(v19IsPhantomOptionalLine(line)) return false;
      if(sourceEstimate && estimateDescriptions.size){
        const key=String(line.desc||'').trim().toLowerCase();
        if(key && !estimateDescriptions.has(key) && line.sourceEstimateLine) return false;
      }
      return num(line.qty)>0 && num(line.rate)>0 && num(line.amount)>0;
    });
  }
  function v19NormalizeEstimate(est){
    if(!est) return est;
    let clean=v19CleanEstimateItems(est.items||[]);
    if(!clean.length && num(est.total)>0 && !Array.isArray(est.items)){
      clean=[{productId:'', product:'Service', sku:'', desc:'Estimate service', qty:1, rate:num(est.total)/(1+(num(state.company?.salesTax)||0)/100), amount:num(est.total)/(1+(num(state.company?.salesTax)||0)/100), taxRate:num(state.company?.salesTax)||0, taxAmount:num(est.total)-num(est.total)/(1+(num(state.company?.salesTax)||0)/100), taxCodeId:'GST5', incomeAccountId:'4000'}];
    }
    est.items=clean;
    const subtotal=clean.reduce((s,l)=>s+num(l.amount),0);
    const tax=clean.reduce((s,l)=>s+num(l.taxAmount),0);
    const discount=Math.min(num(est.discount), subtotal+tax);
    const total=Math.max(0, subtotal+tax-discount);
    est.subtotal=subtotal;
    est.tax=tax;
    est.discount=discount;
    est.total=total;
    est.deposit=Math.min(num(est.deposit), total);
    est.balance=Math.max(0,total-num(est.deposit));
    return est;
  }
  function v19NormalizeInvoice(inv){
    if(!inv) return inv;
    const source=(state.estimates||[]).find(e=>e.id===inv.sourceEstimateId);
    if(source) v19NormalizeEstimate(source);
    let items=v19CleanInvoiceItems(inv.items||[], source);
    if(!items.length && num(inv.subtotal)>0){
      const taxRate=num(inv.taxRate ?? getTaxCode(inv.taxCodeId||'GST5').rate ?? state.company?.salesTax ?? 0);
      const amount=num(inv.subtotal);
      items=[{productId:inv.productId||'', product:'Service', sku:'', desc:inv.desc||'Service', qty:1, rate:amount, amount, taxRate, taxAmount:amount*taxRate/100, taxCodeId:inv.taxCodeId||'GST5', incomeAccountId:inv.incomeAccountId||'4000'}];
    }
    inv.items=items;
    const subtotal=items.reduce((s,l)=>s+num(l.amount),0);
    const tax=items.reduce((s,l)=>s+num(l.taxAmount),0);
    inv.subtotal=subtotal;
    inv.tax=tax;
    inv.shipping=num(inv.shipping);
    inv.paid=Math.min(num(inv.paid), subtotal+tax+num(inv.shipping));
    inv.incomeAccountId=items[0]?.incomeAccountId || inv.incomeAccountId || '4000';
    inv.taxCodeId=items[0]?.taxCodeId || inv.taxCodeId || 'GST5';
    return inv;
  }
  function v19RepairState(){
    (state.estimates||[]).forEach(v19NormalizeEstimate);
    (state.invoices||[]).forEach(v19NormalizeInvoice);
  }

  const v19EstimateDefaultLineBase = estimateDefaultLine;
  estimateDefaultLine = function(line={}){
    const products=(state.products||[]);
    const first=products[0]||{};
    const productId = line.productId ?? first.id ?? '';
    const product=products.find(p=>p.id===productId) || first || {};
    const desc = line.desc ?? line.description ?? product.name ?? '';
    const qty = line.qty !== undefined && line.qty !== null && line.qty !== '' ? num(line.qty) : 1;
    const rate = line.rate !== undefined && line.rate !== null && line.rate !== '' ? num(line.rate) : num(product.price ?? 0);
    const taxRate = line.taxRate !== undefined && line.taxRate !== null && line.taxRate !== '' ? num(line.taxRate) : num(state.company?.salesTax ?? 5);
    return {productId, desc, qty, rate, taxRate};
  };

  const v19EstimateFormHTMLBase = estimateFormHTML;
  estimateFormHTML = function(record=null){
    const safeRecord = record ? v19NormalizeEstimate({...record, items:[...(record.items||[])]}) : null;
    const html = v19EstimateFormHTMLBase(safeRecord);
    // Remove the old auto-generated optional line from new estimates. Users can still add lines manually.
    return html.replace(/<tbody id="estimateLineBody">[\s\S]*?<\/tbody>/, function(){
      const e=safeRecord || {};
      const lines=(e.items && e.items.length ? e.items : [estimateDefaultLine()]);
      return `<tbody id="estimateLineBody">${lines.map(estimateLineRow).join('')}</tbody>`;
    });
  };

  estimateCollectForm = function(form){
    const f=new FormData(form);
    const productIds=f.getAll('lineProductId');
    const descs=f.getAll('lineDesc');
    const qtys=f.getAll('lineQty');
    const rates=f.getAll('lineRate');
    const taxRates=f.getAll('lineTaxRate');
    const items=productIds.map((productId,i)=>{
      const product=(state.products||[]).find(p=>p.id===productId)||{};
      const qty=num(qtys[i]);
      const rate=num(rates[i]);
      const amount=qty*rate;
      const taxRate=num(taxRates[i]);
      return {
        productId,
        product:product.name||'',
        sku:product.sku||product.id||'',
        desc:String(descs[i]||product.name||'').trim(),
        qty, rate, amount,
        taxRate,
        taxAmount:amount*taxRate/100,
        taxCodeId:'GST5',
        incomeAccountId:product.incomeAccountId||'4000'
      };
    }).filter(line=>!v19IsPhantomOptionalLine(line) && num(line.qty)>0 && num(line.rate)>0 && num(line.amount)>0);
    const subtotal=items.reduce((s,x)=>s+num(x.amount),0);
    const tax=items.reduce((s,x)=>s+num(x.taxAmount),0);
    const discount=Math.min(num(f.get('discount')), subtotal+tax);
    const total=Math.max(0, subtotal + tax - discount);
    const deposit=Math.min(num(f.get('deposit')), total);
    return {
      customerId:String(f.get('customerId')||''),
      estimateNumber:String(f.get('estimateNumber')||'').trim(),
      date:String(f.get('date')||todayISO()),
      expiryDate:String(f.get('expiryDate')||''),
      status:String(f.get('status')||'Draft'),
      projectName:String(f.get('projectName')||'').trim(),
      customerEmail:String(f.get('customerEmail')||'').trim(),
      preparedBy:String(f.get('preparedBy')||'').trim(),
      billingAddress:String(f.get('billingAddress')||'').trim(),
      serviceAddress:String(f.get('serviceAddress')||'').trim(),
      customerMessage:String(f.get('customerMessage')||'').trim(),
      scope:String(f.get('scope')||'').trim(),
      terms:String(f.get('terms')||'').trim(),
      memo:String(f.get('memo')||'').trim(),
      items, subtotal, tax, discount, total, deposit, balance:Math.max(0,total-deposit)
    };
  };

  convertEstimateToInvoice = function(id){
    v17EnsureState?.();
    const e=(state.estimates||[]).find(x=>x.id===id);
    if(!e){ showToast('Estimate not found.'); return; }
    if(e.convertedInvoiceId || String(e.status||'')==='Converted'){
      state.settings.salesTab='invoices'; state.settings.activeInvoiceId=e.convertedInvoiceId; saveState(); renderAll(); showToast(`Estimate is already converted to invoice ${e.convertedInvoiceId}.`); return;
    }
    if(String(e.status||'Draft')!=='Accepted'){ showToast('Mark the estimate as Accepted before converting it to an invoice.'); return; }
    v19NormalizeEstimate(e);
    const items=v19CleanEstimateItems(e.items||[]).map(x=>({...x, sourceEstimateLine:true}));
    if(!items.length){ showToast('Estimate has no billable line items to convert.'); return; }
    const subtotal=items.reduce((s,l)=>s+num(l.amount),0);
    const tax=items.reduce((s,l)=>s+num(l.taxAmount),0);
    const inv={
      id:uid('INV'), invoiceNo:'INV-'+String(Date.now()).slice(-6),
      customerId:e.customerId, date:todayISO(), dueDate:addDaysISO(30),
      status:'Draft', emailStatus:'Draft', subtotal, tax, shipping:0, paid:0,
      incomeAccountId:items[0]?.incomeAccountId || '4000', taxCodeId:items[0]?.taxCodeId || 'GST5',
      template:'service', terms:e.terms || invoiceSettings().defaultTerms,
      customerMessage:e.customerMessage || invoiceSettings().defaultMessage,
      paymentInstructions:e.terms || invoiceSettings().paymentInstructions,
      billToAddress:e.billingAddress || `${getCustomer(e.customerId).name}\n${getCustomer(e.customerId).company||''}\n${getCustomer(e.customerId).email||''}`,
      shipTo:e.serviceAddress || getCustomer(e.customerId).company || getCustomer(e.customerId).name,
      sentDate:'', lastViewed:'', reminderCount:0, deliveryMethod:'Email',
      items, sourceEstimateId:e.id, estimateNumber:e.estimateNumber||e.id,
      scope:e.scope, projectName:e.projectName, discount:0,
      estimateSubtotal:subtotal, depositRequired:num(e.deposit),
      depositNote:num(e.deposit)>0?'Deposit required on estimate; not recorded as paid until payment is received.':'',
      memo:`Created from estimate ${e.estimateNumber||e.id}`
    };
    v19NormalizeInvoice(inv);
    state.invoices.unshift(inv);
    e.status='Converted'; e.convertedInvoiceId=inv.id; e.convertedAt=new Date().toISOString();
    audit(`Estimate ${e.estimateNumber||e.id} converted to invoice ${inv.id} with ${items.length} verified line item${items.length===1?'':'s'}`);
    state.settings.salesTab='invoices'; state.settings.activeInvoiceId=inv.id; getInvoiceCenterFilters().status='all';
    saveState(); renderAll(); showToast(`Estimate converted to draft invoice ${inv.id}.`);
  };

  const v19InvoiceItemRowsBase = invoiceItemRows;
  invoiceItemRows = function(inv, settings){
    v19NormalizeInvoice(inv);
    return v19InvoiceItemRowsBase(inv, settings);
  };

  const v19InvoiceTotalBase = invoiceTotal;
  invoiceTotal = function(inv){
    if(invoiceIsVoid?.(inv)) return 0;
    if(inv) v19NormalizeInvoice(inv);
    return num(inv?.subtotal) + num(inv?.tax) + num(inv?.shipping);
  };
  openAmount = function(inv){ return invoiceIsVoid?.(inv) ? 0 : Math.max(0, invoiceTotal(inv) - num(inv?.paid)); };

  const v19ProfessionalInvoiceHTMLBase = professionalInvoiceHTML;
  professionalInvoiceHTML = function(inv){
    v19NormalizeInvoice(inv);
    return v19ProfessionalInvoiceHTMLBase(inv);
  };
  invoicePrintHTML = function(inv){ return professionalInvoiceHTML(inv); };

  const v19RenderInvoiceCenterBase = renderInvoiceCenter;
  renderInvoiceCenter = function(){ v19RepairState(); return v19RenderInvoiceCenterBase(); };

  const v19RenderAllBase = renderAll;
  renderAll = function(){ v19RepairState(); v19RenderAllBase(); };



  // ---------- V20 Dashboard / Report Profit & Loss Consistency Fix ----------
  function v20ReportRange(){
    if(typeof ensureV810State==='function') ensureV810State();
    const start = state.settings?.reportStartDate || '2026-05-01';
    const end = state.settings?.reportEndDate || todayISO();
    return {start, end};
  }
  function v20FormatDateRange(start,end){
    function fmt(d){
      if(!d) return 'Beginning';
      const dt = new Date(String(d)+'T00:00:00');
      if(Number.isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString('en-CA',{month:'short', day:'numeric', year:'numeric'});
    }
    return `${fmt(start)} to ${fmt(end || todayISO())}`;
  }
  function v20ProfitLossForRange(start,end){
    const calc = () => {
      const income = sumTypes(['Income']);
      const expenses = sumTypes(['Expense','COGS']);
      const ar = normalBalance('1200');
      return {income, expenses, ar, profit: income - expenses};
    };
    return (typeof v810WithFilteredState==='function') ? v810WithFilteredState(start,end,calc) : calc();
  }

  const v20RenderPLCardBase = renderPLCard;
  renderPLCard = function(){
    const {start,end}=v20ReportRange();
    const pl=v20ProfitLossForRange(start,end);
    const label=v20FormatDateRange(start,end);
    const el=document.getElementById('plCard');
    if(!el) return;
    el.innerHTML = `<h3>Profit & Loss</h3>
      <div class="muted">Accrual-basis net income · ${escapeHTML(label)}</div>
      <div class="metric">${money(pl.profit)}</div>
      <div class="report-line"><span>Income</span><strong>${money(pl.income)}</strong></div>
      <div class="report-line"><span>Expenses</span><strong>${money(pl.expenses)}</strong></div>
      <div class="report-line"><span>Open A/R</span><strong>${money(pl.ar)}</strong></div>
      <button class="btn soft" data-action="open-dashboard-pl-report" style="margin-top:12px">Run report</button>`;
  };

  if(typeof reportCatalogV8==='function'){
    const v20ReportCatalogBase = reportCatalogV8;
    reportCatalogV8 = function(){
      const list = v20ReportCatalogBase();
      const {start,end}=v20ReportRange();
      const pl=v20ProfitLossForRange(start,end);
      const label=v20FormatDateRange(start,end);
      return list.map(r => r.id==='profit-loss' ? {...r, desc:`Net income ${money(pl.profit)} · ${label}`} : r);
    };
  }

  const v20HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-dashboard-pl-report'){
      const {start,end}=v20ReportRange();
      state.settings ||= {};
      state.settings.reportStartDate=start;
      state.settings.reportEndDate=end;
      state.settings.activeReportId='profit-loss';
      state.settings.reportFilter='all';
      state.settings.reportMenuId=null;
      saveState();
      navigate('reports');
      showToast(`Profit and Loss report opened for ${v20FormatDateRange(start,end)}.`);
      return;
    }
    return v20HandleActionBase(action,id);
  };



  // ---------- V21 Global money-column alignment fix ----------
  // Makes every financial amount column use the same right-edge alignment, fixed numeric spacing,
  // and no wrapping across dashboards, reports, lists, invoice tables, tax tables, and transaction tables.
  function v21PlainText(value){
    const div=document.createElement('div');
    div.innerHTML=String(value ?? '');
    return (div.textContent || div.innerText || '').trim();
  }
  function v21HeadingText(value){
    return v21PlainText(value).toLowerCase().replace(/\s+/g,' ').trim();
  }
  function v21IsMoneyHeading(value){
    const h=v21HeadingText(value);
    if(!h) return false;
    const exact = new Set(['amount','total','subtotal','tax','sales tax','shipping','paid','balance','balance due','open','open balance','income','expenses','expense','net','net income','profit','gross','fees','fee','debit','credit','value','price','rate','cost','avg cost','unit cost','unit price','budget','revenue','actual cost','margin','cash impact','current','bank','open a/r','open a/p','payments','base']);
    if(exact.has(h)) return true;
    return /(^|\b)(amount|total|subtotal|tax|paid|balance|income|expense|profit|revenue|margin|cash|debit|credit|price|rate|cost|value|fee|gross|net|budget|base)(\b|$)/i.test(h);
  }
  function v21IsMoneyCell(value){
    const raw=String(value ?? '');
    if(/class=["'][^"']*\bamount\b/i.test(raw)) return true;
    const text=v21PlainText(raw).replace(/\u00a0/g,' ').trim();
    // Currency and accounting formats: $1,234.56, -$1,234.56, ($1,234.56), 1,234.56
    return /^\(?-?\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})\)?$/.test(text) || /^\(?-?\$?\s*\d+(?:\.\d{2})\)?$/.test(text);
  }

  const v21TableBase = table;
  table = function(headings, rows){
    const amountCols = headings.map(h=>v21IsMoneyHeading(h));
    const ths = headings.map((h,i)=>`<th class="${amountCols[i]?'amount money-col':''}">${h}</th>`).join('');
    const body = rows.length ? rows.map(r=>`<tr>${r.map((c,i)=>{
      const isAmount = amountCols[i] || v21IsMoneyCell(c);
      return `<td class="${isAmount?'amount money-col':''}">${c}</td>`;
    }).join('')}</tr>`).join('') : `<tr><td colspan="${headings.length}"><div class="empty">No records yet.</div></td></tr>`;
    return `<table><thead><tr>${ths}</tr></thead><tbody>${body}</tbody></table>`;
  };

  function v21ApplyMoneyAlignment(root=document){
    if(!root || !root.querySelectorAll) return;
    root.querySelectorAll('table').forEach(tbl=>{
      const heads=[...tbl.querySelectorAll('thead th')];
      const amountCols=heads.map(th=>v21IsMoneyHeading(th.textContent));
      heads.forEach((th,i)=>{ if(amountCols[i]) th.classList.add('amount','money-col'); });
      tbl.querySelectorAll('tbody tr').forEach(tr=>{
        [...tr.children].forEach((td,i)=>{
          if(amountCols[i] || v21IsMoneyCell(td.innerHTML)) td.classList.add('amount','money-col');
        });
      });
    });
    // Summary rows and non-table money values should also use tabular numbers.
    root.querySelectorAll('.report-line > strong, .summary-box strong, .bank-row .amount, .money-card strong, .metric, .invoice-balance, .big-total, .invoice-total, .invoice-amount, .transaction-amount, .report-amount').forEach(el=>{
      el.classList.add('money-value');
    });
  }

  const v21RenderAllBase = renderAll;
  renderAll = function(){ v21RenderAllBase(); v21ApplyMoneyAlignment(document); };
  const v21RenderDashboardBase = renderDashboard;
  renderDashboard = function(){ v21RenderDashboardBase(); v21ApplyMoneyAlignment(document.getElementById('page-dashboard') || document); };
  const v21RenderPageBase = renderPage;
  renderPage = function(page){ v21RenderPageBase(page); v21ApplyMoneyAlignment(document.getElementById('page-'+page) || document); };
  const v21RenderReportsBase = renderReports;
  renderReports = function(){ v21RenderReportsBase(); v21ApplyMoneyAlignment(document.getElementById('page-reports') || document); };



  // ---------- V22: Cash-flow chart y-axis alignment fix ----------
  // Rebuilds the dashboard cash-flow chart as one SVG coordinate system so y-axis labels,
  // gridlines, zero baseline, bars, and balance-line points all share the same exact y positions.
  function injectV22CashFlowAxisStyles(){
    if(document.getElementById('v22-cashflow-axis-fix-styles')) return;
    const style=document.createElement('style');
    style.id='v22-cashflow-axis-fix-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0!important;overflow:hidden!important;border-radius:18px;background:var(--card,#fff)}
      body.v8-ui .v22-cash-card{display:grid;gap:0;background:var(--card,#fff)}
      body.v8-ui .v22-cash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px 4px}
      body.v8-ui .v22-cash-title{display:grid;gap:3px;min-width:220px}
      body.v8-ui .v22-cash-title .eyebrow{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .v22-cash-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em;color:var(--text,#071b36);margin-top:3px}
      body.v8-ui .v22-cash-title .cash-caption{font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .v22-cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .v22-cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .v22-cash-toggle button.active{background:var(--card,#fff);color:#007a3d;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .v22-chart-shell{padding:0 24px 4px;position:relative;overflow:visible}
      body.v8-ui .v22-cash-svg{width:100%;height:320px;display:block;overflow:visible}
      body.v8-ui .v22-axis-label{fill:var(--muted,#667085);font-size:13px;font-weight:900;text-anchor:end;dominant-baseline:middle;font-variant-numeric:tabular-nums}
      body.v8-ui .v22-x-label{fill:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase;text-anchor:middle;dominant-baseline:hanging}
      body.v8-ui .v22-axis-title{fill:var(--muted,#667085);font-size:13px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;text-anchor:middle;dominant-baseline:hanging}
      body.v8-ui .v22-gridline{stroke:rgba(148,163,184,.26);stroke-width:1;shape-rendering:crispEdges}
      body.v8-ui .v22-baseline{stroke:var(--line,#dfe7ee);stroke-width:1.25;shape-rendering:crispEdges}
      body.v8-ui .v22-bar-in{fill:#42b30b;stroke:none}
      body.v8-ui .v22-bar-out{fill:#0da8ad;stroke:none}
      body.v8-ui .v22-balance-line{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      body.v8-ui .v22-balance-dot{fill:#42b30b;stroke:var(--card,#fff);stroke-width:3}
      body.v8-ui .v22-legend text{fill:var(--muted,#667085);font-size:13px;font-weight:900;dominant-baseline:middle}
      body.v8-ui .v22-legend-dot-in{fill:#42b30b}.v22-legend-dot-out{fill:#0da8ad}.v22-legend-line{stroke:#42b30b;stroke-width:3;stroke-linecap:round}
      body.v8-ui .dashboard-cash-hero .cash-source-link{margin:8px 24px 22px!important;padding:0!important;border:0!important;background:transparent!important;color:#0875b8!important;font-weight:900!important;display:inline-flex!important;text-decoration:none!important;box-shadow:none!important;cursor:pointer!important}
      body.v8-ui .dashboard-cash-hero .cash-source-link:hover{text-decoration:underline!important}
      body.v8-ui .cash-chart-legend,body.v8-ui .cash-legend,body.v8-ui .v9-chart-legend,body.v8-ui .v821-chart-legend,body.v8-ui .v822-chart-legend,body.v8-ui .v823-legend,body.v8-ui .v824-legend{display:none!important}
      body.v8-ui.dark-mode .v22-cash-title .cash-balance{color:#f8fafc}
      body.v8-ui.dark-mode .v22-cash-toggle{background:#0f172a;border-color:#334155}
      body.v8-ui.dark-mode .v22-cash-toggle button.active{background:#1e293b;color:#86efac}
      body.v8-ui.dark-mode .v22-axis-label,body.v8-ui.dark-mode .v22-x-label,body.v8-ui.dark-mode .v22-axis-title,body.v8-ui.dark-mode .v22-legend text{fill:#cbd5e1;color:#cbd5e1}
      body.v8-ui.dark-mode .v22-gridline{stroke:rgba(148,163,184,.18)}
      body.v8-ui.dark-mode .v22-baseline{stroke:#334155}
      body.v8-ui.dark-mode .v22-balance-line{stroke:#86efac}
      body.v8-ui.dark-mode .v22-balance-dot{fill:#86efac;stroke:#172033}
      body.v8-ui.dark-mode .v22-legend-line{stroke:#86efac}
      @media(max-width:980px){body.v8-ui .v22-cash-svg{height:300px}.v22-bar-in,.v22-bar-out{shape-rendering:auto}}
      @media(max-width:760px){body.v8-ui .v22-cash-head{flex-direction:column}.v22-cash-toggle{width:100%}.v22-cash-toggle button{flex:1;justify-content:center}.v22-chart-shell{padding-inline:12px}.v22-axis-label,.v22-legend text{font-size:11px}.v22-x-label{font-size:10px}}
    `;
    document.head.appendChild(style);
  }
  function v22CashFlowSvg(series,view,axisMax){
    const safeSeries=(series||[]).map((m,i)=>({...m,_label:(typeof v9MonthYearLabel==='function'?v9MonthYearLabel(m,i):String(m?.label||''))}));
    const W=1200, H=320;
    const plotLeft=64, plotRight=1184, plotTop=34, plotBottom=240;
    const plotW=plotRight-plotLeft, plotH=plotBottom-plotTop;
    const safeAxis=Math.max(1, Number(axisMax)||1);
    const pct=v=>Math.max(0,Math.min(1,(Number(v)||0)/safeAxis));
    const yFor=v=>plotBottom - pct(v)*plotH;
    const axisVals=[safeAxis,safeAxis*.8,safeAxis*.6,safeAxis*.4,safeAxis*.2,0];
    const grid=axisVals.map(v=>{
      const y=yFor(v).toFixed(1);
      return `<line class="${v===0?'v22-baseline':'v22-gridline'}" x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}"/><text class="v22-axis-label" x="${plotLeft-14}" y="${y}">${escapeHTML(typeof v9FormatAxis==='function'?v9FormatAxis(v):money(v))}</text>`;
    }).join('');
    const n=Math.max(1,safeSeries.length||1);
    const groupW=plotW/n;
    const xCenter=i=>plotLeft + groupW*(i+.5);
    const xLabels=safeSeries.map((m,i)=>`<text class="v22-x-label" x="${xCenter(i).toFixed(1)}" y="258">${escapeHTML(m._label)}</text>`).join('');
    const axisTitle=`<text class="v22-axis-title" x="${(plotLeft+plotRight)/2}" y="294">Month / Year</text>`;
    let legend='';
    let plot='';
    if(view==='balance'){
      legend=`<g class="v22-legend" transform="translate(${plotRight-130},20)"><line class="v22-legend-line" x1="0" y1="0" x2="24" y2="0"/><text x="34" y="0">Cash balance</text></g>`;
      const points=safeSeries.map((m,i)=>({x:xCenter(i), y:yFor(Math.max(0,num(m.balance))), m}));
      const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const dots=points.map(p=>`<circle class="v22-balance-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${escapeHTML(p.m._label)}: ${money(num(p.m.balance))}</title></circle>`).join('');
      plot=`<path class="v22-balance-line" d="${path}"/>${dots}`;
    }else{
      legend=`<g class="v22-legend" transform="translate(${plotRight-274},20)"><circle class="v22-legend-dot-in" cx="0" cy="0" r="5"/><text x="14" y="0">Money in</text><circle class="v22-legend-dot-out" cx="116" cy="0" r="5"/><text x="130" y="0">Money out</text></g>`;
      // V24: grouped-bar sizing follows the reference chart logic.
      // Each month group uses proportional paired bars: 30% width per bar and 4% gap.
      // The upper cap prevents oversized bars on very wide screens while preserving responsive scaling.
      const barW=Math.min(34,groupW*.30);
      const gap=Math.max(4,groupW*.04);
      plot=safeSeries.map((m,i)=>{
        const cx=xCenter(i);
        const hIn=pct(num(m.in))*plotH;
        const hOut=pct(num(m.out))*plotH;
        const xIn=cx-gap/2-barW;
        const xOut=cx+gap/2;
        return `<rect class="v22-bar-in" x="${xIn.toFixed(1)}" y="${(plotBottom-hIn).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hIn).toFixed(1)}" rx="2"><title>${escapeHTML(m._label)} money in ${money(num(m.in))}</title></rect><rect class="v22-bar-out" x="${xOut.toFixed(1)}" y="${(plotBottom-hOut).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hOut).toFixed(1)}" rx="2"><title>${escapeHTML(m._label)} money out ${money(num(m.out))}</title></rect>`;
      }).join('');
    }
    return `<svg class="v22-cash-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cash flow ${view==='balance'?'cash balance':'money in and out'} chart">${grid}${legend}${plot}${xLabels}${axisTitle}</svg>`;
  }
  renderCashFlowHero = function(){
    injectV22CashFlowAxisStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView = state.settings.cashFlowHeroView==='balance' ? 'balance' : 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=typeof cashFlowSeries==='function' ? cashFlowSeries() : [];
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.max(0,num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=typeof v9AxisMax==='function' ? v9AxisMax(rawMax) : rawMax;
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance=num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    el.innerHTML=`<div class="v22-cash-card"><div class="v22-cash-head"><div class="v22-cash-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="v22-cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-v9-cashflow-view="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-v9-cashflow-view="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="v22-chart-shell">${v22CashFlowSvg(series,view,axisMax)}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button></div>`;
  };



