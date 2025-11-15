import React from "react";
import "../assets/styles/TextImages.css";

interface TextImagesProps {
  children: React.ReactNode;
}

const TextImages: React.FC<TextImagesProps> = ({ children }) => {
  return <div className="poem-block">{children}</div>;
};

export default TextImages;
