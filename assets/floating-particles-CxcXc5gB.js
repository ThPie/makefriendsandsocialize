import{j as t}from"./framer-KlvbA0rq.js";import{a as o}from"./charts-4HUGKxmU.js";function p({count:e=20}){const[i,l]=o.useState([]);return o.useEffect(()=>{const a=[];for(let s=0;s<e;s++)a.push({id:s,x:Math.random()*100,y:Math.random()*100,size:Math.random()*4+2,duration:Math.random()*20+15,delay:Math.random()*10,opacity:Math.random()*.3+.1});l(a)},[e]),t.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[i.map(a=>t.jsx("div",{className:"absolute rounded-full bg-primary/30",style:{left:`${a.x}%`,top:`${a.y}%`,width:`${a.size}px`,height:`${a.size}px`,opacity:a.opacity,animation:`float-particle ${a.duration}s ease-in-out ${a.delay}s infinite`}},a.id)),t.jsx("div",{className:"absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl",style:{animation:"pulse-glow 8s ease-in-out infinite"}}),t.jsx("div",{className:"absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[hsl(180,60%,30%)]/15 blur-3xl",style:{animation:"pulse-glow 10s ease-in-out 2s infinite"}}),t.jsx("div",{className:"absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-primary/5 blur-2xl",style:{animation:"pulse-glow 6s ease-in-out 4s infinite"}}),t.jsx("style",{children:`
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: var(--opacity);
          }
          25% {
            transform: translate(30px, -40px) scale(1.2);
            opacity: calc(var(--opacity) * 1.5);
          }
          50% {
            transform: translate(-20px, -80px) scale(0.8);
            opacity: var(--opacity);
          }
          75% {
            transform: translate(40px, -40px) scale(1.1);
            opacity: calc(var(--opacity) * 0.8);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `})]})}export{p as F};
