import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import Tags from "../../components/Tags";
import Fields from "../../components/Fields";
import Participants from "../../components/Participants";
import { useSelector, useDispatch } from "react-redux";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import FooterDiv from "../../components/FooterDiv";
import { setError } from "./workspaceSlice";
import { getAppSettingData } from "../../services/globals";
import {
  fetchWorkspaces,
  setDisplayWorkspace,
  setDisplayProject,
} from "./workspaceSlice";
import {
  init,
  setIsAlerts,
  setIsMessages,
  setAppSettingLoad,
} from "../../layouts/appsettingSlice";

const WorkspaceDetail = (props) => {
  const { onClose, id } = props;
  const dispatch = useDispatch();

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
  const workspaces = useSelector((state) => state.workspaces.workspaces);

  const [name, setName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [selectedTemplateName, setSelectedTemplateName] =
    useState("No template");
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(id);

  useEffect(() => {
    setDisabled(id === null ? true : false);

    let initWorkspaceName = "";
    if (id !== null)
      initWorkspaceName = workspaces.find(
        (workspace) => workspace._id === id
      ).name;
    setName(initWorkspaceName);

    setCurrentWorkspaceId(id);
  }, [id, workspaces]);

  const title = id === null ? "New Workspace" : "Edit Workspace";

  const onDetailDoneClicked = async () => {
    onClose(false);
    dispatch(setAppSettingLoad({ app_setting_load: true }));
    const data = await getAppSettingData(null, currentWorkspaceId);
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

  const onNameBlured = async () => {
    if (name === "") return;

    let formData = getFormObj();
    if (currentWorkspaceId === null) {
      formData.append("api_method", "add_workspace");
    } else {
      formData.append("api_method", "edit_workspace");
      formData.append("workspace_id", currentWorkspaceId);
    }
    formData.append("name", name);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (currentWorkspaceId === null)
          setCurrentWorkspaceId(response.data.new_workspace_id);
        setDisabled(false);
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
            <Form.Group className="mb-4" controlId="workspaceName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Workspace name"
                value={name}
                onChange={onNameChanged}
                onBlur={onNameBlured}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="workspaceTags">
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
                workspaceId={currentWorkspaceId}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="workspaceTags">
              <Form.Label className="fs-5">Fields</Form.Label>
              <Fields disabled={disabled} workspaceId={currentWorkspaceId} />
            </Form.Group>
          </div>
          <div
            style={{ width: "1%", backgroundColor: "gray", opacity: 0.7 }}
          ></div>
          <div className="px-4 pt-5 bg-white rounded" style={{ width: "31%" }}>
            <Form.Group className="mb-3" controlId="workspaceParticipants">
              <Form.Label className="fs-5">Participants</Form.Label>
              <Participants
                disabled={disabled}
                workspaceId={currentWorkspaceId}
              />
            </Form.Group>
          </div>
          <div
            style={{ width: "7%", backgroundColor: "gray", opacity: 0.7 }}
            onClick={onDetailDoneClicked}
          ></div>
        </div>
      </Form>
      <FooterDiv parent="workspace" onClick={onDetailDoneClicked} />
    </div>
  );
};

export default WorkspaceDetail;
