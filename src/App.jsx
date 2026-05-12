import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:    "#1c1c1e",   // fond sombre global
  card:  "#f2f2f7",   // cards claires
  white: "#ffffff",
  dark:  "#1c1c1e",
  mid:   "#636366",
  light: "#e5e5ea",
  muted: "#8e8e93",
  text:  "#1c1c1e",
  pill:  "#e5e5ea",
  font:  "'Outfit', system-ui, sans-serif",
  mono:  "'DM Mono', monospace",
};

const PROTEIN_NAV = [
  {id:"tous",    label:"Tous"},
  {id:"poulet",  label:"Poulet"},
  {id:"rouge",   label:"Viande rouge"},
  {id:"poisson", label:"Poisson"},
  {id:"vege",    label:"Végétarien"},
];

function matchNav(r, id) {
  return id==="tous" || r.proteinSource===id;
}

const API_URL = "https://api.anthropic.com/v1/messages";

const RECIPES = [
  {
    id:1, title:"Patate Douce Farcie Bœuf",
    tags:["Prise de masse"], proteinSource:"rouge",
    macros:{kcal:595,prot:50,gluc:69,lip:14},
    image:"🍠", costPerServing:3.80,
    description:"Bœuf haché 5% + sauce fromage blanc herbée.",
    type:"full", baseServings:2,
    ingredients:[
      {id:"01",name:"Patate douce",amount:500,unit:"g"},
      {id:"02",name:"Bœuf haché 5%",amount:400,unit:"g"},
      {id:"03",name:"Oignon",amount:1,unit:""},
      {id:"04",name:"Gousses d'ail",amount:3,unit:""},
      {id:"05",name:"Paprika",amount:1,unit:"cs"},
      {id:"06",name:"Herbes de Provence",amount:1,unit:"cs"},
      {id:"07",name:"Purée de tomates",amount:100,unit:"g"},
      {id:"08",name:"Fromage râpé",amount:20,unit:"g"},
      {id:"09",name:"Huile d'olive",amount:1,unit:"cs"},
      {id:"10",name:"Sriracha",amount:1,unit:"cc"},
      {id:"11",name:"Fromage blanc",amount:100,unit:"g"},
      {id:"12",name:"Coriandre ou persil",amount:1,unit:"cs"},
    ],
    steps:[
      {title:"Four",content:"Piquer les patates douces. Enfourner à 200°C, 45–60 min."},
      {title:"Bœuf",content:"Saisir à feu vif 4–5 min jusqu'à coloration."},
      {title:"Aromates",content:"Oignon + ail + paprika + herbes. Cuire 5 min à feu moyen."},
      {title:"Tomate",content:"Purée de tomates, chauffer 3 min. Rectifier."},
      {title:"Sauce",content:"Fromage blanc + herbes + sel + poivre."},
      {title:"Service",content:"Fendre, garnir, fromage râpé, sriracha."},
    ],
  },
  {
    id:2, title:"Risotto Poulet Champignons",
    tags:["Batch cooking"], proteinSource:"poulet",
    macros:{kcal:580,prot:48,gluc:68,lip:10},
    image:"🍚", costPerServing:4.50,
    description:"Fromage blanc en finition — crémeux sans les lipides.",
    type:"full", baseServings:2,
    ingredients:[
      {id:"01",name:"Riz arborio",amount:160,unit:"g"},
      {id:"02",name:"Filets de poulet",amount:300,unit:"g"},
      {id:"03",name:"Champignons de Paris",amount:250,unit:"g"},
      {id:"04",name:"Bouillon de poulet",amount:700,unit:"ml"},
      {id:"05",name:"Oignon",amount:1,unit:""},
      {id:"06",name:"Gousses d'ail",amount:2,unit:""},
      {id:"07",name:"Parmesan râpé",amount:30,unit:"g"},
      {id:"08",name:"Fromage blanc 0%",amount:80,unit:"g"},
      {id:"09",name:"Huile d'olive",amount:1,unit:"cs"},
      {id:"10",name:"Courgette",amount:1,unit:""},
    ],
    steps:[
      {title:"Poulet",content:"Dés saisis à feu vif. Réserver."},
      {title:"Base",content:"Oignon + ail dans l'huile, 3 min."},
      {title:"Légumes",content:"Champignons + courgette en dés, 5 min. Thym."},
      {title:"Riz",content:"Remuer 2 min jusqu'à transparence."},
      {title:"Bouillon",content:"Louche par louche en remuant, 18 min."},
      {title:"Finition",content:"Hors du feu : parmesan + fromage blanc + poulet."},
    ],
  },
  {
    id:3, title:"Roll Pan Fajitas Poulet",
    tags:["Batch cooking"], proteinSource:"poulet",
    macros:{kcal:361,prot:31,gluc:42,lip:8},
    image:"🌯", costPerServing:2.20,
    description:"10 rouleaux batch au four. 4 jours au frigo.",
    type:"full", baseServings:10,
    ingredients:[
      {id:"01",name:"Wraps blé complet",amount:10,unit:""},
      {id:"02",name:"Blanc de poulet",amount:1000,unit:"g"},
      {id:"03",name:"Poivrons tricolores",amount:3,unit:""},
      {id:"04",name:"Oignon",amount:1,unit:""},
      {id:"05",name:"Gousses d'ail",amount:5,unit:""},
      {id:"06",name:"Tomates",amount:3,unit:""},
      {id:"07",name:"Paprika fumé",amount:1,unit:"cs"},
      {id:"08",name:"Épices cajun",amount:1,unit:"cs"},
      {id:"09",name:"Concentré de tomate",amount:2,unit:"cs"},
      {id:"10",name:"Fromage blanc 3,3%",amount:150,unit:"g"},
      {id:"11",name:"Feta",amount:90,unit:"g"},
      {id:"12",name:"Mozzarella râpée",amount:100,unit:"g"},
      {id:"13",name:"Jalapeño",amount:1,unit:""},
      {id:"14",name:"Huile d'olive",amount:1,unit:"cs"},
    ],
    steps:[
      {title:"Four",content:"Préchauffer à 180°C."},
      {title:"Poulet",content:"Dés + épices cajun + paprika, 6–7 min."},
      {title:"Légumes",content:"Oignon + poivrons + tomates + ail + concentré. 5 min. Tiédir."},
      {title:"Montage",content:"Wraps 10 sec micro. Fromage blanc + farce + feta + jalapeño. Rouler."},
      {title:"Gratin",content:"Mozzarella. 20 min à 180°C."},
    ],
  },
  {
    id:4, title:"Hot Honey Beef Bowl",
    tags:["Prise de masse"], proteinSource:"rouge",
    macros:{kcal:610,prot:46,gluc:55,lip:18},
    image:"🥩", costPerServing:5.20,
    description:"Bœuf haché, patate douce rôtie, avocat, sauce miel-sriracha.",
    type:"assembly",
    assemblyNote:"Rôtir la patate douce en dés (200°C, 25 min). Cuire le bœuf avec oignon + ail, finir avec miel-sriracha hors du feu. Assembler : riz → bœuf → patate → avocat. Sauce yaourt grec + cottage cheese.",
    baseServings:2,
    ingredients:[
      {id:"01",name:"Bœuf haché 5%",amount:400,unit:"g"},
      {id:"02",name:"Patate douce",amount:400,unit:"g"},
      {id:"03",name:"Avocat",amount:1,unit:""},
      {id:"04",name:"Riz basmati cuit",amount:200,unit:"g"},
      {id:"05",name:"Cottage cheese",amount:100,unit:"g"},
      {id:"06",name:"Yaourt grec 0%",amount:80,unit:"g"},
      {id:"07",name:"Miel",amount:1,unit:"cc"},
      {id:"08",name:"Sriracha",amount:1,unit:"cs"},
      {id:"09",name:"Paprika fumé",amount:1,unit:"cc"},
      {id:"10",name:"Oignon",amount:1,unit:""},
      {id:"11",name:"Gousses d'ail",amount:2,unit:""},
      {id:"12",name:"Huile d'olive",amount:1,unit:"cs"},
    ],
  },
  {
    id:5, title:"Gratin Thaï Poulet Coco",
    tags:["Batch cooking"], proteinSource:"poulet",
    macros:{kcal:520,prot:45,gluc:40,lip:16},
    image:"🥥", costPerServing:3.60,
    description:"Curry jaune, lait de coco light, riz basmati al dente.",
    type:"full", baseServings:2,
    ingredients:[
      {id:"01",name:"Filets de poulet",amount:700,unit:"g"},
      {id:"02",name:"Riz basmati",amount:150,unit:"g"},
      {id:"03",name:"Lait de coco light",amount:200,unit:"ml"},
      {id:"04",name:"Champignons",amount:150,unit:"g"},
      {id:"05",name:"Poivron rouge",amount:1,unit:""},
      {id:"06",name:"Petits pois surgelés",amount:100,unit:"g"},
      {id:"07",name:"Pâte de curry jaune",amount:1,unit:"cs"},
      {id:"08",name:"Sauce soja",amount:1,unit:"cs"},
      {id:"09",name:"Gousses d'ail",amount:3,unit:""},
      {id:"10",name:"Gingembre râpé",amount:1,unit:"cc"},
      {id:"11",name:"Huile d'olive",amount:1,unit:"cs"},
      {id:"12",name:"Coriandre fraîche",amount:1,unit:"cs"},
    ],
    steps:[
      {title:"Riz",content:"Cuire al dente — finira au four."},
      {title:"Curry",content:"Ail + gingembre + pâte curry + poulet. 5 min."},
      {title:"Légumes",content:"Champignons + poivron + petits pois + lait de coco + soja. 5 min."},
      {title:"Gratin",content:"Riz + préparation dans un plat. 20 min à 180°C."},
      {title:"Service",content:"Coriandre fraîche."},
    ],
  },
  {
    id:6, title:"Dahl Patate Douce Coco",
    tags:["Végétarien"], proteinSource:"vege",
    macros:{kcal:490,prot:22,gluc:65,lip:12},
    image:"🫘", costPerServing:1.80,
    description:"Lentilles corail, patate douce, lait de coco. Comfort food clean.",
    type:"full", baseServings:4,
    ingredients:[
      {id:"01",name:"Lentilles corail",amount:250,unit:"g"},
      {id:"02",name:"Patate douce",amount:400,unit:"g"},
      {id:"03",name:"Lait de coco light",amount:400,unit:"ml"},
      {id:"04",name:"Tomates concassées",amount:400,unit:"g"},
      {id:"05",name:"Oignon",amount:1,unit:""},
      {id:"06",name:"Gousses d'ail",amount:3,unit:""},
      {id:"07",name:"Gingembre râpé",amount:1,unit:"cs"},
      {id:"08",name:"Curry",amount:2,unit:"cc"},
      {id:"09",name:"Cumin",amount:1,unit:"cc"},
      {id:"10",name:"Curcuma",amount:1,unit:"cc"},
      {id:"11",name:"Huile d'olive",amount:1,unit:"cs"},
      {id:"12",name:"Coriandre fraîche",amount:1,unit:"cs"},
    ],
    steps:[
      {title:"Base",content:"Oignon + ail + gingembre 3 min. Épices 1 min."},
      {title:"Légumes",content:"Patate douce en dés + tomates."},
      {title:"Cuisson",content:"Lentilles + lait de coco + eau. 20–25 min."},
      {title:"Service",content:"Coriandre. Riz basmati à côté."},
    ],
  },
  {
    id:7, title:"Wraps Poulet Blé Complet",
    tags:["Batch cooking"], proteinSource:"poulet",
    macros:{kcal:361,prot:31,gluc:38,lip:8},
    image:"🫓", costPerServing:2.90,
    description:"Farce poulet-poivrons, sauce fromage blanc, gratinés.",
    type:"assembly",
    assemblyNote:"Faire revenir poulet + ail + oignon + épices (7–8 min). Poivrons, 4 min. Wraps 10 sec micro. Fromage blanc + farce, rouler serré. Mozzarella + four 15–20 min à 180°C.",
    baseServings:4,
    ingredients:[
      {id:"01",name:"Wraps blé complet",amount:4,unit:""},
      {id:"02",name:"Filets de poulet",amount:500,unit:"g"},
      {id:"03",name:"Poivrons",amount:2,unit:""},
      {id:"04",name:"Oignon",amount:1,unit:""},
      {id:"05",name:"Gousses d'ail",amount:3,unit:""},
      {id:"06",name:"Fromage blanc 3,3%",amount:120,unit:"g"},
      {id:"07",name:"Paprika fumé",amount:1,unit:"cs"},
      {id:"08",name:"Cumin",amount:1,unit:"cc"},
      {id:"09",name:"Mozzarella râpée",amount:60,unit:"g"},
      {id:"10",name:"Huile d'olive",amount:1,unit:"cs"},
    ],
  },
];

async function generateRecipe(prompt) {
  const sys = "Assistant nutrition prise de masse. JSON ONLY no backticks. Schema: {\"title\":\"\",\"tags\":[\"\"],\"proteinSource\":\"poulet|rouge|poisson|vege\",\"macros\":{\"kcal\":0,\"prot\":0,\"gluc\":0,\"lip\":0},\"image\":\"emoji\",\"description\":\"\",\"type\":\"full\",\"costPerServing\":3.5,\"baseServings\":2,\"ingredients\":[{\"id\":\"01\",\"name\":\"\",\"amount\":0,\"unit\":\"\"}],\"steps\":[{\"title\":\"\",\"content\":\"\"}],\"assemblyNote\":\"\"}";
  const res = await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content:prompt}]})});
  const data = await res.json();
  const text = data.content?.find(b=>b.type==="text")?.text||"";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [p,setP]=useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setP(1),500);
    const t2=setTimeout(()=>setP(2),2000);
    const t3=setTimeout(()=>onDone(),2700);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",opacity:p===2?0:1,transition:p===2?"opacity 0.6s":"none"}}>
      <div style={{textAlign:"center",opacity:p>=0?1:0,transition:"opacity 0.7s"}}>
        <div style={{fontFamily:C.font,fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.3)",letterSpacing:6,textTransform:"uppercase",marginBottom:14}}>Nutrition · Performance</div>
        <div style={{fontFamily:C.font,fontSize:42,fontWeight:700,color:"#fff",letterSpacing:4,textTransform:"uppercase"}}>KORAMARCO</div>
        <div style={{width:28,height:1,background:"rgba(255,255,255,0.2)",margin:"18px auto 0",opacity:p>=1?1:0,transition:"opacity 0.5s 0.4s"}}/>
      </div>
    </div>
  );
}

// ── SHEET ─────────────────────────────────────────────────────────────────────
function Sheet({ recipe, onClose }) {
  const innerRef   = useRef(null);
  const handleY    = useRef(null);
  const tabSwipeX  = useRef(null);
  const tabSwipeY  = useRef(null);
  const [vis,setVis]           = useState(false);
  const [ty,setTy]             = useState(0);
  const [servings,setServings] = useState(recipe.baseServings);
  const [tab,setTab]           = useState("ingredients");

  const TABS = recipe.type==="full"
    ? [{id:"ingredients",label:"Ingrédients"},{id:"steps",label:"Préparation"},{id:"shopping",label:"Courses"}]
    : [{id:"ingredients",label:"Ingrédients"},{id:"shopping",label:"Courses"}];
  const tabIdx = TABS.findIndex(t=>t.id===tab);

  useEffect(()=>{
    requestAnimationFrame(()=>setVis(true));
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow="";};
  },[]);

  const close=useCallback(()=>{setVis(false);setTimeout(onClose,320);},[onClose]);

  // Drag to dismiss — ONLY on the handle bar
  const onHandleTS=(e)=>{ handleY.current=e.touches[0].clientY; };
  const onHandleTM=(e)=>{
    if(!handleY.current) return;
    const dy=e.touches[0].clientY-handleY.current;
    if(dy>0) setTy(dy);
  };
  const onHandleTE=()=>{
    if(ty>160) close(); else setTy(0);
    handleY.current=null;
  };

  // Swipe tabs — ONLY on the tab content zone
  const onTabTS=(e)=>{
    tabSwipeX.current=e.touches[0].clientX;
    tabSwipeY.current=e.touches[0].clientY;
  };
  const onTabTE=(e)=>{
    if(tabSwipeX.current===null) return;
    const dx=e.changedTouches[0].clientX-tabSwipeX.current;
    const dy=Math.abs(e.changedTouches[0].clientY-tabSwipeY.current);
    if(Math.abs(dx)>50&&dy<60){
      if(dx<0&&tabIdx<TABS.length-1) setTab(TABS[tabIdx+1].id);
      if(dx>0&&tabIdx>0) setTab(TABS[tabIdx-1].id);
    }
    tabSwipeX.current=null; tabSwipeY.current=null;
  };

  // Keep empty handlers to avoid breaking existing refs
  const onTS=()=>{}; const onTM=()=>{}; const onTE=()=>{};

  const ratio=servings/recipe.baseServings;
  const fmt=(ing,r)=>{
    const q=ing.amount*r;
    const d=q%1===0?q:q.toFixed(1);
    return ing.unit?d+" "+ing.unit:String(d);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(8px)"}}/>
      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{position:"relative",zIndex:1,background:C.bg,borderRadius:"48px 48px 0 0",height:"94vh",display:"flex",flexDirection:"column",transform:"translateY("+(vis?ty:100)+"%)",transition:ty>0?"none":"transform 0.4s cubic-bezier(.32,0,.15,1)"}}>

        {/* handle — drag to dismiss */}
        <div
          onTouchStart={onHandleTS} onTouchMove={onHandleTM} onTouchEnd={onHandleTE}
          style={{padding:"16px 0 8px",display:"flex",justifyContent:"center",flexShrink:0,cursor:"grab"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/>
        </div>

        <div ref={innerRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 6px 50px"}}>

          {/* MAIN CARD — white, huge radius */}
          <div style={{background:C.white,borderRadius:48,overflow:"hidden",marginBottom:8}}>

            {/* image zone */}
            <div style={{background:"#f0f0f5",height:220,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <div style={{fontSize:90,lineHeight:1,filter:"drop-shadow(0 8px 20px rgba(0,0,0,0.1))"}}>{recipe.image}</div>
              <button onClick={close} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.08)",border:"none",color:C.text,fontSize:15,width:30,height:30,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              {/* tag pills */}
              <div style={{position:"absolute",top:14,left:14,display:"flex",gap:5}}>
                {recipe.tags.slice(0,1).map(t=>(
                  <span key={t} style={{fontFamily:C.font,fontSize:9,fontWeight:500,color:C.mid,background:"rgba(255,255,255,0.85)",padding:"4px 10px",borderRadius:20,letterSpacing:0.5}}>{t}</span>
                ))}
                {recipe.type==="assembly"&&<span style={{fontFamily:C.font,fontSize:9,fontWeight:500,color:C.mid,background:"rgba(255,255,255,0.85)",padding:"4px 10px",borderRadius:20,letterSpacing:0.5}}>Rapide</span>}
              </div>
            </div>

            {/* text zone */}
            <div style={{padding:"20px 20px 24px"}}>
              <div style={{fontFamily:C.font,fontSize:22,fontWeight:600,color:C.text,lineHeight:1.15,marginBottom:6}}>{recipe.title}</div>
              <div style={{fontFamily:C.font,fontSize:13,color:C.muted,lineHeight:1.55,marginBottom:20}}>{recipe.description}</div>

              {/* MACROS — par portion */}
              <div style={{marginBottom:6}}>
                <div style={{fontFamily:C.font,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Par portion</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                  {[
                    {l:"Protéines",v:recipe.macros.prot,u:"g",hi:true},
                    {l:"Glucides", v:recipe.macros.gluc,u:"g"},
                    {l:"Lipides",  v:recipe.macros.lip, u:"g"},
                    {l:"Calories", v:recipe.macros.kcal,u:"kcal"},
                  ].map(m=>(
                    <div key={m.l} style={{background:m.hi?C.dark:C.card,borderRadius:14,padding:"11px 4px",textAlign:"center"}}>
                      <div style={{fontFamily:C.mono,fontSize:16,fontWeight:500,color:m.hi?"#fff":C.text,lineHeight:1}}>{m.v}</div>
                      <div style={{fontFamily:C.font,fontSize:8,color:m.hi?"rgba(255,255,255,0.4)":C.muted,marginTop:3,textTransform:"uppercase",letterSpacing:0.5}}>{m.u}</div>
                      <div style={{fontFamily:C.font,fontSize:8,color:m.hi?"rgba(255,255,255,0.35)":C.muted,marginTop:1}}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* cost */}
              <div style={{marginTop:10,background:C.card,borderRadius:14,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:C.font,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Coût / portion</span>
                <span style={{fontFamily:C.mono,fontSize:16,fontWeight:500,color:C.text}}>{"~"+recipe.costPerServing.toFixed(2)+" €"}</span>
              </div>
            </div>
          </div>

          {/* PORTIONS CARD */}
          <div style={{background:C.white,borderRadius:48,padding:"16px 20px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:C.font,fontSize:13,fontWeight:600,color:C.text}}>Portions</div>
              <div style={{fontFamily:C.font,fontSize:11,color:C.muted,marginTop:2}}>Ajuste les quantités</div>
            </div>
            <div style={{display:"flex",alignItems:"center"}}>
              <button onClick={()=>setServings(s=>Math.max(1,s-1))} style={{width:36,height:36,borderRadius:"12px 0 0 12px",border:"1px solid "+C.light,borderRight:"none",background:C.white,color:C.text,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300}}>−</button>
              <div style={{width:48,height:36,background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:15,color:"#fff",fontWeight:500}}>{servings}</div>
              <button onClick={()=>setServings(s=>Math.min(12,s+1))} style={{width:36,height:36,borderRadius:"0 12px 12px 0",border:"1px solid "+C.light,borderLeft:"none",background:C.white,color:C.text,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300}}>+</button>
            </div>
          </div>

          {/* ASSEMBLY NOTE */}
          {recipe.type==="assembly"&&recipe.assemblyNote&&(
            <div style={{background:C.white,borderRadius:48,padding:"18px 20px",marginBottom:8,borderLeft:"3px solid "+C.dark}}>
              <div style={{fontFamily:C.font,fontSize:10,fontWeight:700,color:C.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Préparation</div>
              <div style={{fontFamily:C.font,fontSize:13,color:C.mid,lineHeight:1.7}}>{recipe.assemblyNote}</div>
            </div>
          )}

          {/* TABS CARD */}
          <div style={{background:C.white,borderRadius:48,overflow:"hidden"}}>
            {/* tab bar */}
            <div style={{display:"flex",padding:"6px 6px 0",gap:3}}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{flex:1,padding:"9px 6px",borderRadius:"16px 16px 0 0",border:"none",fontFamily:C.font,fontSize:11,fontWeight:600,color:tab===t.id?C.text:C.muted,background:tab===t.id?C.card:"transparent",cursor:"pointer",transition:"all 0.15s",letterSpacing:0.3}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div
              onTouchStart={onTabTS} onTouchEnd={onTabTE}
              style={{background:C.card,margin:"0 6px 6px",borderRadius:20,padding:"4px 0"}}>
              {tab==="ingredients"&&recipe.ingredients.map((ing,i)=>(
                <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.white:"none"}}>
                  <span style={{fontFamily:C.font,fontSize:14,color:C.text}}>{ing.name}</span>
                  <span style={{fontFamily:C.mono,fontSize:12,fontWeight:500,color:C.text}}>{fmt(ing,ratio)}</span>
                </div>
              ))}

              {tab==="steps"&&recipe.steps&&recipe.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:14,padding:"14px 16px",borderBottom:i<recipe.steps.length-1?"1px solid "+C.white:"none",alignItems:"flex-start"}}>
                  <div style={{fontFamily:C.mono,fontSize:12,color:C.muted,flexShrink:0,marginTop:1,width:22}}>{i<9?"0"+(i+1):i+1}</div>
                  <div>
                    <div style={{fontFamily:C.font,fontSize:10,fontWeight:700,color:C.text,letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>{step.title}</div>
                    <div style={{fontFamily:C.font,fontSize:13,color:C.mid,lineHeight:1.6}}>{step.content}</div>
                  </div>
                </div>
              ))}

              {tab==="shopping"&&(
                <div>
                  {recipe.ingredients.map((ing,i)=>(
                    <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.white:"none"}}>
                      <span style={{fontFamily:C.font,fontSize:14,color:C.text}}>{ing.name}</span>
                      <span style={{fontFamily:C.mono,fontSize:12,fontWeight:500,color:C.text}}>{fmt(ing,ratio)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:C.dark,borderRadius:"0 0 20px 20px",marginTop:0}}>
                    <span style={{fontFamily:C.font,fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:1,textTransform:"uppercase"}}>Total estimé</span>
                    <span style={{fontFamily:C.mono,fontSize:18,color:"#fff",fontWeight:500}}>{"~"+(recipe.costPerServing*servings).toFixed(2)+" €"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── GENERATE MODAL ────────────────────────────────────────────────────────────
function GenModal({ onClose, onAdd }) {
  const [prompt,setPrompt]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [vis,setVis]=useState(false);
  useEffect(()=>requestAnimationFrame(()=>setVis(true)),[]);
  const close=()=>{setVis(false);setTimeout(onClose,300);};
  const go=async()=>{
    if(!prompt.trim())return;
    setLoading(true);setErr("");
    try{const r=await generateRecipe(prompt);r.id=Date.now();onAdd(r);close();}
    catch{setErr("Erreur. Réessaie.");}
    finally{setLoading(false);}
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative",zIndex:1,background:C.bg,borderRadius:"48px 48px 0 0",padding:"24px 16px 44px",transform:vis?"translateY(0)":"translateY(100%)",transition:"transform 0.4s cubic-bezier(.32,0,.15,1)"}}>
        <div style={{background:C.white,borderRadius:24,padding:"20px 18px 24px"}}>
          <div style={{fontFamily:C.font,fontSize:20,fontWeight:600,color:C.text,marginBottom:4}}>Nouvelle recette</div>
          <div style={{fontFamily:C.font,fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.5}}>Décris ce que tu veux — KoraMarco génère la recette.</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ex: bowl saumon-avocat haute protéine…"
            style={{width:"100%",minHeight:80,borderRadius:16,border:"1px solid "+C.light,padding:"12px 14px",fontSize:13,fontFamily:C.font,resize:"none",outline:"none",boxSizing:"border-box",color:C.text,background:C.card}}/>
          {err&&<div style={{color:"#ff3b30",fontSize:12,marginTop:6,fontFamily:C.font}}>{err}</div>}
          <button onClick={go} disabled={loading||!prompt.trim()}
            style={{width:"100%",marginTop:12,padding:"14px 0",background:loading?C.light:C.dark,color:loading?C.muted:"#fff",border:"none",borderRadius:50,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:C.font,letterSpacing:0.5,transition:"all 0.2s"}}>
            {loading?"Génération en cours…":"Générer →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RECIPE CARD ───────────────────────────────────────────────────────────────
function RecipeCard({ r, onClick, i }) {
  return (
    <div onClick={()=>onClick(r)}
      style={{background:C.white,borderRadius:48,overflow:"hidden",cursor:"pointer",animationName:"up",animationDuration:"0.35s",animationDelay:(i*0.05)+"s",animationFillMode:"both",WebkitTapHighlightColor:"transparent"}}>

      {/* image zone — light bg */}
      <div style={{background:"#f0f0f5",height:200,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <div style={{fontSize:80,lineHeight:1,filter:"drop-shadow(0 6px 16px rgba(0,0,0,0.1))"}}>{r.image}</div>
        {r.type==="assembly"&&(
          <span style={{position:"absolute",top:12,left:12,fontFamily:C.font,fontSize:9,fontWeight:500,color:C.muted,background:"rgba(255,255,255,0.9)",padding:"4px 10px",borderRadius:20}}>Rapide</span>
        )}
        <div style={{position:"absolute",bottom:12,right:12,background:"rgba(255,255,255,0.9)",borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"baseline",gap:3}}>
          <span style={{fontFamily:C.mono,fontSize:12,fontWeight:500,color:C.text}}>{"~"+r.costPerServing.toFixed(2)+"€"}</span>
          <span style={{fontFamily:C.font,fontSize:9,color:C.muted}}>/pers</span>
        </div>
      </div>

      {/* content */}
      <div style={{padding:"18px 18px 20px"}}>
        {/* macro pills — style "300mg 600mg" */}
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{fontFamily:C.font,fontSize:10,fontWeight:600,color:C.text,background:C.pill,padding:"4px 10px",borderRadius:20}}>{r.macros.prot+"g prot"}</span>
          <span style={{fontFamily:C.font,fontSize:10,color:C.mid,background:C.pill,padding:"4px 10px",borderRadius:20}}>{r.macros.gluc+"g gluc"}</span>
          <span style={{fontFamily:C.font,fontSize:10,color:C.mid,background:C.pill,padding:"4px 10px",borderRadius:20}}>{r.macros.kcal+" kcal"}</span>
        </div>

        <div style={{fontFamily:C.font,fontSize:19,fontWeight:600,color:C.text,lineHeight:1.2,marginBottom:6}}>{r.title}</div>
        <div style={{fontFamily:C.font,fontSize:12,color:C.muted,lineHeight:1.5,marginBottom:18}}>{r.description}</div>

        {/* CTA pill */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.dark,borderRadius:50,padding:"10px 18px"}}>
          <span style={{fontFamily:C.font,fontSize:12,fontWeight:600,color:"#fff"}}>Voir la recette</span>
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>→</span>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash,setSplash]   = useState(true);
  const [recipes,setRecipes] = useState(RECIPES);
  const [selected,setSelected] = useState(null);
  const [modal,setModal]     = useState(false);
  const [nav,setNav]         = useState("tous");

  const navIdx = PROTEIN_NAV.findIndex(n=>n.id===nav);
  const navSwipeX = useRef(null);
  const navSwipeY = useRef(null);

  useEffect(()=>{
    const l=document.createElement("link");
    l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  },[]);

  const filtered=recipes.filter(r=>matchNav(r,nav));

  return (
    <>
      <style>{"@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0;} body{background:#1c1c1e;-webkit-font-smoothing:antialiased;} ::-webkit-scrollbar{width:0;} button{-webkit-tap-highlight-color:transparent;}"}</style>

      {splash&&<Splash onDone={()=>setSplash(false)}/>}

      <div style={{minHeight:"100vh",background:C.bg,opacity:splash?0:1,transition:"opacity 0.4s 0.1s"}}>

        {/* TOP BAR */}
        <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(28,28,30,0.95)",backdropFilter:"blur(20px)",padding:"0 16px"}}>
          <div style={{maxWidth:480,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:C.font,fontSize:15,fontWeight:700,color:"#fff",letterSpacing:3,textTransform:"uppercase"}}>KoraMarco</div>
            <button onClick={()=>setModal(true)}
              style={{background:C.white,color:C.dark,border:"none",borderRadius:50,padding:"7px 16px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:C.font,letterSpacing:1,textTransform:"uppercase"}}>
              + Générer
            </button>
          </div>

          {/* NAV PILLS */}
          <div style={{maxWidth:480,margin:"0 auto",display:"flex",gap:5,paddingBottom:10,overflowX:"auto"}}>
            {PROTEIN_NAV.map(n=>(
              <button key={n.id} onClick={()=>setNav(n.id)}
                style={{padding:"6px 14px",borderRadius:50,border:"none",whiteSpace:"nowrap",background:nav===n.id?C.white:"rgba(255,255,255,0.1)",color:nav===n.id?C.dark:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:nav===n.id?700:400,cursor:"pointer",fontFamily:C.font,letterSpacing:0.3,transition:"all 0.18s",flexShrink:0}}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* CARDS — swipe horizontal to change category */}
        <div
          onTouchStart={e=>{navSwipeX.current=e.touches[0].clientX; navSwipeY.current=e.touches[0].clientY;}}
          onTouchEnd={e=>{
            if(navSwipeX.current===null) return;
            const dx=e.changedTouches[0].clientX-navSwipeX.current;
            const dy=Math.abs(e.changedTouches[0].clientY-(navSwipeY.current||0));
            if(Math.abs(dx)>60&&dy<80){
              if(dx<0&&navIdx<PROTEIN_NAV.length-1) setNav(PROTEIN_NAV[navIdx+1].id);
              if(dx>0&&navIdx>0) setNav(PROTEIN_NAV[navIdx-1].id);
            }
            navSwipeX.current=null; navSwipeY.current=null;
          }}
          style={{maxWidth:480,margin:"0 auto",padding:"12px 6px 32px",display:"flex",flexDirection:"column",gap:6}}>

          {/* section header */}
          <div style={{padding:"8px 4px 4px"}}>
            <div style={{fontFamily:C.font,fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase"}}>{filtered.length+" recette"+(filtered.length>1?"s":"")}</div>
          </div>

          {filtered.map((r,i)=><RecipeCard key={r.id} r={r} onClick={setSelected} i={i}/>)}

          {/* generate card */}
          <div onClick={()=>setModal(true)}
            style={{background:"rgba(255,255,255,0.06)",borderRadius:48,padding:"28px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,cursor:"pointer",border:"1px solid rgba(255,255,255,0.08)",transition:"background 0.2s",WebkitTapHighlightColor:"transparent"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
            <div style={{fontFamily:C.font,fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase"}}>Nouvelle recette</div>
            <div style={{background:C.white,borderRadius:50,padding:"10px 20px",display:"inline-flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:C.font,fontSize:12,fontWeight:600,color:C.dark}}>Via Claude AI</span>
              <span style={{color:"rgba(0,0,0,0.3)",fontSize:11}}>→</span>
            </div>
          </div>
        </div>
      </div>

      {selected&&<Sheet recipe={selected} onClose={()=>setSelected(null)}/>}
      {modal&&<GenModal onClose={()=>setModal(false)} onAdd={r=>{setRecipes(p=>[...p,r]);}}/>}
    </>
  );
}
