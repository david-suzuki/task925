import React, { useState, useEffect, Fragment } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { getFormObj, server_domain } from "../services/constants";
import { post } from "../services/axios";
import { PlusIconButton, XIconButton } from "./IconButton";
import { setError } from "../features/workspace/workspaceSlice";
import LoadingParticipants from "./LoadingParticipants";

const Participants = (props) => {
  const { disabled, workspaceId, projectId } = props;
  const dispatch = useDispatch();
  const types = useSelector((state) => state.appsetting.participant_types);
  const status = useSelector((state) => state.appsetting.participant_status);

  const initParticipants = [
    {
      id: null,
      email: "",
      type: "",
      status: "",
    },
  ];

  const [participants, setParticipants] = useState(initParticipants);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setInitAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_participants");
      formData.append(
        "workspace_id",
        workspaceId === undefined ? "" : workspaceId
      );
      formData.append("project_id", projectId === undefined ? "" : projectId);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const participant_list = response.data.list;
          let initParticipants = [
            {
              id: null,
              email: "",
              type: "",
              status: "",
            },
          ];
          if (participant_list.length > 0) {
            initParticipants = participant_list.map((participant) => {
              return {
                id: participant._id,
                email: participant.email,
                type: participant.type,
                status: participant.status,
              };
            });
          }
          setParticipants(initParticipants);
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

    if (
      (projectId === undefined && workspaceId !== null) ||
      (workspaceId === undefined && projectId !== null)
    )
      setInitAsync();
  }, [workspaceId, projectId, dispatch]);

  const onNewClicked = () => {
    setParticipants([
      ...participants,
      {
        id: null,
        email: "",
        type: "",
        status: "",
      },
    ]);
  };

  const onEmailChanged = (e, index) => {
    const newParticipants = participants.map((participant, i) => {
      if (i === index)
        return Object.assign({}, participant, { email: e.target.value });
      else return participant;
    });
    setParticipants(newParticipants);
  };

  const onDeleteClicked = async (index) => {
    const targetParticipant = participants.find(
      (participant, i) => i === index
    );
    const targetId = targetParticipant.id;
    if (targetId !== null) {
      let formData = getFormObj();
      formData.append("api_method", "delete_participant");
      formData.append("participant_id", targetId);

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const newParticipants = participants.filter(
            (particiapnt, i) => i !== index
          );
          setParticipants(newParticipants);
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
    }
  };

  const onTypeChanged = (e, index) => {
    const newParticipants = participants.map((participant, i) => {
      if (i === index)
        return Object.assign({}, participant, { type: e.target.value });
      else return participant;
    });
    setParticipants(newParticipants);
  };

  const onStatusChanged = (e, index) => {
    const newParticipants = participants.map((participant, i) => {
      if (i === index)
        return Object.assign({}, participant, { status: e.target.value });
      else return participant;
    });
    setParticipants(newParticipants);
  };

  const onBlur = async (index) => {
    const participant = participants.find((p, i) => i === index);

    if (!participant.email || !participant.type || !participant.status) return;

    let formData = getFormObj();
    if (participant.id === null) {
      formData.append("api_method", "add_participant");
    } else {
      formData.append("api_method", "edit_participant");
      formData.append("participant_id", participant.id);
    }
    formData.append("email", participant.email);
    formData.append("type", participant.type);
    formData.append("status", participant.status);
    formData.append(
      "workspace_id",
      workspaceId === undefined ? "" : workspaceId
    );
    formData.append("project_id", projectId === undefined ? "" : projectId);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (participant.id === null) {
          const newParticipants = participants.map((participant, i) => {
            if (i === index) {
              return Object.assign({}, participant, {
                id: response.data.new_participant_id,
              });
            }
            return participant;
          });
          setParticipants(newParticipants);
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

  return (
    <Fragment>
      {loading ? (
        <LoadingParticipants />
      ) : (
        <Row>
          <Col md={1}>
            <div style={{ marginTop: 33 }}>
              <PlusIconButton onClick={onNewClicked} disabled={disabled} />
            </div>
          </Col>
          <Col md={11}>
            {participants.map((participant, i) => (
              <div key={i} className="mb-4">
                <div className="d-flex">
                  <Form.Group className="mx-3" style={{ width: "100%" }}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      className="me-2"
                      type="text"
                      placeholder="Participant email"
                      disabled={disabled}
                      value={participant.email}
                      onChange={(e) => onEmailChanged(e, i)}
                      onBlur={() => onBlur(i)}
                    />
                  </Form.Group>
                  <div style={{ marginTop: 33 }}>
                    <XIconButton
                      onClick={() => onDeleteClicked(i)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="d-flex my-2" style={{ marginLeft: 8 }}>
                  <Form.Group className="ms-2" style={{ width: "50%" }}>
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      disabled={disabled}
                      value={participant.type}
                      onChange={(e) => onTypeChanged(e, i)}
                      onBlur={() => onBlur(i)}
                    >
                      <option value="" disabled hidden>
                        Type...
                      </option>
                      {types.map((type, i) => (
                        <option key={i} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="ms-2" style={{ width: "50%" }}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      disabled={disabled}
                      value={participant.status}
                      onChange={(e) => onStatusChanged(e, i)}
                      onBlur={() => onBlur(i)}
                    >
                      <option value="" disabled hidden>
                        Status...
                      </option>
                      {status.map((stat, i) => (
                        <option key={i} value={stat}>
                          {stat}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      )}
    </Fragment>
  );
};

export default Participants;
