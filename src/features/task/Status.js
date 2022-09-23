import React, { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";

const Status = (props) => {
  const { taskId, loggerId, participants, addedDate, closedDate } = props;

  const workspaces = useSelector((state) => state.workspaces.workspaces);
  let workspaceName = "";
  let projectName = "";

  for (let workspace of workspaces) {
    const projects = workspace.projects;
    for (let project of projects) {
      const tasks = project.tasks;
      for (let task of tasks) {
        if (task._id === taskId) {
          workspaceName = workspace.name;
          projectName = project.name;
          break;
        }
      }
    }
  }

  const [loggers, setLoggers] = useState([]);

  useEffect(() => {
    if (participants.length > 0) {
      setLoggers(participants);
    }
  }, [participants]);

  return (
    <Fragment>
      <div className="d-flex mb-2">
        <Form.Group className="me-3" style={{ width: "50%" }}>
          <Form.Label>Workspace</Form.Label>
          <Form.Control
            type="text"
            value={workspaceName}
            readOnly
            placeholder="Workspace"
          />
        </Form.Group>
        <Form.Group style={{ width: "50%" }}>
          <Form.Label>Project</Form.Label>
          <Form.Control
            type="text"
            value={projectName}
            readOnly
            placeholder="Project"
          />
        </Form.Group>
      </div>
      <div className="d-flex mb-2">
        <Form.Group className="w-50 me-3">
          <Form.Label>Logger/Author</Form.Label>
          <Form.Select value={loggerId} disabled>
            <option value="0" hidden>
              Logger/Author
            </option>
            {loggers.map((logger) => (
              <option key={logger._id} value={logger._id}>
                {logger.email}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="w-50">
          <Form.Label>Logger/Author</Form.Label>
          <Form.Select disabled>
            <option value="" hidden>
              Viewers
            </option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </Form.Select>
        </Form.Group>
      </div>
      <div className="d-flex mb-2">
        <Form.Group className="w-50 me-3">
          <Form.Label>Date added</Form.Label>
          <Form.Control
            type="text"
            value={addedDate}
            readOnly
            placeholder="Date added"
          />
        </Form.Group>
        <Form.Group className="w-50">
          <Form.Label>Date closed</Form.Label>
          <Form.Control
            type="text"
            value={closedDate}
            readOnly
            placeholder="Date closed"
          />
        </Form.Group>
      </div>
    </Fragment>
  );
};

export default Status;
