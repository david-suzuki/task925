import React, { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { HambugurMenuContext } from '../services/contexts';

const HambugurDropdown = (props) => {
    const { items, itemId, parentId } = props
    const onItemSelected = useContext(HambugurMenuContext);

    return (
        <Dropdown
            align={{ lg: 'start' }}
        >
            <Dropdown.Toggle variant="light" className="border border-secondary" style={{ width:'80%', height: '35px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="7 3 9 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {
                    items.map((item, i) => 
                        <Dropdown.Item 
                            key={i}
                            as="button"
                            onClick={() => onItemSelected(item.label, itemId, parentId)}
                        >
                            {item.label}
                        </Dropdown.Item>
                    )
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default HambugurDropdown