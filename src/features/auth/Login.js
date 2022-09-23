import React, { useState } from "react";
import { Form, Button, Container, Row, Image, Alert } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { post } from "../../services/axios";
import { apikey, apisecret, token } from "../../services/constants";
import { login } from './authSlice';
import { setError } from '../workspace/workspaceSlice';

const Login = () => {
    const [email, setEmail] = useState('')
    const [emailEmptyError, setEmailEmptyError] = useState(false)
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    let location = useLocation();
    let from = location.state?.from?.pathname || "/";

    const onLoginSubmitClick = async () => {
        if (email === "") {
            setEmailEmptyError(true)
            return
        }

        let formData = new FormData();
        formData.append('api_method', 'login')
        formData.append('apikey', apikey)
        formData.append('apisecret', apisecret)
        formData.append('account_id', 'account2.' + token)
        formData.append('login_email', email)
        formData.append('login_password', password)

        try {
            setLoading(true)
            const loginResponse = await post('https://ww2.task925.com/?api', formData)
            if (loginResponse.data.success === 1) {
                const user = {
                    email
                }

                dispatch(login({
                    isAuthenticated: true, 
                    isInitialized: false, 
                    user
                }))

                localStorage.setItem("isAuthenticated", "done");
                localStorage.setItem("user", JSON.stringify(user));
                // Send them back to the page they tried to visit when they were
                // redirected to the login page. Use { replace: true } so we don't create
                // another entry in the history stack for the login page.  This means that
                // when they get to the protected page and click the back button, they
                // won't end up back on the login page, which is also really nice for the
                // user experience.
                setLoading(false)
                navigate(from, { replace: true });
            } else if (loginResponse.data.error) {
                setErrMsg("Incorrect email and password")
                setLoading(false)
            }
        } catch(err) {
            setLoading(false)
            dispatch(setError({
                isShow: true,
                title: "Error",
                message: err.toString()
            }))
        }
    }

    const onEmailChange = (e) => {
        setEmailEmptyError(false)
        setEmail(e.target.value)
    }

    return (
        <Container>
            <Row className="justify-content-md-center" style={{ marginTop: 70}}>
                <div style={{ width: '40%'}}>
                    <div style={{ display: 'flex', justifyContent: 'center'}}>
                        <Image src="imgs/logo.png"></Image>
                    </div>
                    <Form style={{ background: '#e7f1ff'}} className="px-5 pb-4 pt-3 rounded-3">
                        <p className="text-center fs-3">Login</p>
                        {
                            errMsg !== "" &&
                            <Alert 
                                variant="danger"
                                dismissible
                                onClose={() => setErrMsg('')}
                            >
                                {errMsg}
                            </Alert>
                        }
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email"
                                required 
                                placeholder="Enter email"
                                value={email}
                                onChange={onEmailChange} 
                            />
                            {
                                emailEmptyError &&
                                <Form.Text className="text-danger ms-1">
                                    Email is required*.
                                </Form.Text>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)} 
                            />
                        </Form.Group>

                        <Button
                            className="mt-3 w-100" 
                            variant="primary" 
                            type="button"
                            onClick={onLoginSubmitClick}
                            disabled={loading} 
                        >
                            {loading ? 'Loading...' : 'Login'}
                            {   
                                loading &&
                                <div className="spinner-border spinner-border-sm ms-2 mt-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                                </div>
                            }
                        </Button>

                        <p className="text-center mt-4 mb-0 fs-6">Don't have an account? <Link to="/signup">Sign up</Link></p>
                        <p className="text-center fs-6"><Link to="/forgotpassword">Forgot your password?</Link></p>
                    </Form>
                </div>
            </Row>
        </Container>
    )
}

export default Login