import React, { useState, useEffect, useContext } from "react";
import { Accordion, Button, Card, ButtonGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  fetchWorkspaces,
  setDisplayWorkspace,
  setDisplayProject,
} from "../workspace/workspaceSlice";
import {
  init,
  setIsMessages,
  setIsAlerts,
  setAppSettingLoad,
} from "../../layouts/appsettingSlice";
import ContextAwareToggle from "../../components/ContextAwareToggle";
import ProjectView from "./ProjectView";
import HambugurDropdown from "../../components/HambugurDropdown";
import { PROJECT_MENUITEMS } from "../../services/constants";
import { getAppSettingData } from "../../services/globals";
import { setError } from "../workspace/workspaceSlice";
import { HambugurMenuContext } from "../../services/contexts";

const ProjectSingle = (props) => {
  const { project, index, workspaceId, accordionActiveIndex } = props;
  const dispatch = useDispatch();
  const onItemSelected = useContext(HambugurMenuContext);

  const [viewStatus, setViewStatus] = useState("list");
  const [tasks, setTasks] = useState(project.tasks);

  useEffect(() => {
    setTasks(project.tasks);
  }, [project]);

  // const onSelect = (selectedTask) => {
  //     if (selectedTask.length > 0) {
  //         setTasks(project.tasks.filter((task) => task._id === selectedTask[0]._id))
  //     } else {
  //         setTasks(project.tasks)
  //     }
  // }

  const onCollapseHeaderClicked = async (eventKey) => {
    if (eventKey === accordionActiveIndex) {
      dispatch(
        setDisplayProject({
          display_project: "-1",
        })
      );
      return;
    }

    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(project._id, null);
    dispatch(setAppSettingLoad({ app_setting_load: false }));
    if (data.error) {
      dispatch(
        setError({
          isShow: true,
          title: "Error",
          message: data.message,
        })
      );
      return;
    }

    const settingsData = data.app_settings;
    const workspaces = settingsData.workspaces;
    dispatch(
      fetchWorkspaces({
        workspaces: workspaces,
      })
    );

    const display_workspace = settingsData.display_workspace;
    dispatch(
      setDisplayWorkspace({
        display_workspace: display_workspace,
      })
    );

    const display_project = settingsData.display_project;
    dispatch(
      setDisplayProject({
        display_project: display_project,
      })
    );

    const participant_types = settingsData.participant_types;
    const participant_status = settingsData.participant_status;
    const tag_templates = settingsData.tag_templates;
    const tag_visible_to = settingsData.tag_visible_to;
    const tag_editors = settingsData.tag_editors;
    const field_types = settingsData.field_types;
    const field_visible_to = settingsData.field_visible_to;
    const field_editors = settingsData.field_editors;
    const message_visible_to = settingsData.message_visible_to;
    const message_recipients = settingsData.message_recipients;

    dispatch(
      init({
        participant_types,
        participant_status,
        tag_templates,
        tag_editors,
        tag_visible_to,
        field_types,
        field_visible_to,
        field_editors,
        message_visible_to,
        message_recipients,
      })
    );

    const isMessages = settingsData.messages;
    dispatch(
      setIsMessages({
        isMessages: isMessages,
      })
    );

    const isAlerts = settingsData.alerts;
    dispatch(
      setIsAlerts({
        isAlerts: isAlerts,
      })
    );
  };

  return (
    <Card>
      <Card.Header style={{ backgroundColor: "#e7f1ff" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex">
            <HambugurDropdown
              items={PROJECT_MENUITEMS}
              itemId={project._id}
              parentId={workspaceId}
            />
            <ContextAwareToggle
              eventKey={index.toString()}
              callback={onCollapseHeaderClicked}
            >
              {project.name}
            </ContextAwareToggle>
          </div>
          <div>
            <Button
              variant="outline-info"
              size="sm"
              className="mx-3"
              onClick={() => onItemSelected("New Task", project._id)}
            >
              + New Task
            </Button>
            <ButtonGroup size="sm">
              <Button
                variant="outline-primary"
                style={{ width: "80px" }}
                onClick={() => setViewStatus("list")}
              >
                List
              </Button>
              <Button
                variant="outline-primary"
                style={{ width: "80px" }}
                onClick={() => setViewStatus("month")}
              >
                Month
              </Button>
              <Button
                variant="outline-primary"
                style={{ width: "80px" }}
                onClick={() => setViewStatus("timeline")}
              >
                Timeline
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Card.Header>
      <Accordion.Collapse eventKey={index.toString()}>
        <Card.Body className="mx-2">
          <ProjectView
            viewStatus={viewStatus}
            tasks={tasks}
            projectId={project._id}
          />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default ProjectSingle;
