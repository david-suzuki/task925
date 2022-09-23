import React from "react";
import "./Loading.css";

const LoadingTags = () => {

    return (
        <div>
            <div className="d-flex">
                <div className="animated-background mx-2" style={{ width: '50%' }}>
                </div>
                <div className="animated-background mx-2" style={{ width: '25%' }}>
                </div>
                <div className="animated-background mx-2" style={{ width: '25%' }}>
                </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <div className="animated-background mx-2" style={{ width: '45%' }}>
                </div>
            </div>
        </div>
    )
}

export default LoadingTags