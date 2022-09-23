import React from "react";
import { useSelector } from "react-redux";
import { Accordion } from "react-bootstrap";
import ProjectSingle from "./ProjectSingle";
import "bootstrap/dist/css/bootstrap.css";

const ProjectList = (props) => {
  const display_project = useSelector(
    (state) => state.workspaces.display_project
  );
  const { projects, workspaceId } = props;
  const active_index = projects
    .findIndex((project) => project._id === display_project)
    .toString();

  return (
    <Accordion activeKey={active_index} className="my-3">
      {projects.map((project, i) => (
        <ProjectSingle
          key={project._id}
          project={project}
          index={i}
          workspaceId={workspaceId}
          accordionActiveIndex={active_index}
        />
      ))}
    </Accordion>
  );
};

export default ProjectList;
