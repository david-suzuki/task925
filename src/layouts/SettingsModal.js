import React, { useEffect, useState } from 'react';
import { Modal, Tabs, Tab, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getFormObj, server_domain } from '../services/constants';
import { post } from '../services/axios';
import { setError } from '../features/workspace/workspaceSlice';
import { getAppSettingData } from '../services/globals';

const SettingsModal = (props) => {
    const {showSetting, onHide} = props
    const dispatch = useDispatch()

    const workspaces = useSelector(state=>state.workspaces.workspaces)
    const projects = []
    for (let workspace of workspaces) {
        const projs = workspace.projects
        for (let pro of projs) {
            const obj = {
                _id: pro._id,
                name: pro.name
            }
            projects.push(obj)
        }
    }

    const project_options = projects.map(project=>
        <option key={project._id} value={project._id}>{project.name}</option>    
    )
    
    const [accountForm, setAccountForm] = useState({
        server: "",
        address: "",
        password: ""
    })
    const [filterForm, setFilterForm] = useState({
        fromEmail: "",
        subject: "",
        project: "0"
    })
    const [filterrs, setFilterrs] = useState([])
    const [projectError, setProjectError] = useState(false)

    useEffect(()=>{
        let unmount = false

        const getInitialFormData = async () => {
            const data = await getAppSettingData(null, null);
            if (data.error) {
                dispatch(setError({
                    isShow: true,
                    title: "Error",
                    message: data.message
                }))
                return
            }

            const accountData = data.app_settings.account;
            const mailServer = accountData.incoming_mail_server;
            const mailAddress = accountData.incoming_mail_address;
            const mailPassword = accountData.incoming_mail_password;
            const filterrs = accountData.filters;

            if (unmount) return;

            setAccountForm({
                server: mailServer,
                address: mailAddress,
                password: mailPassword
            })

            setFilterrs(filterrs)
        }

        getInitialFormData()

        return () => {
            unmount = true
        }
    }, [dispatch])

    const onAccountFormChanged = (e) => {
        setAccountForm({...accountForm, [e.target.name]:e.target.value})
    }

    const onFilterFormChanged = (e) => {
        if (e.target.name === "project")
            setProjectError(false)

        setFilterForm({...filterForm, [e.target.name]:e.target.value})
    }

    const onDoneClicked = async () => {
        let formData = getFormObj();
        formData.append('api_method', 'update_account_settings')
        formData.append('incoming_mail_server', accountForm.server)
        formData.append('incoming_mail_address', accountForm.address)
        formData.append('incoming_mail_password', accountForm.password)

        try {
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                onHide()
            } else {
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

    const onAddFilterClicked = async () => {
        if (filterForm.project === "0") {
            setProjectError(true)
            return
        }

        let formData = getFormObj();
        formData.append('api_method', 'add_filter_setting')
        formData.append('filter_email_address', filterForm.fromEmail)
        formData.append('filter_subject_text', filterForm.subject)
        formData.append('project_id', filterForm.project)

        try {
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                setFilterrs([
                    ...filterrs, 
                    {_id: response.data.new_filter_id, filter_email_address: filterForm.fromEmail, filter_subject_text: filterForm.subject, project_id: filterForm.project}
                ])                
            } else {
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

    const onDeleteFilterClicked = async (filterId) => {
        let formData = getFormObj();
        formData.append('api_method', 'delete_filter_setting')
        formData.append('filter_setting_id', filterId)

        try {
            const response = await post(server_domain, formData)
            if (response.data.success === 1) {
                setFilterrs(filterrs.filter(f=>f._id !== filterId))        
            } else {
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

    return (
        <Modal show={showSetting} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: '390px' }}>
                <Tabs defaultActiveKey="account">
                    <Tab eventKey="account" title="Account Settings">
                        <Form className="mt-3 ms-2" style={{ width: '60%' }}>
                            <Form.Group className="mb-3">
                                <Form.Label>Incoming Email Account Server</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Server address" 
                                    name="server"
                                    value={accountForm.server}
                                    onChange={onAccountFormChanged}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Incoming Email Account Email Address</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="Email address" 
                                    name="address"
                                    value={accountForm.address}
                                    onChange={onAccountFormChanged}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Incoming Email Account Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    placeholder="Password for email account" 
                                    name="password"
                                    value={accountForm.password}
                                    onChange={onAccountFormChanged}
                                />
                            </Form.Group>

                            <Button variant="primary" type="button" onClick={onDoneClicked}>
                                Done
                            </Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="filters" title="Filters">
                        <div className="mt-1 ms-2">
                            <Row>
                                <Col sm={{ span: 3, offset: 6 }} style={{height: '21px'}}>
                                    {
                                        projectError &&
                                        <span className='text-danger' style={{ fontSize: '12px'}}>
                                            *Project is required.
                                        </span>
                                    }
                                </Col>
                            </Row>
                            <Form>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="From Email..."
                                            name="fromEmail"
                                            value={filterForm.fromEmail}
                                            onChange={onFilterFormChanged}
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Subject contains..." 
                                            name="subject"
                                            value={filterForm.subject}
                                            onChange={onFilterFormChanged}
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Select
                                            name="project" 
                                            value={filterForm.project}
                                            onChange={onFilterFormChanged}
                                        >
                                            <option value="0" hidden>Set project</option>
                                            { project_options }
                                        </Form.Select>
                                    </Col>
                                    <Col xs="auto">
                                        <Button type="button" onClick={ onAddFilterClicked }>Add Filter</Button>
                                    </Col>
                                </Row>
                            </Form>
                            <div className="mt-4" style={{ maxHeight: '220px', overflowY: 'auto'}}>
                                <Table 
                                    bordered 
                                    hover 
                                    size="sm"
                                >
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>From Email</th>
                                            <th>Filter Subject</th>
                                            <th>Set Project</th>
                                            <th className="text-end">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filterrs.map((filterr, i) =>
                                                <tr key={filterr._id}>
                                                    <td>{i+1}</td>
                                                    <td>{filterr.filter_email_address}</td>
                                                    <td>{filterr.filter_subject_text}</td>
                                                    <td>{projects.find(project=>project._id===filterr.project_id)?.name}</td>
                                                    <th className="text-end text-primary">
                                                        <Trash 
                                                            style={{ cursor: "pointer" }}
                                                            onClick={()=>onDeleteFilterClicked(filterr._id)}
                                                        />
                                                    </th>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    )
}

export default SettingsModal