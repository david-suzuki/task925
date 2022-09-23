import React, { useEffect, useState } from "react";

const FooterDiv = (props) => {
  const { onClick } = props;
  const [height, setHeight] = useState(100);

  useEffect(() => {
    const divRoot = document.getElementById("root");
    const div1 = document.getElementById("div1");
    const div2 = document.getElementById("div2");
    setHeight(relativeHeightHandler(divRoot, div1, div2));

    function handleResize() {
      setHeight(relativeHeightHandler(divRoot, div1, div2));
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const relativeHeightHandler = (root, ele1, ele2) => {
    if (ele1 !== null && ele2 !== null) {
      const heightroot = root.clientHeight;
      const height1 = ele1.clientHeight;
      const height2 = ele2.clientHeight;
      const h = heightroot - height1 - height2;
      if (h < 0) return window.innerHeight - height1 - height2;
      return Math.max(h, 100);
    }
    return 0;
  };

  return (
    <div
      style={{
        backgroundColor: "gray",
        opacity: 0.7,
        height: `${height}px`,
      }}
      onClick={onClick}
    ></div>
  );
};

export default FooterDiv;
