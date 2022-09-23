import React, { useState, useEffect, useContext } from "react";
import { Accordion, Card, Button, ButtonGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import ContextAwareToggle from "../../components/ContextAwareToggle";
import HambugurDropdown from "../../components/HambugurDropdown";
import ProjectList from "../project/ProjectList";
import ProjectMonth from "../project/ProjectMonth";
import ProjectTimeline from "../project/ProjectTimeline";

import "./Workspace.css";
import { WORKSPACE_MENUITEMS } from "../../services/constants";
import { getAppSettingData } from "../../services/globals";
import {
  fetchWorkspaces,
  setDisplayProject,
  setDisplayWorkspace,
} from "./workspaceSlice";
import {
  init,
  setIsAlerts,
  setIsMessages,
  setAppSettingLoad,
} from "../../layouts/appsettingSlice";
import { setError } from "./workspaceSlice";
import { HambugurMenuContext } from "../../services/contexts";

const WorkspaceSingle = (props) => {
  const { workspace, index, accordionActiveIndex } = props;

  const dispatch = useDispatch();
  const onItemSelected = useContext(HambugurMenuContext);

  const [viewStatus, setViewStatus] = useState("list");
  const [projects, setProjects] = useState(workspace.projects);

  useEffect(() => {
    setProjects(workspace.projects);
  }, [workspace]);

  // const onSelect = (selectedProject) => {
  //     if (selectedProject.length > 0) {
  //         setProjects(workspace.projects.filter((project) => project._id === selectedProject[0]._id))
  //     } else {
  //         setProjects(workspace.projects)
  //     }
  // }

  const onCollapseHeaderClicked = async (eventKey) => {
    if (eventKey === accordionActiveIndex) {
      dispatch(
        setDisplayWorkspace({
          display_workspace: "-1",
        })
      );
      return;
    }

    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(null, workspace._id);
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
              items={WORKSPACE_MENUITEMS}
              itemId={workspace._id}
              parentId={null}
            />
            <ContextAwareToggle
              eventKey={index.toString()}
              callback={onCollapseHeaderClicked}
            >
              {workspace.name}
            </ContextAwareToggle>
          </div>
          <div className="d-flex">
            <Button
              variant="outline-info"
              size="sm"
              className="mx-3"
              onClick={() => onItemSelected("New Project", workspace._id)}
            >
              + New Project
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
          {/* <Col sm={2}>
                        <Form>
                            <AutoCompleteSelector
                                type="project"
                                options={workspace.projects}
                                onSelect={onSelect}
                            />
                        </Form>
                    </Col> */}
          {viewStatus === "list" ? (
            <ProjectList projects={projects} workspaceId={workspace._id} />
          ) : viewStatus === "month" ? (
            <ProjectMonth projects={projects} workspaceId={workspace._id} />
          ) : (
            <ProjectTimeline projects={projects} workspaceId={workspace._id} />
          )}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default WorkspaceSingle;
