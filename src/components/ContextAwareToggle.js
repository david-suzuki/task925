import React from "react";
import { useContext } from "react";
import { useAccordionButton, AccordionContext } from "react-bootstrap";

const ContextAwareToggle = ({ children, eventKey, callback }) => {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey)
  );

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <div
      // type="button"
      style={{
        color: isCurrentEventKey ? "#0c63e4" : "black",
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: 3,
        cursor: "pointer",
      }}
      onClick={decoratedOnClick}
    >
      {children}
    </div>
  );
};

export default ContextAwareToggle;
