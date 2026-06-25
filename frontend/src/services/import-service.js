// SmartBooks CSV import service.
// Parses, validates, and applies low-risk import plans for browser workflows.
(function(global){
  "use strict";

  const TYPE_CONFIG = {
    customers: {
      label:"Customers",
      collection:"customers",
      prefix:"C-IMP",
      template:["id","name","company","email","phone","type"],
      required:["name"]
    },
    vendors: {
      label:"Vendors",
      collection:"vendors",
      prefix:"V-IMP",
      template:["id","name","email","phone","category"],
      required:["name"]
    },
    products: {
      label:"Products / Services",
      collection:"products",
      prefix:"P-IMP",
      template:["id","name","type","price","incomeAccountId","qty"],
      required:["name"]
    },
    bankTransactions: {
      label:"Bank transactions",
      collection:"bankTransactions",
      prefix:"BFT-IMP",
      template:["id","date","description","amount","bankAccountId","suggestedAccountId","note"],
      required:["date","description","amount"]
    }
  };

  const FIELD_ALIASES = {
    id:["id","recordid","record_id","externalid","external_id"],
    name:["name","customer","vendor","product","service","item","displayname","display_name"],
    company:["company","companyname","company_name"],
    email:["email","emailaddress","email_address"],
    phone:["phone","telephone","mobile"],
    type:["type","kind","customer_type","product_type"],
    category:["category","expensecategory","expense_category"],
    price:["price","rate","salesprice","sales_price"],
    incomeAccountId:["incomeaccountid","income_account_id","incomeaccount","income_account","accountid","account_id"],
    qty:["qty","quantity","quantityonhand","quantity_on_hand","stock","onhand","on_hand"],
    date:["date","transactiondate","transaction_date","posteddate","posted_date"],
    description:["description","desc","memo","payee","details"],
    amount:["amount","value","transactionamount","transaction_amount"],
    bankAccountId:["bankaccountid","bank_account_id","bankaccount","bank_account"],
    suggestedAccountId:["suggestedaccountid","suggested_account_id","categoryaccountid","category_account_id","account"],
    note:["note","notes","memo"]
  };

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeHeader(value){
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function normalizeKey(value){
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function clean(value){
    return String(value ?? "").trim();
  }

  function parseAmount(value){
    const raw = clean(value);
    if(!raw) return { ok:false, value:0 };
    const negative = /^\(.*\)$/.test(raw);
    const cleaned = raw.replace(/[,$%]/g, "").replace(/[()]/g, "");
    const number = Number(cleaned);
    if(!Number.isFinite(number)) return { ok:false, value:0 };
    return { ok:true, value:negative ? -Math.abs(number) : number };
  }

  function parseOptionalNumber(value, fallback=0){
    const raw = clean(value);
    if(!raw) return fallback;
    const parsed = parseAmount(raw);
    return parsed.ok ? parsed.value : fallback;
  }

  function isISODate(value){
    const raw = clean(value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
    const date = new Date(raw + "T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === raw;
  }

  function parseCsv(text){
    const input = String(text || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for(let i=0; i<input.length; i++){
      const ch = input[i];
      const next = input[i + 1];
      if(quoted){
        if(ch === '"' && next === '"'){
          cell += '"';
          i++;
        }else if(ch === '"'){
          quoted = false;
        }else{
          cell += ch;
        }
      }else if(ch === '"'){
        quoted = true;
      }else if(ch === ","){
        row.push(cell);
        cell = "";
      }else if(ch === "\n"){
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }else if(ch === "\r"){
        if(next === "\n") continue;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }else{
        cell += ch;
      }
    }

    if(quoted) throw new Error("CSV has an unterminated quoted value.");
    row.push(cell);
    if(row.some(value => clean(value))) rows.push(row);
    const nonBlank = rows.filter(values => values.some(value => clean(value)));
    if(!nonBlank.length) return { headers:[], rows:[] };
    const headers = nonBlank[0].map(clean);
    return {
      headers,
      rows: nonBlank.slice(1).map((values, index) => {
        const record = {};
        headers.forEach((header, column) => { record[normalizeHeader(header)] = clean(values[column]); });
        return { rowNumber:index + 2, values, record };
      })
    };
  }

  function readField(row, field){
    const aliases = FIELD_ALIASES[field] || [field];
    for(const alias of aliases){
      const key = normalizeHeader(alias);
      if(Object.prototype.hasOwnProperty.call(row.record, key)) return clean(row.record[key]);
    }
    return "";
  }

  function nextImportId(state, collection, prefix, used){
    const existing = new Set([...(state[collection] || []).map(item => String(item.id || "")), ...used]);
    let index = 1;
    let id = `${prefix}-${String(index).padStart(3, "0")}`;
    while(existing.has(id)){
      index++;
      id = `${prefix}-${String(index).padStart(3, "0")}`;
    }
    used.add(id);
    return id;
  }

  function findAccount(state, id){
    const key = clean(id);
    return (state.chartOfAccounts || []).find(account => String(account.id) === key || String(account.code) === key);
  }

  function findBankAccount(state, id){
    const key = clean(id);
    return (state.bankAccounts || []).find(account => String(account.id) === key || normalizeKey(account.name) === normalizeKey(key));
  }

  function findExisting(type, state, record){
    const list = state[TYPE_CONFIG[type].collection] || [];
    const id = clean(record.id);
    if(id){
      const byId = list.find(item => String(item.id) === id);
      if(byId) return byId;
    }
    if(type === "customers" || type === "vendors"){
      const email = normalizeKey(record.email);
      if(email){
        const byEmail = list.find(item => normalizeKey(item.email) === email);
        if(byEmail) return byEmail;
      }
      return list.find(item => normalizeKey(item.name) === normalizeKey(record.name));
    }
    if(type === "products"){
      return list.find(item => normalizeKey(item.name) === normalizeKey(record.name));
    }
    if(type === "bankTransactions"){
      return list.find(item =>
        String(item.id) === id ||
        (
          clean(item.date) === clean(record.date) &&
          normalizeKey(item.description) === normalizeKey(record.description) &&
          Number(item.amount || 0) === Number(record.amount || 0) &&
          clean(item.bankAccountId) === clean(record.bankAccountId)
        )
      );
    }
    return null;
  }

  function recordForRow(type, state, row, usedIds){
    const errors = [];
    const config = TYPE_CONFIG[type];
    if(!config) return { record:null, errors:[`Unsupported import type: ${type}`] };

    for(const field of config.required){
      if(!readField(row, field)) errors.push(`${field} is required`);
    }

    if(type === "customers"){
      const name = readField(row, "name");
      return {
        errors,
        record:{
          id: readField(row, "id") || nextImportId(state, config.collection, config.prefix, usedIds),
          name,
          company: readField(row, "company") || name,
          email: readField(row, "email"),
          phone: readField(row, "phone"),
          type: readField(row, "type") || "Commercial"
        }
      };
    }

    if(type === "vendors"){
      const name = readField(row, "name");
      return {
        errors,
        record:{
          id: readField(row, "id") || nextImportId(state, config.collection, config.prefix, usedIds),
          name,
          email: readField(row, "email"),
          phone: readField(row, "phone"),
          category: readField(row, "category") || "Imported vendor"
        }
      };
    }

    if(type === "products"){
      const incomeAccount = readField(row, "incomeAccountId") || "4000";
      if(!findAccount(state, incomeAccount)) errors.push(`incomeAccountId ${incomeAccount} does not exist`);
      return {
        errors,
        record:{
          id: readField(row, "id") || nextImportId(state, config.collection, config.prefix, usedIds),
          name: readField(row, "name"),
          type: readField(row, "type") || "Service",
          price: parseOptionalNumber(readField(row, "price"), 0),
          incomeAccountId: findAccount(state, incomeAccount)?.id || incomeAccount,
          qty: parseOptionalNumber(readField(row, "qty"), 0)
        }
      };
    }

    const amount = parseAmount(readField(row, "amount"));
    if(!amount.ok) errors.push("amount must be numeric");
    const date = readField(row, "date");
    if(date && !isISODate(date)) errors.push("date must use YYYY-MM-DD");
    const bankAccount = findBankAccount(state, readField(row, "bankAccountId")) || (state.bankAccounts || [])[0];
    if(!bankAccount) errors.push("bankAccountId is required");
    const suggestedRaw = readField(row, "suggestedAccountId") || (amount.value >= 0 ? "4100" : "6000");
    const suggested = findAccount(state, suggestedRaw);
    if(!suggested) errors.push(`suggestedAccountId ${suggestedRaw} does not exist`);
    return {
      errors,
      record:{
        id: readField(row, "id") || nextImportId(state, config.collection, config.prefix, usedIds),
        date,
        description: readField(row, "description"),
        amount: amount.value,
        bankAccountId: bankAccount?.id || readField(row, "bankAccountId"),
        status: "Unreviewed",
        suggestedAccountId: suggested?.id || suggestedRaw,
        matchType: amount.value >= 0 ? "Deposit / income category" : "Expense category",
        linkedId: null,
        posted: false,
        cleared: false,
        note: readField(row, "note") || "Imported from CSV"
      }
    };
  }

  function buildPlan(state, type, csvText){
    const config = TYPE_CONFIG[type];
    if(!config) throw new Error(`Unsupported import type: ${type}`);
    const parsed = parseCsv(csvText);
    const usedIds = new Set();
    const entries = parsed.rows.map(row => {
      const result = recordForRow(type, state || {}, row, usedIds);
      if(result.errors.length){
        return { rowNumber:row.rowNumber, action:"error", record:result.record, messages:result.errors };
      }
      const existing = findExisting(type, state || {}, result.record);
      if(type === "bankTransactions" && existing){
        return { rowNumber:row.rowNumber, action:"skip", record:result.record, existingId:existing.id, messages:["Duplicate bank transaction already exists"] };
      }
      return {
        rowNumber:row.rowNumber,
        action: existing ? "update" : "create",
        record: existing ? Object.assign({}, result.record, { id:existing.id }) : result.record,
        existingId: existing?.id || null,
        messages: existing ? [`Updates existing ${existing.id}`] : []
      };
    });
    return {
      type,
      label:config.label,
      collection:config.collection,
      headers:parsed.headers,
      entries,
      summary: summarize(entries)
    };
  }

  function summarize(entries){
    return entries.reduce((summary, entry) => {
      summary.total++;
      summary[entry.action] = (summary[entry.action] || 0) + 1;
      if(entry.action === "create" || entry.action === "update") summary.ready++;
      return summary;
    }, { total:0, ready:0, create:0, update:0, skip:0, error:0 });
  }

  function applyPlan(state, plan){
    if(!state || !plan) return { create:0, update:0, skip:0, error:0 };
    const list = state[plan.collection] ||= [];
    const applied = { create:0, update:0, skip:0, error:0 };
    for(const entry of plan.entries || []){
      if(entry.action === "error" || entry.action === "skip"){
        applied[entry.action]++;
        continue;
      }
      const existing = list.find(item => String(item.id) === String(entry.record.id));
      if(existing){
        Object.assign(existing, clone(entry.record));
        applied.update++;
      }else{
        list.unshift(clone(entry.record));
        applied.create++;
      }
    }
    return applied;
  }

  function templateCsv(type){
    const config = TYPE_CONFIG[type];
    if(!config) return "";
    return config.template.join(",") + "\n";
  }

  const api = {
    types: TYPE_CONFIG,
    parseCsv,
    buildPlan,
    applyPlan,
    templateCsv,
    summarize
  };

  global.SmartBooksImport = api;
  if(typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
