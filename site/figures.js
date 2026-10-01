/* Simplified teaching drawings. Numbering matches the BAMF catalog of 07.05.2025.
   These are not the catalog scans. */
(function () {
  function stars(cx, cy, r, n, color) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x = (cx + r * Math.cos(a)).toFixed(1);
      const y = (cy + r * Math.sin(a)).toFixed(1);
      out += `<circle cx="${x}" cy="${y}" r="1.7" fill="${color}"/>`;
    }
    return out;
  }

  function frame(inner, caption) {
    return `<figure class="sheet-fig"><div class="fig-row">${inner}</div><figcaption>${caption}</figcaption></figure>`;
  }

  function cell(n, svg) {
    return `<div class="fig-cell"><div class="fig-draw">${svg}</div><span>Bild ${n}</span></div>`;
  }

  function numCell(n, svg) {
    return `<div class="fig-cell"><div class="fig-draw">${svg}</div><span>${n}</span></div>`;
  }

  const eagle = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M6 6h52v40c0 16-12 26-26 28C18 72 6 62 6 46z" fill="#e4c33a" stroke="#1c1915" stroke-width="1.4"/><path d="M30 34c-16-4-20 8-16 18 8-4 12-6 16-12z" fill="#1c1915"/><path d="M34 32c14-8 20 2 16 16-8-2-12-4-16-10z" fill="#1c1915"/><ellipse cx="32" cy="42" rx="6" ry="12" fill="#1c1915"/><circle cx="40" cy="22" r="5" fill="#1c1915"/><path d="M44 21h8l-3 3z" fill="#b4532a"/><path d="M26 52l-6 8M34 54l6 8" stroke="#1c1915" stroke-width="2"/></svg>`;
  const chi = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M32 8c10 8 14 14 14 24 0 8-4 16-14 28-10-12-14-20-14-28 0-10 4-16 14-24z" fill="none" stroke="#1c1915" stroke-width="3.2"/><path d="M18 30h28M32 14v36" stroke="#1c1915" stroke-width="3.2"/><path d="M32 18c8 0 12 6 12 12" fill="none" stroke="#1c1915" stroke-width="3.2"/></svg>`;
  const cross = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M24 8h16l2 14h14v16l-14 2v14H26l-2-14H10V24h14z" fill="#b9c0c6" stroke="#31506a" stroke-width="1.6"/></svg>`;
  const gdr = `<svg viewBox="0 0 64 76" aria-hidden="true"><circle cx="32" cy="36" r="22" fill="#b4332a" stroke="#e4c33a" stroke-width="3"/><path d="M14 36c4-12 12-18 18-18s14 6 18 18" fill="none" stroke="#e4c33a" stroke-width="2"/><path d="M14 40c6 10 12 14 18 14s12-4 18-14" fill="none" stroke="#c9a24a" stroke-width="2"/><path d="M24 42h16l-3-8h-4l2-8h-6l2 8h-4z" fill="#e4c33a"/><circle cx="32" cy="30" r="4" fill="none" stroke="#e4c33a" stroke-width="1.6"/></svg>`;

  const castle = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 10h48v44c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><path d="M16 28h8v22h-8zM28 18h8v32h-8zM40 28h8v22h-8z" fill="#f4f0e6"/><path d="M18 28v-6h4v6M30 18v-6h4v6M42 28v-6h4v6" stroke="#f4f0e6" stroke-width="1.4"/><path d="M28 50h8v8h-8z" fill="#1c1915"/></svg>`;
  const key = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><circle cx="26" cy="30" r="8" fill="none" stroke="#f4f0e6" stroke-width="3"/><path d="M33 30h16v4h-4v6h-4v-6h-4" fill="none" stroke="#f4f0e6" stroke-width="3"/></svg>`;
  const lion = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c4c7a" stroke="#1c1915"/><path d="M10 16h44v8H10zM10 32h44v8H10z" fill="#f4f0e6"/><path d="M10 24h44v8H10zM10 40h44v8H10z" fill="#b4332a"/><path d="M30 20c6 2 10 10 8 20-6 2-12 0-14-6 2-6 2-12 6-14z" fill="#e4c33a"/></svg>`;
  const bear = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M16 4h10l2 5h8l2-5h10v8l6 4v6H10v-6l6-4z" fill="#e4c33a" stroke="#1c1915"/><path d="M8 16h48v40c0 10-10 16-24 18C18 72 8 66 8 56z" fill="#f7f4ee" stroke="#1c1915"/><circle cx="24" cy="34" r="5" fill="#1c1915"/><circle cx="40" cy="34" r="5" fill="#1c1915"/><ellipse cx="32" cy="44" rx="8" ry="9" fill="#1c1915"/><circle cx="29" cy="43" r="1" fill="#f7f4ee"/><circle cx="35" cy="43" r="1" fill="#f7f4ee"/><ellipse cx="32" cy="48" rx="2" ry="1.3" fill="#f7f4ee"/></svg>`;

  const us = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#f4f0e6" stroke="#1c1915"/><rect width="72" height="6.8" y="0" fill="#b4332a"/><rect width="72" height="6.8" y="13.6" fill="#b4332a"/><rect width="72" height="6.8" y="27.2" fill="#b4332a"/><rect width="72" height="6.8" y="40.8" fill="#b4332a"/><rect width="30" height="26" fill="#2c4c7a"/></svg>`;
  const eu = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#2c4c9a" stroke="#1c1915"/>${stars(36, 24, 14, 12, "#e4c33a")}</svg>`;
  const un = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#5aa0d6" stroke="#1c1915"/><circle cx="36" cy="24" r="10" fill="none" stroke="#f7f4ee" stroke-width="1.6"/>${stars(36, 24, 10, 8, "#f7f4ee")}</svg>`;
  const other = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#1d3f86" stroke="#1c1915"/><path d="M36 8a16 16 0 1 0 12 6" fill="none" stroke="#e4c33a" stroke-width="2"/>${stars(36, 24, 12, 8, "#e4c33a")}</svg>`;

  const berlinWappen = frame(
    cell(1, castle) + cell(2, key) + cell(3, lion) + cell(4, bear),
    "Vereinfachte Wappen. Die Bildnummern sind dieselben wie im Katalog."
  );

  const wappen4 = frame(
    cell(1, eagle) + cell(2, chi) + cell(3, cross) + cell(4, gdr),
    "Vereinfacht gezeichnet. Die Bildnummern sind dieselben wie im Katalog."
  );
  const flags = frame(
    cell(1, us) + cell(2, eu) + cell(3, un) + cell(4, other),
    "Vereinfachte Flaggen. Die Bildnummern sind dieselben wie im Katalog."
  );

  const byId = {
    "g-021": wappen4,
    "g-209": wappen4,
    "g-226": flags,
    "BE-01": berlinWappen,
  };

  window.LID_FIGURE = function (id) {
    return byId[id] || "";
  };
})();
