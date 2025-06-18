import React, { ReactNode, createContext, useState, useEffect } from "react";
import type { Task } from "../types/Task";
import { useJSONStorage } from "../hooks/useStorage";

interface TaskData {
  tasks: Task[];
  setTasks: (tasks: Task[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskData>({} as TaskData);

const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const title = "New Tab - Let's be organized!";
  const { value: tasks, setValue: setTasksStorage, loading, error } = useJSONStorage<Task[]>('tasks', []);
  
  const setTasks = async (newTasks: Task[]) => {
    await setTasksStorage(newTasks);
  };

  useEffect(() => {
    if (tasks) {
      const uncompletedTasks = tasks.filter((task) => !task.completed);
      document.title =
        uncompletedTasks.length > 0
          ? `(${uncompletedTasks.length}) ${title}`
          : title;
    }
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ 
      tasks: tasks || [], 
      setTasks, 
      loading, 
      error 
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskProvider };
