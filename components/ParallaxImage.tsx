import type { ImgHTMLAttributes } from "react";
export function ParallaxImage({className="",...props}:ImgHTMLAttributes<HTMLImageElement>){return <span className={`parallax-frame ${className}`}><img {...props}/></span>}
