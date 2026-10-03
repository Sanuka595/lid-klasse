# lid-klasse 🇩🇪

[![Live](https://img.shields.io/badge/App-live-0f0f0e?style=flat-square)](https://sanuka595.github.io/lid-klasse/)
[![Fragen](https://img.shields.io/badge/Fragen-460-2e7d4f?style=flat-square)](https://sanuka595.github.io/lid-klasse/)
[![Katalog](https://img.shields.io/badge/BAMF-07.05.2025-4a6fa5?style=flat-square)](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html)

> **Übungsheft & Prüfungssimulator** für den Test **„Leben in Deutschland“** und den **Einbürgerungstest**.  
> Offizieller Gesamtfragenkatalog des BAMF, Stand **07.05.2025**.

**Приложение:** [sanuka595.github.io/lid-klasse](https://sanuka595.github.io/lid-klasse/)

Автономная PWA: 460 вопросов, экзамен на 60 минут, оффлайн, украинские подсказки только к сложным терминам.

---

## Возможности

- **460 вопросов** — 300 общих + по 10 на каждую из 16 земель
- **Lernen** — подряд или вразброс, сразу видно ответ
- **Nur Fehler** — только ошибки
- **Gemerkt** — закладки
- **Prüfung** — 33 вопроса (30 + 3 земельных), таймер 60 мин, сетка 1…33
- **Übersicht** — вся сетка, поиск по номеру или слову
- **Озвучка** — немецкая речь через Web Speech API
- **Глоссарий** — подсветка сложных админ-, правовых и исторических слов (не Schule / Eltern)
- **Картинки** — векторные карты и гербы всех земель, Рейхстаг, бюллетень, символика
- **Клавиатура** — `1…4`, `Space` / `Enter`, `←` `→`
- **Daten** — экспорт / импорт прогресса JSON
- **Оффлайн** — Service Worker кэширует всё приложение

---

## Локально

Чисто HTML / JS / CSS, без сборки фронта.

```bash
npm start
# или
python3 -m http.server 8000 --directory docs
```

Открыть: [http://localhost:8000](http://localhost:8000)

```bash
npm test
npm run build   # если менял data/source/
```

---

## Структура

```
lid-klasse/
├── data/                 # каталог BAMF и сборка
├── scripts/build_data.py
├── docs/                 # то, что отдаёт GitHub Pages / Cloudflare
├── tests/
├── package.json
└── README.md
```

Папка **`docs/` — корень сайта**. Относительные пути (`./app.js`, `./glossary.js`, service worker) завязаны на неё. Не переименовывать и не переносить: сломается и Pages, и Cloudflare.

---

## Деплой

Репозиторий уже на GitHub: [Sanuka595/lid-klasse](https://github.com/Sanuka595/lid-klasse).  
Живой сайт читает ветку `main`, каталог `/docs`.

```bash
cd /home/forg/Projekt/lid-klasse
git add -u
git commit -m "feat: …"
git push origin main
```

Cloudflare подтянет `main` сам. Кэш PWA сбрасывается bump’ом имени в `docs/sw.js` (`lid-klasse-N`).
