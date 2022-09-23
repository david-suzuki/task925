import React, {useState} from "react";
import { PersonIconButton, ListIconButton } from '../../components/IconButton'
import 'bootstrap/dist/css/bootstrap.css';
import './Task.css';

const TimelineElement = (props) => {
    const { task } = props;
    const [isElementShow, setIsElementShow] = useState(false)
    const [isElementPositionFixed, setIsElementPositionFixed] = useState(false)
    const [isElementShowFixed, setIsElementShowFixed] = useState(false)
    const [isElementWidthFree, setIsElementWidthFree] = useState(false)
    const [isCloseShow, setIsCloseShow] = useState(false)

    const [elementPostion, setElementPosition] = useState(0)
    const [elementWidth, setElementWidth] = useState(70)

    const mousePositionHandler = (e) => {
        var position = e.clientX - 50
        if (e.clientX < 70)
            position = 70
        
        if (e.clientX > 1270)
            position = 1270
        // if button is not clicked yet, then calculate the current position of mouse
        // console.log(isElementWidthFree)
        if (!isElementPositionFixed) {
            setElementPosition(position - elementWidth / 2)
        // setElementPosition(position)
        } else if (isElementWidthFree) {
            setElementWidth(position - elementPostion + 15)
        }
    }

    const mouseEnterRowHandler = () => {
        // if button is not clicked yet
        if (!isElementPositionFixed && !isElementShowFixed) 
            setIsElementShow(true)
    }

    const mouseLeaveRowHandler = () => {
        // if button is not clicked yet
        if (!isElementPositionFixed && !isElementShowFixed) 
            setIsElementShow(false)
    }

    const elementMouseUpHandler = (e) => {
        if (e.button === 0) {
            e.stopPropagation()
        
            // setElementPosition(elementPostion)
            setIsElementPositionFixed(true)
            setIsElementShowFixed(true)
        }
    }

    const elementMouseDownHandler = (e) => {
        if (e.button === 0) {
            e.stopPropagation()
            setIsElementPositionFixed(false)
            setIsElementWidthFree(false)
        }
    }

    const iconMouseDownHandler = (e) => {
        e.stopPropagation()
        setIsElementWidthFree(true)
    }

    const iconMouseUpHandler = (e) => {
        e.stopPropagation()
        setIsElementWidthFree(false)
    }

    const elementMouseRightHandler = (e) => {
        if (e.button === 2) {
            e.stopPropagation()
            e.preventDefault()
            setIsCloseShow(!isCloseShow)
        }
    }

    const elementRemoveHandler = () => {
        setIsElementShow(false)
        setIsElementPositionFixed(false)
        setIsElementShowFixed(false)
        setIsElementWidthFree(false)
        setIsCloseShow(false)
        setElementPosition(0)
        setElementWidth(70)
    }

    const elementClass = isElementShowFixed ? 'fixed' : 'free'

    return (
        <div className="bg-white border mt-2">
            <div 
                className="py-2 ps-1"
                onMouseEnter={ mouseEnterRowHandler }
                onMouseLeave={ mouseLeaveRowHandler }
                onMouseMove={ mousePositionHandler }
                style={{ position: 'relative' }}
            >   
                <ListIconButton />
                <PersonIconButton />
                <span>{task.name}</span>
                {
                isElementShow &&
                    <div 
                        className={elementClass} 
                        style={{left:elementPostion, width: elementWidth}}
                        onMouseDown={ elementMouseDownHandler }
                        onMouseUp={ elementMouseUpHandler }
                        onContextMenu = { elementMouseRightHandler }
                    >
                        <span className="icon-span"
                        onMouseDown={ iconMouseDownHandler }
                        onMouseUp={ iconMouseUpHandler} >
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill={isElementShowFixed ? 'red' : 'gray'} 
                            className="bi bi-chevron-right" 
                            viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        </span>
                        {
                        isCloseShow && 
                        <div 
                            className="closeDiv d-flex justify-content-center align-items-center"
                            onClick={elementRemoveHandler}>
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                width="16" height="16" fill="white" 
                                class="bi bi-x-lg" 
                                viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
                            <path fillRule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
                            </svg>
                        </div>
                        }
                    </div>
                }
            </div>
        </div>
    );
}

export default TimelineElement