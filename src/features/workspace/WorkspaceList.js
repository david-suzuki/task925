import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import Topbar from "../../layouts/topbar";
import "./Workspace.css";
import "bootstrap/dist/css/bootstrap.css";
import { useSelector, useDispatch } from "react-redux";
import WorkspaceSingle from "./WorkspaceSingle";
import WorkspaceDetail from "./WorkspaceDetail";
import {
  WORKSPACE_MENUITEMS,
  PROJECT_MENUITEMS,
} from "../../services/constants";
import { fetchWorkspaces } from "./workspaceSlice";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../../features/workspace/workspaceSlice";
import ProjectDetail from "../project/ProjectDetail";
import { HambugurMenuContext } from "../../services/contexts";
import TaskDetail from "../task/TaskDetail";
import TaskView from "../task/TaskView";
import {
  PUSHER_APP_KEY,
  PUSHER_APP_CLUSTER,
  PUSHER_CHANNEL_PREFIX,
} from "../../services/constants";
import Pusher from "pusher-js";
import { setDisplayWorkspace, setDisplayProject } from "./workspaceSlice";
import {
  init,
  setIsMessages,
  setIsAlerts,
} from "../../layouts/appsettingSlice";
import SubTaskDetail from "../subtask/SubTaskDetail";

export default function WorkspaceList() {
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  const display_workspace = useSelector(
    (state) => state.workspaces.display_workspace
  );
  const active_index = workspaces
    .findIndex((workspace) => workspace._id === display_workspace)
    .toString();
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);

  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectId, setProjectId] = useState(null);

  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const [showSubTaskDetail, setShowSubTaskDetail] = useState(false);
  const [subTaskId, setSubTaskId] = useState(null);

  const onHamburgurMenuSelected = (menuLabel, id, parentId) => {
    // new workspace
    if (menuLabel === "New Workspace") {
      setShow(true);
      setWorkspaceId(null);
      // edit workspace
    } else if (menuLabel === WORKSPACE_MENUITEMS[0].label) {
      setShow(true);
      setWorkspaceId(id);
      // delete workspace
    } else if (menuLabel === WORKSPACE_MENUITEMS[1].label) {
      deleteWorkspace(id);
    } else if (menuLabel === "New Project") {
      setShowProjectDetail(true);
      setWorkspaceId(id);
      setProjectId(null);
      // edit project
    } else if (menuLabel === PROJECT_MENUITEMS[0].label) {
      setShowProjectDetail(true);
      setProjectId(id);
    } else if (menuLabel === PROJECT_MENUITEMS[1].label) {
      deleteProject(id);
    } else if (menuLabel === "New Task") {
      setShowTaskDetail(true);
      setProjectId(id);
      setTaskId(null);
    } else if (menuLabel === "Edit Task") {
      setShowTaskDetail(true);
      setTaskId(id);
      setProjectId(parentId);
    } else if (menuLabel === "View Task") {
      setShowTaskView(true);
      setTaskId(id);
      setProjectId(parentId);
    } else if (menuLabel === "New Sub-task") {
      setShowSubTaskDetail(true);
      setTaskId(id);
      setSubTaskId(null);
    }
  };

  const deleteWorkspace = async (workspace_id) => {
    let formData = getFormObj();
    formData.append("api_method", "delete_workspace");
    formData.append("workspace_id", workspace_id);

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        const newWorkspaces = workspaces.filter(
          (workspace) => workspace._id !== workspace_id
        );
        dispatch(
          fetchWorkspaces({
            workspaces: newWorkspaces,
          })
        );
      } else if (response.data.error) {
        dispatch(
          setError({
            isShow: true,
            title: "Error",
            message: response.data.message,
          })
        );
      }
    } catch (err) {
      dispatch(
        setError({
          isShow: true,
          title: "Error",
          message: err.toString(),
        })
      );
    }
  };

  const deleteProject = async (project_id) => {
    let formData = getFormObj();
    formData.append("api_method", "delete_project");
    formData.append("project_id", project_id);

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        const newWorkspaces = workspaces.map((workspace) => {
          const newProjects = workspace.projects.filter(
            (project) => project._id !== project_id
          );
          return Object.assign({}, workspace, { projects: newProjects });
        });
        dispatch(
          fetchWorkspaces({
            workspaces: newWorkspaces,
          })
        );
      } else if (response.data.error) {
        dispatch(
          setError({
            isShow: true,
            title: "Error",
            message: response.data.message,
          })
        );
      }
    } catch (err) {
      dispatch(
        setError({
          isShow: true,
          title: "Error",
          message: err.toString(),
        })
      );
    }
  };

  const onShowDetail = (type, taskId, projectId) => {
    if (type === "task") {
      setShow(false);
      setShowProjectDetail(false);
      setShowTaskDetail(true);
      setTaskId(taskId);
      setProjectId(projectId);
    } else if (type === "project") {
      setShow(false);
      setShowProjectDetail(true);
      setShowTaskDetail(false);
      setProjectId(projectId);
    }
  };

  useEffect(() => {
    var pusher = new Pusher(PUSHER_APP_KEY, { cluster: PUSHER_APP_CLUSTER });
    for (let workspace of workspaces) {
      const channel_name = PUSHER_CHANNEL_PREFIX + workspace._id;
      const channel = pusher.subscribe(channel_name);
      channel.bind(channel_name, function (eventData) {
        //reload dashboard here (app_settings)
        let formData = getFormObj();
        formData.append("api_method", "app_settings");
        formData.append("app_version", "1");
        formData.append(
          "device_info",
          "https://github.com/bestiejs/platform.js"
        );
        post(server_domain, formData)
          .then((response) => {
            const data = response.data;
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
          })
          .catch((err) => {
            dispatch(
              setError({
                isShow: true,
                title: "Error",
                message: err.toString(),
              })
            );
          });
      });
    }

    return () => {
      for (let workspace of workspaces) {
        const channel_name = PUSHER_CHANNEL_PREFIX + workspace._id;
        pusher.unsubscribe(channel_name);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <HambugurMenuContext.Provider value={onHamburgurMenuSelected}>
        <Topbar onShowDetail={onShowDetail} />
        <Accordion activeKey={active_index}>
          {workspaces.map((workspace, i) => (
            <WorkspaceSingle
              key={workspace._id}
              workspace={workspace}
              index={i}
              accordionActiveIndex={active_index}
            />
          ))}
        </Accordion>
      </HambugurMenuContext.Provider>
      {show && (
        <WorkspaceDetail onClose={() => setShow(false)} id={workspaceId} />
      )}

      {showProjectDetail && (
        <ProjectDetail
          onClose={() => setShowProjectDetail(false)}
          workspaceId={workspaceId}
          id={projectId}
        />
      )}
      {showTaskDetail && (
        <TaskDetail
          onClose={() => setShowTaskDetail(false)}
          projectId={projectId}
          id={taskId}
        />
      )}
      {showTaskView && (
        <TaskView
          onClose={() => setShowTaskView(false)}
          projectId={projectId}
          id={taskId}
        />
      )}
      {showSubTaskDetail && (
        <SubTaskDetail
          onClose={() => setShowSubTaskDetail(false)}
          taskId={taskId}
          id={subTaskId}
        />
      )}
    </div>
  );
}
