import React from "react";
import { Form, Button, Container, Row } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';

const ForgotPassword = () => {
    return (
        <Container>
            <Row className="justify-content-md-center" style={{ marginTop: 70}}>
                <div style={{ width: '40%'}}>
                    <Form style={{ background: '#e7f1ff'}} className="px-5 pb-4 pt-3 rounded-3">
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3 w-100">
                            Forgot password
                        </Button>
                    </Form>
                </div>
            </Row>
        </Container>
    )
}

export default ForgotPassword