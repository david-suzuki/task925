import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Col, Row, Form, Modal } from "react-bootstrap";
import { Printer, Capslock, XCircleFill } from "react-bootstrap-icons";
import { apikey, apisecret, server_domain, token } from "../services/constants";
import { post } from "../services/axios";
import { setError } from "../features/workspace/workspaceSlice";
import LoadingDocuments from "./LoadingDocuments";

const DocumentsLinks = (props) => {
  const { projectId, taskId, disabled, noAddButton } = props;
  const dispatch = useDispatch();

  const [modalShow, setModalShow] = useState(false);
  const [docs, setDocs] = useState([]);

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);

  const [url, setUrl] = useState("");
  const [docISfile, setDocISFile] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [linkAlert, setLinkAlert] = useState(false);

  const [hoverDocId, setHoverDocId] = useState(0);

  const [formSubmitting, setFormSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    setModalShow(false);
  };

  const onTitleChanged = (e) => {
    setTitle(e.target.value);
    setTitleError(false);
  };

  const onFileChanged = (e) => {
    setLinkError(false);

    const file = e.target.files[0];
    if (file === undefined) {
      setDocISFile("");
      setLinkAlert(false);
      return;
    }

    // show alert when file and url both are set
    if (file && url) setLinkAlert(true);

    // encode the file using the FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
      // logs data:<type>;base64,wL2dvYWwgbW9yZ...
      // console.log(reader.result);
      setDocISFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onUrlChanged = (e) => {
    setLinkError(false);
    setUrl(e.target.value);

    // show alert when file and url both are set
    if (e.target.value && docISfile) setLinkAlert(true);
    else setLinkAlert(false);
  };

  const handleSubmit = async () => {
    if (title === "") {
      setTitleError(true);
      return;
    }

    if (docISfile === "" && url === "") {
      setLinkError(true);
      return;
    }

    const formData = new FormData();
    formData.append("api_method", "add_doc");
    formData.append("apikey", apikey);
    formData.append("apisecret", apisecret);
    formData.append("account_id", "ww2." + token);
    formData.append("name", title);
    formData.append("docISfile", docISfile);
    formData.append("url", url);
    formData.append("project_id", projectId === undefined ? "" : projectId);
    formData.append("task_id", taskId === undefined ? "" : taskId);

    setFormSubmitting(true);
    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        setDocs([
          ...docs,
          {
            _id: response.data.new_doc_id,
            name: title,
            docISfile: response.data.docISfile,
            url: url,
          },
        ]);
        setTitle("");
        setDocISFile("");
        setUrl("");
        setFormSubmitting(false);
        setModalShow(false);
      } else {
        setFormSubmitting(false);
        setModalShow(false);
        dispatch(
          setError({
            isShow: true,
            title: "Error",
            message: response.data.message,
          })
        );
      }
    } catch (err) {
      setFormSubmitting(false);
      dispatch(
        setError({
          isShow: true,
          title: "Error",
          message: err.toString(),
        })
      );
    }
  };

  const onDocDeleted = async (e, docId) => {
    e.stopPropagation();
    const formData = new FormData();
    formData.append("api_method", "delete_doc");
    formData.append("apikey", apikey);
    formData.append("apisecret", apisecret);
    formData.append("account_id", "ww2." + token);
    formData.append("doc_id", docId);

    try {
      const response = await post(server_domain, formData);
      if (response.data.success === 1) {
        setDocs(docs.filter((doc) => doc._id !== docId));
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

  const onDocClicked = (e, docId) => {
    e.preventDefault();
    const doc = docs.find((doc) => doc._id === docId);
    let link = "";
    if (doc.url) link = doc.url;
    else {
      const server_url = server_domain.substring(0, server_domain.length - 4);
      link = server_url + doc.docISfile;
    }

    window.open(link);
  };

  useEffect(() => {
    const getDocumentsAsync = async () => {
      const formData = new FormData();
      formData.append("api_method", "get_docs");
      formData.append("apikey", apikey);
      formData.append("apisecret", apisecret);
      formData.append("account_id", "ww2." + token);
      formData.append("project_id", projectId === undefined ? "" : projectId);
      formData.append("task_id", taskId === undefined ? "" : taskId);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          setDocs(response.data.list);
        } else {
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

    if (projectId || taskId) getDocumentsAsync();
  }, [dispatch]);

  return (
    <Fragment>
      {!noAddButton && (
        <div className="mb-2">
          {disabled || loading ? (
            <Button variant="primary" size="sm" disabled>
              <Capslock /> New document/link
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalShow(true)}
            >
              <Capslock /> New document/link
            </Button>
          )}
        </div>
      )}
      {loading ? (
        <LoadingDocuments />
      ) : (
        <Row className="mt-3">
          {docs.map((doc) => (
            <Col md={3} className="mb-2" key={doc._id}>
              <Button
                className="position-relative w-100"
                variant="success"
                size="sm"
                onClick={(e) => onDocClicked(e, doc._id)}
                onMouseEnter={() => setHoverDocId(doc._id)}
                onMouseLeave={() => setHoverDocId(0)}
              >
                <Printer style={{ marginRight: "10px" }} />
                {doc.name || "Unknown name"}
                {hoverDocId === doc._id && (
                  <XCircleFill
                    className="position-absolute text-white bg-danger rounded-circle"
                    style={{ top: "-4px", right: "-5px" }}
                    onClick={(e) => onDocDeleted(e, doc._id)}
                  />
                )}
              </Button>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={modalShow} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Document or Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Document/Link title"
              value={title}
              onChange={onTitleChanged}
            />
            {titleError && (
              <Form.Text className="ms-2 text-danger">
                Document title is required.
              </Form.Text>
            )}
          </Form.Group>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control type="file" onChange={onFileChanged} />
          </Form.Group>
          <p className="text-center"> OR </p>
          <Form.Group className="my-3">
            <Form.Control
              type="text"
              placeholder="URL"
              value={url}
              onChange={onUrlChanged}
            />
            {linkError && (
              <Form.Text className="ms-2 text-danger">
                File or URL is required.
              </Form.Text>
            )}
            {linkAlert && (
              <Form.Text className="ms-2 text-secondary">
                File and URL are set together. Your file will be ignored.
              </Form.Text>
            )}
          </Form.Group>
          <div className="d-flex justify-content-center">
            <Button
              variant="primary"
              onClick={handleSubmit}
              size="sm"
              disabled={formSubmitting ? true : false}
            >
              {formSubmitting ? "Loading..." : "Done"}
              {formSubmitting && (
                <div
                  className="spinner-border spinner-border-sm ms-2 mt-1"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default DocumentsLinks;
