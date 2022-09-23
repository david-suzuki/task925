import React, { Fragment, useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { PlusIconButton, XIconButton } from "./IconButton";
import { getFormObj, server_domain } from "../services/constants";
import { post } from "../services/axios";
import { setError } from "../features/workspace/workspaceSlice";
import LoadingTags from "./LoadingTags";

const Tags = (props) => {
  const { disabled, template, workspaceId, projectId } = props;
  const dispatch = useDispatch();
  const templates = useSelector((state) => state.appsetting.tag_templates);

  // parsing tags object into the format for tags element
  const parseTagTemplates = (tagsObj) => {
    let tag_list = [];
    for (const [key, value] of Object.entries(tagsObj)) {
      const taglist = value.split(";");
      taglist.pop();
      const ct = {
        id: null,
        name: key,
        taglist: taglist,
        visible_to: "",
        editors: "",
      };
      tag_list.push(ct);
    }
    return tag_list;
  };

  const visibleTo = useSelector((state) => state.appsetting.tag_visible_to);
  const editors = useSelector((state) => state.appsetting.tag_editors);

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

  const [categoryTags, setCategoryTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetching the initial tags, after parent has id
    const setInitCategoryTagsAsync = async () => {
      let formData = getFormObj();
      formData.append("api_method", "get_tags");
      formData.append(
        "workspace_id",
        workspaceId === undefined ? "" : workspaceId
      );
      formData.append("project_id", projectId === undefined ? "" : projectId);

      try {
        setLoading(true);
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const ct_list = response.data.list;
          let initCategoryTags = [
            {
              id: null,
              name: "",
              taglist: [""],
              visible_to: "",
              editors: "",
            },
          ];
          if (ct_list.length > 0) {
            initCategoryTags = ct_list.map((ct) => {
              let taglist = ct.taglistISsmallplaintextbox.split(";");
              taglist.pop();
              return {
                id: ct._id,
                name: ct.name,
                taglist: taglist,
                visible_to: ct.visible_to,
                editors: ct.editors,
              };
            });
          }
          setCategoryTags(initCategoryTags);
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

    // Making the initial tags, when user select 'apply template'
    const setInitCategoryTagsTemplate = (template_name) => {
      const currentTemplate = templates.find((t) => t.name === template_name);
      const template_tags = currentTemplate.tags;
      setCategoryTags(parseTagTemplates(template_tags));
    };

    if (
      (projectId === undefined && workspaceId !== null) ||
      (workspaceId === undefined && projectId !== null)
    ) {
      if (template === "No template") {
        setInitCategoryTagsAsync();
      } else if (template !== "No template") {
        setInitCategoryTagsTemplate(template);
      }
    } else {
      const initCategoryTags = [
        {
          id: null,
          name: "",
          taglist: [""],
          visible_to: "",
          editors: "",
        },
      ];
      setCategoryTags(initCategoryTags);
    }
  }, [template, workspaceId, projectId, templates, dispatch]);

  const onNewCategoryClick = () => {
    const newData = {
      id: null,
      name: "",
      taglist: [""],
      visible_to: "",
      editors: "",
    };
    const newCategoryTags = [...categoryTags, newData];
    setCategoryTags(newCategoryTags);
  };

  const onDeleteCategoryClick = async (category_index) => {
    const targetCategoryTag = categoryTags.find(
      (ct, i) => i === category_index
    );
    const targetId = targetCategoryTag.id;
    if (targetId !== null) {
      let formData = getFormObj();
      formData.append("api_method", "delete_tag");
      formData.append("tag_id", targetId);

      try {
        const response = await post(server_domain, formData);
        if (response.data.success === 1) {
          const newCategoryTags = categoryTags.filter(
            (ct, i) => i !== category_index
          );
          setCategoryTags(newCategoryTags);
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
            message: "",
          })
        );
      }
    }
  };

  const onCategoryNameChange = (e, index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === index) {
        return Object.assign({}, ct, { name: e.target.value });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onVisibleToChanged = (e, index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === index) {
        return Object.assign({}, ct, { visible_to: e.target.value });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onEditorsChanged = (e, index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === index) {
        return Object.assign({}, ct, { editors: e.target.value });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onNewTagClick = (category_index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === category_index) {
        let newTags = [...ct.taglist, ""];
        return Object.assign({}, ct, { taglist: newTags });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onTagNameChange = (e, tag_index, category_index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === category_index) {
        let tags = ct.taglist;
        const newTags = tags.map((tag, j) => {
          if (j === tag_index) {
            // return Object.assign({}, tag, { tag_name: e.target.value })
            return e.target.value;
          } else {
            return tag;
          }
        });
        return Object.assign({}, ct, { taglist: newTags });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onDeleteTagClick = (tag_index, category_index) => {
    const newCategoryTags = categoryTags.map((ct, i) => {
      if (i === category_index) {
        let tags = ct.taglist;
        const newTags = tags.filter((tag, j) => j !== tag_index);
        return Object.assign({}, ct, { taglist: newTags });
      }
      return ct;
    });
    setCategoryTags(newCategoryTags);
  };

  const onBlur = async (category_index) => {
    const categoryTag = categoryTags.find((ct, i) => i === category_index);

    if (
      !categoryTag.name ||
      !categoryTag.visible_to ||
      !categoryTag.editors ||
      !categoryTag.taglist.join(";")
    )
      return;

    let formData = getFormObj();
    if (categoryTag.id === null) {
      formData.append("api_method", "add_tag");
    } else {
      formData.append("api_method", "edit_tag");
      formData.append("tag_id", categoryTag.id);
    }
    formData.append("name", categoryTag.name);
    formData.append("taglist", categoryTag.taglist.join(";") + ";");
    formData.append("visible_to", categoryTag.visible_to);
    formData.append("editors", categoryTag.editors);
    formData.append(
      "workspace_id",
      workspaceId === undefined ? "" : workspaceId
    );
    formData.append("project_id", projectId === undefined ? "" : projectId);

    try {
      const response = await post(server_domain, formData);

      if (response.data.success === 1) {
        if (categoryTag.id === null) {
          const newCategoryTags = categoryTags.map((ct, i) => {
            if (i === category_index) {
              return Object.assign({}, ct, { id: response.data.new_tag_id });
            }
            return ct;
          });
          setCategoryTags(newCategoryTags);
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
          message: "",
        })
      );
    }
  };

  return (
    <Fragment>
      {loading ? (
        <LoadingTags />
      ) : (
        <div>
          <Row>
            <Col md={{ offset: 1, span: 10 }}>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label style={{ width: "40%" }}>Category</Form.Label>
                <Form.Label style={{ width: "20%" }}>Visible to</Form.Label>
                <Form.Label style={{ width: "23%" }}>Editor</Form.Label>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={1}>
              <PlusIconButton
                onClick={onNewCategoryClick}
                disabled={disabled}
              />
            </Col>
            <Col md={11}>
              {categoryTags.map((categoryTag, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-center mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Tag category"
                      disabled={disabled}
                      value={categoryTag.name}
                      onChange={(e) => onCategoryNameChange(e, i)}
                      onBlur={() => onBlur(i)}
                    />
                    <Form.Select
                      className="w-50 mx-2"
                      disabled={disabled}
                      value={categoryTag.visible_to}
                      onChange={(e) => onVisibleToChanged(e, i)}
                      onBlur={() => onBlur(i)}
                    >
                      <option value="" disabled hidden>
                        Visible to:
                      </option>
                      {visibleToOptions}
                    </Form.Select>
                    <Form.Select
                      className="w-50 me-2"
                      value={categoryTag.editors}
                      onChange={(e) => onEditorsChanged(e, i)}
                      disabled={disabled}
                      onBlur={() => onBlur(i)}
                    >
                      <option value="" disabled hidden>
                        Editors:
                      </option>
                      {editorsOptions}
                    </Form.Select>
                    <XIconButton
                      onClick={() => onDeleteCategoryClick(i)}
                      disabled={disabled}
                    />
                  </div>
                  <Row>
                    <Col md={{ span: 1, offset: 2 }}>
                      <PlusIconButton
                        onClick={() => onNewTagClick(i)}
                        disabled={disabled}
                      />
                    </Col>
                    <Col md={8}>
                      {categoryTag.taglist.map((tag, j) => (
                        <div
                          className="mb-2 w-75 d-flex justify-content-start"
                          key={j}
                        >
                          <Form.Control
                            style={{ marginLeft: "7px" }}
                            className="me-2"
                            type="text"
                            placeholder="Tag Name"
                            value={tag}
                            disabled={disabled}
                            onChange={(e) => onTagNameChange(e, j, i)}
                            onBlur={() => onBlur(i)}
                          />
                          <XIconButton
                            onClick={() => onDeleteTagClick(j, i)}
                            disabled={disabled}
                          />
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              ))}
            </Col>
          </Row>
        </div>
      )}
    </Fragment>
  );
};

export default Tags;
