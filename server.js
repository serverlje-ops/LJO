const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// ---------- Passwortschutz (HTTP Basic Auth) ----------
// Benutzername/Passwort werden über Umgebungsvariablen gesetzt (siehe Render-Dashboard
// -> Environment). Wenn keine gesetzt sind, ist der Server NICHT geschützt.
const APP_USER = process.env.APP_USER;
const APP_PASSWORD = process.env.APP_PASSWORD;

function checkAuth(req, res, next){
  if (!APP_USER || !APP_PASSWORD) return next(); // kein Schutz konfiguriert

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);
    if (user === APP_USER && pass === APP_PASSWORD) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Nachtkontrolle"');
  res.status(401).send('Zugriff verweigert – Benutzername/Passwort erforderlich.');
}

app.use(checkAuth);
app.use(express.json());
app.use(express.static(__dirname));

// Beim allerersten Start wird die Personenliste mit diesem Startbestand angelegt.
// Danach ist immer NUR data.json die Wahrheit - hier wird nichts mehr automatisch
// zurückgesetzt, auch nicht bei Tageswechsel. Häkchen bleiben stehen, bis sie über
// den Reset-Button (mit Bestätigungswort) manuell gelöscht werden.
const SEED_ROSTER = [
  {
    "id": "p001",
    "name": "Christine Ludigkeit",
    "age": 18,
    "room": "201"
  },
  {
    "id": "p002",
    "name": "Rebekka Fliss",
    "age": 19,
    "room": "201"
  },
  {
    "id": "p003",
    "name": "Inga Linder",
    "age": 16,
    "room": "202"
  },
  {
    "id": "p004",
    "name": "Frieda Krauel",
    "age": 15,
    "room": "202"
  },
  {
    "id": "p005",
    "name": "Adele Reißenberger",
    "age": 16,
    "room": "202"
  },
  {
    "id": "p006",
    "name": "Clara Breuer",
    "age": 16,
    "room": "202"
  },
  {
    "id": "p007",
    "name": "Anouk Wallbaum",
    "age": 22,
    "room": "203"
  },
  {
    "id": "p008",
    "name": "Isabella Irsch",
    "age": 22,
    "room": "203"
  },
  {
    "id": "p009",
    "name": "Julia Kolodzy",
    "age": 20,
    "room": "203"
  },
  {
    "id": "p010",
    "name": "Sara Antunes",
    "age": 16,
    "room": "204"
  },
  {
    "id": "p011",
    "name": "Maya-Lotte Kluwe",
    "age": 15,
    "room": "204"
  },
  {
    "id": "p012",
    "name": "Lea Batt",
    "age": 14,
    "room": "204"
  },
  {
    "id": "p013",
    "name": "Silja Emse",
    "age": 17,
    "room": "206"
  },
  {
    "id": "p014",
    "name": "Charlotte Söntgerath",
    "age": 18,
    "room": "206"
  },
  {
    "id": "p015",
    "name": "Lakeisha Koprowski",
    "age": 17,
    "room": "206"
  },
  {
    "id": "p016",
    "name": "Isabelle Wirtgen",
    "age": 20,
    "room": "206"
  },
  {
    "id": "p017",
    "name": "Martha Putzke",
    "age": 15,
    "room": "209a"
  },
  {
    "id": "p018",
    "name": "Dareen Friedrichs",
    "age": 20,
    "room": "209a"
  },
  {
    "id": "p019",
    "name": "Lucia Täuber",
    "age": 17,
    "room": "209b"
  },
  {
    "id": "p020",
    "name": "Pia Vohn",
    "age": 18,
    "room": "209b"
  },
  {
    "id": "p021",
    "name": "Victoria Steinhoff",
    "age": 19,
    "room": "209b"
  },
  {
    "id": "p022",
    "name": "Elisa Mühlbach",
    "age": 20,
    "room": "210"
  },
  {
    "id": "p023",
    "name": "Ruby Schlenker",
    "age": 16,
    "room": "210"
  },
  {
    "id": "p024",
    "name": "Polina Starytska",
    "age": 18,
    "room": "210"
  },
  {
    "id": "p025",
    "name": "Maya Eckardt",
    "age": 19,
    "room": "211"
  },
  {
    "id": "p026",
    "name": "Pauline Krull",
    "age": 18,
    "room": "211"
  },
  {
    "id": "p027",
    "name": "Lena Küssow",
    "age": 19,
    "room": "211"
  },
  {
    "id": "p028",
    "name": "Anton Rütten",
    "age": 17,
    "room": "212"
  },
  {
    "id": "p029",
    "name": "Paul Drutkowski",
    "age": 17,
    "room": "212"
  },
  {
    "id": "p030",
    "name": "Louisa Liebner",
    "age": 20,
    "room": "214"
  },
  {
    "id": "p031",
    "name": "Ariana Meißner",
    "age": 19,
    "room": "214"
  },
  {
    "id": "p032",
    "name": "Fanny Beck",
    "age": 18,
    "room": "214"
  },
  {
    "id": "p033",
    "name": "Jördis Overlöper",
    "age": 17,
    "room": "214"
  },
  {
    "id": "p034",
    "name": "Len Haskic",
    "age": 19,
    "room": "302"
  },
  {
    "id": "p035",
    "name": "Tassilo Wettstein",
    "age": 18,
    "room": "303"
  },
  {
    "id": "p036",
    "name": "Roman Liedtke",
    "age": 19,
    "room": "303"
  },
  {
    "id": "p037",
    "name": "Tobias Iwanczik",
    "age": 19,
    "room": "303"
  },
  {
    "id": "p038",
    "name": "Philipp Aichele",
    "age": 20,
    "room": "304"
  },
  {
    "id": "p039",
    "name": "Simon Eismann",
    "age": 22,
    "room": "304"
  },
  {
    "id": "p040",
    "name": "Mika Balazs",
    "age": 18,
    "room": "305"
  },
  {
    "id": "p041",
    "name": "Aaron Lenzing",
    "age": 17,
    "room": "305"
  },
  {
    "id": "p042",
    "name": "Franz Diekmann",
    "age": 22,
    "room": "306"
  },
  {
    "id": "p043",
    "name": "Benjamin Thieroff",
    "age": 21,
    "room": "306"
  },
  {
    "id": "p044",
    "name": "Jonathan Thieroff",
    "age": 21,
    "room": "306"
  },
  {
    "id": "p045",
    "name": "Franz Dorn",
    "age": 21,
    "room": "310"
  },
  {
    "id": "p046",
    "name": "Nils Völker",
    "age": 19,
    "room": "310"
  },
  {
    "id": "p047",
    "name": "Bastian Werdeling",
    "age": 22,
    "room": "310"
  },
  {
    "id": "p048",
    "name": "Johannes Bauer",
    "age": 17,
    "room": "311"
  },
  {
    "id": "p049",
    "name": "Mateo Gericke Barrio",
    "age": 16,
    "room": "311"
  },
  {
    "id": "p050",
    "name": "Martino Codognotto",
    "age": 17,
    "room": "311"
  },
  {
    "id": "p051",
    "name": "Alexander Wendt",
    "age": 17,
    "room": "312"
  },
  {
    "id": "p052",
    "name": "Karl Küstermann",
    "age": 18,
    "room": "312"
  },
  {
    "id": "p053",
    "name": "Joshua Kröger",
    "age": 17,
    "room": "312"
  },
  {
    "id": "p054",
    "name": "Frederick Vanryne",
    "age": 19,
    "room": "312"
  },
  {
    "id": "p055",
    "name": "Mattis Passe",
    "age": 19,
    "room": "313"
  },
  {
    "id": "p056",
    "name": "Tjark Schulte",
    "age": 18,
    "room": "313"
  },
  {
    "id": "p057",
    "name": "Felix Kotzwander",
    "age": 17,
    "room": "313"
  },
  {
    "id": "p058",
    "name": "Niels Hoeijmakers",
    "age": 16,
    "room": "313"
  },
  {
    "id": "p059",
    "name": "Jasper Adam",
    "age": 16,
    "room": "314"
  },
  {
    "id": "p060",
    "name": "Christian Haack",
    "age": 16,
    "room": "314"
  },
  {
    "id": "p061",
    "name": "Ben Block",
    "age": 16,
    "room": "314"
  },
  {
    "id": "p062",
    "name": "Friedrich Schlieker",
    "age": 17,
    "room": "314"
  },
  {
    "id": "p063",
    "name": "Frido Limper",
    "age": 16,
    "room": "315"
  },
  {
    "id": "p064",
    "name": "Jorik v. d. Gabelentz",
    "age": 16,
    "room": "315"
  },
  {
    "id": "p065",
    "name": "Jun-Ah Kim",
    "age": 19,
    "room": "315"
  },
  {
    "id": "p066",
    "name": "Julian Fricke",
    "age": 16,
    "room": "316"
  },
  {
    "id": "p067",
    "name": "Alwin Fröhlich",
    "age": 15,
    "room": "316"
  },
  {
    "id": "p068",
    "name": "Julian Bittermann",
    "age": 16,
    "room": "316"
  },
  {
    "id": "p069",
    "name": "Haruki Ebmeyer",
    "age": 15,
    "room": "316"
  },
  {
    "id": "p070",
    "name": "Hayato Saßmannshaus",
    "age": 22,
    "room": "317"
  },
  {
    "id": "p071",
    "name": "Julian Schroers",
    "age": 19,
    "room": "317"
  },
  {
    "id": "p072",
    "name": "Leander Birgel",
    "age": 22,
    "room": "317"
  }
];

function readData(){
  try{
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }catch(e){
    return { night: {}, roster: SEED_ROSTER };
  }
}
function writeData(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function nextId(roster){
  let max = 0;
  roster.forEach(p => {
    const n = parseInt(String(p.id).replace(/\\D/g, ''), 10);
    if(!isNaN(n) && n > max) max = n;
  });
  return 'p' + String(max + 1).padStart(3, '0');
}

// Liefert Personenliste + aktuellen Abhak-Stand in einem Aufruf.
// Keine automatische Zurücksetzung mehr - der Stand bleibt, bis er manuell
// über den Reset-Button geändert wird.
app.get('/api/state', (req, res) => {
  const data = readData();
  res.json({ night: data.night || {}, roster: data.roster || SEED_ROSTER });
});

app.post('/api/night', (req, res) => {
  const { night } = req.body || {};
  const data = readData();
  data.night = night || {};
  writeData(data);
  res.json({ ok: true });
});

// Neue Person zu einem Zimmer hinzufügen
app.post('/api/person', (req, res) => {
  const { name, age, room } = req.body || {};
  if (!name || !room) return res.status(400).json({ error: 'name und room sind erforderlich' });
  const data = readData();
  const roster = data.roster || [];
  const person = { id: nextId(roster), name: String(name).trim(), age: age === null || age === undefined || age === '' ? null : Number(age), room: String(room).trim() };
  roster.push(person);
  data.roster = roster;
  writeData(data);
  res.json({ ok: true, person });
});

// Person bearbeiten (Name/Alter/Zimmer) - so lässt sich auch jemand in ein anderes Zimmer verschieben
app.put('/api/person/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, room } = req.body || {};
  const data = readData();
  const roster = data.roster || [];
  const person = roster.find(p => p.id === id);
  if (!person) return res.status(404).json({ error: 'Person nicht gefunden' });
  if (name !== undefined && name !== '') person.name = String(name).trim();
  if (room !== undefined && room !== '') person.room = String(room).trim();
  if (age !== undefined) person.age = (age === null || age === '') ? null : Number(age);
  data.roster = roster;
  writeData(data);
  res.json({ ok: true, person });
});

// Person entfernen (z.B. wenn jemand abgereist ist)
app.delete('/api/person/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.roster = (data.roster || []).filter(p => p.id !== id);
  if (data.night) delete data.night[id];
  writeData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Nachtkontrolle-Server läuft auf Port ${PORT}`);
});
