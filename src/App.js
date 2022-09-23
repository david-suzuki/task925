import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkspaceList from './features/workspace/WorkspaceList';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ForgotPassword from './features/auth/ForgotPassword';
import AuthRequire from './features/auth/AuthRequire';
import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=
          {
            <AuthRequire>
              <WorkspaceList />
            </AuthRequire>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
