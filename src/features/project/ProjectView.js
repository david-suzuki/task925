import React from "react";
import TaskList from "../task/TaskList";
import TaskMonth from "../task/TaskMonth";
import TaskTimeline from "../task/TaskTimeline";

const ProjectView = (props) => {
  const { viewStatus, tasks, projectId } = props;

  let ViewElement = null;
  if (viewStatus === "list") {
    ViewElement = (
      <div>
        <TaskList tasks={tasks} projectId={projectId} />
      </div>
    );
  } else if (viewStatus === "month") {
    ViewElement = (
      <div>
        <TaskMonth tasks={tasks} projectId={projectId} />
      </div>
    );
  } else {
    ViewElement = (
      <div>
        <TaskTimeline tasks={tasks} projectId={projectId} />
      </div>
    );
  }

  return <div style={{ marginTop: 10 }}>{ViewElement}</div>;
};

export default ProjectView;
