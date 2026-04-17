import React, { useContext, useCallback, memo } from "react";
import Notes from "./Notes";
import Tasks from "./tasks";
import { TaskContext } from "./context/TasksContext";
import { useStorage } from "./hooks/useStorage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

const General = memo(() => {
  const { value: tab, setValue: setTabStorage } = useStorage<string>("activeTab", "tasks");
  const { tasks } = useContext(TaskContext);

  const activeTab = tab === "notes" ? "notes" : "tasks";

  const handleTabChange = useCallback(
    async (value: string) => {
      try {
        await setTabStorage(value);
      } catch (error) {
        console.error("Failed to save active tab:", error);
      }
    },
    [setTabStorage]
  );

  const incompleteCount = tasks.filter((t) => !t.completed).length;

  return (
    <section className="flex flex-col flex-1 min-h-0">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
        <TabsList className="mb-2">
          <TabsTrigger value="tasks">
            {incompleteCount > 0 ? `Tasks (${incompleteCount})` : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex flex-col flex-1 min-h-0 mt-0">
          <Tasks />
        </TabsContent>
        <TabsContent value="notes" className="flex flex-col flex-1 min-h-0 mt-0">
          <Notes />
        </TabsContent>
      </Tabs>
    </section>
  );
});

General.displayName = "General";

export default General;
