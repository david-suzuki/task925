import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    workspaces: [],
    display_workspace: 0,
    display_project: 0,
    error: {} 
}

const workspaceSlice = createSlice({
    name: 'workspaces',
    initialState,
    reducers: {
        fetchWorkspaces(state, action) {
            state.workspaces = action.payload.workspaces
        },
        setDisplayWorkspace(state, action) {
            state.display_workspace = action.payload.display_workspace
        },
        setDisplayProject(state, action) {
            state.display_project = action.payload.display_project
        },
        setError(state, action) {
            state.error.isShow = action.payload.isShow
            state.error.title = action.payload.title
            state.error.message = action.payload.message
        }
    }
})

export const { fetchWorkspaces, setError, setDisplayWorkspace, setDisplayProject } = workspaceSlice.actions

export default workspaceSlice.reducer