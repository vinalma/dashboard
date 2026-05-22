import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#008080",
  surface: "#c0c0c0",
  accent: "#000080",
  accentSoft: "#1084d0",
  white: "#ffffff",
  black: "#000000",
  muted: "#808080",
  highlight: "#dfdfdf",
};

const CARD_COLORS = [
  { bg: "#c0c0c0", title: "#000080", text: "#000000", paper: "#ffffff" },
  { bg: "#c0c0c0", title: "#800000", text: "#000000", paper: "#ffffff" },
  { bg: "#c0c0c0", title: "#008000", text: "#000000", paper: "#ffffff" },
  { bg: "#c0c0c0", title: "#808000", text: "#000000", paper: "#ffffff" },
  { bg: "#c0c0c0", title: "#800080", text: "#000000", paper: "#ffffff" },
  { bg: "#c0c0c0", title: "#008080", text: "#000000", paper: "#ffffff" },
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

const WIN98_STYLES = {
  window: { background:"#c0c0c0", boxShadow:"inset -1px -1px #0a0a0a,inset 1px 1px #dfdfdf,inset -2px -2px grey,inset 2px 2px #fff" },
  button: { background:"#c0c0c0", boxShadow:"inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px grey,inset 2px 2px #dfdfdf", color:"#000", outline:"none", border:"none", fontFamily:"'MS Sans Serif', Tahoma, sans-serif", cursor:"pointer", padding:"2px 8px", fontSize: 12 },
  buttonActive: { background:"#c0c0c0", boxShadow:"inset -1px -1px #fff,inset 1px 1px #0a0a0a,inset -2px -2px #dfdfdf,inset 2px 2px grey", color:"#000", outline:"none", border:"none", fontFamily:"'MS Sans Serif', Tahoma, sans-serif", cursor:"pointer", padding:"3px 7px 1px 9px", fontSize: 12 },
  inset: { background:"#fff", boxShadow:"inset -1px -1px #fff,inset 1px 1px grey,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a" },
  titleBar: (color="#000080") => ({ background:color, color:"#fff", fontWeight:"bold", padding:"2px 4px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'MS Sans Serif', Tahoma, sans-serif", fontSize:12, letterSpacing:0 }),
  text: { fontFamily:"'MS Sans Serif', Tahoma, sans-serif", fontSize: 12, color: "#000" }
};



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

    if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'input') return;
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

function DotGrid({ cam }) {
  const s = 40 * cam.zoom;
  const ox = ((cam.x % s) + s) % s;
  const oy = ((cam.y % s) + s) % s;
  return (
    <div style={{ position:"absolute", inset:0, background:COLORS.bg, pointerEvents:"none", zIndex:0 }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="dg" x={ox} y={oy} width={s} height={s} patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1" height="1" fill="#000" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dg)" />
      </svg>
    </div>
  );
}

function ZoomControls({ cam, zoomTo, onFit }) {
  return (
    <div style={{ position:"absolute", bottom:16, right:16, zIndex:100, display:"flex", gap:4, ...WIN98_STYLES.window, padding:4 }}>
      <button style={WIN98_STYLES.button} onClick={() => zoomTo(cam.zoom*1.3)}>+</button>
      <button style={WIN98_STYLES.button} onClick={() => zoomTo(cam.zoom/1.3)}>-</button>
      <div style={{ padding:"0 8px", display:"flex", alignItems:"center", ...WIN98_STYLES.text, minWidth:42, justifyContent:"center" }}>
        {Math.round(cam.zoom*100)}%
      </div>
      <button style={WIN98_STYLES.button} onClick={onFit}>Fit</button>
    </div>
  );
}

function SelectionBox({ box }) {
  if (!box) return null;
  const x = Math.min(box.x1, box.x2), y = Math.min(box.y1, box.y2);
  const w = Math.abs(box.x2-box.x1), h = Math.abs(box.y2-box.y1);
  return (
    <div style={{
      position:"absolute", left:x, top:y, width:w, height:h, zIndex:999,
      border:"1px dotted #000", background:"transparent", pointerEvents:"none",
    }} />
  );
}

function ResizeHandle({ onResizeStart }) {
  return (
    <div
      onMouseDown={onResizeStart}
      style={{
        position:"absolute", right:2, bottom:2, width:12, height:12,
        cursor:"se-resize", zIndex:20,
        background: "repeating-linear-gradient(135deg, transparent, transparent 2px, #808080 2px, #808080 3px, #fff 3px, #fff 4px)"
      }}
    />
  );
}

function Window({ title, color, onClose, children, style, onTitleDown, isSelected }) {
  return (
    <div style={{ ...WIN98_STYLES.window, display:"flex", flexDirection:"column", padding:2, position:"absolute", zIndex: isSelected ? 10 : 1, ...style }}>
      <div onMouseDown={onTitleDown} style={{ ...WIN98_STYLES.titleBar(isSelected ? color : "#808080"), cursor: onTitleDown ? "grab" : "default" }}>
        <span style={{overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingLeft: 2}}>{title}</span>
        {onClose && (
          <button onClick={e=>{e.stopPropagation(); onClose();}} style={{ ...WIN98_STYLES.button, padding:"0 4px", marginLeft:4, fontWeight:"bold" }}>
            X
          </button>
        )}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:4, background: "#c0c0c0" }}>
        {children}
      </div>
    </div>
  );
}

function PostItCard({ card, colorDef, selected, onMouseDown, onOpen, onDelete, onResizeStart, onUpdate }) {
  const doneCount = card.tasks?.filter(t=>t.done).length||0;
  const totalCount = card.tasks?.length||0;
  return (
    <Window title={card.type==="project"?"Projeto: "+card.title:"Tarefas: "+card.title} color={colorDef.title} onClose={onDelete} onTitleDown={onMouseDown} isSelected={selected} style={{
      left:card.x, top:card.y, width:card.w||260, height:card.h||210,
    }}>
      <textarea
        value={card.title}
        onChange={e=>onUpdate?.({...card, title:e.target.value})}
        onMouseDown={e=>e.stopPropagation()}
        style={{ ...WIN98_STYLES.inset, ...WIN98_STYLES.text, fontSize:15, fontWeight:"bold", flex:1, resize:"none", padding:6, marginBottom:6, width: "100%", boxSizing: "border-box" }}
      />
      {totalCount>0 && (
        <div style={{ marginBottom:6, ...WIN98_STYLES.text }}>
          Concluído: {doneCount}/{totalCount}
        </div>
      )}
      <div style={{ display:"flex", gap:4 }}>
        <button onClick={e=>{e.stopPropagation();onOpen();}} style={{...WIN98_STYLES.button, flex:1, fontWeight: "bold"}}>
          Abrir
        </button>
      </div>
      <ResizeHandle onResizeStart={onResizeStart} />
    </Window>
  );
}

function ConnectionLine({ from, to, tasks, isSelected, onSelect, onDelete, onRedirectStart }) {
  const t1 = tasks.find(t=>t.id===from), t2 = tasks.find(t=>t.id===to);
  if (!t1||!t2) return null;
  const t1x = t1.x + (t1.w||240)/2, t1y = t1.y + (t1.h||130)/2;
  const t2x = t2.x + (t2.w||240)/2, t2y = t2.y + (t2.h||130)/2;
  const dx = t2x - t1x, dy = t2y - t1y;
  
  let x1, y1, x2, y2, cx1, cy1, cx2, cy2;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) { x1 = t1.x + (t1.w||240); y1 = t1y; x2 = t2.x; y2 = t2y; }
    else { x1 = t1.x; y1 = t1y; x2 = t2.x + (t2.w||240); y2 = t2y; }
    const cDist = Math.max(Math.abs(x2 - x1) / 2, 40);
    cx1 = x1 + (dx > 0 ? cDist : -cDist); cy1 = y1;
    cx2 = x2 + (dx > 0 ? -cDist : cDist); cy2 = y2;
  } else {
    if (dy > 0) { x1 = t1x; y1 = t1.y + (t1.h||130); x2 = t2x; y2 = t2.y; }
    else { x1 = t1x; y1 = t1.y; x2 = t2x; y2 = t2.y + (t2.h||130); }
    const cDist = Math.max(Math.abs(y2 - y1) / 2, 40);
    cx1 = x1; cy1 = y1 + (dy > 0 ? cDist : -cDist);
    cx2 = x2; cy2 = y2 + (dy > 0 ? -cDist : cDist);
  }

  const mx = 0.125*x1 + 0.375*cx1 + 0.375*cx2 + 0.125*x2;
  const my = 0.125*y1 + 0.375*cy1 + 0.375*cy2 + 0.125*y2;
  const color = "#000";

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
        stroke={isSelected ? "#fff" : color} strokeWidth={2}
        fill="none"
        style={{ pointerEvents:"none", filter: isSelected ? "drop-shadow(1px 1px 0 #000)" : "none" }}
      />
      {/* Target Arrow / Dot */}
      <rect x={x2-4} y={y2-4} width="8" height="8" fill={isSelected ? "#fff" : color} stroke={isSelected?"#000":"none"} style={{ pointerEvents:"none" }}/>

      {isSelected && (
        <>
          <foreignObject x={mx-14} y={my-14} width="28" height="28" style={{ pointerEvents:"auto" }}>
            <button
              onMouseDown={(e)=>{e.stopPropagation(); e.preventDefault(); onDelete();}}
              style={{ ...WIN98_STYLES.button, width:28, height:28, fontWeight:"bold" }}
            >
              X
            </button>
          </foreignObject>
          {/* Redirect Handle */}
          <rect
            x={x2-6} y={y2-6} width="12" height="12" fill="#fff" stroke="#000" strokeWidth="1"
            style={{ cursor:"grab", pointerEvents:"auto" }}
            onMouseDown={(e)=>{e.stopPropagation(); e.preventDefault(); onRedirectStart(e);}}
          />
        </>
      )}
    </g>
  );
}

function ConnectionHandle({ side, onConnStart }) {
  const styles = {
    top: { top: -6, left: "50%", transform: "translateX(-50%)" },
    bottom: { bottom: -6, left: "50%", transform: "translateX(-50%)" },
    left: { left: -6, top: "50%", transform: "translateY(-50%)" },
    right: { right: -6, top: "50%", transform: "translateY(-50%)" },
  };
  return (
    <div
      onMouseDown={(e)=>onConnStart(e)}
      style={{
        position:"absolute", ...styles[side],
        width:10, height:10, background:"#000", border:"1px solid #fff", cursor:"crosshair", zIndex:20
      }}
    />
  );
}

function TaskPostIt({ task, colorDef, selected, onMouseDown, onToggle, onConnStart, onResizeStart, onChangeTitle }) {
  return (
    <Window title={task.title || "Tarefa"} color={colorDef.title} onTitleDown={onMouseDown} isSelected={selected} style={{
      left:task.x, top:task.y, width:task.w||240, height:task.h||130,
    }}>
      <div style={{ display:"flex", gap:6, flex:1, marginBottom:4, background: "#c0c0c0" }}>
        <button onClick={e=>{e.stopPropagation();onToggle();}} style={{...WIN98_STYLES.inset, width:20, height:20, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0}}>
          {task.done && <span style={{fontWeight:"bold", fontSize:14}}>✓</span>}
        </button>
        <textarea
          value={task.title}
          onChange={e=>onChangeTitle?.(e.target.value)}
          onMouseDown={e=>e.stopPropagation()}
          style={{ ...WIN98_STYLES.inset, ...WIN98_STYLES.text, textDecoration:task.done?"line-through":"none", opacity:task.done?0.6:1, flex:1, resize:"none", padding:4 }}
        />
      </div>
      {["top","bottom","left","right"].map(side => (
        <ConnectionHandle key={side} side={side} onConnStart={(e)=>{e.stopPropagation(); e.preventDefault(); onConnStart(task.id,e,side);}} />
      ))}
      <ResizeHandle onResizeStart={onResizeStart} />
    </Window>
  );
}

function BoardView({ card, onToggleTask, onChangeTaskTitle }) {
  const todo = card.tasks.filter(t=>!t.done), done = card.tasks.filter(t=>t.done);
  return (
    <div style={{ display:"flex", gap:20, padding:"20px", background:COLORS.bg, minHeight:"100%", alignItems: "flex-start" }}>
      {[["A Fazer", todo, false], ["Concluído", done, true]].map(([label, items, isDone]) => (
        <Window key={label} title={`${label} (${items.length})`} color="#000080" style={{ flex:1, minWidth:220, position:"relative" }} isSelected={true}>
          {items.map(t=>{
            return (
              <div key={t.id} onClick={()=>onToggleTask(t.id)} style={{
                display:"flex", alignItems:"center", gap:10, marginBottom:8, cursor:"pointer",
                opacity:isDone?0.6:1
              }}>
                <div style={{...WIN98_STYLES.inset, width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  {isDone&&<span style={{fontWeight:"bold", fontSize:12}}>✓</span>}
                </div>
                <input
                  value={t.title}
                  onChange={e=>onChangeTaskTitle?.(t.id, e.target.value)}
                  onClick={e=>e.stopPropagation()}
                  style={{ ...WIN98_STYLES.text, background:"transparent", border:"1px dotted transparent", outline:"none", flex:1, textDecoration:isDone?"line-through":"none", padding:2 }}
                />
              </div>
            );
          })}
        </Window>
      ))}
    </div>
  );
}

function ModalDialog({ onClose, title, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 370, position: "relative" }}>
        <Window title={title} onClose={onClose} color="#000080" isSelected={true} style={{position:"relative"}}>
          <div style={{ padding: 12 }}>
            {children}
          </div>
        </Window>
      </div>
    </div>
  );
}

function AddCardModal({ onAdd, onClose }) {
  const [title,setTitle]=useState(""), [type,setType]=useState("tasks"), [color,setColor]=useState(0);
  return (
    <ModalDialog onClose={onClose} title="Novo Card">
      <div style={{...WIN98_STYLES.text, marginBottom: 4}}>Nome:</div>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"&&title.trim())onAdd({title:title.trim(),type,color});}}
        style={{ ...WIN98_STYLES.inset, ...WIN98_STYLES.text, width:"100%", padding:"4px", outline:"none", marginBottom:16, boxSizing:"border-box" }}
      />
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["tasks","project"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={type===t?WIN98_STYLES.buttonActive:WIN98_STYLES.button}>
            {t==="tasks"?"📋 Tarefas":"📁 Projeto"}
          </button>
        ))}
      </div>
      <div style={{...WIN98_STYLES.text, marginBottom: 4}}>Cor:</div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {CARD_COLORS.map((c,i)=>(
          <button key={i} onClick={()=>setColor(i)} style={{ width:24, height:24, background:c.title, border:color===i?`2px solid #000`:"2px solid transparent", cursor:"pointer", boxShadow:color===i?`0 0 0 1px #fff inset`:"none" }}/>
        ))}
      </div>
      <div style={{display:"flex", justifyContent:"flex-end", gap:8}}>
        <button onClick={()=>title.trim()&&onAdd({title:title.trim(),type,color})} disabled={!title.trim()} style={{ ...WIN98_STYLES.button, fontWeight:"bold" }}>OK</button>
        <button onClick={onClose} style={WIN98_STYLES.button}>Cancelar</button>
      </div>
    </ModalDialog>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [title,setTitle]=useState(""), [color,setColor]=useState(0);
  return (
    <ModalDialog onClose={onClose} title="Nova Tarefa">
      <div style={{...WIN98_STYLES.text, marginBottom: 4}}>Nome da Tarefa:</div>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"&&title.trim())onAdd({title:title.trim(),color});}}
        style={{ ...WIN98_STYLES.inset, ...WIN98_STYLES.text, width:"100%", padding:"4px", outline:"none", marginBottom:16, boxSizing:"border-box" }}
      />
      <div style={{...WIN98_STYLES.text, marginBottom: 4}}>Cor:</div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {CARD_COLORS.map((c,i)=>(
          <button key={i} onClick={()=>setColor(i)} style={{ width:24, height:24, background:c.title, border:color===i?`2px solid #000`:"2px solid transparent", cursor:"pointer", boxShadow:color===i?`0 0 0 1px #fff inset`:"none" }}/>
        ))}
      </div>
      <div style={{display:"flex", justifyContent:"flex-end", gap:8}}>
        <button onClick={()=>title.trim()&&onAdd({title:title.trim(),color})} disabled={!title.trim()} style={{ ...WIN98_STYLES.button, fontWeight:"bold" }}>OK</button>
        <button onClick={onClose} style={WIN98_STYLES.button}>Cancelar</button>
      </div>
    </ModalDialog>
  );
}

function rectHit(item, box) {
  const ix=item.x, iy=item.y, iw=item.w||260, ih=item.h||200;
  const bx=Math.min(box.x1,box.x2), by=Math.min(box.y1,box.y2);
  const bw=Math.abs(box.x2-box.x1), bh=Math.abs(box.y2-box.y1);
  return ix<bx+bw && ix+iw>bx && iy<by+bh && iy+ih>by;
}

function ProjectView({ card, colorDef, onBack, onUpdate }) {
  const [viewMode,setViewMode]=useState("canvas");
  const [showAddTask,setShowAddTask]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [selectedConn,setSelectedConn]=useState(null);
  const [selBox,setSelBox]=useState(null);
  const [drawConn, setDrawConn]=useState(null);

  const canvasRef=useRef(null);
  const drawConnRef=useRef(null);
  const dragRef=useRef(null);
  const resizeRef=useRef(null);
  const selRef=useRef(null);
  const { cam, zoomTo, fitToContent } = useInfiniteCanvas(canvasRef);

  useEffect(()=>{
    if(card.tasks.length>0) setTimeout(()=>fitToContent(card.tasks.map(t=>({x:t.x,y:t.y,w:t.w||240,h:t.h||130}))),60);
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
    setSelectedConn(null);
  };

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

  const onResizeStart=(id,e)=>{
    e.stopPropagation(); e.preventDefault();
    const task=card.tasks.find(t=>t.id===id);
    resizeRef.current={ id, startW:task.w||240, startH:task.h||130, startX:e.clientX, startY:e.clientY };
  };

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
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px", borderBottom:"2px solid #000", ...WIN98_STYLES.window, boxShadow:"none", zIndex:10 }}>
        <button onClick={onBack} style={{...WIN98_STYLES.button, fontWeight: "bold"}}>Voltar</button>
        <div style={{ flex:1, textAlign:"center", ...WIN98_STYLES.text, fontWeight:"bold" }}>{card.title}</div>
        <div style={{ display:"flex", gap:4 }}>
          {["canvas","board"].map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={viewMode===m?WIN98_STYLES.buttonActive:WIN98_STYLES.button}>
              {m==="canvas"?"Mapa":"Board"}
            </button>
          ))}
        </div>
        <button onClick={()=>setShowAddTask(true)} style={{...WIN98_STYLES.button, fontWeight:"bold"}}>
          Novo Item
        </button>
      </div>

      {viewMode==="canvas" ? (
        <div ref={canvasRef} onMouseDown={onCanvasBgDown} style={{ flex:1, position:"relative", overflow:"hidden", background:COLORS.bg, cursor:"default" }}>
          <DotGrid cam={cam}/>
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
                    <path d={`M${x1} ${y1} C${cx1} ${cy1},${cx2} ${cy2},${x2} ${y2}`} stroke="#000" strokeWidth="2" fill="none" />
                    <rect x={x2-4} y={y2-4} width="8" height="8" fill="#000" style={{ pointerEvents:"none" }}/>
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
          {selBox && (() => {
            const sx=selBox.x1*cam.zoom+cam.x, sy=selBox.y1*cam.zoom+cam.y;
            const ex=selBox.x2*cam.zoom+cam.x, ey=selBox.y2*cam.zoom+cam.y;
            return <SelectionBox box={{x1:sx,y1:sy,x2:ex,y2:ey}}/>;
          })()}
          <ZoomControls cam={cam} zoomTo={zoomTo} onFit={()=>fitToContent(card.tasks.map(t=>({x:t.x,y:t.y,w:t.w||240,h:t.h||130})))}/>
        </div>
      ) : (
        <div style={{ flex:1, overflow:"auto", background:COLORS.bg }}>
          <BoardView card={card} onToggleTask={toggleTask} onChangeTaskTitle={(id, title)=>onUpdate({...card,tasks:card.tasks.map(t=>t.id===id?{...t,title}:t)})}/>
        </div>
      )}
      {showAddTask&&<AddTaskModal onAdd={addTask} onClose={()=>setShowAddTask(false)}/>}
    </div>
  );
}

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
    const colorDef=CARD_COLORS[openCard.color||0];
    return <ProjectView card={openCard} colorDef={colorDef} onBack={()=>setOpenCardId(null)} onUpdate={updateCard}/>;
  }

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", fontFamily: WIN98_STYLES.text.fontFamily }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px", ...WIN98_STYLES.window, boxShadow:"none", borderBottom:"2px solid #000", zIndex:10 }}>
        <div style={{ ...WIN98_STYLES.text, fontWeight:"bold", marginLeft:8 }}>Mural OS 98</div>
        <button onClick={()=>setShowAddCard(true)} style={{...WIN98_STYLES.button, fontWeight:"bold"}}>Novo Card</button>
      </div>

      <div ref={canvasRef} onMouseDown={onCanvasBgDown} style={{ flex:1, position:"relative", overflow:"hidden", background:COLORS.bg, cursor:"default" }}>
        <DotGrid cam={cam}/>
        <div style={{ position:"absolute", left:0, top:0, transform:`translate(${cam.x}px,${cam.y}px) scale(${cam.zoom})`, transformOrigin:"0 0" }}>
          {data.cards.map(card=>{
            const tc=CARD_COLORS[card.color||0];
            return (
              <PostItCard key={card.id} card={card} colorDef={tc} selected={selected.has(card.id)}
                onMouseDown={e=>onCardDown(card.id,e)}
                onOpen={()=>setOpenCardId(card.id)} onDelete={()=>deleteCard(card.id)}
                onResizeStart={e=>onResizeStart(card.id,e)} onUpdate={updateCard}
              />
            );
          })}
        </div>
        {selBox && (() => {
          const sx=selBox.x1*cam.zoom+cam.x, sy=selBox.y1*cam.zoom+cam.y;
          const ex=selBox.x2*cam.zoom+cam.x, ey=selBox.y2*cam.zoom+cam.y;
          return <SelectionBox box={{x1:sx,y1:sy,x2:ex,y2:ey}}/>;
        })()}
        <ZoomControls cam={cam} zoomTo={zoomTo} onFit={()=>fitToContent(data.cards.map(c=>({x:c.x,y:c.y,w:c.w||260,h:c.h||210})))}/>
      </div>
      {showAddCard&&<AddCardModal onAdd={addCard} onClose={()=>setShowAddCard(false)}/>}
    </div>
  );
}
