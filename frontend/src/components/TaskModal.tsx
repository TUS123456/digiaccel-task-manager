import React, { useState, useEffect } from "react";
import { Task } from "../types";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    priority?: "Low" | "Medium" | "High";
    status?: "In Progress" | "Completed";
  }) => void;
  initialTask: Task | null;
  selectedDate: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  selectedDate,
}) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("11:30 AM");
  const [date, setDate] = useState(selectedDate);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setStartTime(initialTask.startTime || "10:00 AM");
      setEndTime(initialTask.endTime || "11:30 AM");
      setDate(initialTask.date || selectedDate);
      setDescription(initialTask.description || "");
    } else {
      setTitle("");
      setStartTime("10:00 AM");
      setEndTime("11:30 AM");
      setDate(selectedDate);
      setDescription("");
    }
  }, [initialTask, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      date,
      startTime,
      endTime,
      priority: "Medium",
      status: initialTask ? initialTask.status : "In Progress",
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-transparent flex flex-col justify-end pointer-events-none">
      {/* Bottom Sheet Drawer (h-[56%]) allowing Task Complete/Pending cards to show in the background like Figma */}
      <div className="w-full h-[56%] bg-white rounded-none px-5 py-3.5 shadow-2xl flex flex-col justify-between pointer-events-auto border-t border-slate-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-slate-900">
              {initialTask ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-none transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} id="task-form" className="space-y-2.5">
            {/* Task Title */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Task title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Doing Homework"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4562E8]"
              />
            </div>

            {/* Set Time */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Set Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Start"
                    className="w-full px-3 py-1.5 pl-8 bg-white border border-slate-200 rounded-none text-xs text-slate-800 focus:outline-none focus:border-[#4562E8]"
                  />
                  <Clock className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Ends"
                    className="w-full px-3 py-1.5 pl-8 bg-white border border-slate-200 rounded-none text-xs text-slate-800 focus:outline-none focus:border-[#4562E8]"
                  />
                  <Clock className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Set Date */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Set Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-none text-xs text-slate-800 focus:outline-none focus:border-[#4562E8]"
                />
                <CalendarIcon className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Description (optional)
              </label>
              <textarea
                rows={1}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add Description"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4562E8] resize-none"
              />
            </div>
          </form>
        </div>

        {/* Action Button at bottom */}
        <div className="pt-2">
          <button
            type="submit"
            form="task-form"
            className="w-full py-2.5 bg-[#4562E8] hover:bg-[#3751CF] active:scale-[0.99] text-white font-medium rounded-none shadow-md shadow-blue-500/20 transition-all cursor-pointer text-xs"
          >
            {initialTask ? "Save Changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
};
