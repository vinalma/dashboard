import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#1a1a2e", surface: "#16213e", accent: "#e94560", accentSoft: "#e9456033",
  white: "#eaf6ff", muted: "#8892b0",
};

const CARD_COLORS = [
  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  { bg: "#ede9fe", border: "#8b5cf6", text: "#5b21b6" },
  { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
  { bg: "#ffedd5", border: "#f97316", text: "#9a3412" },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const CARD_MIN_W = 180, CARD_MIN_H = 120;
const TASK_MIN_W = 180, TASK_MIN_H = 100;

const INITIAL_DATA = {
  cards: [
    { id:"p1", type:"project", title:"Redesign do App", color:3, x:100, y:100, w:280, h:210,
      tasks:[
        {id:"t1",title:"Wireframes",done:false,x:80,y:80,w:240,h:130,color:1},
        {id:"t2",title:"Design System",done:false,x:420,y:80,w:240,h:130,color:4},
        {id:"t3",title:"Protótipo Hi-fi",done:false,x:250,y:320,w:240,h:130,color:0},
        {id:"t4",title:"Testes de usabilidade",done:false,x:660,y:280,w:240,h:130,color:2},
      ],
      connections:[["t1","t2"],["t2","t3"],["t3","t4"]],
    },
    { id:"p2", type:"project", title:"Lançamento Marketing", color:4, x:480, y:100, w:280, h:210,
      tasks:[
        {id:"t5",title:"Definir público-alvo",done:false,x:80,y:80,w:240,h:130,color:0},
        {id:"t6",title:"Criar conteúdo",done:true,x:420,y:80,w:240,h:130,color:5},
        {id:"t7",title:"Campanha ads",done:false,x:250,y:300,w:240,h:130,color:2},
      ],
      connections:[["t5","t6"],["t5","t7"]],
    },
    { id:"s1", type:"tasks", title:"Tarefas Pessoais", color:0, x:100, y:420, w:260, h:200,
      tasks:[
        {id:"t8",title:"Marcar dentista",done:false},
        {id:"t9",title:"Comprar presente",done:true},
        {id:"t10",title:"Estudar React",done:false},
      ],
    },
    { id:"s2", type:"tasks", title:"Backlog Dev", color:2, x:480, y:420, w:260, h:200,
      tasks:[
        {id:"t11",title:"Fix bug login",done:false},
        {id:"t12",title:"Refatorar API",done:false},
        {id:"t13",title:"Deploy staging",done:true},
        {id:"t14",title:"Testes E2E",done:false},
      ],
    },
  ],
};

// ─────────────── Icons ───────────────
const I = (d, extra="") => ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {extra && <path d={extra} />}
  </svg>
);
function PlusIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;}
function TrashIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;}
function LinkIcon({size=14}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;}
function CheckIcon({size=14}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;}
function ArrowBack({size=20}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;}
function BoardIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;}
function MapIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><line x1="6" y1="6" x2="9" y2="10"/><line x1="18" y1="6" x2="15" y2="10"/><line x1="6" y1="18" x2="9" y2="14"/><line x1="18" y1="18" x2="15" y2="14"/></svg>;}
function ExpandIcon({size=14}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>;}
function ZoomInIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;}
function ZoomOutIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;}
function FitIcon({size=16}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>;}

// ─────────────── Infinite Canvas Hook ───────────────
function useInfiniteCanvas(containerRef) {
  const [cam, setCam] = useState({ x: 60, y: 60, zoom: 1 });
  const isPanning = useRef(false);
  const panStart = useRef({});
  const MIN_ZOOM = 0.1, MAX_ZOOM = 4;

  const handleWheel = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      setCam(p => {
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom * factor));
        const r = z / p.zoom;
        return { zoom: z, x: mx - (mx - p.x)*r, y: my - (my - p.y)*r };
      });
      return;
    }

    if (e.target.tagName.toLowerCase() === 'textarea') return;
    e.preventDefault();
    
    const dx = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
    const dy = e.shiftKey && e.deltaX === 0 ? 0 : e.deltaY;
    setCam(p => ({ ...p, x: p.x - dx, y: p.y - dy }));
  }, [containerRef]);

  const onPanStart = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      isPanning.current = true;
      setCam(p => { panStart.current = { mx: e.clientX, my: e.clientY, cx: p.x, cy: p.y }; return p; });
    }
  }, []);
  const onPanMove = useCallback((e) => {
    if (!isPanning.current) return;
    setCam(p => ({ ...p, x: panStart.current.cx + e.clientX - panStart.current.mx, y: panStart.current.cy + e.clientY - panStart.current.my }));
  }, []);
  const onPanUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("mousedown", onPanStart);
    window.addEventListener("mousemove", onPanMove);
    window.addEventListener("mouseup", onPanUp);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", onPanStart);
      window.removeEventListener("mousemove", onPanMove);
      window.removeEventListener("mouseup", onPanUp);
    };
  }, [handleWheel, onPanStart, onPanMove, onPanUp]);

  const zoomTo = useCallback((z) => {
    const el = containerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height/2;
    setCam(p => { const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)); const r = nz/p.zoom; return { zoom: nz, x: cx-(cx-p.x)*r, y: cy-(cy-p.y)*r }; });
  }, [containerRef]);

  const fitToContent = useCallback((items, pad=80) => {
    const el = containerRef.current; if (!el || !items.length) return;
    const rect = el.getBoundingClientRect();
    let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
    items.forEach(it => { x0=Math.min(x0,it.x); y0=Math.min(y0,it.y); x1=Math.max(x1,it.x+(it.w||260)); y1=Math.max(y1,it.y+(it.h||200)); });
    const cw=x1-x0+pad*2, ch=y1-y0+pad*2;
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(rect.width/cw, rect.height/ch)));
    setCam({ zoom: z, x: (rect.width-cw*z)/2-(x0-pad)*z, y: (rect.height-ch*z)/2-(y0-pad)*z });
  }, [containerRef]);

  return { cam, setCam, zoomTo, fitToContent };
}

// ─────────────── Dot Grid ───────────────
function DotGrid({ cam }) {
  const s = 40 * cam.zoom;
  const ox = ((cam.x % s) + s) % s;
  const oy = ((cam.y % s) + s) % s;
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="dg" x={ox} y={oy} width={s} height={s} patternUnits="userSpaceOnUse">
            <circle cx={s/2} cy={s/2} r={Math.max(0.8, 1.4*cam.zoom)} fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dg)" />
      </svg>
    </div>
  );
}

// ─────────────── Zoom Controls ───────────────
function ZoomControls({ cam, zoomTo, onFit }) {
  const btn = { width:34, height:34, borderRadius:8, border:"none", background:"rgba(255,255,255,0.07)", color:COLORS.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" };
  return (
    <div style={{ position:"absolute", bottom:16, right:16, zIndex:100, display:"flex", gap:4, background:COLORS.surface, borderRadius:10, padding:4, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.08)" }}>
      <button style={btn} onClick={() => zoomTo(cam.zoom*1.3)}><ZoomInIcon /></button>
      <button style={btn} onClick={() => zoomTo(cam.zoom/1.3)}><ZoomOutIcon /></button>
      <div style={{ padding:"0 8px", display:"flex", alignItems:"center", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:COLORS.muted, minWidth:42, justifyContent:"center" }}>
        {Math.round(cam.zoom*100)}%
      </div>
      <button style={btn} onClick={onFit}><FitIcon /></button>
    </div>
  );
}

// ─────────────── Selection Box ───────────────
function SelectionBox({ box }) {
  if (!box) return null;
  const x = Math.min(box.x1, box.x2), y = Math.min(box.y1, box.y2);
  const w = Math.abs(box.x2-box.x1), h = Math.abs(box.y2-box.y1);
  return (
    <div style={{
      position:"absolute", left:x, top:y, width:w, height:h, zIndex:999,
      border:"2px solid #3a86ff", background:"rgba(58,134,255,0.08)",
      borderRadius:4, pointerEvents:"none",
    }} />
  );
}

// ─────────────── Resize Handle ───────────────
function ResizeHandle({ onResizeStart, color }) {
  return (
    <div
      onMouseDown={onResizeStart}
      style={{
        position:"absolute", right:-6, bottom:-6, width:18, height:18,
        borderRadius:"50%", background: color || "#3a86ff",
        border:"2.5px solid #fff", cursor:"se-resize", zIndex:20,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1 7L7 1M4 7L7 4M7 7L7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// ─────────────── Post-it Card (main canvas) ───────────────
function PostItCard({ card, colorDef, selected, onMouseDown, onOpen, onDelete, onResizeStart, onUpdate }) {
  const doneCount = card.tasks?.filter(t=>t.done).length||0;
  const totalCount = card.tasks?.length||0;
  const progress = totalCount>0 ? (doneCount/totalCount)*100 : 0;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position:"absolute", left:card.x, top:card.y, width:card.w||260, height:card.h||210,
        background:colorDef.bg, borderLeft:`6px solid ${colorDef.border}`, borderRadius:8,
        padding:"16px 18px", cursor:"grab", userSelect:"none",
        boxShadow: selected
          ? `0 0 0 2.5px #3a86ff, 0 8px 32px rgba(0,0,0,0.35)`
          : "0 6px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.14)",
        fontFamily:"'Caveat',cursive", overflow:"hidden",
        display:"flex", flexDirection:"column",
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:colorDef.border, opacity:0.8 }}>
          {card.type==="project"?"📁 Projeto":"📋 Tarefas"}
        </span>
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{ background:"none", border:"none", cursor:"pointer", color:colorDef.text, opacity:0.4, padding:2, flexShrink:0 }}>
          <TrashIcon size={13} />
        </button>
      </div>
      <textarea
        value={card.title}
        onChange={e=>onUpdate?.({...card, title:e.target.value})}
        onMouseDown={e=>e.stopPropagation()}
        style={{ fontSize:26, fontWeight:700, color:colorDef.text, lineHeight:1.2, flex:1, wordBreak:"break-word", background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"inherit", padding:0 }}
      />
      {totalCount>0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ height:5, background:colorDef.border+"33", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:colorDef.border, borderRadius:3 }} />
          </div>
          <span style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:colorDef.text, opacity:0.6, marginTop:3, display:"block" }}>
            {doneCount}/{totalCount} concluídas
          </span>
        </div>
      )}
      <button onClick={e=>{e.stopPropagation();onOpen();}} style={{
        display:"flex", alignItems:"center", gap:6, background:colorDef.border+"22",
        border:`1px solid ${colorDef.border}44`, borderRadius:6, padding:"7px 10px",
        cursor:"pointer", color:colorDef.text, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, justifyContent:"center",
      }}>
        <ExpandIcon size={12} /> Abrir
      </button>
      <ResizeHandle onResizeStart={onResizeStart} color={colorDef.border} />
    </div>
  );
}

// ─────────────── Connection SVG ───────────────
function ConnectionLine({ from, to, tasks, color, isSelected, onSelect, onDelete, onRedirectStart }) {
  const t1 = tasks.find(t=>t.id===from), t2 = tasks.find(t=>t.id===to);
  if (!t1||!t2) return null;
  const t1x = t1.x + (t1.w||240)/2, t1y = t1.y + (t1.h||130)/2;
  const t2x = t2.x + (t2.w||240)/2, t2y = t2.y + (t2.h||130)/2;
  const dx = t2x - t1x, dy = t2y - t1y;
  
  let x1, y1, x2, y2, cx1, cy1, cx2, cy2;
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) { x1 = t1.x + (t1.w||240); y1 = t1y; x2 = t2.x; y2 = t2y; }
    else { x1 = t1.x; y1 = t1y; x2 = t2.x + (t2.w||240); y2 = t2y; }
    const cDist = Math.max(Math.abs(x2 - x1) / 2, 40);
    cx1 = x1 + (dx > 0 ? cDist : -cDist); cy1 = y1;
    cx2 = x2 + (dx > 0 ? -cDist : cDist); cy2 = y2;
  } else {
    // Vertical connection
    if (dy > 0) { x1 = t1x; y1 = t1.y + (t1.h||130); x2 = t2x; y2 = t2.y; }
    else { x1 = t1x; y1 = t1.y; x2 = t2x; y2 = t2.y + (t2.h||130); }
    const cDist = Math.max(Math.abs(y2 - y1) / 2, 40);
    cx1 = x1; cy1 = y1 + (dy > 0 ? cDist : -cDist);
    cx2 = x2; cy2 = y2 + (dy > 0 ? -cDist : cDist);
  }

  const mx = 0.125*x1 + 0.375*cx1 + 0.375*cx2 + 0.125*x2;
  const my = 0.125*y1 + 0.375*cy1 + 0.375*cy2 + 0.125*y2;

  return (
    <g>
      {/* Hitbox */}
      <path
        d={`M${x1} ${y1} C${cx1} ${cy1},${cx2} ${cy2},${x2} ${y2}`}
        stroke="transparent" strokeWidth="20" fill="none"
        style={{ cursor:"pointer", pointerEvents:"visibleStroke" }}
        onMouseDown={onSelect}
      />
      {/* Visible Line */}
      <path
        d={`M${x1} ${y1} C${cx1} ${cy1},${cx2} ${cy2},${x2} ${y2}`}
        stroke={isSelected ? "#3a86ff" : color} strokeWidth={isSelected ? 3.5 : 2.5}
        fill="none" strokeDasharray={isSelected ? "none" : "7 5"}
        opacity={isSelected ? 1 : 0.5}
        style={{ pointerEvents:"none" }}
      />
      {/* Target Arrow / Dot */}
      <circle cx={x2} cy={y2} r="5" fill={isSelected ? "#3a86ff" : color} opacity={isSelected ? 1 : 0.6} style={{ pointerEvents:"none" }}/>

      {isSelected && (
        <>
          <foreignObject x={mx-14} y={my-14} width="28" height="28" style={{ pointerEvents:"auto" }}>
            <button
              onMouseDown={(e)=>{e.stopPropagation(); e.preventDefault(); onDelete();}}
              style={{ width:28, height:28, borderRadius:"50%", background:"#e94560", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", cursor:"pointer", padding:0, boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}
            >
              <TrashIcon size={14}/>
            </button>
          </foreignObject>
          {/* Redirect Handle */}
          <circle
            cx={x2} cy={y2} r="10" fill="#3a86ff" stroke="#fff" strokeWidth="3"
            style={{ cursor:"grab", pointerEvents:"auto" }}
            onMouseDown={(e)=>{e.stopPropagation(); e.preventDefault(); onRedirectStart(e);}}
          />
        </>
      )}
    </g>
  );
}

function ConnectionHandle({ side, onConnStart, color }) {
  const styles = {
    top: { top: -10, left: "50%", transform: "translateX(-50%)" },
    bottom: { bottom: -10, left: "50%", transform: "translateX(-50%)" },
    left: { left: -10, top: "50%", transform: "translateY(-50%)" },
    right: { right: -10, top: "50%", transform: "translateY(-50%)" },
  };
  return (
    <div
      onMouseDown={(e)=>onConnStart(e)}
      style={{
        position:"absolute", ...styles[side],
        width:20, height:20, borderRadius:"50%", background:color,
        border:"3.5px solid #fff", cursor:"crosshair", zIndex:20,
        boxShadow:"0 2px 6px rgba(0,0,0,0.25)"
      }}
    />
  );
}

// ─────────────── Task Post-it (big) ───────────────
function TaskPostIt({ task, colorDef, selected, onMouseDown, onToggle, onConnStart, onResizeStart, onChangeTitle }) {
  return (
    <div onMouseDown={onMouseDown} style={{
      position:"absolute", left:task.x, top:task.y,
      width:task.w||240, height:task.h||130,
      background:colorDef.bg, borderLeft:`5px solid ${colorDef.border}`,
      borderRadius:7, padding:"14px 16px", cursor:"grab",
      boxShadow: selected
        ? `0 0 0 2.5px #3a86ff, 0 6px 24px rgba(0,0,0,0.25)`
        : "0 4px 18px rgba(0,0,0,0.22)",
      userSelect:"none", fontFamily:"'Caveat',cursive",
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, flex:1 }}>
        <button onClick={e=>{e.stopPropagation();onToggle();}} style={{
          width:28, height:28, borderRadius:6, flexShrink:0, marginTop:2,
          border:`2.5px solid ${colorDef.border}`,
          background:task.done?colorDef.border:"transparent",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0,
        }}>
          {task.done && <CheckIcon size={15}/>}
        </button>
        <textarea
          value={task.title}
          onChange={e=>onChangeTitle?.(e.target.value)}
          onMouseDown={e=>e.stopPropagation()}
          style={{ fontSize:22, color:colorDef.text, lineHeight:1.25, fontWeight:700, textDecoration:task.done?"line-through":"none", opacity:task.done?0.45:1, wordBreak:"break-word", background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"inherit", flex:1, padding:0, height:"100%" }}
        />
      </div>
      {["top","bottom","left","right"].map(side => (
        <ConnectionHandle key={side} side={side} onConnStart={(e)=>{e.stopPropagation(); e.preventDefault(); onConnStart(task.id,e,side);}} color={colorDef.border} />
      ))}
      <ResizeHandle onResizeStart={onResizeStart} color={colorDef.border}/>
    </div>
  );
}

// ─────────────── Board View ───────────────
function BoardView({ card, onToggleTask, onChangeTaskTitle }) {
  const todo = card.tasks.filter(t=>!t.done), done = card.tasks.filter(t=>t.done);
  const col = { flex:1, minWidth:220, background:"rgba(255,255,255,0.05)", borderRadius:10, padding:14 };
  return (
    <div style={{ display:"flex", gap:20, padding:"20px 0" }}>
      {[["A Fazer", todo, false], ["Concluído", done, true]].map(([label, items, isDone]) => (
        <div key={label} style={col}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14, color:COLORS.muted }}>{label} ({items.length})</div>
          {items.map(t=>{
            const tc = CARD_COLORS[t.color||0];
            return (
              <div key={t.id} onClick={()=>onToggleTask(t.id)} style={{
                background:tc.bg, borderLeft:`5px solid ${tc.border}`, borderRadius:7, padding:"13px 15px",
                marginBottom:10, fontFamily:"'Caveat',cursive", fontSize:22, color:tc.text,
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                opacity:isDone?0.55:1, textDecoration:isDone?"line-through":"none",
                boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
              }}>
                <div style={{ width:22, height:22, borderRadius:5, border:`2.5px solid ${tc.border}`, flexShrink:0, background:isDone?tc.border:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isDone&&<CheckIcon size={12}/>}
                </div>
                <input
                  value={t.title}
                  onChange={e=>onChangeTaskTitle?.(t.id, e.target.value)}
                  onClick={e=>e.stopPropagation()}
                  style={{ background:"transparent", border:"none", outline:"none", fontSize:22, fontFamily:"inherit", color:"inherit", flex:1, textDecoration:isDone?"line-through":"none", opacity:isDone?0.55:1 }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────── Modals ───────────────
function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:COLORS.surface, borderRadius:14, padding:28, width:370, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────── Add Card Modal ───────────────
function AddCardModal({ onAdd, onClose }) {
  const [title,setTitle]=useState(""), [type,setType]=useState("tasks"), [color,setColor]=useState(0);
  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18, fontWeight:700, color:COLORS.white, margin:"0 0 20px" }}>Novo Card</h3>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nome do card..."
        onKeyDown={e=>{if(e.key==="Enter"&&title.trim())onAdd({title:title.trim(),type,color});}}
        style={{ width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, color:COLORS.white, fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:16, boxSizing:"border-box" }}
      />
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["tasks","project"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{ flex:1, padding:"8px 0", borderRadius:6, border:type===t?`2px solid ${COLORS.accent}`:"2px solid rgba(255,255,255,0.1)", background:type===t?COLORS.accentSoft:"transparent", color:COLORS.white, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontW:600, cursor:"pointer" }}>
            {t==="tasks"?"📋 Tarefas":"📁 Projeto"}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {CARD_COLORS.map((c,i)=>(
          <button key={i} onClick={()=>setColor(i)} style={{ width:34, height:34, borderRadius:"50%", background:c.bg, border:color===i?`3px solid ${c.border}`:"3px solid transparent", cursor:"pointer", boxShadow:color===i?`0 0 0 2px ${COLORS.surface},0 0 0 4px ${c.border}`:"none" }}/>
        ))}
      </div>
      <button onClick={()=>title.trim()&&onAdd({title:title.trim(),type,color})} disabled={!title.trim()} style={{ width:"100%", padding:"10px 0", borderRadius:6, border:"none", background:title.trim()?COLORS.accent:"rgba(255,255,255,0.1)", color:COLORS.white, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:title.trim()?"pointer":"default" }}>Criar</button>
    </Modal>
  );
}

// ─────────────── Add Task Modal ───────────────
function AddTaskModal({ onAdd, onClose }) {
  const [title,setTitle]=useState(""), [color,setColor]=useState(0);
  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18, fontWeight:700, color:COLORS.white, margin:"0 0 20px" }}>Nova Tarefa</h3>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nome da tarefa..."
        onKeyDown={e=>{if(e.key==="Enter"&&title.trim())onAdd({title:title.trim(),color});}}
        style={{ width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, color:COLORS.white, fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:16, boxSizing:"border-box" }}
      />
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {CARD_COLORS.map((c,i)=>(
          <button key={i} onClick={()=>setColor(i)} style={{ width:30, height:30, borderRadius:"50%", background:c.bg, border:color===i?`3px solid ${c.border}`:"3px solid transparent", cursor:"pointer" }}/>
        ))}
      </div>
      <button onClick={()=>title.trim()&&onAdd({title:title.trim(),color})} disabled={!title.trim()} style={{ width:"100%", padding:"10px 0", borderRadius:6, border:"none", background:title.trim()?COLORS.accent:"rgba(255,255,255,0.1)", color:COLORS.white, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:title.trim()?"pointer":"default" }}>Adicionar</button>
    </Modal>
  );
}

// ─────────────── rectHit helper ───────────────
function rectHit(item, box) {
  const ix=item.x, iy=item.y, iw=item.w||260, ih=item.h||200;
  const bx=Math.min(box.x1,box.x2), by=Math.min(box.y1,box.y2);
  const bw=Math.abs(box.x2-box.x1), bh=Math.abs(box.y2-box.y1);
  return ix<bx+bw && ix+iw>bx && iy<by+bh && iy+ih>by;
}

// ─────────────── Project Inner Canvas ───────────────
function ProjectView({ card, colorDef, onBack, onUpdate }) {
  const [viewMode,setViewMode]=useState("canvas");
  const [showAddTask,setShowAddTask]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [selectedConn,setSelectedConn]=useState(null);
  const [selBox,setSelBox]=useState(null);
  const [drawConn, setDrawConn]=useState(null);

  const canvasRef=useRef(null);
  const drawConnRef=useRef(null);
  const dragRef=useRef(null);      // dragging items
  const resizeRef=useRef(null);    // resizing
  const selRef=useRef(null);       // selection box draw
  const { cam, zoomTo, fitToContent } = useInfiniteCanvas(canvasRef);

  // ── fit on mount ──
  useEffect(()=>{
    if(card.tasks.length>0) setTimeout(()=>fitToContent(card.tasks.map(t=>({x:t.x,y:t.y,w:t.w||240,h:t.h||130}))),60);
  },[]);

  // ── pointer world coords ──
  const toWorld=(e)=>{
    const r=canvasRef.current.getBoundingClientRect();
    return { x:(e.clientX-r.left-cam.x)/cam.zoom, y:(e.clientY-r.top-cam.y)/cam.zoom };
  };

  // ── canvas background mousedown → start selection box ──
  const onCanvasBgDown=(e)=>{
    if(e.button!==0||e.shiftKey) return;
    const w=toWorld(e);
    selRef.current={x0:w.x,y0:w.y};
    setSelBox({x1:w.x,y1:w.y,x2:w.x,y2:w.y});
    setSelected(new Set());
    setSelectedConn(null);
  };

  // ── item drag start ──
  const onItemDown=(id,e)=>{
    if(e.button!==0||e.shiftKey) return;
    e.stopPropagation();
    setSelectedConn(null);
    const w=toWorld(e);
    let ids;
    if(selected.has(id)) ids=[...selected];
    else { ids=[id]; setSelected(new Set([id])); }
    dragRef.current={
      ids,
      starts: Object.fromEntries(ids.map(tid=>{
        const t=card.tasks.find(x=>x.id===tid);
        return [tid,{x:t.x-w.x,y:t.y-w.y}];
      })),
    };
    e.preventDefault();
  };

  // ── resize start ──
  const onResizeStart=(id,e)=>{
    e.stopPropagation(); e.preventDefault();
    const task=card.tasks.find(t=>t.id===id);
    resizeRef.current={ id, startW:task.w||240, startH:task.h||130, startX:e.clientX, startY:e.clientY };
  };

  // ── global mouse move ──
  const onMove=useCallback((e)=>{
    if(selRef.current){
      const w=toWorld(e);
      const box={x1:selRef.current.x0,y1:selRef.current.y0,x2:w.x,y2:w.y};
      setSelBox(box);
      const hits=new Set(card.tasks.filter(t=>rectHit(t,box)).map(t=>t.id));
      setSelected(hits);
    }
    if(drawConnRef.current){
      const w=toWorld(e);
      setDrawConn(p=>({...p, x2:w.x, y2:w.y}));
    }
    if(dragRef.current){
      const dragInfo = dragRef.current;
      const w=toWorld(e);
      onUpdate({
        ...card,
        tasks:card.tasks.map(t=>{
          if(!dragInfo.ids.includes(t.id)) return t;
          const s=dragInfo.starts[t.id];
          return {...t, x:w.x+s.x, y:w.y+s.y};
        }),
      });
    }
    if(resizeRef.current){
      const r=resizeRef.current;
      const dx=(e.clientX-r.startX)/cam.zoom;
      const dy=(e.clientY-r.startY)/cam.zoom;
      onUpdate({
        ...card,
        tasks:card.tasks.map(t=>t.id===r.id?{...t,w:Math.max(TASK_MIN_W,r.startW+dx),h:Math.max(TASK_MIN_H,r.startH+dy)}:t),
      });
    }
  },[card,onUpdate,cam]);

  const onUp=useCallback((e)=>{
    if(drawConnRef.current && e && canvasRef.current) {
      const r=canvasRef.current.getBoundingClientRect();
      const wx = (e.clientX-r.left-cam.x)/cam.zoom, wy = (e.clientY-r.top-cam.y)/cam.zoom;
      const target = card.tasks.find(t=> wx>=t.x && wx<=t.x+(t.w||240) && wy>=t.y && wy<=t.y+(t.h||130));
      if(target && target.id !== drawConnRef.current.sourceId) {
        const a = drawConnRef.current.sourceId, b = target.id;
        const ex = card.connections?.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
        if(!ex) {
          onUpdate({...card,connections:[...(card.connections||[]),[a,b]]});
        } else {
          onUpdate({...card,connections:card.connections.filter(([x,y])=>!( (x===a&&y===b) || (x===b&&y===a) ))});
        }
      }
      setDrawConn(null);
      drawConnRef.current = null;
    }
    selRef.current=null; dragRef.current=null; resizeRef.current=null;
    setSelBox(null);
  },[card, onUpdate, cam]);

  useEffect(()=>{
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  },[onMove,onUp]);

  const toggleTask=(id)=>onUpdate({...card,tasks:card.tasks.map(t=>t.id===id?{...t,done:!t.done}:t)});

  const onConnStart=(id,e,side)=>{
    const w = toWorld(e);
    const task = card.tasks.find(t=>t.id===id);
    let x1, y1;
    if (side==="top") { x1=task.x+(task.w||240)/2; y1=task.y; }
    else if (side==="bottom") { x1=task.x+(task.w||240)/2; y1=task.y+(task.h||130); }
    else if (side==="left") { x1=task.x; y1=task.y+(task.h||130)/2; }
    else { x1=task.x+(task.w||240); y1=task.y+(task.h||130)/2; }
    drawConnRef.current = { sourceId: id, x1, y1, side };
    setDrawConn({ sourceId: id, x1, y1, x2: w.x, y2: w.y, side });
  };

  const addTask=({title,color})=>{
    const t={id:uid(),title,done:false,x:100+Math.random()*400,y:100+Math.random()*300,w:240,h:130,color};
    onUpdate({...card,tasks:[...card.tasks,t]});
    setShowAddTask(false);
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)", background:COLORS.surface, flexShrink:0 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:COLORS.white, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, padding:"6px 10px", borderRadius:6 }}>
          <ArrowBack size={18}/> Voltar
        </button>
        <div style={{ flex:1, textAlign:"center", fontFamily:"'Caveat',cursive", fontSize:26, color:colorDef.border, fontWeight:700 }}>{card.title}</div>
        <div style={{ display:"flex", gap:4 }}>
          {["canvas","board"].map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:6, border:"none", background:viewMode===m?"rgba(255,255,255,0.12)":"transparent", color:viewMode===m?COLORS.white:COLORS.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600 }}>
              {m==="canvas"?<MapIcon/>:<BoardIcon/>} {m==="canvas"?"Mapa":"Board"}
            </button>
          ))}
        </div>

        <button onClick={()=>setShowAddTask(true)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:6, border:"none", background:COLORS.accent, color:COLORS.white, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700 }}>
          <PlusIcon size={14}/> Tarefa
        </button>
      </div>

      {viewMode==="canvas" ? (
        <div ref={canvasRef} onMouseDown={onCanvasBgDown} style={{ flex:1, position:"relative", overflow:"hidden", background:COLORS.bg, cursor:"default" }}>
          <DotGrid cam={cam}/>
          {/* world layer */}
          <div style={{ position:"absolute", left:0, top:0, transform:`translate(${cam.x}px,${cam.y}px) scale(${cam.zoom})`, transformOrigin:"0 0" }}>
            <svg style={{ position:"absolute", left:0, top:0, width:9999, height:9999, pointerEvents:"none", zIndex:1 }}>
              {(card.connections||[]).map(([f,t],i)=>(
                <ConnectionLine key={i} from={f} to={t} tasks={card.tasks} color={colorDef.border}
                  isSelected={selectedConn?.from===f && selectedConn?.to===t}
                  onSelect={(e)=>{ e.stopPropagation(); setSelectedConn({from:f, to:t}); setSelected(new Set()); }}
                  onDelete={()=>{
                    onUpdate({...card,connections:card.connections.filter(([a,b])=>!(a===f&&b===t))});
                    setSelectedConn(null);
                  }}
                  onRedirectStart={(e)=>{
                    const w = toWorld(e);
                    const taskF = card.tasks.find(x=>x.id===f);
                    const taskT = card.tasks.find(x=>x.id===t);
                    if(taskF && taskT) {
                      const t1x = taskF.x+(taskF.w||240)/2, t1y = taskF.y+(taskF.h||130)/2;
                      const t2x = taskT.x+(taskT.w||240)/2, t2y = taskT.y+(taskT.h||130)/2;
                      const dx = t2x - t1x, dy = t2y - t1y;
                      let side;
                      if(Math.abs(dx)>Math.abs(dy)) side = dx>0?"right":"left";
                      else side = dy>0?"bottom":"top";
                      
                      let x1, y1;
                      if (side==="top") { x1=taskF.x+(taskF.w||240)/2; y1=taskF.y; }
                      else if (side==="bottom") { x1=taskF.x+(taskF.w||240)/2; y1=taskF.y+(taskF.h||130); }
                      else if (side==="left") { x1=taskF.x; y1=taskF.y+(taskF.h||130)/2; }
                      else { x1=taskF.x+(taskF.w||240); y1=taskF.y+(taskF.h||130)/2; }
                      
                      drawConnRef.current = { sourceId: f, x1, y1, side };
                      setDrawConn({ sourceId: f, x1, y1, x2: w.x, y2: w.y, side });
                      onUpdate({...card,connections:card.connections.filter(([a,b])=>!(a===f&&b===t))});
                      setSelectedConn(null);
                    }
                  }}
                />
              ))}
              {drawConn && (() => {
                const {x1, y1, x2, y2, side} = drawConn;
                let cx1, cy1, cx2, cy2;
                if (side==="left"||side==="right") {
                  const cDist = Math.max(Math.abs(x2 - x1) / 2, 40);
                  cx1 = x1 + (side==="right" ? cDist : -cDist); cy1 = y1;
                  cx2 = x2 + (side==="right" ? -cDist : cDist); cy2 = y2;
                } else {
                  const cDist = Math.max(Math.abs(y2 - y1) / 2, 40);
                  cx1 = x1; cy1 = y1 + (side==="bottom" ? cDist : -cDist);
                  cx2 = x2; cy2 = y2 + (side==="bottom" ? -cDist : cDist);
                }
                return (
                  <g>
                    <path d={`M${x1} ${y1} C${cx1} ${cy1},${cx2} ${cy2},${x2} ${y2}`} stroke={colorDef.border} strokeWidth="2.5" fill="none" strokeDasharray="7 5" opacity="0.8"/>
                    <circle cx={x2} cy={y2} r="5" fill={colorDef.border} opacity="0.8"/>
                  </g>
                );
              })()}
            </svg>
            {card.tasks.map(task=>{
              const tc=CARD_COLORS[task.color||0];
              return (
                <TaskPostIt key={task.id} task={task} colorDef={tc} selected={selected.has(task.id)}
                  onMouseDown={e=>onItemDown(task.id,e)}
                  onToggle={()=>toggleTask(task.id)}
                  onConnStart={onConnStart}
                  onResizeStart={e=>onResizeStart(task.id,e)}
                  onChangeTitle={(title)=>onUpdate({...card,tasks:card.tasks.map(t=>t.id===task.id?{...t,title}:t)})}
                />
              );
            })}
          </div>
          {/* selection box in screen space */}
          {selBox && (() => {
            const sx=selBox.x1*cam.zoom+cam.x, sy=selBox.y1*cam.zoom+cam.y;
            const ex=selBox.x2*cam.zoom+cam.x, ey=selBox.y2*cam.zoom+cam.y;
            return <SelectionBox box={{x1:sx,y1:sy,x2:ex,y2:ey}}/>;
          })()}
          <ZoomControls cam={cam} zoomTo={zoomTo} onFit={()=>fitToContent(card.tasks.map(t=>({x:t.x,y:t.y,w:t.w||240,h:t.h||130})))}/>
        </div>
      ) : (
        <div style={{ flex:1, overflow:"auto", padding:"0 24px" }}>
          <BoardView card={card} onToggleTask={toggleTask} onChangeTaskTitle={(id, title)=>onUpdate({...card,tasks:card.tasks.map(t=>t.id===id?{...t,title}:t)})}/>
        </div>
      )}
      {showAddTask&&<AddTaskModal onAdd={addTask} onClose={()=>setShowAddTask(false)}/>}
    </div>
  );
}

// ─────────────── Main App ───────────────
export default function App() {
  const [data,setData]=useState(INITIAL_DATA);
  const [openCardId,setOpenCardId]=useState(null);
  const [showAddCard,setShowAddCard]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [selBox,setSelBox]=useState(null);

  const canvasRef=useRef(null);
  const dragRef=useRef(null);
  const resizeRef=useRef(null);
  const selRef=useRef(null);
  const { cam, zoomTo, fitToContent } = useInfiniteCanvas(canvasRef);

  useEffect(()=>{
    if(data.cards.length>0) setTimeout(()=>fitToContent(data.cards.map(c=>({x:c.x,y:c.y,w:c.w||260,h:c.h||210}))),120);
  },[]);

  const toWorld=(e)=>{
    const r=canvasRef.current.getBoundingClientRect();
    return { x:(e.clientX-r.left-cam.x)/cam.zoom, y:(e.clientY-r.top-cam.y)/cam.zoom };
  };

  const onCanvasBgDown=(e)=>{
    if(e.button!==0||e.shiftKey) return;
    const w=toWorld(e);
    selRef.current={x0:w.x,y0:w.y};
    setSelBox({x1:w.x,y1:w.y,x2:w.x,y2:w.y});
    setSelected(new Set());
  };

  const onCardDown=(id,e)=>{
    if(e.button!==0||e.shiftKey) return;
    e.stopPropagation();
    const w=toWorld(e);
    let ids;
    if(selected.has(id)) ids=[...selected];
    else { ids=[id]; setSelected(new Set([id])); }
    dragRef.current={
      ids,
      starts:Object.fromEntries(ids.map(cid=>{
        const c=data.cards.find(x=>x.id===cid);
        return [cid,{x:c.x-w.x,y:c.y-w.y}];
      })),
    };
    e.preventDefault();
  };

  const onResizeStart=(id,e)=>{
    e.stopPropagation(); e.preventDefault();
    const card=data.cards.find(c=>c.id===id);
    resizeRef.current={id,startW:card.w||260,startH:card.h||210,startX:e.clientX,startY:e.clientY};
  };

  const onMove=useCallback((e)=>{
    if(selRef.current){
      const w=toWorld(e);
      const box={x1:selRef.current.x0,y1:selRef.current.y0,x2:w.x,y2:w.y};
      setSelBox(box);
      const hits=new Set(data.cards.filter(c=>rectHit(c,box)).map(c=>c.id));
      setSelected(hits);
    }
    if(dragRef.current){
      const dragInfo = dragRef.current;
      const w=toWorld(e);
      setData(prev=>({
        ...prev,
        cards:prev.cards.map(c=>{
          if(!dragInfo.ids.includes(c.id)) return c;
          const s=dragInfo.starts[c.id];
          return {...c,x:w.x+s.x,y:w.y+s.y};
        }),
      }));
    }
    if(resizeRef.current){
      const r=resizeRef.current;
      const dx=(e.clientX-r.startX)/cam.zoom;
      const dy=(e.clientY-r.startY)/cam.zoom;
      setData(prev=>({
        ...prev,
        cards:prev.cards.map(c=>c.id===r.id?{...c,w:Math.max(CARD_MIN_W,r.startW+dx),h:Math.max(CARD_MIN_H,r.startH+dy)}:c),
      }));
    }
  },[data,cam]);

  const onUp=useCallback(()=>{
    selRef.current=null; dragRef.current=null; resizeRef.current=null;
    setSelBox(null);
  },[]);

  useEffect(()=>{
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  },[onMove,onUp]);

  const addCard=({title,type,color})=>{
    const c={id:uid(),type,title,color,x:200+Math.random()*400,y:200+Math.random()*300,w:260,h:210,tasks:[],connections:type==="project"?[]:undefined};
    setData(p=>({...p,cards:[...p.cards,c]}));
    setShowAddCard(false);
  };

  const deleteCard=(id)=>setData(p=>({...p,cards:p.cards.filter(c=>c.id!==id)}));
  const updateCard=(u)=>setData(p=>({...p,cards:p.cards.map(c=>c.id===u.id?u:c)}));

  const openCard=openCardId?data.cards.find(c=>c.id===openCardId):null;

  if(openCard){
    return (
      <div style={{ width:"100%", height:"100vh", background:COLORS.bg, overflow:"hidden" }}>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <ProjectView card={openCard} colorDef={CARD_COLORS[openCard.color]} onBack={()=>setOpenCardId(null)} onUpdate={updateCard}/>
      </div>
    );
  }

  return (
    <div style={{ width:"100%", height:"100vh", background:COLORS.bg, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:COLORS.surface, flexShrink:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>🗂️</span>
          <span style={{ fontFamily:"'Caveat',cursive", fontSize:28, fontWeight:700, color:COLORS.white }}>Meu Mural</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {selected.size>0&&(
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:COLORS.muted, background:"rgba(58,134,255,0.15)", border:"1px solid rgba(58,134,255,0.3)", borderRadius:6, padding:"4px 10px" }}>
              {selected.size} selecionado{selected.size>1?"s":""}
            </span>
          )}
          <button onClick={()=>setShowAddCard(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, border:"none", background:COLORS.accent, color:COLORS.white, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 2px 12px rgba(233,69,96,0.3)" }}>
            <PlusIcon size={16}/> Novo Card
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} onMouseDown={onCanvasBgDown} style={{ flex:1, position:"relative", overflow:"hidden", background:COLORS.bg }}>
        <DotGrid cam={cam}/>

        <div style={{ position:"absolute", left:0, top:0, transform:`translate(${cam.x}px,${cam.y}px) scale(${cam.zoom})`, transformOrigin:"0 0" }}>
          {data.cards.map(card=>(
            <PostItCard key={card.id} card={card} colorDef={CARD_COLORS[card.color]} selected={selected.has(card.id)}
              onMouseDown={e=>onCardDown(card.id,e)}
              onOpen={()=>setOpenCardId(card.id)}
              onDelete={()=>deleteCard(card.id)}
              onResizeStart={e=>onResizeStart(card.id,e)}
              onUpdate={(newCard)=>updateCard(newCard)}
            />
          ))}
        </div>

        {/* selection box screen space */}
        {selBox && (()=>{
          const sx=selBox.x1*cam.zoom+cam.x, sy=selBox.y1*cam.zoom+cam.y;
          const ex=selBox.x2*cam.zoom+cam.x, ey=selBox.y2*cam.zoom+cam.y;
          return <SelectionBox box={{x1:sx,y1:sy,x2:ex,y2:ey}}/>;
        })()}

        {data.cards.length===0&&(
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:COLORS.muted, zIndex:5, pointerEvents:"none" }}>
            <span style={{ fontSize:48 }}>📌</span>
            <span style={{ fontFamily:"'Caveat',cursive", fontSize:24 }}>Seu mural está vazio!</span>
            <span style={{ fontSize:14 }}>Clique em "Novo Card" para começar</span>
          </div>
        )}

        <ZoomControls cam={cam} zoomTo={zoomTo} onFit={()=>fitToContent(data.cards.map(c=>({x:c.x,y:c.y,w:c.w||260,h:c.h||210})))}/>
      </div>

      {showAddCard&&<AddCardModal onAdd={addCard} onClose={()=>setShowAddCard(false)}/>}
    </div>
  );
}
