/* Simplified teaching drawings and map figures.
   Numbering matches the BAMF catalog of 07.05.2025.
   These are vector illustrations for study purposes. */
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

  // Base coat of arms & heraldic elements
  const eagle = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M6 6h52v40c0 16-12 26-26 28C18 72 6 62 6 46z" fill="#e4c33a" stroke="#1c1915" stroke-width="1.4"/><path d="M30 34c-16-4-20 8-16 18 8-4 12-6 16-12z" fill="#1c1915"/><path d="M34 32c14-8 20 2 16 16-8-2-12-4-16-10z" fill="#1c1915"/><ellipse cx="32" cy="42" rx="6" ry="12" fill="#1c1915"/><circle cx="40" cy="22" r="5" fill="#1c1915"/><path d="M44 21h8l-3 3z" fill="#b4532a"/><path d="M26 52l-6 8M34 54l6 8" stroke="#1c1915" stroke-width="2"/></svg>`;
  const chi = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M32 8c10 8 14 14 14 24 0 8-4 16-14 28-10-12-14-20-14-28 0-10 4-16 14-24z" fill="none" stroke="#1c1915" stroke-width="3.2"/><path d="M18 30h28M32 14v36" stroke="#1c1915" stroke-width="3.2"/><path d="M32 18c8 0 12 6 12 12" fill="none" stroke="#1c1915" stroke-width="3.2"/></svg>`;
  const cross = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M24 8h16l2 14h14v16l-14 2v14H26l-2-14H10V24h14z" fill="#b9c0c6" stroke="#31506a" stroke-width="1.6"/></svg>`;
  const gdr = `<svg viewBox="0 0 64 76" aria-hidden="true"><circle cx="32" cy="36" r="22" fill="#b4332a" stroke="#e4c33a" stroke-width="3"/><path d="M14 36c4-12 12-18 18-18s14 6 18 18" fill="none" stroke="#e4c33a" stroke-width="2"/><path d="M14 40c6 10 12 14 18 14s12-4 18-14" fill="none" stroke="#c9a24a" stroke-width="2"/><path d="M24 42h16l-3-8h-4l2-8h-6l2 8h-4z" fill="#e4c33a"/><circle cx="32" cy="30" r="4" fill="none" stroke="#e4c33a" stroke-width="1.6"/></svg>`;

  const castle = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 10h48v44c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><path d="M16 28h8v22h-8zM28 18h8v32h-8zM40 28h8v22h-8z" fill="#f4f0e6"/><path d="M18 28v-6h4v6M30 18v-6h4v6M42 28v-6h4v6" stroke="#f4f0e6" stroke-width="1.4"/><path d="M28 50h8v8h-8z" fill="#1c1915"/></svg>`;
  const key = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><circle cx="26" cy="30" r="8" fill="none" stroke="#f4f0e6" stroke-width="3"/><path d="M33 30h16v4h-4v6h-4v-6h-4" fill="none" stroke="#f4f0e6" stroke-width="3"/></svg>`;
  const lion = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c4c7a" stroke="#1c1915"/><path d="M10 16h44v8H10zM10 32h44v8H10z" fill="#f4f0e6"/><path d="M10 24h44v8H10zM10 40h44v8H10z" fill="#b4332a"/><path d="M30 20c6 2 10 10 8 20-6 2-12 0-14-6 2-6 2-12 6-14z" fill="#e4c33a"/></svg>`;
  const bear = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M16 4h10l2 5h8l2-5h10v8l6 4v6H10v-6l6-4z" fill="#e4c33a" stroke="#1c1915"/><path d="M8 16h48v40c0 10-10 16-24 18C18 72 8 66 8 56z" fill="#f7f4ee" stroke="#1c1915"/><circle cx="24" cy="34" r="5" fill="#1c1915"/><circle cx="40" cy="34" r="5" fill="#1c1915"/><ellipse cx="32" cy="44" rx="8" ry="9" fill="#1c1915"/><circle cx="29" cy="43" r="1" fill="#f7f4ee"/><circle cx="35" cy="43" r="1" fill="#f7f4ee"/><ellipse cx="32" cy="48" rx="2" ry="1.3" fill="#f7f4ee"/></svg>`;

  // Extended state shields
  const bwShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#e4c33a" stroke="#1c1915"/><path d="M22 20h20v6h-20zM22 34h20v6h-20zM22 48h20v6h-20z" fill="#1c1915"/><circle cx="38" cy="23" r="2.5" fill="#b4332a"/><circle cx="38" cy="37" r="2.5" fill="#b4332a"/><circle cx="38" cy="51" r="2.5" fill="#b4332a"/></svg>`;
  const byShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c4c9a" stroke="#1c1915"/><polygon points="8,8 24,8 8,24" fill="#f4f0e6"/><polygon points="24,8 40,8 8,40 8,24" fill="#f4f0e6"/><polygon points="40,8 56,8 8,56 8,40" fill="#f4f0e6"/><polygon points="56,8 56,24 24,56 8,56" fill="#f4f0e6"/><polygon points="56,24 56,40 40,56 24,56" fill="#f4f0e6"/></svg>`;
  const horseShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><path d="M24 44c4-12 10-16 18-18-2-4-6-6-10-4-4 2-8 8-8 14z" fill="#f4f0e6"/><circle cx="28" cy="24" r="5" fill="#f4f0e6"/><path d="M24 44l-6 10M36 44l4 10M40 34l8 8" stroke="#f4f0e6" stroke-width="2.5"/></svg>`;
  const redEagleShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#f4f0e6" stroke="#1c1915"/><path d="M30 34c-16-4-20 8-16 18 8-4 12-6 16-12z" fill="#b4332a"/><path d="M34 32c14-8 20 2 16 16-8-2-12-4-16-10z" fill="#b4332a"/><ellipse cx="32" cy="42" rx="6" ry="12" fill="#b4332a"/><circle cx="40" cy="22" r="5" fill="#b4332a"/><path d="M44 21h8l-3 3z" fill="#e4c33a"/></svg>`;
  const nrwShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c5a38" stroke="#1c1915"/><path d="M32 8h24v46c0 5-4 10-12 14V8z" fill="#b4332a"/><path d="M14 20q10 6 0 12t0 12" stroke="#f4f0e6" stroke-width="3" fill="none"/><circle cx="44" cy="46" r="6" fill="#b4332a" stroke="#e4c33a" stroke-width="1.8"/></svg>`;
  const saxonBars = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#e4c33a" stroke="#1c1915"/><path d="M8 16h48v8H8zM8 32h48v8H8zM8 48h48v8H8z" fill="#1c1915"/><path d="M12 12l40 40" stroke="#2c5a38" stroke-width="6" stroke-linecap="round"/></svg>`;
  const bullShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#e4c33a" stroke="#1c1915"/><ellipse cx="32" cy="40" rx="14" ry="12" fill="#1c1915"/><path d="M22 30c-6-10-2-16 4-14M42 30c6-10 2-16-4-14" stroke="#f4f0e6" stroke-width="3" fill="none"/><circle cx="26" cy="38" r="2.5" fill="#f4f0e6"/><circle cx="38" cy="38" r="2.5" fill="#f4f0e6"/></svg>`;
  const wheelCross = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><circle cx="24" cy="28" r="10" stroke="#f4f0e6" stroke-width="2.5" fill="none"/><line x1="14" y1="28" x2="34" y2="28" stroke="#f4f0e6" stroke-width="2"/><line x1="24" y1="18" x2="24" y2="38" stroke="#f4f0e6" stroke-width="2"/><path d="M40 20h12v16H40z" fill="#f4f0e6"/><line x1="46" y1="14" x2="46" y2="42" stroke="#b4332a" stroke-width="2"/></svg>`;
  const nettleLions = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#b4332a" stroke="#1c1915"/><path d="M8 8h24v56C18 62 8 56 8 46z" fill="#e4c33a"/><path d="M12 24h14M12 40h14" stroke="#2c4c9a" stroke-width="4"/><polygon points="44,20 54,34 46,46 36,36" fill="#f4f0e6"/></svg>`;
  const anhaltShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#f4f0e6" stroke="#1c1915"/><path d="M8 38h48v24C32 68 8 58 8 38z" fill="#b4332a"/><ellipse cx="32" cy="34" rx="10" ry="7" fill="#1c1915"/><circle cx="26" cy="30" r="3" fill="#1c1915"/></svg>`;
  const saarShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c4c7a" stroke="#1c1915"/><path d="M32 8h24v26H32z" fill="#f4f0e6"/><path d="M8 34h24v28c-8-2-16-8-24-16z" fill="#e4c33a"/><path d="M32 34h24v12c0 8-12 16-24 18z" fill="#b4332a"/><line x1="8" y1="34" x2="56" y2="34" stroke="#1c1915" stroke-width="1.5"/><line x1="32" y1="8" x2="32" y2="70" stroke="#1c1915" stroke-width="1.5"/></svg>`;
  const thShield = `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M8 8h48v46c0 10-10 16-24 18C18 70 8 64 8 54z" fill="#2c4c9a" stroke="#1c1915"/><path d="M10 16h44v8H10zM10 32h44v8H10z" fill="#f4f0e6"/><path d="M10 24h44v8H10zM10 40h44v8H10z" fill="#b4332a"/>${stars(32, 38, 18, 8, "#f4f0e6")}</svg>`;

  // Flags
  const us = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#f4f0e6" stroke="#1c1915"/><rect width="72" height="6.8" y="0" fill="#b4332a"/><rect width="72" height="6.8" y="13.6" fill="#b4332a"/><rect width="72" height="6.8" y="27.2" fill="#b4332a"/><rect width="72" height="6.8" y="40.8" fill="#b4332a"/><rect width="30" height="26" fill="#2c4c7a"/></svg>`;
  const eu = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#2c4c9a" stroke="#1c1915"/>${stars(36, 24, 14, 12, "#e4c33a")}</svg>`;
  const un = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#5aa0d6" stroke="#1c1915"/><circle cx="36" cy="24" r="10" fill="none" stroke="#f7f4ee" stroke-width="1.6"/>${stars(36, 24, 10, 8, "#f7f4ee")}</svg>`;
  const other = `<svg viewBox="0 0 72 48" aria-hidden="true"><rect width="72" height="48" fill="#1d3f86" stroke="#1c1915"/><path d="M36 8a16 16 0 1 0 12 6" fill="none" stroke="#e4c33a" stroke-width="2"/>${stars(36, 24, 12, 8, "#e4c33a")}</svg>`;

  // Architectural / Reichstag drawing
  const reichstag = `<svg viewBox="0 0 120 75" style="width:min(100%, 14rem);height:auto;display:block" aria-hidden="true">
    <rect width="120" height="75" fill="#f3efe4"/>
    <path d="M46 32 C46 16 74 16 74 32 Z" fill="#6baed6" stroke="#1c1915" stroke-width="1.4"/>
    <line x1="60" y1="16" x2="60" y2="32" stroke="#1c1915" stroke-width="1"/>
    <line x1="52" y1="20" x2="68" y2="28" stroke="#1c1915" stroke-width="0.8"/>
    <line x1="68" y1="20" x2="52" y2="28" stroke="#1c1915" stroke-width="0.8"/>
    <line x1="60" y1="16" x2="60" y2="10" stroke="#1c1915" stroke-width="1.2"/>
    <rect x="60" y="10" width="8" height="5" fill="#1c1915"/>
    <rect x="15" y="32" width="90" height="34" fill="#e7e0d2" stroke="#1c1915" stroke-width="1.5"/>
    <polygon points="45,32 60,24 75,32" fill="#d9d0c0" stroke="#1c1915" stroke-width="1.2"/>
    <line x1="48" y1="32" x2="48" y2="66" stroke="#1c1915" stroke-width="1.4"/>
    <line x1="56" y1="32" x2="56" y2="66" stroke="#1c1915" stroke-width="1.4"/>
    <line x1="64" y1="32" x2="64" y2="66" stroke="#1c1915" stroke-width="1.4"/>
    <line x1="72" y1="32" x2="72" y2="66" stroke="#1c1915" stroke-width="1.4"/>
    <rect x="22" y="38" width="8" height="10" fill="#221f1b"/>
    <rect x="22" y="52" width="8" height="10" fill="#221f1b"/>
    <rect x="90" y="38" width="8" height="10" fill="#221f1b"/>
    <rect x="90" y="52" width="8" height="10" fill="#221f1b"/>
    <rect x="10" y="66" width="100" height="4" fill="#1c1915"/>
  </svg>`;

  // Ballots (Stimmzettel)
  const ballotValid = `<svg viewBox="0 0 46 64" aria-hidden="true"><rect width="46" height="64" fill="#fdfbf7" stroke="#1c1915" stroke-width="1.2"/><line x1="23" y1="4" x2="23" y2="60" stroke="#999" stroke-dasharray="1 1"/><circle cx="16" cy="20" r="4" fill="none" stroke="#1c1915"/><line x1="13" y1="17" x2="19" y2="23" stroke="#1c1915" stroke-width="1.5"/><line x1="19" y1="17" x2="13" y2="23" stroke="#1c1915" stroke-width="1.5"/><circle cx="30" cy="34" r="4" fill="none" stroke="#1c1915"/><line x1="27" y1="31" x2="33" y2="37" stroke="#1c1915" stroke-width="1.5"/><line x1="33" y1="31" x2="27" y2="37" stroke="#1c1915" stroke-width="1.5"/><line x1="6" y1="10" x2="18" y2="10" stroke="#999"/><line x1="28" y1="10" x2="40" y2="10" stroke="#999"/></svg>`;
  const ballotMulti = `<svg viewBox="0 0 46 64" aria-hidden="true"><rect width="46" height="64" fill="#fdfbf7" stroke="#1c1915" stroke-width="1.2"/><line x1="23" y1="4" x2="23" y2="60" stroke="#999" stroke-dasharray="1 1"/><circle cx="16" cy="18" r="4" fill="none" stroke="#1c1915"/><line x1="13" y1="15" x2="19" y2="21" stroke="#1c1915" stroke-width="1.5"/><line x1="19" y1="15" x2="13" y2="21" stroke="#1c1915" stroke-width="1.5"/><circle cx="16" cy="32" r="4" fill="none" stroke="#1c1915"/><line x1="13" y1="29" x2="19" y2="35" stroke="#1c1915" stroke-width="1.5"/><line x1="19" y1="29" x2="13" y2="35" stroke="#1c1915" stroke-width="1.5"/><circle cx="30" cy="34" r="4" fill="none" stroke="#1c1915"/><line x1="27" y1="31" x2="33" y2="37" stroke="#1c1915" stroke-width="1.5"/><line x1="33" y1="31" x2="27" y2="37" stroke="#1c1915" stroke-width="1.5"/></svg>`;
  const ballotCrossed = `<svg viewBox="0 0 46 64" aria-hidden="true"><rect width="46" height="64" fill="#fdfbf7" stroke="#1c1915" stroke-width="1.2"/><line x1="6" y1="6" x2="40" y2="58" stroke="#8d342c" stroke-width="2.2"/><line x1="40" y1="6" x2="6" y2="58" stroke="#8d342c" stroke-width="2.2"/></svg>`;
  const ballotBlank = `<svg viewBox="0 0 46 64" aria-hidden="true"><rect width="46" height="64" fill="#fdfbf7" stroke="#1c1915" stroke-width="1.2"/><line x1="23" y1="4" x2="23" y2="60" stroke="#999" stroke-dasharray="1 1"/><circle cx="16" cy="20" r="4" fill="none" stroke="#1c1915"/><circle cx="30" cy="34" r="4" fill="none" stroke="#1c1915"/></svg>`;

  // Germany Map Generator
  function makeGermanyMap(markers) {
    const marksSvg = markers.map((m) =>
      `<g class="map-mark">
        <circle cx="${m.x}" cy="${m.y}" r="11" fill="var(--ink, #1c1915)" stroke="var(--paper, #f3efe4)" stroke-width="2"/>
        <text x="${m.x}" y="${m.y + 4.5}" text-anchor="middle" fill="var(--paper, #f3efe4)" font-size="12" font-family="'Segoe UI', sans-serif" font-weight="bold">${m.num}</text>
      </g>`
    ).join("");

    const mapSvg = `<svg class="map" viewBox="0 0 240 300" style="width:min(100%, 18rem);height:auto;display:block" aria-label="Karte von Deutschland mit nummerierten Bundesländern">
      <path d="M 85,25 L 115,20 L 118,50 L 140,45 L 195,45 L 210,75 L 180,100 L 215,145 L 185,185 L 175,230 L 190,265 L 155,290 L 125,275 L 90,285 L 70,245 L 45,215 L 25,190 L 40,155 L 25,115 L 65,80 L 85,75 Z" fill="var(--chip, #e7e0d2)" stroke="var(--ink, #1c1915)" stroke-width="1.8" stroke-linejoin="round"/>
      ${marksSvg}
    </svg>`;

    return `<figure class="sheet-fig" style="margin:0.6rem 0"><div class="fig-draw">${mapSvg}</div><figcaption>Karte von Deutschland mit markierten Bundesländern (1–4).</figcaption></figure>`;
  }

  // Pre-configured questions
  const wappen4 = frame(
    cell(1, eagle) + cell(2, chi) + cell(3, cross) + cell(4, gdr),
    "Vereinfacht gezeichnet. Die Bildnummern entsprechen dem BAMF-Katalog."
  );

  const flags = frame(
    cell(1, us) + cell(2, eu) + cell(3, un) + cell(4, other),
    "Vereinfachte Flaggen. Die Bildnummern entsprechen dem BAMF-Katalog."
  );

  const bundestagFig = frame(
    `<div class="fig-cell"><div class="fig-draw">${reichstag}</div></div>`,
    "Vereinfachte Zeichnung des Reichstagsgebäudes mit Glaskuppel in Berlin."
  );

  const eagleSymbol = frame(
    cell(1, eagle),
    "Der Bundesadler im Plenarsaal des Deutschen Bundestages."
  );

  const ballotsFig = frame(
    numCell(1, ballotValid) + numCell(2, ballotMulti) + numCell(3, ballotCrossed) + numCell(4, ballotBlank),
    "Schematische Darstellung von Stimmzetteln (Erst- und Zweitstimme)."
  );

  function photoNote(title, text) {
    return `<div class="note" style="border-left:3px solid var(--muted);padding-left:0.6rem"><strong>Foto im Katalog (${title}):</strong> ${text}</div>`;
  }

  function wappenRow(w1, w2, w3, w4) {
    return frame(
      cell(1, w1) + cell(2, w2) + cell(3, w3) + cell(4, w4),
      "Vereinfachte Wappen. Die Bildnummern entsprechen dem BAMF-Katalog."
    );
  }

  const byId = {
    // General Questions
    "g-021": wappen4,
    "g-055": bundestagFig,
    "g-070": photoNote("Aufgabe 70", "Bundespräsident Gustav Heinemann überreicht Helmut Schmidt 1974 die Ernennungsurkunde zum Bundeskanzler."),
    "g-130": ballotsFig,
    "g-181": photoNote("Aufgabe 181", "Willy Brandt kniet 1970 am Mahnmal der Helden des Warschauer Ghettos (Kniefall von Warschau)."),
    "g-209": wappen4,
    "g-216": eagleSymbol,
    "g-226": flags,
    "g-235": photoNote("Aufgabe 235", "François Mitterrand und Helmut Kohl reichen sich 1984 in Verdun die Hände (Aussöhnung)."),

    // 16 State Coat of Arms Questions (XX-01)
    "BW-01": wappenRow(bwShield, byShield, lion, castle),       // 1: BW (Correct)
    "BY-01": wappenRow(bwShield, byShield, lion, bear),         // 2: BY (Correct)
    "BE-01": wappenRow(castle, key, lion, bear),                // 4: BE (Correct)
    "BB-01": wappenRow(saxonBars, bullShield, castle, redEagleShield), // 4: BB (Correct)
    "HB-01": wappenRow(castle, lion, key, bear),                // 3: HB (Correct)
    "HH-01": wappenRow(key, castle, lion, bear),                // 2: HH (Correct)
    "HE-01": wappenRow(lion, bwShield, byShield, bear),         // 1: HE (Correct)
    "MV-01": wappenRow(castle, redEagleShield, bullShield, horseShield), // 3: MV (Correct)
    "NI-01": wappenRow(castle, nettleLions, horseShield, lion), // 3: NI (Correct)
    "NW-01": wappenRow(lion, nrwShield, bwShield, castle),      // 2: NW (Correct)
    "RP-01": wappenRow(wheelCross, lion, saarShield, castle),   // 1: RP (Correct)
    "SL-01": wappenRow(lion, wheelCross, horseShield, saarShield), // 4: SL (Correct)
    "SN-01": wappenRow(redEagleShield, anhaltShield, bullShield, saxonBars), // 4: SN (Correct)
    "ST-01": wappenRow(saxonBars, redEagleShield, bullShield, anhaltShield), // 4: ST (Correct)
    "SH-01": wappenRow(castle, horseShield, nettleLions, bullShield), // 3: SH (Correct)
    "TH-01": wappenRow(saxonBars, anhaltShield, lion, thShield), // 4: TH (Correct)

    // 16 Bundesländer Map Questions (XX-08)
    "BW-08": makeGermanyMap([
      { num: 1, x: 90, y: 105 },
      { num: 2, x: 80, y: 245 }, // Baden-Württemberg (Correct)
      { num: 3, x: 168, y: 65 },
      { num: 4, x: 150, y: 240 },
    ]),
    "BY-08": makeGermanyMap([
      { num: 1, x: 52, y: 138 },
      { num: 2, x: 90, y: 105 },
      { num: 3, x: 80, y: 245 },
      { num: 4, x: 150, y: 240 }, // Bayern (Correct)
    ]),
    "BE-08": makeGermanyMap([
      { num: 1, x: 108, y: 68 },
      { num: 2, x: 80, y: 85 },
      { num: 3, x: 168, y: 65 },
      { num: 4, x: 170, y: 110 }, // Berlin (Correct)
    ]),
    "BB-08": makeGermanyMap([
      { num: 1, x: 105, y: 40 },
      { num: 2, x: 52, y: 138 },
      { num: 3, x: 125, y: 168 },
      { num: 4, x: 178, y: 125 }, // Brandenburg (Correct)
    ]),
    "HB-08": makeGermanyMap([
      { num: 1, x: 80, y: 85 },  // Bremen (Correct)
      { num: 2, x: 108, y: 68 },
      { num: 3, x: 170, y: 110 },
      { num: 4, x: 35, y: 222 },
    ]),
    "HH-08": makeGermanyMap([
      { num: 1, x: 105, y: 40 },
      { num: 2, x: 80, y: 85 },
      { num: 3, x: 108, y: 68 }, // Hamburg (Correct)
      { num: 4, x: 168, y: 65 },
    ]),
    "HE-08": makeGermanyMap([
      { num: 1, x: 52, y: 138 },
      { num: 2, x: 125, y: 168 },
      { num: 3, x: 82, y: 175 },  // Hessen (Correct)
      { num: 4, x: 80, y: 245 },
    ]),
    "MV-08": makeGermanyMap([
      { num: 1, x: 105, y: 40 },
      { num: 2, x: 90, y: 105 },
      { num: 3, x: 168, y: 65 }, // Mecklenburg-Vorpommern (Correct)
      { num: 4, x: 178, y: 125 },
    ]),
    "NI-08": makeGermanyMap([
      { num: 1, x: 90, y: 105 }, // Niedersachsen (Correct)
      { num: 2, x: 52, y: 138 },
      { num: 3, x: 132, y: 130 },
      { num: 4, x: 82, y: 175 },
    ]),
    "NW-08": makeGermanyMap([
      { num: 1, x: 90, y: 105 },
      { num: 2, x: 82, y: 175 },
      { num: 3, x: 52, y: 138 }, // Nordrhein-Westfalen (Correct)
      { num: 4, x: 50, y: 205 },
    ]),
    "RP-08": makeGermanyMap([
      { num: 1, x: 50, y: 205 }, // Rheinland-Pfalz (Correct)
      { num: 2, x: 82, y: 175 },
      { num: 3, x: 35, y: 222 },
      { num: 4, x: 80, y: 245 },
    ]),
    "SL-08": makeGermanyMap([
      { num: 1, x: 50, y: 205 },
      { num: 2, x: 35, y: 222 }, // Saarland (Correct)
      { num: 3, x: 80, y: 245 },
      { num: 4, x: 82, y: 175 },
    ]),
    "SN-08": makeGermanyMap([
      { num: 1, x: 178, y: 125 },
      { num: 2, x: 132, y: 130 },
      { num: 3, x: 125, y: 168 },
      { num: 4, x: 182, y: 172 }, // Sachsen (Correct)
    ]),
    "ST-08": makeGermanyMap([
      { num: 1, x: 90, y: 105 },
      { num: 2, x: 178, y: 125 },
      { num: 3, x: 132, y: 130 }, // Sachsen-Anhalt (Correct)
      { num: 4, x: 125, y: 168 },
    ]),
    "SH-08": makeGermanyMap([
      { num: 1, x: 105, y: 40 }, // Schleswig-Holstein (Correct)
      { num: 2, x: 168, y: 65 },
      { num: 3, x: 90, y: 105 },
      { num: 4, x: 108, y: 68 },
    ]),
    "TH-08": makeGermanyMap([
      { num: 1, x: 82, y: 175 },
      { num: 2, x: 125, y: 168 }, // Thüringen (Correct)
      { num: 3, x: 132, y: 130 },
      { num: 4, x: 182, y: 172 },
    ]),
  };

  window.LID_FIGURE = function (id) {
    return byId[id] || "";
  };
})();
