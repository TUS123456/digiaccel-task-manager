import React, { useMemo } from "react";
import { Task, TaskStats } from "../types";
import { formatDateKey } from "../utils/dateUtils";

interface HomeScreenProps {
  tasks: Task[];
  stats: TaskStats;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenSearch: () => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onOpenWeeklyOverview: () => void;
  onOpenDeployGuide: () => void;
  onResetData: () => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 8-day strip starting from the Sunday of the current week (Sun 09 -> Sun 16 in the design)
function buildDays() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      key: formatDateKey(d),
      dow: DAY_NAMES[d.getDay()],
      num: String(d.getDate()).padStart(2, "0"),
    };
  });
}

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6" />
    <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" />
  </svg>
);

export function HomeScreen({
  tasks,
  stats,
  selectedDate,
  onSelectDate,
  onOpenSearch,
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onOpenWeeklyOverview,
}: HomeScreenProps) {
  const days = useMemo(buildDays, []);
  const todaysTasks = tasks.filter((t) => t.date === selectedDate);

  return (
    <div className="relative flex min-h-full flex-col bg-[#FBFBFF] px-[22px] pb-28 pt-7 font-['Poppins',system-ui,sans-serif] text-slate-900">
      {/* Search */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left"
      >
        <span className="text-[13px] text-gray-500">Search for a task</span>
        <span className="text-slate-900">
          <SearchIcon />
        </span>
      </button>

      {/* Date strip */}
      <div className="mt-[18px] flex justify-between">
        {days.map((d) => {
          const selected = d.key === selectedDate;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelectDate(d.key)}
              className={`flex h-[62px] w-10 flex-col items-center justify-center gap-1 rounded-md ${
                selected ? "bg-[#4361EE] text-white" : "text-gray-500"
              }`}
            >
              <span className="text-[11px]">{d.dow}</span>
              <span className="text-[15px] font-medium">{d.num}</span>
              {selected && (
                <span className="-mt-0.5 h-1 w-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="mt-[22px] grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3.5 rounded-lg bg-[#EEF1FF] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#A9B7F7] text-[#26399B]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 12l3 3 5-6" />
              </svg>
            </span>
            <span className="text-xs font-medium">Task Complete</span>
          </div>
          <div className="flex items-baseline gap-2 pl-1">
            <span className="text-[26px] font-semibold">
              {String(stats.completedThisWeek).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-600">This Week</span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 rounded-lg bg-[#FFE3E3] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F9A8A8] text-[#B42318]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </span>
            <span className="text-xs font-medium">Task Pending</span>
          </div>
          <div className="flex items-baseline gap-2 pl-1">
            <span className="text-[26px] font-semibold">
              {String(stats.pendingThisWeek).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-600">This Week</span>
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <h2 className="mt-[30px] text-lg font-semibold">Weekly Progress</h2>
      <div
        className="mt-3.5 h-[22px] bg-[#D8DCFB]"
        role="progressbar"
        aria-valuenow={stats.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#26399B]"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      {/* Tasks today */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks Today</h2>
        <button
          type="button"
          onClick={onOpenWeeklyOverview}
          className="text-[13px] font-medium text-[#2F4BDB]"
        >
          View All
        </button>
      </div>

      <ul className="mt-2 flex flex-col">
        {todaysTasks.map((task) => {
          const done = task.status === "Completed";
          return (
            <li
              key={task.id}
              className="flex h-[60px] items-center gap-3.5 border-b border-gray-200"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={`Mark "${task.title}" as ${done ? "in progress" : "completed"}`}
                onClick={() => onToggleTask(task.id)}
                className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[3px] border-[1.5px] border-[#4361EE] bg-white text-[#4361EE]"
              >
                {done && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm font-medium ${done ? "line-through" : ""}`}
              >
                {task.title}
              </span>
              <button
                type="button"
                aria-label="Delete task"
                onClick={() => onDeleteTask(task.id)}
                className="flex h-11 w-11 items-center justify-center text-gray-500"
              >
                <TrashIcon />
              </button>
              <button
                type="button"
                aria-label="Edit task"
                onClick={() => onEditTask(task)}
                className="-ml-3 flex h-11 w-11 items-center justify-center text-gray-500"
              >
                <EditIcon />
              </button>
            </li>
          );
        })}
        {todaysTasks.length === 0 && (
          <li className="py-6 text-center text-sm text-gray-500">
            No tasks for this day
          </li>
        )}
      </ul>

      {/* Floating add button */}
      <button
        type="button"
        aria-label="Add task"
        onClick={onOpenAddTask}
        className="sticky bottom-7 mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#4361EE] text-white shadow-[0_6px_16px_rgba(67,97,238,0.35)]"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
