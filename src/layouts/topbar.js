import React, { Fragment, useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Navbar,
  Container,
  Nav,
  Image,
  Dropdown,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  GearFill,
  ExclamationTriangleFill,
  EnvelopeFill,
  Circle,
} from "react-bootstrap-icons";
import { getFormObj, server_domain } from "../services/constants";
import { post } from "../services/axios";
import { logout } from "../features/auth/authSlice";
import AlertModal from "../components/AlertModal";
import { setError } from "../features/workspace/workspaceSlice";
import SettingsModal from "./SettingsModal";
import {
  setIsAlerts,
  setIsMessages,
  setAppSettingLoad,
} from "./appsettingSlice";
import { getAppSettingData } from "../services/globals";
import {
  fetchWorkspaces,
  setDisplayWorkspace,
  setDisplayProject,
} from "../features/workspace/workspaceSlice";
import { init } from "./appsettingSlice";
import "../App.css";
import { HambugurMenuContext } from "../services/contexts";

const Topbar = (props) => {
  const { onShowDetail } = props;
  const user = useSelector((state) => state.auth.user);
  const error = useSelector((state) => state.workspaces.error);
  const isMessages = useSelector((state) => state.appsetting.isMessages);
  const isAlerts = useSelector((state) => state.appsetting.isAlerts);
  const appSettingLoad = useSelector(
    (state) => state.appsetting.app_setting_load
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onItemSelected = useContext(HambugurMenuContext);

  const [alerts, setAlerts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showSetting, setShowSetting] = useState(false);

  const onLogoutClick = () => {
    dispatch(
      logout({
        isAuthenticated: false,
        isInitialized: false,
        user: null,
      })
    );

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const onModalClosed = () => {
    dispatch(
      setError({
        isShow: false,
        title: "",
        message: "",
      })
    );
  };

  const onAlertItemClicked = (itemId) => {
    const alertItem = alerts.find((alert) => alert._id === itemId);
    const taskId = alertItem.task_id;
    const projectId = alertItem.project_id;
    if (!taskId && !projectId) return;

    if (projectId) {
      if (taskId) {
        onShowDetail("task", taskId, projectId);
      } else {
        onShowDetail("project", taskId, projectId);
      }
    }
    return;
  };

  const onAlertDropdownToggled = async () => {
    if (!isAlerts) return;

    let formData = getFormObj();
    formData.append("api_method", "mark_alerts_as_seen");

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        dispatch(
          setIsAlerts({
            isAlerts: false,
          })
        );
      } else {
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

  const onMessageDropdownToggled = async () => {
    if (!isMessages) return;

    let formData = getFormObj();
    formData.append("api_method", "mark_messages_as_seen");

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        dispatch(
          setIsMessages({
            isMessages: false,
          })
        );
      } else {
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

  const handleAppSettingData = async () => {
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

  useEffect(() => {
    let unmount = false;
    const fetchAlertsAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_alerts");

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const unseenAlerts = response.data.unseen_alerts;
          const recentAlerts = response.data.last_10_seen_alerts;
          if (unmount) return;
          setAlerts([...unseenAlerts, ...recentAlerts]);
        } else {
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

    const fetchMessagesAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_messages");

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const unseenMessages = response.data.unseen_messages;
          const recentMessages = response.data.last_10_seen_messages;
          if (unmount) return;
          setMessages([...unseenMessages, ...recentMessages]);
        } else {
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

    fetchAlertsAsync();
    fetchMessagesAsync();

    return () => {
      unmount = true;
    };
  }, [dispatch]);

  return (
    <Fragment>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand
            onClick={() => handleAppSettingData()}
            style={{ cursor: "pointer" }}
          >
            <Image
              src="/imgs/mylogo.png"
              style={{ marginLeft: 50, maxHeight: 50 }}
            ></Image>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            ></Nav>
            <Button
              variant="outline-info"
              className="mx-4"
              onClick={() => onItemSelected("New Workspace")}
            >
              + New Workspace
            </Button>
            <Button
              variant="outline-primary"
              className="mx-2"
              onClick={() => setShowSetting(true)}
            >
              <GearFill />
            </Button>
            <Dropdown
              className="mx-2"
              align={{ lg: "end" }}
              onToggle={onAlertDropdownToggled}
            >
              <Dropdown.Toggle variant="outline-danger">
                <ExclamationTriangleFill />
                {isAlerts && (
                  <Circle
                    className="position-absolute translate-middle rounded-pill bg-danger"
                    style={{ top: 2, left: 40 }}
                  />
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  width: "300px",
                  height: alerts.length === 0 ? "100px" : "350px",
                  overflowY: "scroll",
                  marginTop: "10px",
                }}
              >
                {alerts.length === 0 ? (
                  <p className="text-center my-4">There is no alerts.</p>
                ) : (
                  alerts.map((alert, i) => (
                    <Fragment key={alert._id}>
                      {i !== 0 && <Dropdown.Divider />}
                      <Dropdown.Item
                        onClick={() => onAlertItemClicked(alert._id)}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "break-word",
                          }}
                        >
                          {alert.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "break-word",
                          }}
                        >
                          {alert.alertISsmallplaintextbox}
                        </div>
                      </Dropdown.Item>
                    </Fragment>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown
              className="mx-2"
              align={{ lg: "end" }}
              onToggle={onMessageDropdownToggled}
            >
              <Dropdown.Toggle variant="outline-success">
                <EnvelopeFill />
                {isMessages && (
                  <Circle
                    className="position-absolute translate-middle rounded-pill bg-danger"
                    style={{ top: 2, left: 40 }}
                  />
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  width: "300px",
                  height: messages.length === 0 ? "100px" : "350px",
                  overflowY: "scroll",
                  marginTop: "10px",
                }}
              >
                {messages.length === 0 ? (
                  <p className="text-center my-4">There is no messages.</p>
                ) : (
                  messages.map((message, i) => (
                    <Fragment>
                      {i !== 0 && <Dropdown.Divider />}
                      <Dropdown.Item>
                        <div
                          style={{
                            fontSize: "13px",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "break-word",
                          }}
                        >
                          {message.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "break-word",
                          }}
                        >
                          {message.messageISsmallplaintextbox}
                        </div>
                      </Dropdown.Item>
                    </Fragment>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown align={{ lg: "end" }} className="e-caret-hide">
              <Dropdown.Toggle variant="outline-light">
                <Image
                  rounded
                  src="/imgs/userdefault.png"
                  width={40}
                  className={appSettingLoad ? "rotate-image" : ""}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText className="fw-bold">
                  {user.email}
                </Dropdown.ItemText>
                <Dropdown.Item href="https://account2.task925.com/">
                  Your Account
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogoutClick}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <AlertModal
        isShow={error.isShow}
        title={error.title}
        message={error.message}
        onClose={onModalClosed}
      />
      <SettingsModal
        showSetting={showSetting}
        onHide={() => setShowSetting(false)}
      />
    </Fragment>
  );
};

export default Topbar;
