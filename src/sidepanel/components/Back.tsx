import React from "react";
import { useNavigate } from "react-router-dom";

const Back: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/profile");
  };
  return <button onClick={handleClick}>Back</button>;
};

export default Back;
