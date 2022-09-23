import React, { useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { ListGroup, Row, Col, Container } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@fullcalendar/daygrid/main.css";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { format, addDays } from "date-fns";
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
import "./Task.css";

const TaskMonth = (props) => {
  const { tasks, projectId } = props;

  const dispatch = useDispatch();

  const onItemSelected = useContext(HambugurMenuContext);

  const [graphTasks, setGraphTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    let draggableEl = document.getElementById("external-events");
    new Draggable(draggableEl, {
      itemSelector: ".fc-event",
      eventData: function (eventEl) {
        let title = eventEl.getAttribute("title");
        let id = eventEl.getAttribute("data");
        return {
          title: title,
          id: id,
        };
      },
    });

    const tempTasks = [];
    const tempPendingTasks = [];
    for (let task of tasks) {
      if (!task.date_from || !task.date_to) {
        const taskObj = {
          id: task._id,
          title: task.name,
          backgroundColor: "#aeb8c2",
          borderColor: "#aeb8c2",
        };
        tempPendingTasks.push(taskObj);
      } else {
        const taskObj = {
          id: task._id,
          title: task.name,
          start: task.date_from,
          end: task.date_to,
          allDay: true,
          backgroundColor: "#aeb8c2",
          borderColor: "#aeb8c2",
        };
        tempTasks.push(taskObj);
      }
      if (task.sub_tasks.length > 0) {
        for (let subTask of task.sub_tasks) {
          if (!subTask.date_from || !subTask.date_to) {
            const subTaskObj = {
              id: subTask._id,
              title: subTask.name,
              backgroundColor: "#aeb8c2",
              borderColor: "#aeb8c2",
            };
            tempPendingTasks.push(subTaskObj);
          } else {
            const subTaskObj = {
              id: subTask._id,
              title: subTask.name,
              start: subTask.date_from,
              end: subTask.date_to,
              allDay: true,
              backgroundColor: "#aeb8c2",
              borderColor: "#aeb8c2",
            };
            tempTasks.push(subTaskObj);
          }
        }
      }
    }

    setGraphTasks(tempTasks);
    setPendingTasks(tempPendingTasks);
  }, [tasks]);

  //   handling to drop the external task on calendar
  const handleReceive = (info) => {
    //   removing the moved task from pending task list
    const newPendingTasks = pendingTasks.filter(
      (task) => task.id !== info.event.id
    );
    setPendingTasks(newPendingTasks);

    // synchronize the updated task with backend using api and update app setting data
    const endDay = addDays(info.event.start, 1);
    const newInfo = {
      ...info,
      event: {
        ...info.event,
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: endDay,
      },
    };
    updateTask(newInfo);

    // updating the list of tasks on calendar
    const taskObj = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: endDay,
      allDay: true,
      backgroundColor: "#aeb8c2",
      borderColor: "#aeb8c2",
    };
    const newGraphTasks = [...graphTasks, ...[taskObj]];
    setGraphTasks(newGraphTasks);

    // remove the task in blur color
    info.event.remove();
  };

  const updateTask = async (info) => {
    const fromDate = format(info.event.start, "yyyy-MM-dd");
    const toDate = format(info.event.end, "yyyy-MM-dd");

    let formData = getFormObj();
    formData.append("api_method", "edit_task");
    formData.append("task_id", info.event.id);
    formData.append("name", info.event.title);
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

  const handleClick = (info) => {
    const task_id = info.event.id;
    let role = "";
    for (let task of tasks) {
      if (task._id === task_id) {
        role = task.role;
        break;
      }
      if (task.sub_tasks.length > 0) {
        const sub_task = task.sub_tasks.find(
          (subtask) => subtask._id === task_id
        );
        if (sub_task) {
          role = sub_task.role;
          break;
        }
      }
    }

    if (role === "Admin") onItemSelected("Edit Task", task_id, projectId);
    else onItemSelected("View Task", task_id, projectId);
  };

  const onPendingTaskClicked = (pendingTask) => {
    const task_id = pendingTask.id;
    let role = "";
    for (let task of tasks) {
      if (task._id === task_id) {
        role = task.role;
        break;
      }
      if (task.sub_tasks.length > 0) {
        const sub_task = task.sub_tasks.find(
          (subtask) => subtask._id === task_id
        );
        if (sub_task) {
          role = sub_task.role;
          break;
        }
      }
    }

    if (role === "Admin") onItemSelected("Edit Task", task_id, projectId);
    else onItemSelected("View Task", task_id, projectId);
  };

  const unplanningWidth = pendingTasks.length === 0 ? 2 : 3;

  return (
    <Container>
      <Row>
        <Col sm={unplanningWidth}>
          <div
            id="external-events"
            style={{
              marginTop: 20,
              padding: "10px",
              width: "80%",
              height: "auto",
              maxHeight: "-webkit-fill-available",
            }}
          >
            {pendingTasks.length !== 0 && (
              <p align="center">
                <strong>Unplanned Tasks</strong>
              </p>
            )}
            <ListGroup as="ol" numbered>
              {pendingTasks.map((task) => (
                <ListGroup.Item
                  as="li"
                  className="fc-event"
                  title={task.title}
                  data={task.id}
                  key={task.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onPendingTaskClicked(task)}
                >
                  {task.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
        <Col sm={8}>
          <FullCalendar
            initialView="dayGridMonth"
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              start: "prev",
              center: "title",
              end: "next",
            }}
            events={graphTasks}
            droppable={true}
            editable={true}
            eventResize={(info) => updateTask(info)} // resizing the date range of calendar
            eventDrop={(info) => updateTask(info)} // dropping task inside calendar
            eventClick={handleClick}
            eventReceive={handleReceive} // dropping external task into calendar
            fixedWeekCount={false}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default TaskMonth;
