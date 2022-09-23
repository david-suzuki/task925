import { getFormObj, server_domain } from "./constants";
import { post } from "./axios";

export const getAppSettingData = async (projectId, workspaceId) => {
    let formData = getFormObj();
    formData.append('api_method', 'app_settings')
    formData.append('app_version', '1')
    formData.append('device_info', "https://github.com/bestiejs/platform.js")

    if (projectId)
        formData.append('project_id', projectId)

    if (workspaceId)
        formData.append('workspace_id', workspaceId)

    try {
        const response = await post(server_domain, formData)
        return response.data   
    } catch(err) {
        alert(err.toString())
        return
    }
}