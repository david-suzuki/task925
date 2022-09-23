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

const TaskTimeline = (props) => {
  const { tasks, projectId } = props;

  const dispatch = useDispatch();

  const onItemSelected = useContext(HambugurMenuContext);

  const [graphTasks, setGraphTasks] = useState([]);
  // const [tooltipPosition, setTooltipPosition] = useState({ x: "0", y: "0" });

  useEffect(() => {
    const myTimeout = setTimeout(initDomElement, 100);

    const tempTasks = getGraphTasks();
    setGraphTasks(tempTasks);

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

    let taskNameElements = document.getElementsByClassName("_nI1Xw");
    for (let i = 0; i < taskNameElements.length; i++) {
      taskNameElements[i].style.cursor = "pointer";
      taskNameElements[i].addEventListener(
        "click",
        function (event) {
          const taskName = event.target.innerHTML.replaceAll("&nbsp;", "");
          const graphTaskItem = initialGraphTasks.find((graphTask, idx) => {
            if (idx === i && graphTask.name.trim() === taskName) return true;
            return false;
          });

          if (graphTaskItem) handleDblClick(graphTaskItem);
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

  const getGraphTasks = () => {
    const tempTasks = [];
    for (let task of tasks) {
      const taskObj = {
        start: calcDate(task.date_from),
        end: calcDate(task.date_to),
        name: task.name,
        id: task._id,
        type: "task",
        progress: 0,
        role: task.role,
        styles: {
          progressColor: "#ffbb54",
          progressSelectedColor: "#ff9e0d",
        },
      };
      tempTasks.push(taskObj);
      if (task.sub_tasks.length > 0) {
        for (let subTask of task.sub_tasks) {
          const subTaskObj = {
            start: calcDate(subTask.date_from),
            end: calcDate(subTask.date_to),
            name: "\u00A0\u00A0\u00A0" + subTask.name,
            id: subTask._id,
            type: "task",
            progress: 0,
            role: subTask.role,
            styles: {
              progressColor: "#ffbb54",
              progressSelectedColor: "#ff9e0d",
            },
          };
          tempTasks.push(subTaskObj);
        }
      }
    }

    return tempTasks;
  };

  const initialGraphTasks = getGraphTasks();

  const handleTaskChange = async (task) => {
    let newTasks = graphTasks.map((t) => (t.id === task.id ? task : t));

    setGraphTasks(newTasks);

    const fromDate = format(task.start, "yyyy-MM-dd");
    const toDate = format(task.end, "yyyy-MM-dd");

    let formData = getFormObj();
    formData.append("api_method", "edit_task");
    formData.append("task_id", task.id);
    formData.append("name", task.name.trim());
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

  const handleDblClick = (task) => {
    if (task.role === "Admin") onItemSelected("Edit Task", task.id, projectId);
    else onItemSelected("View Task", task.id, projectId);
  };

  return (
    <div>
      {graphTasks.length > 0 && (
        <Gantt
          tasks={graphTasks}
          listCellWidth="150px"
          columnWidth={60}
          viewMode={ViewMode.Day}
          barFill={40}
          barCornerRadius={10}
          onDateChange={handleTaskChange}
          onDoubleClick={handleDblClick}
          TooltipContent={"span"}
        />
      )}
    </div>
  );
};

export default TaskTimeline;
