/* The wrapper controls cinematic crops for pre-optimized local images. */
/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";
type ParallaxImageProps=ImgHTMLAttributes<HTMLImageElement>&{"data-reveal"?:string};
export function ParallaxImage({className="","data-reveal":dataReveal,alt,...props}:ParallaxImageProps){return <span data-reveal={dataReveal} className={`parallax-frame ${className}`}><img alt={alt ?? ""} {...props}/></span>}
