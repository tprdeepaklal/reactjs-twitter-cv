import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="ui three item menu">
      <NavLink to="/tweets" className="item">
        New Tweets
      </NavLink>
      <NavLink to="/rules" className="item">
        Manage Rules
      </NavLink>
      <NavLink to="/trends" className="item">
        Trends
      </NavLink>
    </div>
  );
};

export default Navbar;