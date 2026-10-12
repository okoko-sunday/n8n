/* ==========================================================================
   Request form: validation, cleaning, submission to the n8n webhook,
   success / error states and demo mode (?demo=1).
   Requires js/config.js to be loaded first.
   ========================================================================== */
(() => {
  "use strict";

  const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  const WEBHOOK_URL = String(cfg.WEBHOOK_URL || "").trim();
  const PLACEHOLDER_MARKER = "YOUR-N8N-INSTANCE";
  const TIMEOUT_MS = 15000;
  const LIMITS = { name: 100, email: 150, messageMin: 5, messageMax: 2000 };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const DEMO_SAMPLES = [
    {
      label: "Clear – Sales",
      name: "Chidi Okafor",
      message: "Do you have a laptop available for ₦300,000?"
    },
    {
      label: "Clear – Payment",
      name: "Aisha Bello",
      message: "I paid ₦45,000 for order #4521 yesterday but I haven't received a payment confirmation."
    },
    {
      label: "Clear – Delivery",
      name: "Tunde Adeyemi",
      message: "My parcel for order #3310 was supposed to arrive on Friday. Can you give me the tracking update?"
    },
    {
      label: "Ambiguous",
      name: "Ngozi Eze",
      message: "There is a problem with what happened yesterday. Please sort it out."
    },
    {
      label: "Ambiguous – overlapping",
      name: "Emeka Nwosu",
      message: "I was charged twice and the item still hasn't come. Should I cancel?"
    }
  ];

  const form = document.getElementById("request-form");
  if (!form) return;

  const fields = {
    name: form.elements.namedItem("name"),
    email: form.elements.namedItem("email"),
    message: form.elements.namedItem("message")
  };
  const honeypot = form.elements.namedItem("website");
  const submitBtn = document.getElementById("submit-btn");
  const submitLabel = submitBtn.querySelector(".btn-label");
  const statusEl = document.getElementById("form-status");
  const warningEl = document.getElementById("config-warning");
  const formWrap = document.getElementById("form-wrap");
  const successPanel = document.getElementById("success-panel");
  const successText = document.getElementById("success-text");
  const anotherBtn = document.getElementById("send-another");
  const counter = document.getElementById("message-count");

  let sending = false;

  const isConfigured = () =>
    /^https?:\/\//i.test(WEBHOOK_URL) && !WEBHOOK_URL.includes(PLACEHOLDER_MARKER);

  // ---- Small UI helpers ----
  const updateCounter = () => {
    const length = fields.message.value.length;
    counter.textContent = `${length} / ${LIMITS.messageMax}`;
    counter.classList.toggle("is-near", length >= LIMITS.messageMax * 0.9);
  };

  const setStatus = (type, message, withRetry = false) => {
    statusEl.textContent = "";
    if (!message) return;

    const box = document.createElement("div");
    box.className = `alert alert-${type}`;
    const text = document.createElement("p");
    text.textContent = message;
    box.append(text);

    if (withRetry) {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "btn btn-secondary btn-sm";
      retry.textContent = "Try again";
      retry.addEventListener("click", () => submitBtn.click());
      box.append(retry);
    }
    statusEl.append(box);
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    submitLabel.textContent = loading ? "Sending…" : "Send request";
    form.setAttribute("aria-busy", String(loading));
  };

  // ---- Cleaning & validation ----
  const getCleanData = () => ({
    name: fields.name.value.trim(),
    email: fields.email.value.trim().toLowerCase(),
    message: fields.message.value.trim()
  });

  const validate = (data) => {
    const errors = {};

    if (!data.name) errors.name = "Please enter your full name.";
    else if (data.name.length > LIMITS.name) errors.name = `Your name must be ${LIMITS.name} characters or fewer.`;

    if (!data.email) errors.email = "Please enter your email address.";
    else if (data.email.length > LIMITS.email) errors.email = `Your email must be ${LIMITS.email} characters or fewer.`;
    else if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address, e.g. ada@example.com.";

    if (!data.message) errors.message = "Please tell us how we can help.";
    else if (data.message.length < LIMITS.messageMin) errors.message = `Please add a little more detail (at least ${LIMITS.messageMin} characters).`;
    else if (data.message.length > LIMITS.messageMax) errors.message = `Please keep your request under ${LIMITS.messageMax} characters.`;

    return errors;
  };

  // Shows inline errors; focuses the first invalid field. Returns true when valid.
  const showErrors = (errors, focusFirst = true) => {
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      const errorEl = document.getElementById(`${key}-error`);
      const message = errors[key] || "";
      errorEl.textContent = message;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        if (!firstInvalid) firstInvalid = input;
      } else {
        input.removeAttribute("aria-invalid");
      }
    });
    if (firstInvalid && focusFirst) firstInvalid.focus();
    return !firstInvalid;
  };

  // Clear a field's error as soon as the user starts fixing it
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener("input", () => {
      if (fields[key].getAttribute("aria-invalid") === "true") {
        fields[key].removeAttribute("aria-invalid");
        document.getElementById(`${key}-error`).textContent = "";
      }
    });
  });
  fields.message.addEventListener("input", updateCounter);

  // ---- Success / reset ----
  const showSuccess = (data) => {
    successText.textContent =
      `Thank you, ${data.name}! Your request has been received. We've sent a confirmation to ${data.email}.`;
    form.reset();
    updateCounter();
    showErrors({}, false);
    setStatus();
    formWrap.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  };

  const showForm = () => {
    successPanel.hidden = true;
    formWrap.hidden = false;
  };

  anotherBtn.addEventListener("click", () => {
    showForm();
    fields.name.focus();
  });

  // ---- Submit ----
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    setStatus();

    const data = getCleanData();
    if (!showErrors(validate(data))) {
      setStatus("error", "Please fix the highlighted fields and try again.");
      return;
    }

    // Bots fill the hidden field: pretend it worked, send nothing.
    if (honeypot && honeypot.value.trim() !== "") {
      console.info("[ShopEase] Honeypot field filled — submission skipped.");
      showSuccess(data);
      return;
    }

    if (!isConfigured()) {
      warningEl.hidden = false;
      setStatus("warning", "This form isn't connected yet, so your request was not sent. The site owner needs to add the webhook URL in js/config.js.");
      return;
    }

    const payload = {
      name: data.name,
      email: data.email,
      message: data.message,
      submitted_at: new Date().toISOString(),
      source: "shopease_website"
    };

    sending = true;
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const error = new Error(`Webhook responded with HTTP ${response.status}`);
        error.status = response.status;
        error.responseBody = body;
        throw error;
      }

      showSuccess(payload);
    } catch (error) {
      const timedOut = error && error.name === "AbortError";
      console.error("[ShopEase] Request submission failed:", {
        reason: timedOut ? `timeout after ${TIMEOUT_MS / 1000}s` : error.message,
        status: error.status,
        responseBody: error.responseBody,
        url: WEBHOOK_URL,
        error
      });
      setStatus(
        "error",
        timedOut
          ? "This is taking longer than expected, so we stopped waiting. Your message is still here — please try again."
          : "Sorry, we couldn't send your request just now. Your message is still here — please try again in a moment.",
        true
      );
    } finally {
      clearTimeout(timer);
      sending = false;
      setLoading(false);
    }
  });

  // ---- Demo mode (?demo=1) ----
  const fillSample = (sample) => {
    showForm();
    fields.name.value = sample.name;
    fields.message.value = sample.message;
    const demoEmail = String(cfg.DEMO_EMAIL || "").trim();
    if (demoEmail) fields.email.value = demoEmail;
    showErrors({}, false);
    updateCounter();
    setStatus("info", `Sample loaded: ${sample.label}.${fields.email.value.trim() ? "" : " Type an email address, then press Send."}`);
    (fields.email.value.trim() ? submitBtn : fields.email).focus();
  };

  const initDemo = () => {
    const panel = document.getElementById("demo-panel");
    if (!panel) return;
    const list = panel.querySelector(".demo-buttons");
    DEMO_SAMPLES.forEach((sample) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-secondary btn-sm";
      button.textContent = sample.label;
      button.addEventListener("click", () => fillSample(sample));
      list.append(button);
    });
    panel.hidden = false;
  };

  // ---- Init ----
  document.querySelectorAll("[data-response-time]").forEach((el) => {
    el.textContent = cfg.RESPONSE_TIME || "within 24 hours";
  });
  if (!isConfigured()) warningEl.hidden = false;
  if (new URLSearchParams(window.location.search).get("demo") === "1") initDemo();
  updateCounter();
})();
