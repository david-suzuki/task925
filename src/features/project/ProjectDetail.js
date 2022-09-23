import React, { useState, useEffect, Fragment } from "react";
import { Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import compareAsc from "date-fns/compareAsc";
import Tags from "../../components/Tags";
import Fields from "../../components/Fields";
import Participants from "../../components/Participants";
import DatePicker from "../../components/DatePicker";
import DocumentsLinks from "../../components/DocumentsLinks";
import Timeline from "../../components/Timeline";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import {
  setError,
  fetchWorkspaces,
  setDisplayProject,
  setDisplayWorkspace,
} from "../workspace/workspaceSlice";
import {
  init,
  setIsAlerts,
  setIsMessages,
  setAppSettingLoad,
} from "../../layouts/appsettingSlice";
import FooterDiv from "../../components/FooterDiv";
import { getAppSettingData } from "../../services/globals";
import LoadingTimeline from "../../components/LoadingTimeline";
import "../../components/Loading.css";

const ProjectDetail = (props) => {
  const { onClose, id, workspaceId } = props;
  const dispatch = useDispatch();

  const title = id === null ? "New Project" : "Edit Project";

  const tag_templates = useSelector((state) => state.appsetting.tag_templates);
  const tagTemplates = [
    {
      name: "No template",
      tags: null,
    },
  ].concat(tag_templates);
  let templatesOptions = tagTemplates.map((template, i) => (
    <option key={i} value={template.name}>
      {template.name}
    </option>
  ));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [selectedTemplateName, setSelectedTemplateName] =
    useState("No template");
  const [currentProjectId, setCurrentProjectId] = useState(id);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setProjectNameAsync = async (id) => {
      let formData = getFormObj();
      formData.append("api_method", "get_project");
      formData.append("project_id", id);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const project = response.data.project;
          setName(project.name);
          setTimelines(project.timeline);
          setDescription(
            project.detailsISsmallplaintextbox === null
              ? ""
              : project.detailsISsmallplaintextbox
          );
          setDateFrom(
            project.date_from === null ? "" : project.date_from.split(" ")[0]
          );
          setDateTo(
            project.date_to === null ? "" : project.date_to.split(" ")[0]
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
      setProjectNameAsync(id);
    }

    setCurrentProjectId(id);
  }, [id, dispatch]);

  const onDetailDoneClicked = async () => {
    onClose(false);
    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(currentProjectId, workspaceId);
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
  const onNameChanged = (e) => setName(e.target.value);
  const onTemplateNameChanged = (e) => setSelectedTemplateName(e.target.value);
  const onDescriptionChanged = (e) => setDescription(e.target.value);

  const convertDateFromStr = (dateStr) => {
    const dates = dateStr.split("-");
    const year = parseInt(dates[0]);
    const month = parseInt(dates[1]) - 1;
    const day = parseInt(dates[2]);

    return new Date(year, month, day);
  };

  const onDateFromChanged = (value) => {
    if (dateTo) {
      const compareResult = compareAsc(
        convertDateFromStr(value),
        convertDateFromStr(dateTo)
      );
      if (compareResult > 0) {
        alert("DateFrom field should be before DateTo field.");
        return;
      }
    }
    setDateFrom(value);
  };

  const onDateToChanged = (value) => {
    if (dateFrom) {
      const compareResult = compareAsc(
        convertDateFromStr(dateFrom),
        convertDateFromStr(value)
      );
      if (compareResult > 0) {
        alert("DateTo field should be after DateFrom field.");
        return;
      }
    }
    setDateTo(value);
  };

  const onBlured = async () => {
    if (name === "") return;

    let formData = getFormObj();
    if (currentProjectId === null) {
      formData.append("api_method", "add_project");
      formData.append("workspace_id", workspaceId);
    } else {
      formData.append("api_method", "edit_project");
      formData.append("project_id", currentProjectId);
    }
    formData.append("name", name);
    formData.append("detailsISsmallplaintextbox", description);
    formData.append("date_from", dateFrom);
    formData.append("date_to", dateTo);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (currentProjectId === null)
          setCurrentProjectId(response.data.new_project_id);
        setDisabled(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

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
            <Form.Group className="mb-2" controlId="projectName">
              {loading ? (
                <div className="animated-background mx-2"></div>
              ) : (
                <Fragment>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Project name"
                    value={name}
                    onChange={onNameChanged}
                    onBlur={onBlured}
                  />
                </Fragment>
              )}
            </Form.Group>
            <Form.Group className="mb-2" controlId="projectDescription">
              {loading ? (
                <div className="my-3 mx-2">
                  <div className="animated-background mb-1"></div>
                  <div className="animated-background mb-1"></div>
                  <div className="animated-background w-50 mb-2"></div>
                </div>
              ) : (
                <Fragment>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Project description"
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={onDescriptionChanged}
                    onBlur={onBlured}
                  />
                </Fragment>
              )}
            </Form.Group>
            <Form.Group className="mb-4 d-flex" controlId="projectDateFrom">
              {loading ? (
                <Fragment>
                  <div className="animated-background mb-1 w-50 mx-2"></div>
                  <div className="animated-background mb-1 w-50 mx-2"></div>
                </Fragment>
              ) : (
                <Fragment>
                  <div className="w-50">
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      value={dateFrom}
                      onChange={onDateFromChanged}
                      placeholder="Date From"
                      onBlured={onBlured}
                    />
                  </div>
                  <div className="w-50 ms-3">
                    <Form.Label>Date To</Form.Label>
                    <DatePicker
                      value={dateTo}
                      onChange={onDateToChanged}
                      placeholder="Date To"
                      onBlured={onBlured}
                    />
                  </div>
                </Fragment>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectTags">
              <div className="d-flex justify-content-between mb-2">
                <Form.Label className="fs-5">Tags</Form.Label>
                <Form.Select
                  className="w-50"
                  disabled={disabled}
                  value={selectedTemplateName}
                  onChange={onTemplateNameChanged}
                >
                  <option value="No template" disabled hidden>
                    Apply template
                  </option>
                  {templatesOptions}
                </Form.Select>
              </div>
              <Tags
                disabled={disabled}
                template={selectedTemplateName}
                projectId={currentProjectId}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectFields">
              <Form.Label className="fs-5">Fields</Form.Label>
              <Fields disabled={disabled} projectId={currentProjectId} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="projectDocuments">
              <Form.Label className="fs-5">Documents & Links</Form.Label>
              <DocumentsLinks
                disabled={disabled}
                projectId={currentProjectId}
              />
            </Form.Group>
          </div>
          <div
            style={{ width: "1%", backgroundColor: "gray", opacity: 0.7 }}
          ></div>
          <div className="px-4 pt-5 bg-white rounded" style={{ width: "31%" }}>
            <Form.Group className="mb-3" controlId="projectParticipants">
              <Form.Label className="fs-5">Participants</Form.Label>
              <Participants disabled={disabled} projectId={currentProjectId} />
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
      <FooterDiv parent="project" onClick={onDetailDoneClicked} />
    </div>
  );
};

export default ProjectDetail;
