import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    participant_types: [],
    participant_status: [],
    tag_templates: [],
    tag_editors: [],
    tag_visible_to: [],
    field_types: [],
    field_visible_to: [],
    field_editors: [],
    message_visible_to: [],
    message_recipients: [],
    isMessages: false,
    isAlerts: false,
    app_setting_load: false 
}

const appsettingSlice = createSlice({
    name: 'appsetting',
    initialState,
    reducers: {
        init (state, action) {
            state.participant_types = action.payload.participant_types
            state.participant_status = action.payload.participant_status
            state.tag_templates = action.payload.tag_templates
            state.tag_editors = action.payload.tag_editors
            state.tag_visible_to = action.payload.tag_visible_to
            state.field_types = action.payload.field_types
            state.field_visible_to = action.payload.field_visible_to
            state.field_editors = action.payload.field_editors
            state.message_visible_to = action.payload.message_visible_to
            state.message_recipients = action.payload.message_recipients
        },

        setIsAlerts (state, action) {
            state.isAlerts = action.payload.isAlerts
        },

        setIsMessages (state, action) {
            state.isMessages = action.payload.isMessages
        },

        setAppSettingLoad(state, action) {
            state.app_setting_load = action.payload.app_setting_load
        }
    }
})

export const { init, setIsAlerts, setIsMessages, setAppSettingLoad } = appsettingSlice.actions

export default appsettingSlice.reducer