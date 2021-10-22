import React from "react";

const StreamController = ({callback}) => {
    const _toggleConnection = (e) =>{
        callback();
    }
  return (
    <div className="ui" style={{padding : '10px 0px 0px'}}>
      <button id="ct_btn" className="ui labeled icon button" onClick={(e) => _toggleConnection(e)} >
        <span> Start Stream </span>
        <i className="play icon"></i>
      </button>
      <span > Will auto stop after reaching 15 new tweets</span>
    </div>
  );
};

export default StreamController;