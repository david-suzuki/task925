import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form } from "react-bootstrap";
import { getFormObj, server_domain } from "../../services/constants";
import { post } from "../../services/axios";
import { setError } from "../workspace/workspaceSlice";
import Multiselect from 'multiselect-react-dropdown';

const Tag = (props) => {
    const { disabled, taskId, projectId, savedTags } = props
    const dispatch = useDispatch()

    const [tags, setTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [loading, setLoading] = useState(false)

    const onSelected = async (list, item) => {
        
        let formData = getFormObj();
        formData.append('api_method', 'add_task_tag_link')
        formData.append('tag_id', item._id)
        formData.append('tag_name', item.tag)
        formData.append('task_id', taskId)

        try {
            setLoading(true)
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                const newSelectedValues = list.map(l=>{
                    if (l.tag === item.tag)
                        return Object.assign({}, l, {tag_id: response.data.new_task_tag_link_id})
                    return l
                })
                setSelectedTags(newSelectedValues)
            } else {
                dispatch(setError({
                    isShow: true,
                    title: "Error",
                    message: response.data.message
                }))
            }
            setLoading(false)  
        } catch(err) {
            dispatch(setError({
                isShow: true,
                title: "Error",
                message: err.toString()
            }))
        }
    }

    const onRemoved = async (list, item) => {
        let formData = getFormObj();
        formData.append('api_method', 'delete_task_tag_link')
        formData.append('task_tag_link_id', item.tag_id)

        try {
            setLoading(true)
            const response = await post(server_domain, formData)
            
            if (response.data.success !== 1) {
                dispatch(setError({
                    isShow: true,
                    title: "Error",
                    message: response.data.message
                }))
            }
            setLoading(false)    
        } catch(err) {
            dispatch(setError({
                isShow: true,
                title: "Error",
                message: err.toString()
            }))
        }
    }

    useEffect(() => {
        let unmount = false
        const setTagsAsnyc = async() => {
            let formData = getFormObj()
            formData.append('api_method', 'get_tags')
            formData.append('project_id', projectId)
            
            try {
                const response = await post(server_domain, formData)
                if (unmount) return;
                if (response.data.success === 1) {
                    const categorytags = response.data.list;
                    const tempTags = []
                    const tempSelectedTags = []
                    for (let ct of categorytags) {
                        const tag_list = ct.taglistISsmallplaintextbox.split(";")
                        tag_list.pop()
                        for (let tag of tag_list) {
                            const tagObj = { _id: ct._id, name: ct.name, tag: tag, tag_id: null } 
                            tempTags.push(tagObj)
                            for (let savedTag of savedTags) 
                                if (savedTag.tag_name === tag)
                                    tempSelectedTags.push({...tagObj, tag_id:savedTag.task_tag_link_id})
                        }
                    }
                    setTags(tempTags)
                    setSelectedTags(tempSelectedTags)
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
            setTagsAsnyc()

        return () => {
            unmount = true;
        }

    }, [projectId, savedTags, dispatch])

    return (
        <Fragment>
        {
            disabled ? 
            <Form.Control 
                type="text" 
                placeholder="Tag"
                disabled={true}
            />
            :
            <Multiselect
                displayValue="tag"
                groupBy="name"
                showCheckbox
                placeholder="Tag"
                disable={loading}
                options={tags}
                selectedValues={selectedTags}
                style={{
                    option: { 
                        height: '30px',
                        paddingTop: '2px'
                    },
                    optionContainer: {
                        opacity: 1,
                        background: 'white'
                    }
                }}
                onSelect={onSelected}
                onRemove={onRemoved}
            />
        }
        </Fragment>
    )
}

export default Tag