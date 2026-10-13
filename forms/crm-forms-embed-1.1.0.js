/* CRM Forms local WordPress loader */
(function crmEmbedRuntime(endpoints, bindSubmission) {
  if (!endpoints?.schema || !endpoints?.submit) return;
  var fieldSequence = 0;
  function url(template, slug) {
    return template.replace("{slug}", encodeURIComponent(slug));
  }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (key) {
      if (key === "text") node.textContent = props[key];
      else if (key === "class") node.className = props[key];
      else node.setAttribute(key, props[key]);
    });
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  // Duplicated from inputHintsFor() on purpose: this runtime is stringified
  // and executed outside the module, so it cannot import anything.
  function hints(spec, input) {
    var map = {
      email: "email", name: "name", full_name: "name", fullname: "name",
      first_name: "given-name", firstname: "given-name",
      last_name: "family-name", lastname: "family-name",
      phone: "tel", company: "organization", organization: "organization",
    };
    var autocomplete = map[spec.key] || (spec.type === "tel" ? "tel" : null);
    if (autocomplete) input.setAttribute("autocomplete", autocomplete);
    if (spec.type === "email") input.setAttribute("inputmode", "email");
    if (spec.type === "tel") input.setAttribute("inputmode", "tel");
  }

  function field(spec) {
    if (spec.type === "hidden") {
      return el("input", { type: "hidden", name: spec.key, value: spec.defaultValue || "" });
    }

    var wrap = el("div", { class: "crm-embed-field" });
    var fieldId = "crm-embed-" + (++fieldSequence) + "-" + spec.key;

    if (spec.type === "checkbox" || spec.type === "consent") {
      var box = el("input", { type: "checkbox", name: spec.key });
      if (spec.required) box.required = true;
      var boxLabel = el("label", { class: "crm-embed-check" }, [box, el("span", { text: spec.label })]);
      wrap.appendChild(boxLabel);
    } else if (spec.type === "radio") {
      wrap.appendChild(el("span", { class: "crm-embed-label", text: spec.label }));
      (spec.options || []).forEach(function (option, index) {
        var input = el("input", { type: "radio", name: spec.key, value: option });
        if (spec.required && index === 0) input.required = true;
        wrap.appendChild(el("label", { class: "crm-embed-check" }, [input, el("span", { text: option })]));
      });
    } else {
      wrap.appendChild(el("label", { text: spec.label, for: fieldId }));
      var input;
      if (spec.type === "select") {
        input = el("select", { name: spec.key, id: fieldId });
        input.appendChild(el("option", { value: "", text: "Choose…" }));
        (spec.options || []).forEach(function (option) {
          input.appendChild(el("option", { value: option, text: option }));
        });
      } else if (spec.type === "textarea") {
        input = el("textarea", { name: spec.key, id: fieldId, rows: "4" });
      } else {
        input = el("input", { type: spec.type, name: spec.key, id: fieldId });
      }
      if (spec.placeholder) input.setAttribute("placeholder", spec.placeholder);
      if (spec.required) input.required = true;
      hints(spec, input);
      wrap.appendChild(input);
    }

    if (spec.help) wrap.appendChild(el("span", { class: "crm-embed-help", text: spec.help }));
    return wrap;
  }

  function mount(host, form) {
    var settings = form.settings || {};
    var node = el("form", { class: "crm-embed-form" });
    // The accent chosen in the admin, exposed as a custom property so a host
    // page can override it with one CSS line if it wants to.
    if (settings.accentColor && host.getAttribute("data-crm-style") !== "none") {
      host.style.setProperty("--crm-embed-accent", settings.accentColor);
    }

    if (settings.headline) node.appendChild(el("h3", { class: "crm-embed-title", text: settings.headline }));
    if (settings.subhead) node.appendChild(el("p", { class: "crm-embed-sub", text: settings.subhead }));
    (form.fields || []).forEach(function (spec) { node.appendChild(field(spec)); });

    var honeypot = el("div", { class: "crm-embed-hp", "aria-hidden": "true" }, [
      el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" }),
    ]);
    node.appendChild(honeypot);

    var button = el("button", { type: "submit", text: settings.submitLabel || "Submit" });
    node.appendChild(button);
    var error = el("p", { class: "crm-embed-error" });
    error.hidden = true;
    node.appendChild(error);
    if (settings.consentText) {
      node.appendChild(el("p", { class: "crm-embed-note", text: settings.consentText }));
    }

    var status = el("p", { class: "crm-embed-status", role: "status" });
    node.appendChild(status);
    bindSubmission({ form: node, endpoint: url(endpoints.submit, form.slug), error: error, status: status,
      requireReceipt: settings.resourceCapture === true, scope: String([...document.querySelectorAll('[data-crm-form]')].indexOf(host)),
      onSuccess: function(result) {
        if (result.redirectUrl) { location.href = result.redirectUrl; return; }
        var done = el("p", { class: "crm-embed-done", role: "status", tabindex: "-1", text: result.message || "Thank you." });
        host.replaceChildren(done); done.focus();
      }
    });

    host.replaceChildren(node);
  }

  // Host themes (WordPress especially) style bare input/button/label
  // selectors hard, often with !important. Everything here is scoped under
  // .crm-embed-form and the few properties that decide whether the form is
  // usable at all — box-sizing, width, and the 16px that stops iOS zooming
  // the page on focus — are forced.
  function styles() {
    if (document.getElementById("crm-embed-styles")) return;
    var accent = "var(--crm-embed-accent,#8A6642)";
    var style = document.createElement("style");
    style.id = "crm-embed-styles";
    style.textContent = [
      ".crm-embed-form,.crm-embed-form *{box-sizing:border-box!important}",
      ".crm-embed-form{max-width:560px;width:100%;font-family:inherit;font-size:16px;line-height:1.5;text-align:left}",
      ".crm-embed-title{margin:0 0 6px;font-size:1.4em;line-height:1.25}",
      ".crm-embed-sub{margin:0 0 18px;opacity:.8}",
      ".crm-embed-field{margin:0 0 18px;text-align:left}",
      ".crm-embed-field>label,.crm-embed-label{display:block;font-size:14px;opacity:.75;margin:0 0 6px;font-weight:inherit;text-transform:none;float:none;width:auto}",
      ".crm-embed-field input,.crm-embed-field select,.crm-embed-field textarea{" +
        "width:100%!important;max-width:100%!important;font-family:inherit;font-size:16px!important;line-height:1.4;" +
        "min-height:48px;padding:12px 14px;margin:0;border:1px solid rgba(0,0,0,.22);border-radius:8px;" +
        "background:#fff;color:#222;display:block}",
      ".crm-embed-field textarea{resize:vertical;min-height:110px}",
      ".crm-embed-field input:focus-visible,.crm-embed-field select:focus-visible,.crm-embed-field textarea:focus-visible{" +
        "outline:2px solid " + accent + ";outline-offset:1px}",
      ".crm-embed-check{display:flex!important;gap:12px;align-items:flex-start;margin:0 0 4px;font-size:16px;" +
        "line-height:1.45;min-height:44px;padding:8px 0;cursor:pointer;font-weight:inherit;text-transform:none}",
      ".crm-embed-check input{width:20px!important;height:20px;min-height:0;flex:none;margin:2px 0 0;padding:0;accent-color:" + accent + "}",
      ".crm-embed-help{display:block;font-size:14px;opacity:.65;margin:5px 0 0}",
      ".crm-embed-form button{font-family:inherit;font-size:17px;width:100%;min-height:52px;padding:14px 22px;" +
        "border:0;border-radius:8px;background:" + accent + ";color:#fff;cursor:pointer;" +
        "touch-action:manipulation;margin:10px 0 0;text-transform:none;letter-spacing:normal}",
      ".crm-embed-form button:disabled{opacity:.55;cursor:default}",
      ".crm-embed-error{color:#A33B2E;font-size:15px;margin:12px 0 0}",
      ".crm-embed-note{font-size:13px;opacity:.7;line-height:1.5;margin:14px 0 0}",
      ".crm-embed-done{font-size:17px;line-height:1.5;margin:0;padding:12px 0}",
      ".crm-embed-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px;overflow:hidden}",
      "@media (min-width:520px){.crm-embed-form button{width:auto;min-width:200px}}",
    ].join("");
    document.head.appendChild(style);
  }

  function boot() {
    var hosts = document.querySelectorAll("[data-crm-form]");
    var wantsStyles = false;
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].getAttribute("data-crm-style") !== "none") wantsStyles = true;
    }
    if (wantsStyles) styles();

    Array.prototype.forEach.call(hosts, function (host) {
      if (host.getAttribute("data-crm-mounted")) return;
      host.setAttribute("data-crm-mounted", "1");
      fetch(url(endpoints.schema, host.getAttribute("data-crm-form")))
        .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error("Form not found.")); })
        .then(function (form) { mount(host, form); })
        .catch(function (err) {
          host.removeAttribute("data-crm-mounted");
          host.textContent = err.message;
        });
    });
  }

  // Page builders, AJAX themes and single-page navigation all insert markup
  // after load. Anything that adds a [data-crm-form] element later calls
  // CrmForms.refresh() and the new one mounts; already-mounted forms are
  // skipped, so calling it repeatedly is harmless.
  window.CrmForms = window.CrmForms || {};
  window.CrmForms.refresh = boot;
  document.addEventListener("crm-forms:refresh", boot);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.CrmFormsEndpoints, function bindCrmSubmission({ form, endpoint, error, status, onSuccess, requireReceipt, scope }) {
  let pending = false;
  const storageKey = 'crm-inquiry-v1:' + endpoint + ':' + (scope || 'default');
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch {}
  const remember = value => { cached = value; try { sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch {} };
  error.setAttribute('role', 'alert'); error.setAttribute('tabindex', '-1');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    pending = true; error.hidden = true; form.setAttribute('aria-busy', 'true');
    const payload = {};
    new FormData(form).forEach((value, key) => { payload[key] = value; });
    form.querySelectorAll('input[type=checkbox]').forEach(input => { payload[input.name] = input.checked; });
    const controls = [...form.elements].map(input => [input, input.disabled]);
    controls.forEach(([input]) => { input.disabled = true; });
    status.textContent = 'Saving your inquiry…';
    let timer;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
      const fingerprint = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (cached?.fingerprint === fingerprint && cached.completed) {
        onSuccess({ ok: true, submissionId: cached.submissionId, message: 'This inquiry has already been saved.' }); return;
      }
      if (cached?.fingerprint !== fingerprint || !/^[0-9a-f-]{36}$/i.test(cached?.requestId || '')) {
        remember({ fingerprint, requestId: crypto.randomUUID(), completed: false });
      }
      payload.request_id = cached.requestId;
      payload.page = location.origin + location.pathname;
      const params = new URLSearchParams(location.search);
      payload.utm = {};
      for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
        const value = params.get('utm_' + key); if (value) payload.utm[key] = value.slice(0, 200);
      }
      const controller = new AbortController(); timer = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(endpoint, { method: 'POST', credentials: 'omit', referrerPolicy: 'strict-origin',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      const body = await res.json();
      if (!res.ok || body.ok !== true || body.bot || (requireReceipt && !body.submissionId)) {
        throw new Error(res.status === 429 ? 'Too many attempts. Please wait before trying again.' :
          res.status === 400 ? (body.error || 'Check the required fields and permission.') : 'unconfirmed');
      }
      remember({ ...cached, completed: true, submissionId: body.submissionId || null });
      onSuccess(body);
    } catch (err) {
      status.textContent = '';
      error.textContent = err.message === 'unconfirmed' || !/^(Too many attempts|Check |.+ is required\.)/.test(err.message)
        ? 'We could not confirm that your inquiry was saved. Your entries are still here. Retry with the same details to check the same request.' : err.message;
      error.hidden = false; error.focus();
    } finally {
      clearTimeout(timer); pending = false; form.removeAttribute('aria-busy');
      controls.forEach(([input, disabled]) => { input.disabled = disabled; });
    }
  });
});
