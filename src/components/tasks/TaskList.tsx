import React, { Fragment, memo } from "react";
import DraggableItem from "./DraggableItem";
import type { Task } from "../types/Task";
import type { DialogTaskData } from "../types/DialogTaskData";

interface TaskListProps {
  tasks: Task[];
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  disableDrag?: boolean;
}

const TaskList = memo(({ tasks, setDialogTaskData, selectedIds, onToggleSelect, disableDrag }: TaskListProps) => {
  const onEditTaskHandler = (id: string) => {
    setDialogTaskData({ openDialog: true, editableTaskId: id });
  };

  return (
    <Fragment>
      <ul className="list-none p-0 m-0">
        {tasks.map((task: Task, index: number) => (
          <DraggableItem
            key={task.id}
            {...task}
            index={index}
            onEditTask={onEditTaskHandler}
            selected={selectedIds.has(task.id)}
            onToggleSelect={onToggleSelect}
            disableDrag={disableDrag}
          />
        ))}
      </ul>
    </Fragment>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
