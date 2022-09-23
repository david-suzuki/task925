import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Typeahead } from 'react-bootstrap-typeahead';

const AutoCompleteSelector = (props) => {
    const { type, options, onSelect } = props
    const [selected, setSelected] = useState([{_id: 0, name:''}])
    const tOptions = options.map((option)=>Object.assign({}, {_id: option._id, name: option.name}))
    
    const onOptionChange = (e) => {
        setSelected(e)
        onSelect(e)
    }

    return (
        <Form.Group>
            <Typeahead
                id="basic-typeahead-single"
                labelKey="name"
                onChange={ onOptionChange }
                options={tOptions}
                placeholder={`Choose a ${type}...`}
                selected={selected}
            />
        </Form.Group>
    )
}

export default AutoCompleteSelector