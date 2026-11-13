import React, { useState, useEffect, useCallback } from "react";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SearchScreen } from "./components/SearchScreen";
import { TaskModal } from "./components/TaskModal";
import { WeeklyOverviewModal } from "./components/WeeklyOverviewModal";
import { Task, TaskStats, WeekSummary } from "./types";
import {
  fetchTasks,
  fetchStats,
  fetchWeeklySummaries,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  seedDatabase,
} from "./api";
import { formatDateKey } from "./utils/dateUtils";

type Screen = "onboarding" | "home" | "search";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    completedThisWeek: 50,
    pendingThisWeek: 8,
    totalThisWeek: 58,
    progressPercent: 86,
    tasksToday: 4,
    completedToday: 2,
  });

  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateKey(new Date()),
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedWeeks, fetchedStats] = await Promise.all([
        fetchTasks(),
        fetchWeeklySummaries(),
        fetchStats(selectedDate),
      ]);
      setTasks(fetchedTasks);
      setWeeks(fetchedWeeks);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Error fetching data from server API:", err);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveTask = async (taskData: {
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    priority?: "Low" | "Medium" | "High";
    status?: "In Progress" | "Completed";
  }) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    await loadData();
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Completed" ? "In Progress" : "Completed",
            }
          : task,
      ),
    );

    try {
      await toggleTaskStatus(id);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle task:", err);
      loadData();
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await deleteTask(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete task:", err);
      loadData();
    }
  };

  const handleResetData = async () => {
    if (confirm("Reset database to initial sample tasks?")) {
      await seedDatabase();
      await loadData();
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col items-center overflow-hidden bg-[#E5E5E5] font-sans text-slate-900">
      <main className="flex min-h-0 w-full flex-1 justify-center">
        <div className="relative flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white shadow-lg sm:my-6 sm:h-[calc(100dvh-3rem)] sm:rounded-lg">
          <div className="min-h-0 flex-1 overflow-hidden">
            {screen === "onboarding" && (
              <OnboardingScreen onGetStarted={() => setScreen("home")} />
            )}

            {screen === "home" && (
              <HomeScreen
                tasks={tasks}
                stats={stats}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenSearch={() => {
                  setSearchInitialQuery("");
                  setScreen("search");
                }}
                onOpenAddTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onToggleTask={handleToggleTask}
                onOpenWeeklyOverview={() => setIsWeeklyModalOpen(true)}
                onOpenDeployGuide={() => {}}
                onResetData={handleResetData}
              />
            )}

            {screen === "search" && (
              <SearchScreen
                tasks={tasks}
                initialQuery={searchInitialQuery}
                onBack={() => setScreen("home")}
                onToggleTask={handleToggleTask}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </div>

          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            initialTask={editingTask}
            selectedDate={selectedDate}
          />

          <WeeklyOverviewModal
            isOpen={isWeeklyModalOpen}
            onClose={() => setIsWeeklyModalOpen(false)}
            weeks={weeks}
            allTasks={tasks}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onSelectDate={setSelectedDate}
          />
        </div>
      </main>
    </div>
  );
}
