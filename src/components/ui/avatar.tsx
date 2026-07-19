"use client";

/**
 * Avatar Component
 * ────────────────
 * Reusable avatar with fallback initials.
 * Used in sidebar footer & header user section.
 */


import Image from "next/image";
import React from "react";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, src, size = 36 }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    fontSize: size * 0.38,
    fontWeight: 600,
    flexShrink: 0,
    position: "relative",
  };

  if (src && !imgError) {
    return (
      <div style={containerStyle}>
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          onError={() => setImgError(true)}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  return <div style={containerStyle}>{getInitials(name)}</div>;
}
