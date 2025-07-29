'use client';
import Image from "next/image";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export default function Icon({ name, className = '', size = 24, color = '#00AEEF' }: IconProps) {
  return (
    <Image 
      src={`/icons/${name}.svg`}
      alt={name}
      className={className}
      width={size}
      height={size}
      style={{ 
        filter: color === '#FFFFFF' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2475%) hue-rotate(176deg) brightness(118%) contrast(119%)'
      }}
    />
  );
} 