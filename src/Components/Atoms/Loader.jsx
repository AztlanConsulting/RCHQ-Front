import React from "react";
import { LoadingIndicator } from "../untitled/loading-indicator/loading-indicator";

const Loader = ({ size = "md" }) => {
  return <LoadingIndicator type="dot-circle" size={size} />;
};

export default Loader;
