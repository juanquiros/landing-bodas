import type { ImgHTMLAttributes } from "react";
type ParallaxImageProps=ImgHTMLAttributes<HTMLImageElement>&{"data-reveal"?:string};
export function ParallaxImage({className="","data-reveal":dataReveal,...props}:ParallaxImageProps){return <span data-reveal={dataReveal} className={`parallax-frame ${className}`}><img {...props}/></span>}
