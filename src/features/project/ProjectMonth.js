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

const ProjectMonth = (props) => {
  const { projects, workspaceId } = props;

  const dispatch = useDispatch();

  const onItemSelected = useContext(HambugurMenuContext);

  const [graphProjects, setGraphProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);

  useEffect(() => {
    let draggableEl = document.getElementById("external-projects");
    new Draggable(draggableEl, {
      itemSelector: ".fc-project",
      eventData: function (eventEl) {
        let title = eventEl.getAttribute("title");
        let id = eventEl.getAttribute("data");
        return {
          title: title,
          id: id,
        };
      },
    });

    const tempProjects = [];
    const tempPendingProjects = [];
    for (let project of projects) {
      if (!project.date_from || !project.date_to) {
        const projectObj = {
          id: project._id,
          title: project.name,
          backgroundColor: "#aeb8c2",
          borderColor: "#aeb8c2",
        };
        tempPendingProjects.push(projectObj);
      } else {
        const projectObj = {
          id: project._id,
          title: project.name,
          start: project.date_from,
          end: project.date_to,
          allDay: true,
          backgroundColor: "#aeb8c2",
          borderColor: "#aeb8c2",
        };
        tempProjects.push(projectObj);
      }
    }

    setGraphProjects(tempProjects);
    setPendingProjects(tempPendingProjects);
  }, [projects]);

  //   handling to drop the external project on calendar
  const handleReceive = (info) => {
    //   removing the moved project from pending project list
    const newPendingProjects = pendingProjects.filter(
      (project) => project.id !== info.event.id
    );
    setPendingProjects(newPendingProjects);

    // synchronize the updated project with backend using api and update app setting data
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
    updateProject(newInfo);

    // updating the list of projects on calendar
    const projectObj = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: endDay,
      allDay: true,
      backgroundColor: "#aeb8c2",
      borderColor: "#aeb8c2",
    };
    const newGraphTasks = [...graphProjects, ...[projectObj]];
    setGraphProjects(newGraphTasks);

    // remove the task in blur color
    info.event.remove();
  };

  const updateProject = async (info) => {
    const fromDate = format(info.event.start, "yyyy-MM-dd");
    const toDate = format(info.event.end, "yyyy-MM-dd");

    let formData = getFormObj();
    formData.append("api_method", "edit_project");
    formData.append("project_id", info.event.id);
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
    const project_id = info.event.id;
    onItemSelected("Edit Project", project_id, workspaceId);
  };

  const onPendingProjectClicked = (pendingProject) => {
    const project_id = pendingProject.id;
    onItemSelected("Edit Project", project_id, workspaceId);
  };

  const unplanningWidth = pendingProjects.length === 0 ? 2 : 3;

  return (
    <Container>
      <Row>
        <Col sm={unplanningWidth}>
          <div
            id="external-projects"
            style={{
              marginTop: 20,
              padding: "10px",
              width: "80%",
              height: "auto",
              maxHeight: "-webkit-fill-available",
            }}
          >
            {pendingProjects.length !== 0 && (
              <p align="center">
                <strong>Unplanned Projects</strong>
              </p>
            )}
            <ListGroup as="ol" numbered>
              {pendingProjects.map((project) => (
                <ListGroup.Item
                  as="li"
                  className="fc-project"
                  title={project.title}
                  data={project.id}
                  key={project.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onPendingProjectClicked(project)}
                >
                  {project.title}
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
            events={graphProjects}
            droppable={true}
            editable={true}
            eventResize={(info) => updateProject(info)} // resizing the date range of calendar
            eventDrop={(info) => updateProject(info)} // dropping task inside calendar
            eventClick={handleClick}
            eventReceive={handleReceive} // dropping external task into calendar
            fixedWeekCount={false}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectMonth;
