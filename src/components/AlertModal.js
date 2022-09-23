import React, {useEffect, useState} from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

const AlertModal = (props) => {
    const { isShow, onClose, title, message } = props;
    const [show, setShow] = useState(isShow);

    useEffect(() => {
        setShow(isShow)
    }, [isShow])

    const handleClose = (result) => {
        onClose(result)
    }

    return (
        <Modal show={show} onHide={() => handleClose(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center">
                    {message}
                </div>
                <div className="d-flex justify-content-center mt-4">
                    {/* <Button 
                        variant="primary" 
                        className="mx-2" 
                        style={{ minWidth: 70 }}
                        onClick={() => handleClose(true)}
                    >
                        Ok
                    </Button> */}
                    <Button 
                        variant="secondary" 
                        className="mx-2"
                        onClick={() => handleClose(false)}
                    >
                        Close
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default AlertModal