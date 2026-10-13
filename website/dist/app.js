'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-navigation');
const closeMenu = () => { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true'){ closeMenu(); toggle.focus(); } });
matchMedia('(min-width: 761px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab){ tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !active; }); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectTab(tab)); tab.addEventListener('keydown', e => { let next; if(['ArrowRight','ArrowDown'].includes(e.key)) next = (index + 1) % tabs.length; if(['ArrowLeft','ArrowUp'].includes(e.key)) next = (index + tabs.length - 1) % tabs.length; if(e.key === 'Home') next = 0; if(e.key === 'End') next = tabs.length - 1; if(next !== undefined){ e.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); } }); });
const form = document.getElementById('inquiry-form');
const success = document.getElementById('inquiry-success');
if(form){
  const endpoint = 'https://crm-crane.vercel.app/api/crm/form/cq-website-inquiry';
  const submit = document.getElementById('submit-inquiry');
  const label = document.getElementById('submit-label');
  const fields = document.getElementById('inquiry-fields');
  const status = document.getElementById('form-status');
  const error = document.getElementById('form-error');
  const retry = document.getElementById('connection-retry');
  const storageKey = 'cq-website-inquiry-request-v1';
  let ready = false, pending = false, cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { /* Memory-only retry protection still works when storage is unavailable. */ }
  const cache = value => { cached = value; try { sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch {} };
  const clearError = () => { error.hidden = true; error.textContent = ''; };
  function showError(message){ error.textContent = message; error.hidden = false; error.focus(); }
  async function connect(){
    ready = false; submit.disabled = true; retry.hidden = true; clearError(); status.textContent = 'Checking the inquiry connection…';
    try {
      const response = await fetch(endpoint, {credentials:'omit',referrerPolicy:'strict-origin',signal:AbortSignal.timeout(12000)});
      if(!response.ok) throw new Error('unavailable');
      const schema = await response.json();
      const required = ['name','company','email','needs','resource_consent'];
      if(schema.slug !== 'cq-website-inquiry' || schema.settings?.resourceCapture !== true || !required.every(key=>schema.fields?.some(f=>f.key===key && f.required)) || !schema.fields?.some(f=>f.key==='marketing_opt_in'&&!f.required)) throw new Error('contract');
      ready = true; submit.disabled = false; status.textContent = 'Connected to CraneQualified’s business CRM.';
    } catch { status.textContent = 'The inquiry connection is unavailable.'; retry.hidden = false; showError('We can’t connect to the inquiry service right now. Try the connection again, or email office@ccoschool.us. Nothing has been submitted.'); }
  }
  function showSuccess(record, marketing){
    form.reset(); form.hidden = true; success.hidden = false;
    document.getElementById('consent-receipt').textContent = marketing ? 'You also requested CraneQualified resources and workforce-development guidance. Existing unsubscribe preferences remain subject to the CRM’s consent controls.' : 'You did not opt in to additional marketing through this inquiry.';
    document.getElementById('receipt-reference').textContent = record ? `Inquiry reference: ${record}` : '';
    document.getElementById('success-title').focus();
  }
  retry.addEventListener('click', connect);
  document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{ const field=document.getElementById('needs'); if(!field.value.trim()) field.value=button.dataset.prompt; field.focus(); field.setSelectionRange(field.value.length,field.value.length); }));
  form.addEventListener('submit', async event => {
    event.preventDefault(); if(pending || !ready || !form.reportValidity()) return;
    clearError();
    const answers = {name:form.elements.name.value.trim(),company:form.elements.company.value.trim(),email:form.elements.email.value.trim().toLowerCase(),phone:form.elements.phone.value.trim(),needs:form.elements.needs.value.trim(),resource_consent:form.elements.resource_consent.checked,marketing_opt_in:form.elements.marketing_opt_in.checked,consent_version:'cq-website-inquiry-2026-10-v1'};
    if(!answers.name || !answers.company || !answers.needs){ showError('Please add your name, company, and a short description of what you need help with.'); return; }
    pending = true; submit.disabled = true; fields.disabled = true; form.setAttribute('aria-busy','true'); label.textContent = 'Saving your inquiry…'; status.textContent = 'Please wait while your inquiry is saved.';
    try {
      const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(answers)));
      const fingerprint = [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
      if(cached?.fingerprint===fingerprint && cached?.completed){ showSuccess(cached.submissionId,answers.marketing_opt_in); return; }
      if(cached?.fingerprint!==fingerprint || !/^[0-9a-f-]{36}$/i.test(cached?.requestId||'')) cache({fingerprint,requestId:crypto.randomUUID(),completed:false});
      const params = new URLSearchParams(location.search);
      const utm = {source:params.get('utm_source')?.slice(0,200)||'cq-private-website',medium:params.get('utm_medium')?.slice(0,200)||'website',campaign:params.get('utm_campaign')?.slice(0,200)||'operator-bench'};
      for(const key of ['term','content']) if(params.get(`utm_${key}`)) utm[key]=params.get(`utm_${key}`).slice(0,200);
      const payload = {...answers,website:form.elements.website.value,request_id:cached.requestId,page:location.origin+location.pathname,utm};
      const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'strict-origin',signal:AbortSignal.timeout(20000)});
      let result; try { result = await response.json(); } catch { throw new Error('uncertain'); }
      if(response.status===429) throw new Error('rate');
      if(response.status===400) throw new Error('validation');
      if(!response.ok || result.ok!==true || !result.submissionId || result.bot) throw new Error('uncertain');
      cache({...cached,completed:true,submissionId:result.submissionId});
      showSuccess(result.submissionId,answers.marketing_opt_in);
    } catch (reason) {
      status.textContent = 'Please review the message below before trying again.';
      if(reason.message==='rate') showError('Too many attempts were made. Please wait before trying again, or email office@ccoschool.us.');
      else if(reason.message==='validation') showError('The CRM could not accept these details. Check the required fields and consent, then try again.');
      else showError('We couldn’t confirm that your inquiry was saved. Your entries are still here. Try again to check the same request without creating a duplicate, or email office@ccoschool.us.');
    } finally {
      pending = false; fields.disabled = false; submit.disabled = !ready; form.removeAttribute('aria-busy'); label.textContent = 'Request a Bench Conversation';
    }
  });
  document.getElementById('try-again').addEventListener('click', () => { cached=null;try {sessionStorage.removeItem(storageKey);}catch{} success.hidden = true; form.hidden = false; clearError(); status.textContent='Connected to CraneQualified’s business CRM.'; document.getElementById('name').focus(); });
  connect();
}
