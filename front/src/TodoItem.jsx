import { motion } from 'framer-motion';
import { CheckCircle2, Trash2 } from 'lucide-react';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`mr-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl border transition ${todo.completed ? 'border-emerald-300 bg-emerald-100 text-emerald-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100'}`}
        whileTap={{ scale: 0.96 }}
      >
        <CheckCircle2 className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-6 ${todo.completed ? 'text-slate-400' : 'text-slate-950'}`}>
          {todo.text}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="ml-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

export default TodoItem;
