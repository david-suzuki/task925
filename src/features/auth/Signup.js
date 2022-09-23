import React from "react";
import { Form, Button, Container, Row, Image } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from "react-router-dom";

const Signup = () => {
    return (
        <Container>
            <Row className="justify-content-md-center" style={{ marginTop: 20}}>
                <div style={{ width: '40%'}}>
                    <div style={{ display: 'flex', justifyContent: 'center'}}>
                        <Image src="imgs/logo.png"></Image>
                    </div>
                    <Form style={{ background: '#e7f1ff'}} className="px-5 pb-4 pt-3 rounded-3">
                        <p className="text-center fs-3">Sign up</p>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" />
                            {/* <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                            </Form.Text> */}
                        </Form.Group>

                        <Form.Group className="mb-3" >
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" placeholder="Confirm Password" />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3 w-100">
                            Sign up
                        </Button>
                        <p className="text-center mt-4 mb-0 fs-6">Already have an account? <Link to="/login">Login</Link></p>
                        <p className="text-center fs-6"><Link to="/forgotpassword">Forgot your password?</Link></p>
                    </Form>
                </div>
            </Row>
        </Container>
    )
}

export default Signup