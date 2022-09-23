import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Col, Row } from "react-bootstrap";
import { PaperclipIconButton } from "../../components/IconButton";
import { XIconButton, SendIconButton } from "../../components/IconButton";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";

const Message = (props) => {
  const { disabled, taskId } = props;
  const visibleTo = useSelector((state) => state.appsetting.message_visible_to);
  const recipients = useSelector(
    (state) => state.appsetting.message_recipients
  );

  const dispatch = useDispatch();

  const [content, setContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [visible, setVisible] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const onNewFileClicked = () => {
    if (attachedFiles.length < 3) setAttachedFiles([...attachedFiles, ""]);
  };

  const visibleToOptions = visibleTo.map((visible, i) => (
    <option key={i} value={visible}>
      {visible}
    </option>
  ));

  const recipientsOptions = recipients.map((recipient, i) => (
    <option key={i} value={recipient}>
      {recipient}
    </option>
  ));

  const onRecipientChanged = (e) => setRecipient(e.target.value);
  const onVisibleChanged = (e) => setVisible(e.target.value);

  const onDeleteAttachFileClick = (index) => {
    setAttachedFiles(attachedFiles.filter((attach, i) => i !== index));
  };

  const onAttachFileChanged = (e) => {
    const inputName = e.target.name;
    const attachIndex = parseInt(inputName);

    const file = e.target.files[0];
    if (file === undefined) {
      setAttachedFiles(
        attachedFiles.map((attach, i) => {
          if (i === attachIndex) return "";
          return attach;
        })
      );
      return;
    }

    // encode the file using the FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
      // logs data:<type>;base64,wL2dvYWwgbW9yZ...
      setAttachedFiles(
        attachedFiles.map((attach, i) => {
          if (i === attachIndex) return reader.result;
          return attach;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const onSendMessageClicked = async () => {
    let formData = getFormObj();
    formData.append("api_method", "add_task_message");
    formData.append("task_id", taskId);
    formData.append("visible_to", visible);
    formData.append("send_email_to", recipient);
    formData.append("messageISsmallplaintextbox", content);
    for (let i = 0; i < attachedFiles.length; i++) {
      if (attachedFiles[i] !== "") {
        const fieldkey = "attachment0" + (i + 1) + "ISfile";
        formData.append(fieldkey, attachedFiles[i]);
      }
    }

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        setAttachedFiles([]);
        setContent("");
        setVisible("");
        setRecipient("");
        getMessagesAsync();
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

  const getMessagesAsync = async () => {
    let formData = getFormObj();
    formData.append("api_method", "get_task_messages");
    formData.append("task_id", taskId);

    try {
      setLoading(true);
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        setMessages(response.data.list);
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

  useEffect(() => {
    if (taskId) getMessagesAsync();
  }, []);

  return (
    <Fragment>
      <Form.Control
        type="text"
        placeholder="Note / messages"
        as="textarea"
        rows={5}
        disabled={disabled}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Row className="mt-2">
        <Col md={1}>
          <PaperclipIconButton onClick={onNewFileClicked} disabled={disabled} />
        </Col>
        <Col md={11} style={{ paddingLeft: 25 }}>
          {attachedFiles.map((attached, i) => (
            <div className="d-flex mb-2" key={i}>
              <Form.Control
                type="file"
                name={i}
                className="me-1"
                onChange={onAttachFileChanged}
              />
              <XIconButton onClick={() => onDeleteAttachFileClick(i)} />
            </div>
          ))}
          <div className="d-flex justify-content-center">
            <Form.Select
              className="w-50"
              value={recipient}
              onChange={onRecipientChanged}
              disabled={disabled}
            >
              <option value="" hidden>
                Send to...
              </option>
              {recipientsOptions}
            </Form.Select>
            <Form.Select
              className="w-50 mx-1"
              value={visible}
              onChange={onVisibleChanged}
              disabled={disabled}
            >
              <option value="" hidden>
                Visible to...
              </option>
              {visibleToOptions}
            </Form.Select>
            <SendIconButton
              disabled={content === "" || visible === "" || recipient === ""}
              onClick={onSendMessageClicked}
            />
          </div>
        </Col>
      </Row>
      <div className="mt-3">
        {loading ? (
          <div>
            <div className="animated-background mx-2 my-1 w-75"></div>
            <div className="animated-background mx-2 my-1"></div>
          </div>
        ) : (
          messages.map((message, i) => (
            <div key={i}>
              <span className="fw-bold">
                23 Jan 2022 - via {message.name} ({message.from_email})
              </span>
              <br />
              {message.messageISsmallplaintextbox}
              <div className="d-flex justify-content-between align-items-center">
                {message.attachment01ISfile && (
                  <a
                    href={
                      server_domain.substring(0, server_domain.length - 4) +
                      message.attachment01ISfile
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Attachment 1
                  </a>
                )}
                {message.attachment02ISfile && (
                  <a
                    href={
                      server_domain.substring(0, server_domain.length - 4) +
                      message.attachment02ISfile
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Attachment 2
                  </a>
                )}
                {message.attachment03ISfile && (
                  <a
                    href={
                      server_domain.substring(0, server_domain.length - 4) +
                      message.attachment03ISfile
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Attachment 3
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Fragment>
  );
};

export default Message;
