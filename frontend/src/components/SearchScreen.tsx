import React, { useState, useEffect, useRef } from "react";
import { Task } from "../types";
import { ArrowLeft, Search, Trash2, Edit2 } from "lucide-react";

interface SearchScreenProps {
  tasks: Task[];
  initialQuery?: string;
  onBack: () => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  tasks,
  initialQuery = "",
  onBack,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="h-full bg-white flex flex-col font-sans select-none">
      {/* Top Search Bar Header matching Figma Frame 9 */}
      <div className="px-5 pt-6 pb-4 flex items-center space-x-3 bg-white">
        <button
          onClick={onBack}
          className="p-1 text-slate-700 hover:text-slate-900 rounded-none transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-2.5 pl-4 pr-10 bg-white border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4562E8]"
          />
          <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Task List with Exact Figma Spacing and Line-Through on Completion */}
      <div className="flex-1 overflow-y-auto px-5 divide-y divide-slate-200">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No tasks found
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="py-4.5 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-2">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`w-5 h-5 rounded-none border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    task.status === "Completed"
                      ? "bg-[#4562E8] border-[#4562E8] text-white"
                      : "border-slate-300 bg-white hover:border-[#4562E8]"
                  }`}
                >
                  {task.status === "Completed" && (
                    <span className="text-xs font-bold">✓</span>
                  )}
                </button>
                <span
                  className={`text-sm truncate ${
                    task.status === "Completed"
                      ? "line-through text-slate-800"
                      : "text-slate-800 font-medium"
                  }`}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-none transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditTask(task)}
                  className="p-1.5 text-slate-400 hover:text-[#4562E8] rounded-none transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
