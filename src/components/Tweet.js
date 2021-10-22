import React from "react";

const Tweet = ({ json }) => {
  const tw = json.data;
  tw.created_at = new Date(tw.created_at);
  let usr = null;

  for(var key in json.includes.users){
    if(tw.author_id === json.includes.users[key].id){
      usr = json.includes.users[key];
      break;
    }
  }


  return (<div className="item tw_item">
  <span  className="ui tiny image">
    <img alt={usr.name} src={usr.profile_image_url} />
  </span>
  <div className="content">
    <h3  className="header">{tw.text}</h3>
    <div className="description" >
      <span style={{float : 'left'}}>{usr.name}</span> 
      <span style={{float : 'right'}}>{tw.created_at.toLocaleString()}</span> 
    </div>
  </div>
</div>);
};

export default Tweet;