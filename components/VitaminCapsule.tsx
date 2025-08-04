import React from 'react';
import Svg, { Ellipse, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface VitaminCapsuleProps {
  size?: number;
  style?: any;
}

export default function VitaminCapsule({ size = 24, style }: VitaminCapsuleProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
    >
      <Defs>
        {/* Gradient for top half of capsule (darker) */}
        <LinearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF7F50" stopOpacity="1" />
          <Stop offset="100%" stopColor="#FF6B35" stopOpacity="1" />
        </LinearGradient>
        
        {/* Gradient for bottom half of capsule (lighter) */}
        <LinearGradient id="bottomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE4B5" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FFDAB9" stopOpacity="0.9" />
        </LinearGradient>
        
        {/* Highlight gradient for gel effect */}
        <LinearGradient id="highlight" x1="0%" y1="0%" x2="50%" y2="30%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      {/* Rotated capsule group - angled like pill emoji */}
      <G transform="rotate(45 12 12)">
        {/* Single lighter capsule - bigger size */}
        <Ellipse
          cx="12"
          cy="12"
          rx="4.5"
          ry="8"
          fill="url(#bottomGradient)"
        />
        
        {/* Gel capsule highlight for 3D effect */}
        <Ellipse
          cx="10"
          cy="10"
          rx="2"
          ry="5"
          fill="url(#highlight)"
        />
        
        {/* Small highlight dot for extra gel effect */}
        <Ellipse
          cx="9.5"
          cy="9"
          rx="1"
          ry="2"
          fill="#FFFFFF"
          opacity="0.4"
        />
      </G>
    </Svg>
  );
}