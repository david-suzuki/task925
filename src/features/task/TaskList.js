import React, { Fragment, useContext } from 'react';
import { Badge, Dropdown, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import "./Task.css";
import { HambugurMenuContext } from '../../services/contexts';

const TaskList = (props) => {
    const { tasks, projectId } = props

    const onItemSelected = useContext(HambugurMenuContext);

    const getBadgeColor = (status) => {
        let badgeColor = "";
        if (status === 'Overdue')
            badgeColor = "danger"
        else if (status === 'Due shortly')
            badgeColor = "warning"
        else if (status === 'Wishlist')
            badgeColor = "primary"

        return badgeColor
    }

    const onTaskClicked = (task) => {
        if (task.role === "Admin")
            onItemSelected("Edit Task", task._id, projectId)
        else 
            onItemSelected("View Task", task._id, projectId)
    }

    const onNewSubTaskClicked = (task) => {
        onItemSelected("New Sub-task", task._id)
    }

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            New Sub-task
        </Tooltip>
    );

    return (
        <Fragment>
        {
            tasks.map((task, i)=> 
                <Fragment key={task._id}>
                    <div className='d-flex'>
                        <div style={{ width: '97%'}}>
                            <div className="task-row" onClick={()=>onTaskClicked(task)}>
                                <div className="d-flex justify-content-start align-items-center py-2">
                                    {/* <HambugurDropdown 
                                        items={TASK_MENUITEMS}
                                        itemId={task._id}
                                        parentId={projectId}
                                    /> */}
                                    <Dropdown
                                        align={{ lg: 'start' }}
                                    >
                                        <Dropdown.Toggle variant="light" className="border border-secondary" style={{ width:'80%', height: '33px'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="5 3 11 16">
                                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                            </svg>
                                        </Dropdown.Toggle>
                                    </Dropdown>
                                    <span>{task.name}</span>
                                    <Badge pill bg={getBadgeColor(task.status)} style={{marginLeft: 10}}>
                                        {task.status}
                                    </Badge>
                                </div>
                                <div className="task-hr"></div>            
                            </div>
                        </div>
                        <div className="mt-3 ms-2">
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltip}
                            >
                                <Button 
                                    variant='outline-secondary' 
                                    size="sm"
                                    onClick={()=>onNewSubTaskClicked(task)}
                                > + </Button>
                            </OverlayTrigger>
                        </div>
                    </div>
                    {
                        task.sub_tasks.map((subTask)=>
                            <div key={subTask._id} className="ms-4 task-row" onClick={()=>onTaskClicked(subTask)}>
                                <div className="d-flex justify-content-start align-items-center py-2">
                                    {/* <HambugurDropdown 
                                        items={SUBTASK_MENUITEMS}
                                    /> */}
                                    <Dropdown
                                        align={{ lg: 'start' }}
                                    >
                                        <Dropdown.Toggle variant="light" className="border border-secondary" style={{ width:'80%', height: '33px'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="5 3 11 16">
                                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                            </svg>
                                        </Dropdown.Toggle>
                                    </Dropdown>
                                    <span>{subTask.name}</span>
                                    <Badge pill bg={getBadgeColor(subTask.status)} style={{marginLeft: 10}}>
                                        {subTask.status}
                                    </Badge>
                                </div>
                                <div className="task-hr"></div>
                            </div>
                        )
                    }
                </Fragment>
            )
        }
        </Fragment>
    )
}

export default TaskList