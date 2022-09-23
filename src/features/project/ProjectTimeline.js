import React, { useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { format } from "date-fns";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";
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
import { getAppSettingData } from "../../services/globals";
import { HambugurMenuContext } from "../../services/contexts";

const ProjectTimeline = (props) => {
  const { projects, workspaceId } = props;

  const dispatch = useDispatch();

  const onItemSelected = useContext(HambugurMenuContext);

  const [graphProjects, setGraphProjects] = useState([]);

  useEffect(() => {
    const myTimeout = setTimeout(initDomElement, 100);

    const tempProjects = getGraphProjects();

    setGraphProjects(tempProjects);

    return () => {
      clearTimeout(myTimeout);
    };
  }, []);

  const initDomElement = () => {
    const headerCells = document.getElementsByClassName("_WuQ0f");
    for (let i = 0; i < headerCells.length; i++) {
      if (i > 0) {
        headerCells[i].style.display = "none";
      }
    }

    const cells = document.getElementsByClassName("_3lLk3");
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].hasAttribute("title")) {
        cells[i].style.display = "none";
      }
    }
    const horizontalScrollBar = document.getElementsByClassName("_19jgW");
    horizontalScrollBar[0].style.marginLeft = "150px";

    let projectNameElements = document.getElementsByClassName("_nI1Xw");
    for (let i = 0; i < projectNameElements.length; i++) {
      projectNameElements[i].style.cursor = "pointer";
      projectNameElements[i].addEventListener(
        "click",
        function (event) {
          const projectName = event.target.innerHTML.replaceAll("&nbsp;", "");
          const graphProjectItem = initialGraphProjects.find(
            (graphProject, idx) => {
              if (idx === i && graphProject.name.trim() === projectName)
                return true;
              return false;
            }
          );

          if (graphProjectItem) handleDblClick(graphProjectItem);
        },
        false
      );
    }
  };

  const calcDate = (dateStr) => {
    if (!dateStr) {
      return new Date();
    }

    const date = dateStr.split(" ")[0];
    const dates = date.split("-");
    const year = parseInt(dates[0]);
    const month = parseInt(dates[1]) - 1;
    const day = parseInt(dates[2]);

    const result = new Date(year, month, day);
    return result;
  };

  const loadAppSettingData = async () => {
    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(null, null);
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

  const getGraphProjects = () => {
    const tempProjects = [];
    for (let project of projects) {
      const projectObj = {
        start: calcDate(project.date_from),
        end: calcDate(project.date_to),
        name: project.name,
        id: project._id,
        type: "task",
        progress: 0,
        role: project.role,
        styles: {
          progressColor: "#ffbb54",
          progressSelectedColor: "#ff9e0d",
        },
      };
      tempProjects.push(projectObj);
    }

    return tempProjects;
  };

  const initialGraphProjects = getGraphProjects();

  const handleProjectChange = async (project) => {
    let newProjects = graphProjects.map((p) =>
      p.id === project.id ? project : p
    );

    setGraphProjects(newProjects);

    const fromDate = format(project.start, "yyyy-MM-dd");
    const toDate = format(project.end, "yyyy-MM-dd");

    let formData = getFormObj();
    formData.append("api_method", "edit_project");
    formData.append("project_id", project.id);
    formData.append("name", project.name);
    formData.append("date_from", fromDate);
    formData.append("date_to", toDate);

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        loadAppSettingData();
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

  const handleDblClick = (project) => {
    onItemSelected("Edit Project", project.id, workspaceId);
  };

  return (
    <div>
      {graphProjects.length > 0 && (
        <Gantt
          tasks={graphProjects}
          listCellWidth="150px"
          columnWidth={60}
          viewMode={ViewMode.Day}
          barFill={40}
          barCornerRadius={10}
          onDateChange={handleProjectChange}
          onDoubleClick={handleDblClick}
          TooltipContent={"span"}
        />
      )}
    </div>
  );
};

export default ProjectTimeline;
