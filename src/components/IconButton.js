import React from "react";
import { Button } from "react-bootstrap";
import { List, PersonFill, PlusLg, XLg, Paperclip, Send, Link45deg, Eye } from "react-bootstrap-icons";

export const ListIconButton = () => {
    return (
        <Button variant="outline-secondary" size="sm" style={{marginRight: 10, marginBottom: 3}}>
            <List />
        </Button>
    )
}

export const PersonIconButton = () => {
    return (
        <Button variant="outline-secondary" size="sm" style={{marginRight: 10, marginBottom: 3}}>
            <PersonFill />
        </Button>
    )
}

export const PlusIconButton = (props) => {
    return (
        <Button className="d-inline-flex justify-content-center align-items-center" type="button" variant="outline-primary" disabled={props.disabled} onClick={props.onClick} style={{height:36, width:36}}>
            <PlusLg />
        </Button>
    )
}

export const XIconButton = (props) => {
    return (
        <Button className="d-inline-flex justify-content-center align-items-center" type="button" variant="outline-danger" disabled={props.disabled} onClick={props.onClick} style={{height:36, width:36}}>
            <XLg />
        </Button>
    )
}

export const PaperclipIconButton = (props) => {
    return (
        <Button className="d-inline-flex justify-content-center align-items-center" type="button" variant="outline-secondary" onClick={props.onClick} disabled={props.disabled} style={{height:36, width:36}}>
            <Paperclip />
        </Button>
    )
}

export const SendIconButton = (props) => {
    return (
        <Button className="d-inline-flex justify-content-center align-items-center" type="button" variant="outline-primary" onClick={props.onClick} disabled={props.disabled} style={{height:36, width:36}}>
            <Send />
        </Button>
    )
}

export const LinkIconButton = (props) => {
    return (
        <Button className={`d-inline-flex justify-content-center align-items-center ${props.className}`} type="button" variant="outline-secondary" onClick={props.onClick} disabled={props.disabled} style={{height:37, width:37}}>
            <Link45deg />
        </Button>
    )
}

export const EyeIconButton = (props) => {
    return (
        <Button className={`d-inline-flex justify-content-center align-items-center ${props.className}`} type="button" variant="outline-secondary" onClick={props.onClick} disabled={props.disabled} style={{height:37, width:37}}>
            <Eye />
        </Button>
    )
}
