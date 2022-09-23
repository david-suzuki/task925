import React from "react";
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { CheckCircleFill } from "react-bootstrap-icons";
import './Timeline.css';

const Timeline = (props) => {
    const { timelines } = props

    return (
        <VerticalTimeline
            animate={false}
            layout="1-column-left"
            lineColor="black"
        >
            {
                timelines.map((timeline, i) => 
                    <VerticalTimelineElement
                        key={i}
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: 'rgb(190, 236, 250)', color: 'gray' }}
                        contentArrowStyle={{ borderRight: '7px solid  rgb(190, 236, 250)' }}
                        date={timeline.timeline_date}
                        iconStyle={{ 
                            background: 'rgb(33, 150, 243)', 
                            color: '#fff', 
                            width: '30px', height: '30px', 
                            marginLeft: '5px', marginTop: '5px', 
                        }}
                        icon={<CheckCircleFill />}
                    >
                        <span>
                            {timeline.timeline_text}
                        </span><br/>
                    </VerticalTimelineElement> 
                )
            }
        </VerticalTimeline>
    )
}

export default Timeline