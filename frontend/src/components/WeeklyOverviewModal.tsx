import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, WeekSummary } from '../types';

interface WeeklyOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekSummary[];
  allTasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSelectDate: (dateStr: string) => void;
}

export const WeeklyOverviewModal: React.FC<WeeklyOverviewModalProps> = ({
  isOpen,
  onClose,
  weeks,
  allTasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onSelectDate,
}) => {
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(
    weeks.find((w) => w.isCurrentWeek)?.weekId || weeks[0]?.weekId || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-[480px] bg-white rounded-3xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B62F6] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">Weekly Overview</h2>
              <p className="text-xs text-gray-500">Weeks start Monday and end Sunday</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weekly Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {weeks.map((week) => {
            const isExpanded = expandedWeekId === week.weekId;
            const weekTasks = allTasks.filter(
              (t) => t.date >= week.startDate && t.date <= week.endDate
            );

            return (
              <div
                key={week.weekId}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Week Card Summary Header */}
                <button
                  type="button"
                  onClick={() => setExpandedWeekId(isExpanded ? null : week.weekId)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{week.label}</span>
                      {week.isCurrentWeek && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-medium text-[10px] rounded-full">
                          Current Week
                        </span>
                      )}
                    </div>
                    {/* Open & Completed counts */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{week.openTasks} Open</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{week.completedTasks} Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Tasks List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-2"
                    >
                      {weekTasks.length === 0 ? (
                        <p className="text-xs text-gray-400 py-3 text-center">
                          No tasks scheduled for this week.
                        </p>
                      ) : (
                        weekTasks.map((task) => {
                          const isDone = task.status === 'Completed';

                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200/80 text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                                <button
                                  type="button"
                                  onClick={() => onToggleTask(task.id)}
                                  className="text-gray-400 hover:text-blue-600 cursor-pointer shrink-0"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-300 hover:text-blue-500" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`font-medium truncate ${
                                      isDone ? 'line-through text-gray-400' : 'text-gray-800'
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                    <span>{task.date}</span>
                                    {task.startTime && <span>• {task.startTime}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    onSelectDate(task.date);
                                    onClose();
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors cursor-pointer"
                                  title="View on calendar"
                                >
                                  Go to day
                                </button>
                                <button
                                  onClick={() => {
                                    onEditTask(task);
                                    onClose();
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
