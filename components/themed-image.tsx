"use client";

import Image, { type ImageProps } from "next/image";
import { useTheme } from "@/components/theme-provider";

type ThemedImageProps = Omit<ImageProps, "src"> & {
  darkSrc: string;
  lightSrc: string;
};

export function ThemedImage({ darkSrc, lightSrc, ...props }: ThemedImageProps) {
  const { theme } = useTheme();
  const src = theme === "light" ? lightSrc : darkSrc;

  return <Image {...props} src={src} />;
}
