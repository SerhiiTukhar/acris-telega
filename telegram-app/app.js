const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const state = {
  items: [],
  query: "",
  category: "",
};

const els = {
  totalItems: document.querySelector("#totalItems"),
  liquidItems: document.querySelector("#liquidItems"),
  totalMass: document.querySelector("#totalMass"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  stockList: document.querySelector("#stockList"),
  sendSummary: document.querySelector("#sendSummary"),
  template: document.querySelector("#itemTemplate"),
};

const formatNumber = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

function savedDensityKey(item) {
  return `density:${item.row}:${item.name}`;
}

function getDensity(item) {
  const saved = localStorage.getItem(savedDensityKey(item));
  if (saved !== null && saved !== "") return Number(saved);
  return item.densityKgL;
}

function getMass(item) {
  const qty = Number(item.quantity ?? 0);
  if (item.unit === "кг") return qty;
  if (item.unit === "т") return qty * 1000;
  if (item.unit === "л") {
    const density = getDensity(item);
    return density ? qty * density : null;
  }
  return null;
}

function visibleItems() {
  const query = state.query.trim().toLowerCase();
  return state.items.filter((item) => {
    const matchesCategory = !state.category || item.category === state.category || item.group === state.category;
    const haystack = [item.name, item.article, item.category, item.group].join(" ").toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function renderSummary(items) {
  const liquidItems = items.filter((item) => item.unit === "л").length;
  const totalMass = items.reduce((sum, item) => sum + (getMass(item) ?? 0), 0);
  els.totalItems.textContent = formatNumber.format(items.length);
  els.liquidItems.textContent = formatNumber.format(liquidItems);
  els.totalMass.textContent = formatNumber.format(totalMass);
}

function renderCategories() {
  const categories = [...new Set(state.items.map((item) => item.category || item.group).filter(Boolean))].sort();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  }
}

function renderList() {
  const items = visibleItems();
  renderSummary(items);
  els.stockList.textContent = "";

  for (const item of items) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const density = getDensity(item);
    const mass = getMass(item);
    const status = node.querySelector(".status");
    const densityInput = node.querySelector(".density");

    node.querySelector("h2").textContent = item.name;
    node.querySelector(".meta").textContent = [item.category, item.article && `арт. ${item.article}`]
      .filter(Boolean)
      .join(" · ");
    node.querySelector(".quantity").textContent = `${formatNumber.format(item.quantity ?? 0)} ${item.unit}`;
    node.querySelector(".mass").textContent = mass == null ? "—" : `${formatNumber.format(mass)} кг`;

    status.textContent = item.densityStatus;
    status.classList.toggle("warning", item.densityStatus !== "Ориентировочно" && item.unit === "л");

    densityInput.value = density ?? "";
    densityInput.disabled = item.unit !== "л";
    densityInput.addEventListener("input", () => {
      localStorage.setItem(savedDensityKey(item), densityInput.value);
      renderSummary(visibleItems());
      node.querySelector(".mass").textContent = getMass(item) == null ? "—" : `${formatNumber.format(getMass(item))} кг`;
    });

    els.stockList.append(node);
  }
}

function sendSummary() {
  const items = visibleItems();
  const payload = {
    type: "mixing_node_stock_summary",
    items: items.length,
    liquids: items.filter((item) => item.unit === "л").length,
    massKg: Math.round(items.reduce((sum, item) => sum + (getMass(item) ?? 0), 0) * 100) / 100,
  };

  if (tg?.sendData) {
    tg.sendData(JSON.stringify(payload));
  } else {
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    els.sendSummary.title = "Сводка скопирована";
  }
}

function init() {
  const data = window.INVENTORY_DATA ?? { items: [] };
  state.items = data.items;
  renderCategories();
  renderList();
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderList();
});

els.categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderList();
});

els.sendSummary.addEventListener("click", sendSummary);

init();
