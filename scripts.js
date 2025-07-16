const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwo2oXpBHICeC7irWkVLH_vD7RbVHi_JEVNsaZvTiHlino8C7SVvTK9s3bIR__Q8DVbJjwcsuOR_an/pub?output=csv';

async function fetchPrompts() {
  const res = await fetch(sheetURL);
  const text = await res.text();
  const rows = text.split('\n').slice(1).map(r => r.split(','));
  return rows.map(r => ({
    id: r[0],
    businessUnit: r[1],
    title: r[2],
    prompt: r[3],
    tags: r[4]
  }));
}

function renderTabs(units, current, onClick) {
  const tabsDiv = document.getElementById('tabs');
  tabsDiv.innerHTML = '';
  ['All', ...units].forEach(unit => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (unit === current ? ' active' : '');
    btn.innerText = unit;
    btn.onclick = () => onClick(unit);
    tabsDiv.appendChild(btn);
  });
}

function renderPrompts(prompts) {
  const container = document.getElementById('prompt-container');
  container.innerHTML = '';
  prompts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.prompt}</p>
      <p><em>${p.tags}</em></p>
      <button class="copy-button" onclick="navigator.clipboard.writeText('${p.prompt.replace(/'/g, "\'")}')">Copy</button>
    `;
    container.appendChild(card);
  });
}

async function setup() {
  const allPrompts = await fetchPrompts();
  const units = [...new Set(allPrompts.map(p => p.businessUnit))];
  let currentTab = 'All';

  function applyFilters() {
    const searchVal = document.getElementById('search').value.toLowerCase();
    const filtered = allPrompts.filter(p =>
      (currentTab === 'All' || p.businessUnit === currentTab) &&
      (p.title.toLowerCase().includes(searchVal) || p.prompt.toLowerCase().includes(searchVal))
    );
    renderPrompts(filtered);
  }

  renderTabs(units, currentTab, (unit) => {
    currentTab = unit;
    renderTabs(units, currentTab, arguments.callee);
    applyFilters();
  });

  document.getElementById('search').oninput = applyFilters;

  applyFilters();
}

setup();