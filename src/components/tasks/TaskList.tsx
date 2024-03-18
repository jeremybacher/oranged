import React, { Fragment } from "react";
import { List } from "@mui/material";
import { TaskContext } from "../context/TasksContext";
import DraggableItem from "./DraggableItem";
import DialogTask from "./DialogTask";

interface TaskList {
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const TaskList = ({ setDialogTaskData }: TaskList) => {
  const { tasks } = React.useContext(TaskContext);

  const onEditTaskHandler = (id: string) => {
    setDialogTaskData({ openDialog: true, editableTaskId: id });
  }

  return (
    <Fragment>
      <List>
        {tasks.map((task: Task, index: number) => (
          <DraggableItem key={task.id} {...task} index={index} onEditTask={onEditTaskHandler} />
        ))}
      </List>
    </Fragment>
  );
};

export default TaskList;
