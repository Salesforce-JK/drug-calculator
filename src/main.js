// Simple drug rules
const RULES = {
  ibuprofen: {
    perDoseMgPerKg: 10,
    singleDoseCapMg: 400,
    maxDailyMgPerKg: 40,
    maxDailyCapMg: 1200,
    interval: { en: "every 6–8 hours", cs: "každých 6–8 hodin" },
    label: { en: "Nurofen (Ibuprofen)", cs: "Nurofen (Ibuprofen)" }
  },
  paracetamol: {
    perDoseMgPerKg: 15,
    singleDoseCapMg: 1000,
    maxDailyMgPerKg: 75,
    maxDailyCapMg: 3000,
    interval: { en: "every 4–6 hours", cs: "každé 4–6 hodiny" },
    label: { en: "Paralen (Paracetamol)", cs: "Paralen (Paracetamol)" }
  }
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const roundTo = (n, step = 10) => Math.round(n / step) * step;
const formatMg = mg => `${mg.toLocaleString()} mg`;

const calcDose = (weightKg, drug) => {
  const r = RULES[drug];
  const perDoseRaw = weightKg * r.perDoseMgPerKg;
  const perDose = Math.min(perDoseRaw, r.singleDoseCapMg);
  const maxDailyByWeight = weightKg * r.maxDailyMgPerKg;
  const maxDaily = Math.min(maxDailyByWeight, r.maxDailyCapMg);

  return {
    perDose: roundTo(clamp(perDose, 0, r.singleDoseCapMg)),
    maxDaily: roundTo(clamp(maxDaily, 0, r.maxDailyCapMg))
  };
};

const renderResult = (res, drug, lang) => {
  const r = RULES[drug];
  document.getElementById("result").innerHTML = `
    <div class="card">
      <strong>${r.label[lang]}</strong> — ${r.interval[lang]}
      <div class="field">
        <p><span lang="${lang}">${lang === "en" ? "Per-dose estimate" : "Dávka na jednu dávku"}:</span> 
        <strong>${formatMg(res.perDose)}</strong></p>
        <p><span lang="${lang}">${lang === "en" ? "Max in 24 hours" : "Maximum za 24 hodin"}:</span> 
        <strong>${formatMg(res.maxDaily)}</strong></p>
      </div>
    </div>
  `;
};

const initForm = (lang) => {
  const form = document.getElementById("dose-form");
  form.onsubmit = e => {
    e.preventDefault();
    const weight = Number(document.getElementById("weight")?.value);
    const drug = document.getElementById("drug")?.value;
    if (!weight || weight < 2 || weight > 300) {
      document.getElementById("result").innerHTML =
        `<p style="color:red">${lang === "en" ? "Invalid weight." : "Neplatná hmotnost."}</p>`;
      return;
    }
    renderResult(calcDose(weight, drug), drug, lang);
  };
};

const updateLanguage = (lang) => {
  document.documentElement.lang = lang;
  document.querySelectorAll("[lang]").forEach(el => {
    el.classList.remove("active", "block");
    if (el.getAttribute("lang") === lang) {
      if (["H1","P","LABEL","SMALL","BUTTON"].includes(el.tagName))
        el.classList.add("block","active");
      else el.classList.add("active");
    }
  });
  initForm(lang);
};

const initLangSwitcher = () => {
  const switcher = document.getElementById("lang-switcher");
  switcher.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => updateLanguage(btn.dataset.lang);
  });
  updateLanguage(document.documentElement.lang || "en");
};

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
});
