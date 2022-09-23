import React, { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import Topbar from "./topbar";
import 'bootstrap/dist/css/bootstrap.css';
import { useDispatch } from "react-redux";
import { initialize } from "../features/auth/authSlice";
import "./LoadingScreen.css"
import { fetchWorkspaces, setDisplayWorkspace, setDisplayProject } from "../features/workspace/workspaceSlice";
import { init, setIsAlerts, setIsMessages, setAppSettingLoad } from "./appsettingSlice";
import { getAppSettingData } from "../services/globals";
import { setError } from "../features/workspace/workspaceSlice";

const LoadingScreen = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        handleAppSettingData()
    })

    const handleAppSettingData = async () => {
        dispatch(setAppSettingLoad({app_setting_load: true}))
        const data = await getAppSettingData(null, null);
        dispatch(setAppSettingLoad({app_setting_load: false}))
        if (data.error) {
            dispatch(setError({
                isShow: true,
                title: "Error",
                message: data.message
            }))
            return
        }

        const settingsData = data.app_settings
        const workspaces = settingsData.workspaces
        dispatch(fetchWorkspaces({
            workspaces: workspaces
        }))

        const display_workspace = settingsData.display_workspace
        dispatch(setDisplayWorkspace({
            display_workspace: display_workspace
        }))

        const display_project = settingsData.display_project
        dispatch(setDisplayProject({
            display_project: display_project
        }))

        const participant_types = settingsData.participant_types
        const participant_status = settingsData.participant_status
        const tag_templates = settingsData.tag_templates
        const tag_visible_to = settingsData.tag_visible_to
        const tag_editors = settingsData.tag_editors
        const field_types = settingsData.field_types
        const field_visible_to = settingsData.field_visible_to
        const field_editors = settingsData.field_editors
        const message_visible_to = settingsData.message_visible_to
        const message_recipients = settingsData.message_recipients

        dispatch(init({
            participant_types,
            participant_status,
            tag_templates,
            tag_editors,
            tag_visible_to,
            field_types,
            field_visible_to,
            field_editors,
            message_visible_to,
            message_recipients,
        }))

        const isMessages = settingsData.messages
        dispatch(setIsMessages({
            isMessages: isMessages
        }))

        const isAlerts = settingsData.alerts
        dispatch(setIsAlerts({
            isAlerts: isAlerts
        }))

        dispatch(initialize({
            isInitialized: true
        }))
    }

    return (
        <div className="vh-100 bg-loading">
            <div style={{pointerEvents: 'none'}} className="bg-loading">
                <Topbar />
            </div>
            <div className="d-flex justify-content-center align-items-center h-75">
                <Spinner animation="border" variant="primary"/>
            </div>
        </div>
    )
}

export default LoadingScreen