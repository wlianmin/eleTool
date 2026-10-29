const E96 = [10, 10.2, 10.5, 10.7, 11, 11.3, 11.5, 11.8, 12.1, 12.4, 12.7, 13, 13.3, 13.7, 14, 14.3, 14.7, 15, 15.4, 15.8, 16.2, 16.5, 16.9, 17.4, 17.8, 18.2, 18.7, 19.1, 19.6, 20, 20.5, 21, 21.5, 22.1, 22.6, 23.2, 23.7, 24.3, 24.9, 25.5, 26.1, 26.7, 27.4, 28, 28.7, 29.4, 30.1, 30.9, 31.6, 32.4, 33.2, 34, 34.8, 35.7, 36.5, 37.4, 38.3, 39.2, 40.2, 41.2, 42.2, 43.2, 44.2, 45.3, 46.4, 47.5, 48.7, 49.9, 51.1, 52.3, 53.6, 54.9, 56.2, 57.6, 59, 60.4, 61.9, 63.4, 64.9, 66.5, 68.1, 69.8, 71.5, 73.2, 75, 76.8, 78.7, 80.6, 82.5, 84.5, 86.6, 88.7, 90.9, 93.1, 95.3, 97.6].map((value) => value * 10);
const EIA96_MULTIPLIER = { Z: -3, Y: -2, X: -1, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, H: 6, S: 7, R: 8, Q: 9 };

const input = document.querySelector('#code-input');
const clearButton = document.querySelector('#clear-btn');
const resultCard = document.querySelector('.result-card');
const resultValue = document.querySelector('#result-value');
const resultSubline = document.querySelector('#result-subline');
const matchType = document.querySelector('#match-type');
const codeDisplay = document.querySelector('#code-display');
const toleranceDisplay = document.querySelector('#tolerance-display');
const seriesDisplay = document.querySelector('#series-display');
const chips = [...document.querySelectorAll('.example-chip')];

function formatOhms(value) {
  const units = [['MΩ', 1e6], ['kΩ', 1e3], ['Ω', 1]];
  const unit = units.find(([, factor]) => value >= factor) || units[2];
  const amount = value / unit[1];
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} <span>${unit[0]}</span>`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(value);
}

function parseCode(raw) {
  const code = raw.replace(/\s+/g, '').toUpperCase();
  if (!code) return null;
  if (/^\d{3}$/.test(code)) {
    const value = Number(code.slice(0, 2)) * 10 ** Number(code[2]);
    return { value, type: '3 位码 · ±5%', tolerance: '±5%', series: 'E24', digits: code.slice(0, 2), exponent: code[2], copy: '前两位为有效数字，第三位代表后面增加的零。' };
  }
  if (/^\d{4}$/.test(code)) {
    const value = Number(code.slice(0, 3)) * 10 ** Number(code[3]);
    return { value, type: '4 位码 · ±1%', tolerance: '±1%', series: 'E96', digits: code.slice(0, 3), exponent: code[3], copy: '前三位为有效数字，第四位代表后面增加的零。' };
  }
  if (/^\d{2}[A-Z]$/.test(code) && EIA96_MULTIPLIER[code[2]] !== undefined) {
    const index = Number(code.slice(0, 2));
    if (index < 1 || index > 96) return null;
    const exponent = EIA96_MULTIPLIER[code[2]];
    const value = E96[index - 1] * 10 ** exponent;
    return { value, type: 'EIA-96 · ±1%', tolerance: '±1%', series: 'E96', digits: String(E96[index - 1]), exponent: exponent >= 0 ? `+${exponent}` : exponent, copy: '前两位对应 E96 系数，末位字母代表倍率。' };
  }
  if (/^\d*[R][\d]*$/.test(code) || /^R\d+$/.test(code)) {
    const value = Number(code.replace('R', '.'));
    if (!Number.isFinite(value)) return null;
    return { value, type: 'R 小数记法 · 常见 ±1%', tolerance: '常见 ±1%', series: 'R 记法', digits: code.replace('R', '.'), exponent: null, copy: '字母 R 代替小数点，同时保证丝印在元件上清晰可读。' };
  }
  return null;
}

function render(raw) {
  const code = raw.replace(/\s+/g, '').toUpperCase();
  const parsed = parseCode(raw);
  chips.forEach((chip) => chip.classList.toggle('active', chip.dataset.code === code));
  codeDisplay.textContent = code || '—';
  if (!parsed) {
    resultCard.classList.add('invalid');
    resultValue.innerHTML = code ? '无法识别' : '等待输入';
    resultSubline.textContent = code ? '请检查丝印格式，例如 473、334 或 01B' : '输入丝印后自动计算';
    matchType.textContent = '未匹配';
    toleranceDisplay.textContent = '—';
    seriesDisplay.textContent = '—';
    return;
  }
  resultCard.classList.remove('invalid');
  resultValue.innerHTML = formatOhms(parsed.value);
  resultSubline.textContent = `= ${formatNumber(parsed.value)} Ω`;
  matchType.textContent = parsed.type;
  toleranceDisplay.textContent = parsed.tolerance;
  seriesDisplay.textContent = parsed.series;
}

input.addEventListener('input', () => render(input.value));
clearButton.addEventListener('click', () => { input.value = ''; input.focus(); render(''); });
chips.forEach((chip) => chip.addEventListener('click', () => { input.value = chip.dataset.code; render(input.value); input.focus(); }));
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.focus(); input.select(); } });
render(input.value);
