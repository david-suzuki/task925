import React, { useState } from "react";
import { Form } from "react-bootstrap";
// import { format } from 'date-fns'

const DatePicker = (props) => {
    const { value, placeholder, onChange, className, onBlured, disabled } = props
    const [type, setType] = useState('text')

    const onFocus = () => {
        setType('datetime-local')
        // const nowDate = format(new Date(), 'yyyy-MM-dd')
        // onChange(nowDate)
    }

    const onBlur = () => {
        setType('text')
        onBlured()
    }

    const onChanged = (e) => {
        onChange(e.target.value)
    }

    return (
        <Form.Control 
            type={type}
            disabled={disabled}
            className={className}
            onFocus={ onFocus } 
            onBlur={ onBlur } 
            placeholder={ placeholder }
            value={value}
            onChange={onChanged}
        />
    )
}

export default DatePicker