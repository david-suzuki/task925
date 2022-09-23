import React, { Fragment, useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";
import DatePicker from "../../components/DatePicker";
import DateTimePicker from "../../components/DateTimePicker";

const Field = (props) => {
    const { taskId, projectId, disabled, savedFields } = props
    const dispatch = useDispatch()

    const [taskFieldLinks, setTaskFieldLinks] = useState([])

    useEffect(()=>{
        let unmount = false
        const setFieldLinksAsync = async() => {
            let formData = getFormObj()
            formData.append('api_method', 'get_fields')
            formData.append('project_id', projectId)
    
            try {
                const response = await post(server_domain, formData)
                if (unmount) return;
                if (response.data.success === 1) {
                    const fieldList = response.data.list
                    let fieldLinks = []
                    for (let field of fieldList) {
                        let fieldLink = {
                            task_field_link_id: null,
                            field_id: field._id,
                            field_name: field.name,
                            field_type: field.type,
                            field_value: ""
                        }
                        for (let sf of savedFields) {
                            if (field._id === sf.field_id) {
                                fieldLink.field_value = sf.field_name
                                fieldLink.task_field_link_id = sf.task_field_link_id
                                break                             
                            }
                        }
                        fieldLinks.push(fieldLink)
                    }
                    setTaskFieldLinks(fieldLinks)
                } else if (response.data.error) {
                    dispatch(setError({
                        isShow: true,
                        title: "Error",
                        message: response.data.message
                    }))
                }
            } catch (err) {
                dispatch(setError({
                    isShow: true,
                    title: "Error",
                    message: err.toString()
                }))
            }
        }

        if (projectId !== null) 
            setFieldLinksAsync()

        return () => {
            unmount = true;
        }

    }, [projectId, savedFields, dispatch])

    const onFieldLinkChanged = (e, link) => {

        const value = e.target.value
        const newLinks = taskFieldLinks.map(fieldlink=>(
            fieldlink.field_id === link.field_id ? {...fieldlink, field_value: value} : fieldlink
        ))
        
        setTaskFieldLinks(newLinks)
    }

    const onDateLinkChanged = (value, link) => {

        const newLinks = taskFieldLinks.map(fieldlink=>(
            fieldlink.field_id === link.field_id ? {...fieldlink, field_value: value} : fieldlink
        ))
        
        setTaskFieldLinks(newLinks)
    }

    const onCheckboxLinkChanged = async (e, link) => {
        const checkVal = e.target.checked        

        let formData = getFormObj();
        formData.append('field_id', link.field_id)
        formData.append('task_id', taskId)
        const fieldValue = checkVal ? "1" : "0"
        formData.append('field_name', fieldValue)

        if (link.task_field_link_id === null) {
            formData.append('api_method', 'add_task_field_link')
        } else {
            formData.append('api_method', 'edit_task_field_link')
            formData.append('task_field_link_id', link.task_field_link_id)
        }
        try {
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                let newLinks = null
                if (link.task_field_link_id === null) {
                    const newLinkId = response.data.new_task_field_link_id;
                    newLinks = taskFieldLinks.map(fieldlink=>(
                        fieldlink.field_id === link.field_id ? {...fieldlink, field_value: fieldValue, task_field_link_id: newLinkId} : fieldlink
                    ))
                } else {
                    newLinks = taskFieldLinks.map(fieldlink=>(
                        fieldlink.task_field_link_id === link.task_field_link_id ? {...fieldlink, field_value: fieldValue} : fieldlink
                    ))
                }
                
                setTaskFieldLinks(newLinks)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const onFieldLinkBlured = async(link) => {
        const targetLink = taskFieldLinks.find(fieldLink=>fieldLink.field_id === link.field_id)
        let formData = getFormObj();
        formData.append('field_id', targetLink.field_id)
        formData.append('task_id', taskId)
        formData.append('field_name', targetLink.field_value)

        if (link.task_field_link_id === null) {
            formData.append('api_method', 'add_task_field_link')
        } else {
            formData.append('api_method', 'edit_task_field_link')
            formData.append('task_field_link_id', link.task_field_link_id)
        }

        try {
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                if (link.task_field_link_id === null) {
                    const newLinkId = response.data.new_task_field_link_id;
                    const newLinks = taskFieldLinks.map(fieldlink=>(
                        fieldlink.field_id === link.field_id ? {...fieldlink, task_field_link_id: newLinkId} : fieldlink
                    ))
                    setTaskFieldLinks(newLinks)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <Row>
        {   
            taskFieldLinks.map((link, i) => 
                <Fragment key={i}>
                    {
                        link.field_type === 'text' &&
                        <Col xs={12} md={6} className="d-flex justify-content-between mb-1">
                            <label className="col-md-3 col-form-label">{link.field_name}</label>
                            <div className="col-md-9">
                                <Form.Control
                                    disabled={disabled} 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Text"
                                    value={link.field_value}
                                    onChange={(e)=>onFieldLinkChanged(e, link)}
                                    onBlur={()=>onFieldLinkBlured(link)}
                                />
                            </div>
                        </Col>
                    }
                    {
                        link.field_type === 'number' &&
                        <Col xs={12} md={6} className="d-flex justify-content-between mb-1">
                            <label className="col-md-3 col-form-label">{link.field_name}</label>
                            <div className="col-md-9">
                                <Form.Control
                                    disabled={disabled} 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Number"
                                    value={link.field_value}
                                    onChange={(e)=>onFieldLinkChanged(e, link)}
                                    onBlur={()=>onFieldLinkBlured(link)}
                                />
                            </div>
                        </Col>
                    }
                    {
                        link.field_type === 'date' &&
                        <Col xs={12} md={6} className="d-flex justify-content-between mb-1">
                            <label className="col-md-3 col-form-label">{link.field_name}</label>
                            <div className="col-md-9">
                                <DatePicker
                                    disabled={disabled}
                                    value={link.field_value}
                                    onChange={(value)=>onDateLinkChanged(value, link)}
                                    placeholder="Date"
                                    onBlured={()=>onFieldLinkBlured(link)}
                                />          
                            </div>
                        </Col>
                    }
                    {
                        link.field_type === 'date/time' &&
                        <Col xs={12} md={6} className="d-flex justify-content-between mb-1">
                            <label className="col-md-3 col-form-label">{link.field_name}</label>
                            <div className="col-md-9">
                                <DateTimePicker 
                                    disabled={disabled}
                                    value={link.field_value}
                                    onChange={(value)=>onDateLinkChanged(value, link)}
                                    placeholder="Date Time"
                                    onBlured={()=>onFieldLinkBlured(link)}
                                />
                            </div>
                        </Col>
                    }
                    {
                        link.field_type === 'yes/no' &&
                        <Col xs={12} md={6} className="d-flex justify-content-between align-items-center mb-1">
                            <label className="col-md-3 col-form-label">{link.field_name}</label>
                            <div className="col-md-9">
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        disabled={disabled}
                                        checked={link.field_value==="0" ? false : true}
                                        onChange={(e)=>onCheckboxLinkChanged(e, link)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </Col>
                    }
                </Fragment>
            )
        }
        </Row>
    )
}

export default Field