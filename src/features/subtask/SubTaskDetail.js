import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
import DatePicker from "../../components/DatePicker";
import DocumentsLinks from "../../components/DocumentsLinks";
import Timeline from "../../components/Timeline";
import FooterDiv from "../../components/FooterDiv";
import { server_domain, getFormObj } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";
import Field from "../task/Field";
import Tag from "../task/Tag";
import {
  fetchWorkspaces,
  setDisplayWorkspace,
  setDisplayProject,
} from "../workspace/workspaceSlice";
import "../../components/Loading.css";
import LoadingTimeline from "../../components/LoadingTimeline";
import Message from "../task/Message";
import Status from "../task/Status";
import {
  setAppSettingLoad,
  init,
  setIsAlerts,
  setIsMessages,
} from "../../layouts/appsettingSlice";
import { getAppSettingData } from "../../services/globals";

const SubTaskDetail = (props) => {
  const { onClose, id, taskId } = props;
  const workspaces = useSelector((state) => state.workspaces.workspaces);
  let projectId = "";
  for (let workspace of workspaces) {
    const projects = workspace.projects;
    for (let project of projects) {
      const tasks = project.tasks;
      for (let task of tasks) {
        if (task._id === taskId) {
          projectId = project._id;
          break;
        }
      }
    }
  }
  const dispatch = useDispatch();

  const title = id === null ? "New Sub-task" : "Edit Sub-task";

  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [internalDescription, setInternalDescription] = useState("");
  const [owner, setOwner] = useState(0);
  const [actioner, setActioner] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [finished, setFinished] = useState(false);
  const [taskFields, setTaskFields] = useState([]);
  const [taskTags, setTaskTags] = useState([]);
  const [logger, setLogger] = useState("0");
  const [addedDate, setAddedDate] = useState("");
  const [closedDate, setClosedDate] = useState("");

  const [participants, setParticipants] = useState([]);
  const [timelines, setTimelines] = useState([]);

  const [currentSubTaskId, setCurrentSubTaskId] = useState(id);

  const [loading, setLoading] = useState(false);

  const onDetailDoneClicked = async () => {
    onClose(false);
    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(projectId, null);
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

  const onBlured = async () => {
    if (name === "") return;

    let formData = getFormObj();
    if (currentSubTaskId === null) {
      formData.append("api_method", "add_sub_task");
      formData.append("task_id", taskId);
    } else {
      formData.append("api_method", "edit_task");
      formData.append("task_id", currentSubTaskId);
    }
    formData.append("name", name);
    formData.append("detailsISsmallplaintextbox", description);
    formData.append("internal_detailsISsmallplaintextbox", internalDescription);
    formData.append("date_from", dateFrom);
    formData.append("date_to", dateTo);
    formData.append("date_deadline", deadline);
    formData.append("task_owner_id", owner);
    formData.append("actioner_id", actioner);
    formData.append("task_closedYN", finished ? 1 : 0);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (currentSubTaskId === null)
          setCurrentSubTaskId(response.data.new_task_id);
        setDisabled(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onFinishCahnged = async (e) => {
    const checked = e.target.checked;
    setFinished(!finished);

    if (name === "") return;

    let formData = getFormObj();
    formData.append("api_method", "edit_task");
    formData.append("task_id", currentSubTaskId);
    formData.append("name", name);
    formData.append("detailsISsmallplaintextbox", description);
    formData.append("internal_detailsISsmallplaintextbox", internalDescription);
    formData.append("date_from", dateFrom);
    formData.append("date_to", dateTo);
    formData.append("date_deadline", deadline);
    formData.append("task_owner_id", owner);
    formData.append("actioner_id", actioner);
    formData.append("task_closedYN", checked ? 1 : 0);

    try {
      await post(server_domain, formData);
    } catch (err) {
      console.log(err);
    }
  };

  const onDeleteClicked = async () => {
    let formData = getFormObj();
    formData.append("api_method", "delete_task");
    formData.append("task_id", currentSubTaskId);

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        const newWorkspaces = workspaces.map((workspace) => {
          const newProjects = workspace.projects.map((project) => {
            const newTasks = project.tasks.map((task) => {
              const newSubTasks = task.sub_tasks.filter(
                (sub_task) => sub_task._id !== currentSubTaskId
              );
              return Object.assign({}, task, { sub_tasks: newSubTasks });
            });
            return Object.assign({}, project, { tasks: newTasks });
          });
          return Object.assign({}, workspace, { projects: newProjects });
        });
        dispatch(
          fetchWorkspaces({
            workspaces: newWorkspaces,
          })
        );
        onClose(false);
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

  useEffect(() => {
    const setSubTaskAsync = async (id) => {
      let formData = getFormObj();
      formData.append("api_method", "get_task");
      formData.append("task_id", id);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const task = response.data.task;
          setName(task.name);
          setTimelines(task.timeline);
          setDescription(
            task.detailsISsmallplaintextbox === null
              ? ""
              : task.detailsISsmallplaintextbox
          );
          setInternalDescription(
            task.internal_detailsISsmallplaintextbox === null
              ? ""
              : task.detailsISsmallplaintextbox
          );
          setDateFrom(
            task.date_from === null ? "" : task.date_from.split(" ")[0]
          );
          setDateTo(task.date_to === null ? "" : task.date_to.split(" ")[0]);
          setDeadline(
            task.date_deadline === null ? "" : task.date_deadline.split(" ")[0]
          );
          setActioner(task.actioner_id === null ? "0" : task.actioner_id);
          setOwner(task.task_owner_id === null ? "0" : task.task_owner_id);
          setFinished(
            task.task_closedYN === null
              ? false
              : task.task_closedYN === "1"
              ? true
              : false
          );
          setTaskFields(task.task_fields === null ? [] : task.task_fields);
          setTaskTags(task.task_tags === null ? [] : task.task_tags);
          setLogger(task.logger_id === null ? "0" : task.logger_id);
          setAddedDate(
            task._dateadded === null ? "" : task._dateadded.split(" ")[0]
          );
          setClosedDate(
            task.datetime_closed === null
              ? ""
              : task.datetime_closed.split(" ")[0]
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
        setLoading(false);
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

    setDisabled(id === null ? true : false);

    if (id !== null) {
      setSubTaskAsync(id);
    }

    setCurrentSubTaskId(id);
  }, [id, dispatch]);

  useEffect(() => {
    const setParticipantsAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_participants");
      formData.append("project_id", projectId);

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          setParticipants(response.data.list);
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

    if (projectId !== null) {
      setParticipantsAsync();
    }
  }, [projectId, dispatch]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100vh",
        zIndex: 99,
      }}
    >
      <div
        style={{
          backgroundColor: "gray",
          opacity: 0.7,
          height: "15%",
        }}
        id="div1"
        onClick={onDetailDoneClicked}
      ></div>
      <Form>
        <div className="d-flex" style={{ height: "65%" }} id="div2">
          <div
            style={{
              width: "6%",
              backgroundColor: "gray",
              opacity: 0.7,
            }}
            onClick={onDetailDoneClicked}
          ></div>
          <div className="px-4 bg-white" style={{ width: "55%" }}>
            <div className="bg-white py-4 d-flex justify-content-between align-items-center">
              <span className="fs-5 fw-bold">{title}</span>
              <Button variant="primary" onClick={onDetailDoneClicked}>
                Done
              </Button>
            </div>
            <Form.Group className="mb-2" controlId="taskTitle">
              {loading ? (
                <div className="animated-background mx-2"></div>
              ) : (
                <Fragment>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Task title"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={onBlured}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-2" controlId="taskDescription">
              {loading ? (
                <div className="mt-4">
                  <div className="animated-background mx-2 my-1"></div>
                  <div className="animated-background mx-2 my-1"></div>
                  <div className="animated-background mx-2 my-1 w-50"></div>
                </div>
              ) : (
                <Fragment>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Task description"
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={onBlured}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-2" controlId="taskInternalDescription">
              {loading ? (
                <div className="mt-4">
                  <div className="animated-background mx-2 my-1"></div>
                  <div className="animated-background mx-2 my-1 w-50"></div>
                </div>
              ) : (
                <Fragment>
                  <Form.Label>Internal Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Internal description"
                    as="textarea"
                    rows={3}
                    value={internalDescription}
                    onChange={(e) => setInternalDescription(e.target.value)}
                    onBlur={onBlured}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-2 d-flex" controlId="taskDateFrom">
              {loading ? (
                <Fragment>
                  <div className="animated-background mx-2 my-2 w-50"></div>
                  <div className="animated-background mx-2 my-2 w-50"></div>
                </Fragment>
              ) : (
                <Fragment>
                  <div className="w-50 me-3">
                    <Form.Label>Owner/Customer</Form.Label>
                    <Form.Select
                      disabled={disabled}
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      onBlur={onBlured}
                    >
                      <option value="0" hidden>
                        Owner/Customer
                      </option>
                      {participants.map((participant) => (
                        <option value={participant._id} key={participant._id}>
                          {participant.email}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="w-50">
                    <Form.Label>Actioner</Form.Label>
                    <Form.Select
                      disabled={disabled}
                      value={actioner}
                      onChange={(e) => setActioner(e.target.value)}
                      onBlur={onBlured}
                    >
                      <option value="0" hidden>
                        Actioner
                      </option>
                      {participants.map((participant) => (
                        <option value={participant._id} key={participant._id}>
                          {participant.email}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3 d-flex" controlId="taskDateFrom">
              {loading ? (
                <Fragment>
                  <div
                    className="animated-background mx-2 my-1"
                    style={{ width: "30%" }}
                  ></div>
                  <div
                    className="animated-background mx-2 my-1"
                    style={{ width: "30%" }}
                  ></div>
                  <div
                    className="animated-background mx-2 my-1"
                    style={{ width: "30%" }}
                  ></div>
                </Fragment>
              ) : (
                <Fragment>
                  <div style={{ width: "32%" }}>
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      disabled={disabled}
                      value={dateFrom}
                      onChange={(value) => setDateFrom(value)}
                      placeholder="Date From"
                      onBlured={onBlured}
                    />
                  </div>
                  <div className="ms-3" style={{ width: "32%" }}>
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      disabled={disabled}
                      value={dateTo}
                      onChange={(value) => setDateTo(value)}
                      placeholder="Date To"
                      onBlured={onBlured}
                    />
                  </div>
                  <div className="ms-3" style={{ width: "32%" }}>
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      disabled={disabled}
                      value={deadline}
                      onChange={(value) => setDeadline(value)}
                      placeholder="Deadline"
                      onBlured={onBlured}
                    />
                  </div>
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="taskTag">
              {loading ? (
                <div className="animated-background mx-2"></div>
              ) : (
                <Fragment>
                  <Form.Label>Tags</Form.Label>
                  <Tag
                    taskId={currentSubTaskId}
                    projectId={projectId}
                    disabled={disabled}
                    savedTags={taskTags}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              {loading ? (
                <div>
                  <div className="d-flex my-2">
                    <div
                      className="animated-background mx-2"
                      style={{ width: "50%" }}
                    ></div>
                    <div
                      className="animated-background mx-2"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                  <div className="d-flex my-2">
                    <div
                      className="animated-background mx-2"
                      style={{ width: "50%" }}
                    ></div>
                    <div
                      className="animated-background mx-2"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                </div>
              ) : (
                <Fragment>
                  <Form.Label>Fields</Form.Label>
                  <Field
                    taskId={currentSubTaskId}
                    projectId={projectId}
                    disabled={disabled}
                    savedFields={taskFields}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="taskClosedCompleted">
              <Form.Label className="fs-5">Task Closed/Completed</Form.Label>
              {loading ? (
                <div>
                  <div className="d-flex">
                    <div className="animated-background mx-2 my-2 w-50"></div>
                    <div className="animated-background mx-2 my-2 w-50"></div>
                  </div>
                  <div className="d-flex">
                    <div className="animated-background mx-2 my-2 w-50"></div>
                    <div className="animated-background mx-2 my-2 w-50"></div>
                  </div>
                  <div className="d-flex">
                    <div className="animated-background mx-2 my-2 w-50"></div>
                    <div className="animated-background mx-2 my-2 w-50"></div>
                  </div>
                </div>
              ) : (
                <Fragment>
                  <label className="switch ms-3">
                    <input
                      disabled={disabled}
                      type="checkbox"
                      checked={finished}
                      value={finished}
                      onChange={onFinishCahnged}
                    />
                    <span className="slider round"></span>
                  </label>
                  <Status
                    taskId={currentSubTaskId}
                    loggerId={logger}
                    participants={participants}
                    addedDate={addedDate}
                    closedDate={closedDate}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="taskDocuments">
              <Form.Label className="fs-5">Documents & Links</Form.Label>
              <DocumentsLinks disabled={disabled} taskId={currentSubTaskId} />
            </Form.Group>

            <Button
              variant="outline-danger"
              className="mb-3"
              onClick={onDeleteClicked}
              disabled={currentSubTaskId ? false : true}
              style={{ float: "right" }}
            >
              Delete
            </Button>
          </div>
          <div
            style={{ width: "1%", backgroundColor: "gray", opacity: 0.7 }}
          ></div>
          <div className="px-4 pt-5 bg-white rounded" style={{ width: "31%" }}>
            <Form.Group className="mb-3" controlId="taskNotes">
              <Form.Label className="fs-5">Notes & Messages</Form.Label>
              <Message disabled={disabled} taskId={currentSubTaskId} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectTimeline">
              <Form.Label className="fs-5">Timeline</Form.Label>
              {loading ? (
                <LoadingTimeline />
              ) : (
                <Timeline timelines={timelines} />
              )}
            </Form.Group>
          </div>
          <div
            style={{ width: "7%", backgroundColor: "gray", opacity: 0.7 }}
            onClick={onDetailDoneClicked}
          ></div>
        </div>
      </Form>
      <FooterDiv parent="task" onClick={onDetailDoneClicked} />
    </div>
  );
};

export default SubTaskDetail;
