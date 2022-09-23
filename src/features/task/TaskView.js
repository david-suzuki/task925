import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import DocumentsLinks from "../../components/DocumentsLinks";
import Timeline from "../../components/Timeline";
import FooterDiv from "../../components/FooterDiv";
import { server_domain, getFormObj } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";
import "../../components/Loading.css";
import LoadingTimeline from "../../components/LoadingTimeline";
import Message from "./Message";
import { LinkIconButton, EyeIconButton } from "../../components/IconButton";
import Tag from "./Tag";
import Field from "./Field";

const TaskView = (props) => {
  const { onClose, id, projectId } = props;
  const dispatch = useDispatch();

  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [internalDescription, setInternalDescription] = useState("");
  const [owner, setOwner] = useState(0);
  const [actioner, setActioner] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskFields, setTaskFields] = useState([]);
  const [taskTags, setTaskTags] = useState([]);

  const [participants, setParticipants] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [fields, setFields] = useState([]);

  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [dateValue, setDateValue] = useState("");
  const [datetimeValue, setDatetimeValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);

  const [currentTaskId, setCurrentTaskId] = useState(id);

  const [loading, setLoading] = useState(false);

  const onDetailDoneClicked = async () => {
    onClose(false);
  };

  const setFieldValues = (type, name) => {
    switch (type) {
      case "text":
        setTextValue(name);
        break;
      case "number":
        setNumberValue(name);
        break;
      case "date":
        setDateValue(name);
        break;
      case "date/time":
        setDatetimeValue(name);
        break;
      case "yes/no":
        setCheckboxValue(name);
        break;
      default:
    }
  };

  useEffect(() => {
    const setTaskAsync = async (id) => {
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
          setTaskFields(task.task_fields === null ? [] : task.task_fields);
          setTaskTags(task.task_tags === null ? [] : task.task_tags);
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
      setTaskAsync(id);
    }

    setCurrentTaskId(id);
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

  useEffect(() => {
    let unmount = false;
    const setFieldsAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_fields");
      formData.append("project_id", projectId);

      try {
        const response = await post(server_domain, formData);
        if (unmount) return;
        if (response.data.success === 1) {
          const fieldList = response.data.list;
          setFields(fieldList);
          for (let field of fieldList) {
            for (let sf of taskFields) {
              if (field._id === sf.field_id) {
                setFieldValues(field.type, sf.field_name);
              }
            }
          }
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

    if (projectId !== null) setFieldsAsync();

    return () => {
      unmount = true;
    };
  }, [projectId, taskFields, dispatch]);

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
              <span className="fs-5 fw-bold">View Task</span>
              <div>
                <LinkIconButton />
                <EyeIconButton className="mx-2" />
                <Button variant="primary" onClick={onDetailDoneClicked}>
                  Done
                </Button>
              </div>
            </div>
            <Form.Group className="mb-2" controlId="taskTitle">
              {loading ? (
                <div className="animated-background mx-2"></div>
              ) : (
                <Fragment>
                  <Form.Label>Title</Form.Label>
                  <Form.Control type="text" defaultValue={name} disabled />
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
                    as="textarea"
                    rows={4}
                    defaultValue={description}
                    disabled
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
                    as="textarea"
                    rows={3}
                    defaultValue={internalDescription}
                    disabled
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
                  <div className="w-50">
                    <Form.Label>Owner/Customer</Form.Label>
                    <Form.Control
                      type="text"
                      disabled
                      defaultValue={
                        participants.find((p) => p._id === owner)?.email
                      }
                    />
                  </div>
                  <div className="w-50 ms-3">
                    <Form.Label>Actioner</Form.Label>
                    <Form.Control
                      type="text"
                      disabled
                      defaultValue={
                        participants.find((p) => p._id === actioner)?.email
                      }
                    />
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
                    <Form.Control
                      type="text"
                      disabled
                      defaultValue={dateFrom}
                    />
                  </div>
                  <div className="ms-3" style={{ width: "32%" }}>
                    <Form.Label>Date to</Form.Label>
                    <Form.Control type="text" disabled value={dateTo} />
                  </div>
                  <div className="ms-3" style={{ width: "32%" }}>
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="text"
                      disabled
                      defaultValue={deadline}
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
                    taskId={currentTaskId}
                    projectId={projectId}
                    disabled
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
                    taskId={currentTaskId}
                    projectId={projectId}
                    disabled
                    savedFields={taskFields}
                  />
                </Fragment>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="taskDocuments">
              <Form.Label className="fs-5">Documents & Links</Form.Label>
              <DocumentsLinks disabled taskId={currentTaskId} noAddButton />
            </Form.Group>
          </div>
          <div
            style={{ width: "1%", backgroundColor: "gray", opacity: 0.7 }}
          ></div>
          <div className="px-4 pt-5 bg-white rounded" style={{ width: "31%" }}>
            <Form.Group className="mb-3" controlId="taskNotes">
              <Form.Label className="fs-5">Notes & Messages</Form.Label>
              <Message disabled={disabled} taskId={currentTaskId} />
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
      <FooterDiv parent="task-view" onClick={onDetailDoneClicked} />
    </div>
  );
};

export default TaskView;
