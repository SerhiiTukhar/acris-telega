import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = "C:/Users/Admin/OneDrive/Документы/Узел_Смешивания";
const inputPath = path.join(root, "Глиняни_ззр.xlsx");
const outputPath = path.join(root, "Глиняни_ззр_с_плотностью.xlsx");
const appDataPath = path.join(root, "telegram-app", "data", "inventory.json");
const appDataJsPath = path.join(root, "telegram-app", "data", "inventory.js");

const densities = new Map([
  ["НАЙС Бор, 20 л", 1.35],
  ["БОР 150 (ЛУЖНИЙ) Добриво РК (МОНО БОР) 1 л.", 1.35],
  ["Найс Цинк", 1.3],
  ['АМІНО ІКС Регулятор росту рослин РК ("ГОУ АП")', 1.12],
  ["ЛФ-20 Гумат калію натрію з мікроелементами, р,органо-мінеральне добриво , 1 л", 1.1],
  ["Іл-Стар КС", 1.1],
  ["Тіаклотрин-М (каністра 5л)", 1.1],
  ["Платинум Стар", 1.1],
  ["Кайман, 5 л", 1.08],
  ["Пікадор, РК (20л)", 1.05],
  ["ЕКВІНОКС, КС (5л)", 1.08],
  ["Сойгард Голд РК 20л(гербіцид)", 1.12],
  ["Гербіцид Тефуріцид 600", 1.18],
  ["Д-Камба РК 10л(гербіцид)", 1.16],
  ["Ніколь-стар", 1.1],
  ["Ацифен (каністра 20 л)", 1.05],
  ["Olimp", 1.1],
  ["Клодекс ПРО (каністра 5л)", 1.1],
  ["Альфа-Бентазон, 20 л", 1.17],
  ["Дікогерб Супер, РК", 1.16],
  ["Гербіцид SMT-СТАР, КС", 1.1],
  ["Піностоп 1л", 0.98],
  ["ТУРБОЛИП БІОприлипач Ад'ювант на органосиліконовій основі 1 л.", 1.02],
  ["Глайдер, 5 л", 1.0],
  ["Ад'ювант Spread Oil 20 л", 0.9],
  ["Аквареді 5 л", 1.15],
  ["Піностоп", 0.98],
  ["Нор Ест Лайн Аква ph10л канстра", 1.08],
  ["Вартіс (каністра 5л)", 1.08],
  ["Пріланко, 5 л", 1.1],
  ["Олл Брайт 5л", 1.1],
]);

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function massKg(unit, qty, density) {
  if (qty == null) return null;
  if (unit === "кг") return qty;
  if (unit === "т") return qty * 1000;
  if (unit === "л" && density != null) return qty * density;
  return null;
}

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("TDSheet");
const used = sheet.getUsedRange();
const rows = used.values;

sheet.getRange("G8:I8").values = [["Расчет для узла смешивания", null, null]];
sheet.getRange("G9:I9").values = [["Плотность", "Масса", "Статус"]];
sheet.getRange("G10:I10").values = [["кг/л", "кг", "Источник"]];
sheet.getRange("G8:I10").format = {
  fill: "#1f7930",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
};
sheet.getRange("G8:I10").format.borders = { preset: "all", style: "thin", color: "#FFFFFF" };

const appItems = [];
let currentGroup = "";
let currentCategory = "";
const densityValues = [];
const massFormulaValues = [];
const statusValues = [];

for (let idx = 10; idx < rows.length; idx += 1) {
  const excelRow = idx + 1;
  const name = rows[idx]?.[0] ?? "";
  const group = rows[idx]?.[1] ?? "";
  const unit = rows[idx]?.[2] ?? "";
  const qty = asNumber(rows[idx]?.[3]);
  const cost = asNumber(rows[idx]?.[4]);

  if (group && !unit) {
    if (String(group).includes(".")) currentGroup = group;
    else currentCategory = group;
  }

  const density = densities.get(name) ?? null;
  densityValues.push([density]);
  massFormulaValues.push([
    `=IF(D${excelRow}="л",IF(G${excelRow}<>"",E${excelRow}*G${excelRow},""),IF(D${excelRow}="кг",E${excelRow},IF(D${excelRow}="т",E${excelRow}*1000,"")))`,
  ]);
  statusValues.push([unit === "л" ? (density == null ? "Нужно уточнить" : "Ориентировочно") : "Не требуется"]);

  if (unit) {
    appItems.push({
      row: excelRow,
      name,
      article: rows[idx]?.[1] || "",
      unit,
      quantity: qty,
      cost,
      densityKgL: density,
      massKg: massKg(unit, qty, density),
      group: currentGroup,
      category: currentCategory,
      densityStatus: unit === "л" ? (density == null ? "Нужно уточнить" : "Ориентировочно") : "Не требуется",
    });
  }
}

sheet.getRange(`G11:G${rows.length}`).values = densityValues;
sheet.getRange(`H11:H${rows.length}`).formulas = massFormulaValues;
sheet.getRange(`I11:I${rows.length}`).values = statusValues;
sheet.getRange(`G11:H${rows.length}`).format.numberFormat = "0.000";
sheet.getRange(`I11:I${rows.length}`).format.wrapText = true;
sheet.getRange(`G11:I${rows.length}`).format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
sheet.getRange("A10:I10").format = {
  fill: "#D9EAF7",
  font: { bold: true, color: "#1F2937" },
  wrapText: true,
};
sheet.getRange("A:I").format.autofitColumns();
sheet.freezePanes.freezeRows(10);

await fs.mkdir(path.dirname(appDataPath), { recursive: true });
const appData = {
  generatedAt: new Date().toISOString(),
  sourceFile: "Глиняни_ззр.xlsx",
  location: "Глиняни",
  items: appItems,
};
const appDataJson = JSON.stringify(appData, null, 2);
await fs.writeFile(appDataPath, appDataJson, "utf8");
await fs.writeFile(appDataJsPath, `window.INVENTORY_DATA = ${appDataJson};\n`, "utf8");

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath, appDataPath, appDataJsPath, itemCount: appItems.length }, null, 2));
