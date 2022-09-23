import React, { useState, useEffect, Fragment } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { getFormObj, server_domain } from "../services/constants";
import { post } from "../services/axios";
import { PlusIconButton, XIconButton } from "./IconButton";
import { setError } from "../features/workspace/workspaceSlice";
import LoadingFields from "./LoadingFields";

const Fields = (props) => {
  const { disabled, workspaceId, projectId } = props;
  const dispatch = useDispatch();
  const types = useSelector((state) => state.appsetting.field_types);
  const visibleTo = useSelector((state) => state.appsetting.field_visible_to);
  const editors = useSelector((state) => state.appsetting.field_editors);

  const typesOptions = types.map((type, i) => (
    <option key={i} value={type}>
      {type}
    </option>
  ));
  const visibleToOptions = visibleTo.map((visible, i) => (
    <option key={i} value={visible}>
      {visible}
    </option>
  ));
  const editorsOptions = editors.map((editor, i) => (
    <option key={i} value={editor}>
      {editor}
    </option>
  ));

  const initFields = [
    {
      id: null,
      name: "",
      type: "",
      visible_to: "",
      editors: "",
    },
  ];

  const [fields, setFields] = useState(initFields);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setInitFieldsAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_fields");
      formData.append(
        "workspace_id",
        workspaceId === undefined ? "" : workspaceId
      );
      formData.append("project_id", projectId === undefined ? "" : projectId);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const field_list = response.data.list;
          let initFields = [
            {
              id: null,
              name: "",
              type: "",
              visible_to: "",
              editors: "",
            },
          ];
          if (field_list.length > 0) {
            initFields = field_list.map((field) => {
              return {
                id: field._id,
                name: field.name,
                type: field.type,
                visible_to: field.visible_to,
                editors: field.editors,
              };
            });
          }
          setFields(initFields);
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
      setInitFieldsAsync();
  }, [workspaceId, projectId, dispatch]);

  const onNewClicked = () => {
    setFields([
      ...fields,
      { id: null, name: "", type: "", visible_to: "", editors: "" },
    ]);
  };

  const onNameChanged = (e, index) => {
    const newFields = fields.map((field, i) => {
      if (i === index)
        return Object.assign({}, field, { name: e.target.value });
      else return field;
    });
    setFields(newFields);
  };

  const onDeleteClicked = async (index) => {
    const targetField = fields.find((field, i) => i === index);
    const targetId = targetField.id;
    if (targetId !== null) {
      let formData = getFormObj();
      formData.append("api_method", "delete_field");
      formData.append("field_id", targetId);

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const newFields = fields.filter((field, i) => i !== index);
          setFields(newFields);
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
    const newFields = fields.map((field, i) => {
      if (i === index)
        return Object.assign({}, field, { type: e.target.value });
      else return field;
    });
    setFields(newFields);
  };

  const onVisibleToChanged = (e, index) => {
    const newFields = fields.map((field, i) => {
      if (i === index)
        return Object.assign({}, field, { visible_to: e.target.value });
      else return field;
    });
    setFields(newFields);
  };

  const onEditorChanged = (e, index) => {
    const newFields = fields.map((field, i) => {
      if (i === index)
        return Object.assign({}, field, { editors: e.target.value });
      else return field;
    });
    setFields(newFields);
  };

  const onBlur = async (index) => {
    const field = fields.find((f, i) => i === index);

    if (!field.name || !field.type || !field.visible_to || !field.editors)
      return;

    let formData = getFormObj();
    if (field.id === null) {
      formData.append("api_method", "add_field");
    } else {
      formData.append("api_method", "edit_field");
      formData.append("field_id", field.id);
    }
    formData.append("name", field.name);
    formData.append("type", field.type);
    formData.append("visible_to", field.visible_to);
    formData.append("editors", field.editors);
    formData.append(
      "workspace_id",
      workspaceId === undefined ? "" : workspaceId
    );
    formData.append("project_id", projectId === undefined ? "" : projectId);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (field.id === null) {
          const newFields = fields.map((field, i) => {
            if (i === index) {
              return Object.assign({}, field, {
                id: response.data.new_field_id,
              });
            }
            return field;
          });
          setFields(newFields);
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
        <LoadingFields />
      ) : (
        <div>
          <Row>
            <Col md={{ offset: 1, span: 10 }}>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label style={{ width: "30%" }}>Field Name</Form.Label>
                <Form.Label style={{ width: "20%" }}>Type</Form.Label>
                <Form.Label style={{ width: "20%" }}>Visible To</Form.Label>
                <Form.Label style={{ width: "18%" }}>Editor</Form.Label>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={1}>
              <PlusIconButton onClick={onNewClicked} disabled={disabled} />
            </Col>
            <Col md={11}>
              {fields.map((field, i) => (
                <div
                  key={i}
                  className="d-flex mb-2 justify-content-between align-items-center"
                >
                  <Form.Control
                    className="me-2"
                    style={{ width: "34%" }}
                    type="text"
                    disabled={disabled}
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => onNameChanged(e, i)}
                    onBlur={() => onBlur(i)}
                  />
                  <Form.Select
                    className="me-2"
                    style={{ width: "22%" }}
                    value={field.type}
                    disabled={disabled}
                    onChange={(e) => onTypeChanged(e, i)}
                    onBlur={() => onBlur(i)}
                  >
                    <option value="" disabled hidden>
                      Type
                    </option>
                    {typesOptions}
                  </Form.Select>
                  <Form.Select
                    className="me-2"
                    style={{ width: "22%" }}
                    value={field.visible_to}
                    disabled={disabled}
                    onChange={(e) => onVisibleToChanged(e, i)}
                    onBlur={() => onBlur(i)}
                  >
                    <option value="" disabled hidden>
                      Visible to
                    </option>
                    {visibleToOptions}
                  </Form.Select>
                  <Form.Select
                    className="me-2"
                    style={{ width: "22%" }}
                    value={field.editors}
                    disabled={disabled}
                    onChange={(e) => onEditorChanged(e, i)}
                    onBlur={() => onBlur(i)}
                  >
                    <option value="" disabled hidden>
                      Editors
                    </option>
                    {editorsOptions}
                  </Form.Select>
                  <XIconButton
                    onClick={() => onDeleteClicked(i)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </Col>
          </Row>
        </div>
      )}
    </Fragment>
  );
};

export default Fields;
