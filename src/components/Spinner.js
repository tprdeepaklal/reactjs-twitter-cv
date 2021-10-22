import React from "react";

const Spinner = () => {
  return (
    <span style={{float : 'right', clear : 'right', marginTop : '15px', marginRight : '15px'}}>
      <div className="ui active inline loader"></div>
    </span>
  );
};

export default Spinner;