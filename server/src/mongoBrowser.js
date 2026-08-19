const express = require('express');
const mongoose = require('mongoose');

const PORT = Number(process.env.DB_UI_PORT) || 8081;
const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_portal';

const redact = (value) => {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = key === 'password' ? '[redacted]' : redact(nested);
    }
    return out;
  }
  return value;
};

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>project_portal · Mongo</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 14px/1.45 ui-sans-serif, system-ui, sans-serif;
      background: #1c1917;
      color: #f4efe6;
    }
    header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #3f3a36;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
    }
    h1 { font-size: 1rem; font-weight: 600; margin: 0; }
    .muted { color: #a8a29e; font-size: 0.8rem; }
    main { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 53px); }
    nav { border-right: 1px solid #3f3a36; padding: 0.75rem; }
    button.col {
      display: block; width: 100%; text-align: left;
      background: transparent; color: inherit; border: 0;
      padding: 0.45rem 0.55rem; border-radius: 4px; cursor: pointer;
    }
    button.col:hover, button.col.active { background: #2a211c; }
    section { padding: 1rem 1.25rem; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #3f3a36; padding: 0.45rem 0.5rem; text-align: left; vertical-align: top; }
    th { color: #a8a29e; font-weight: 500; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; font: 12px/1.4 ui-monospace, monospace; }
  </style>
</head>
<body>
  <header>
    <h1>project_portal</h1>
    <span class="muted" id="meta">loading…</span>
  </header>
  <main>
    <nav id="nav"></nav>
    <section id="view"><p class="muted">Pick a collection.</p></section>
  </main>
  <script>
    const nav = document.getElementById('nav');
    const view = document.getElementById('view');
    const meta = document.getElementById('meta');

    const load = async (name) => {
      [...nav.querySelectorAll('button')].forEach((b) => b.classList.toggle('active', b.dataset.name === name));
      const res = await fetch('/api/collections/' + encodeURIComponent(name));
      const data = await res.json();
      if (!data.docs.length) {
        view.innerHTML = '<p class="muted">Empty collection.</p>';
        return;
      }
      const keys = [...new Set(data.docs.flatMap((d) => Object.keys(d)))];
      view.innerHTML = '<p class="muted">' + data.count + ' documents</p><table><thead><tr>' +
        keys.map((k) => '<th>' + k + '</th>').join('') + '</tr></thead><tbody>' +
        data.docs.map((doc) => '<tr>' + keys.map((k) => '<td><pre>' +
          JSON.stringify(doc[k], null, 2).replaceAll('<', '&lt;') + '</pre></td>').join('') + '</tr>').join('') +
        '</tbody></table>';
    };

    (async () => {
      const res = await fetch('/api/collections');
      const data = await res.json();
      meta.textContent = data.uri;
      nav.innerHTML = data.collections.map((c) =>
        '<button class="col" data-name="' + c.name + '">' + c.name + ' (' + c.count + ')</button>'
      ).join('');
      nav.onclick = (e) => {
        const btn = e.target.closest('button[data-name]');
        if (btn) load(btn.dataset.name);
      };
      if (data.collections[0]) load(data.collections[0].name);
    })();
  </script>
</body>
</html>`;

(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  const app = express();

  app.get('/api/collections', async (_req, res) => {
    const listed = await db.listCollections().toArray();
    const collections = await Promise.all(
      listed
        .map((c) => c.name)
        .sort()
        .map(async (name) => ({ name, count: await db.collection(name).countDocuments() }))
    );
    res.json({ uri: URI, collections });
  });

  app.get('/api/collections/:name', async (req, res) => {
    const name = req.params.name;
    const allowed = (await db.listCollections().toArray()).map((c) => c.name);
    if (!allowed.includes(name)) return res.status(404).json({ error: 'Unknown collection' });
    const col = db.collection(name);
    const [count, docs] = await Promise.all([
      col.countDocuments(),
      col.find().limit(200).toArray(),
    ]);
    res.json({ count, docs: redact(docs) });
  });

  app.get('/', (_req, res) => {
    res.type('html').send(page);
  });

  app.listen(PORT, () => {
    console.log(`Mongo browser: http://localhost:${PORT}`);
  });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
