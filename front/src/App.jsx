import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import TodoItem from './TodoItem.jsx';

const API_BASE = 'http://localhost:4000';

function App() {
  const [todos, setTodos] = useState([]);
  const [draft, setDraft] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function loadTodos() {
      try {
        setBusy(true);
        const response = await axios.get(`${API_BASE}/todos`);
        setTodos(response.data);
      } catch (error) {
        setNotice('서버에서 할 일을 가져오지 못했습니다.');
      } finally {
        setBusy(false);
      }
    }

    loadTodos();
  }, []);

  const stats = useMemo(() => {
    const completed = todos.filter((item) => item.completed).length;
    return `${completed} / ${todos.length}`;
  }, [todos]);

  const handleAdd = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = {
      id: tempId,
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos((current) => [optimisticTodo, ...current]);
    setDraft('');

    try {
      const response = await axios.post(`${API_BASE}/todos`, { text });
      setTodos((current) => current.map((item) => (item.id === tempId ? response.data : item)));
    } catch (error) {
      setNotice('할 일을 추가하지 못했습니다.');
      setTodos((current) => current.filter((item) => item.id !== tempId));
    }
  };

  const handleToggle = async (id) => {
    const current = todos.find((item) => item.id === id);
    if (!current) return;
    const updated = { ...current, completed: !current.completed };

    setTodos((currentTodos) => currentTodos.map((item) => (item.id === id ? updated : item)));

    try {
      await axios.patch(`${API_BASE}/todos/${id}`, { completed: updated.completed });
    } catch (error) {
      setNotice('상태를 업데이트하지 못했습니다.');
      setTodos((currentTodos) => currentTodos.map((item) => (item.id === id ? current : item)));
    }
  };

  const handleDelete = async (id) => {
    const existing = todos.find((item) => item.id === id);
    setTodos((currentTodos) => currentTodos.filter((item) => item.id !== id));

    try {
      await axios.delete(`${API_BASE}/todos/${id}`);
    } catch (error) {
      setNotice('삭제에 실패했습니다.');
      if (existing) {
        setTodos((currentTodos) => [existing, ...currentTodos]);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F4F6] px-4 py-10 text-slate-950">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-soft">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Checklist</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">오늘의 할 일</h1>
          <p className="mt-3 text-sm text-slate-500">부드럽고 간결한 UX로 할 일을 빠르게 기록하세요.</p>
        </header>

        <form onSubmit={handleAdd} className="mb-5">
          <div className="group relative rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-shadow duration-200 focus-within:shadow-lg">
            <input
              className={`w-full bg-transparent text-base leading-7 text-slate-950 outline-none placeholder:text-slate-400 ${isFocused ? 'placeholder:text-slate-500' : ''}`}
              placeholder="새로운 할 일을 입력해보세요"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
            >
              추가
            </button>
          </div>
        </form>

        <div className="mb-5 flex items-center justify-between rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-600 shadow-sm">
          <span>{stats} 완료</span>
          <span>{busy ? '로딩 중...' : todos.length === 0 ? '할 일이 비어있어요' : `${todos.length}개 항목`}</span>
        </div>

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {notice}
          </motion.div>
        )}

        <section className="space-y-3">
          <AnimatePresence initial={false}>
            {todos.length > 0 ? (
              todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={() => handleToggle(todo.id)} onDelete={() => handleDelete(todo.id)} />
              ))
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500"
              >
                <p className="mb-2 text-lg font-semibold">텅 비어있어요</p>
                <p className="text-sm">할 일을 추가해보세요. 깔끔하게 정리가 시작됩니다.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

export default App;
