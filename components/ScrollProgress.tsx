"use client";
import { useEffect } from "react";
export function ScrollProgress(){useEffect(()=>{const update=()=>{const root=document.documentElement;const max=root.scrollHeight-window.innerHeight;root.style.setProperty("--scroll-progress",`${max?window.scrollY/max:0}`)};update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[]);return <div className="scroll-progress" aria-hidden="true"><i/></div>}
