import React, { ReactNode, createContext, useState, useEffect } from "react";

interface TaskData {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskData>({} as TaskData);

const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const title = "New Tab - Let's be organized!";
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    chrome.storage.sync.get(["tasks"], function (result) {
      const receivedTasks = result.tasks ? JSON.parse(result.tasks) : [];
      setTasks(receivedTasks);
    });
  }, []);

  useEffect(() => {
    const uncompletedTasks = tasks.filter((task) => !task.completed);
    document.title =
      uncompletedTasks.length > 0
        ? `(${uncompletedTasks.length}) ${title}`
        : title;
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
export { TaskContext, TaskProvider };
