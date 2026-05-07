const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

async function initDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ todos: [] }, null, 2));
  }
}

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

app.get('/todos', async (req, res) => {
  try {
    const db = await readDb();
    const sorted = db.todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: '데이터를 가져오는 중 문제가 발생했습니다.' });
  }
});

app.post('/todos', async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: '할 일 텍스트를 입력해주세요.' });
  }

  try {
    const db = await readDb();
    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    db.todos.unshift(newTodo);
    await writeDb(db);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: '할 일을 저장하는 중 문제가 발생했습니다.' });
  }
});

app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const db = await readDb();
    const index = db.todos.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    }

    db.todos[index] = {
      ...db.todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await writeDb(db);
    res.json(db.todos[index]);
  } catch (error) {
    res.status(500).json({ error: '할 일을 업데이트하는 중 문제가 발생했습니다.' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await readDb();
    const filtered = db.todos.filter((item) => item.id !== id);

    if (filtered.length === db.todos.length) {
      return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    }

    await writeDb({ todos: filtered });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: '할 일을 삭제하는 중 문제가 발생했습니다.' });
  }
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`Checklist server running on http://localhost:${PORT}`);
});
