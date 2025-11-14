// src/components/animations/Circle.tsx
import React from 'react';

interface CircleProps extends React.SVGProps<SVGCircleElement> {
  radius: number;
  strokeWidth: number;
  color: string;
  shapeRef?: React.Ref<SVGCircleElement>;
  style?: React.CSSProperties;
}

const Circle: React.FC<CircleProps> = ({ radius, strokeWidth, color, shapeRef, style, ...rest }) => {
  // El radio interno del círculo SVG
  const svgRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * svgRadius;

  return (
    <svg
      style={{ ...style, overflow: 'visible' }} // Permitir que el círculo se dibuje fuera de los límites si es necesario
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      width={radius * 2}
      height={radius * 2}
    >
      <circle
        ref={shapeRef}
        cx={radius}
        cy={radius}
        r={svgRadius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference} // Por defecto para permitir animaciones de dasharray
        {...rest}
      />
    </svg>
  );
};

export default Circle;
