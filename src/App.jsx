import { useState, useEffect, useRef, useCallback } from "react";

// ── TOKENS — Jacob Turner style ───────────────────────────────────────────────
const C = {
  bg:    "#f0ede8",   // fond crème
  bg2:   "#e8e4de",
  card:  "#ffffff",
  dark:  "#0f0f0f",
  mid:   "#5a5a5a",
  light: "#d8d4ce",
  muted: "#9a9690",
  text:  "#0f0f0f",
  font:  "'Outfit', system-ui, sans-serif",
  mono:  "'DM Mono', monospace",
};

const PROTEIN_NAV = [
  {id:"tous",    label:"TOUS"},
  {id:"poulet",  label:"POULET"},
  {id:"rouge",   label:"BŒUF"},
  {id:"poisson", label:"POISSON"},
  {id:"vege",    label:"VÉGÉ"},
];

// SVG icons — filaire minimaliste, lisible à petite taille
const NAV_ICONS = {
  // Tous — grille 2x2 simple
  tous:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  // Poulet — deux cuisses côte à côte
  poulet:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4c1.5 0 3 1.5 3 4 0 1.5-.5 2.5-1.5 3L8 19H6l-1.5-8C3.5 10 3 9 3 7.5 3 5.5 4.5 4 6 4"/><circle cx="7" cy="3" r="1.2"/><path d="M16 4c1.5 0 3 1.5 3 3.5 0 1.5-.5 2.5-1.5 3L16 19h-2l-1.5-8C11.5 10 11 9 11 7.5 11 5.5 12.5 4 14 4"/><circle cx="15" cy="3" r="1.2"/></svg>,
  // Bœuf — tête de vache de face
  rouge:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c-4 0-7 3-7 7 0 3 2 5 5 6v1h4v-1c3-1 5-3 5-6 0-4-3-7-7-7z"/><path d="M4 6c-1-1-2-1-2 1s1 3 3 3"/><path d="M20 6c1-1 2-1 2 1s-1 3-3 3"/><circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M10 14c0 0 1 1 2 1s2-1 2-1"/><path d="M10 17h4"/></svg>,
  // Poisson — forme reconnaissable
  poisson: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12c0 0 2-5 7-5s8 5 8 5-3 5-8 5-7-5-7-5z"/><path d="M3 8c0 0 0 4 3 4"/><path d="M3 16c0 0 0-4 3-4"/><circle cx="17" cy="11.5" r="0.8" fill="currentColor" stroke="none"/></svg>,
  // Végé — feuille simple
  vege:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V11"/><path d="M12 11c0-4 3-8 9-9-1 6-4 9-9 9z"/><path d="M12 11c0-4-3-8-9-9 1 6 4 9 9 9z"/></svg>,
};

function matchNav(r, id) { return id==="tous" || r.proteinSource===id; }

const API_URL = "https://api.anthropic.com/v1/messages";

// ── DATA ──────────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    id:1, title:"PATATE DOUCE\nFARCIE BŒUF",
    tags:["PRISE DE MASSE"], proteinSource:"rouge",
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
      {title:"FOUR",content:"Piquer les patates douces. Enfourner à 200°C, 45–60 min."},
      {title:"BŒUF",content:"Saisir à feu vif 4–5 min jusqu'à coloration."},
      {title:"AROMATES",content:"Oignon + ail + paprika + herbes. Cuire 5 min à feu moyen."},
      {title:"TOMATE",content:"Purée de tomates, chauffer 3 min. Rectifier."},
      {title:"SAUCE",content:"Fromage blanc + herbes + sel + poivre."},
      {title:"SERVICE",content:"Fendre, garnir, fromage râpé, sriracha."},
    ],
  },
  {
    id:2, title:"RISOTTO POULET\nCHAMPIGNONS",
    tags:["BATCH COOKING"], proteinSource:"poulet",
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
      {title:"POULET",content:"Dés saisis à feu vif. Réserver."},
      {title:"BASE",content:"Oignon + ail dans l'huile, 3 min."},
      {title:"LÉGUMES",content:"Champignons + courgette en dés, 5 min. Thym."},
      {title:"RIZ",content:"Remuer 2 min jusqu'à transparence."},
      {title:"BOUILLON",content:"Louche par louche en remuant, 18 min."},
      {title:"FINITION",content:"Hors du feu : parmesan + fromage blanc + poulet."},
    ],
  },
  {
    id:3, title:"ROLL PAN\nFAJITAS POULET",
    tags:["BATCH COOKING"], proteinSource:"poulet",
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
      {title:"FOUR",content:"Préchauffer à 180°C."},
      {title:"POULET",content:"Dés + épices cajun + paprika, 6–7 min."},
      {title:"LÉGUMES",content:"Oignon + poivrons + tomates + ail + concentré. 5 min. Tiédir."},
      {title:"MONTAGE",content:"Wraps 10 sec micro. Fromage blanc + farce + feta + jalapeño. Rouler."},
      {title:"GRATIN",content:"Mozzarella. 20 min à 180°C."},
    ],
  },
  {
    id:4, title:"HOT HONEY\nBEEF BOWL",
    tags:["PRISE DE MASSE"], proteinSource:"rouge",
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
    id:5, title:"GRATIN THAÏ\nPOULET COCO",
    tags:["BATCH COOKING"], proteinSource:"poulet",
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
      {title:"RIZ",content:"Cuire al dente — finira au four."},
      {title:"CURRY",content:"Ail + gingembre + pâte curry + poulet. 5 min."},
      {title:"LÉGUMES",content:"Champignons + poivron + petits pois + lait de coco + soja. 5 min."},
      {title:"GRATIN",content:"Riz + préparation dans un plat. 20 min à 180°C."},
      {title:"SERVICE",content:"Coriandre fraîche."},
    ],
  },
  {
    id:6, title:"DAHL PATATE\nDOUCE COCO",
    tags:["VÉGÉTARIEN"], proteinSource:"vege",
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
      {title:"BASE",content:"Oignon + ail + gingembre 3 min. Épices 1 min."},
      {title:"LÉGUMES",content:"Patate douce en dés + tomates."},
      {title:"CUISSON",content:"Lentilles + lait de coco + eau. 20–25 min."},
      {title:"SERVICE",content:"Coriandre. Riz basmati à côté."},
    ],
  },
  {
    id:7, title:"WRAPS POULET\nBLÉ COMPLET",
    tags:["BATCH COOKING"], proteinSource:"poulet",
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
    const t1=setTimeout(()=>setP(1),400);
    const t2=setTimeout(()=>setP(2),2000);
    const t3=setTimeout(()=>onDone(),2700);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:C.bg,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"48px 24px",opacity:p===2?0:1,transition:p===2?"opacity 0.5s":"none"}}>
      <div style={{fontFamily:C.font,fontSize:11,fontWeight:600,color:C.muted,letterSpacing:4,textTransform:"uppercase",opacity:p>=0?1:0,transition:"opacity 0.6s"}}>
        KORAMARCO
      </div>
      <div style={{opacity:p>=1?1:0,transform:p>=1?"translateY(0)":"translateY(20px)",transition:"opacity 0.7s 0.3s, transform 0.7s 0.3s"}}>
        <div style={{fontFamily:C.font,fontSize:52,fontWeight:800,color:C.text,letterSpacing:-2,lineHeight:0.95,textTransform:"uppercase",marginBottom:24}}>
          NUTRITION.<br/>PERFORMANCE.<br/>RÉSULTATS.
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",opacity:p>=1?1:0,transition:"opacity 0.6s 0.5s"}}>
        <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>OBJECTIF PRISE DE MASSE</div>
        <div style={{fontFamily:C.mono,fontSize:9,color:C.muted}}>v1.0</div>
      </div>
    </div>
  );
}

// ── BOTTOM SHEET ──────────────────────────────────────────────────────────────
function Sheet({ recipe, onClose }) {
  const innerRef  = useRef(null);
  const handleY   = useRef(null);
  const tabSwipeX = useRef(null);
  const tabSwipeY = useRef(null);
  const [vis,setVis]           = useState(false);
  const [ty,setTy]             = useState(0);
  const [servings,setServings] = useState(recipe.baseServings);
  const [tab,setTab]           = useState("ingredients");

  const TABS = recipe.type==="full"
    ? [{id:"ingredients",label:"INGRÉDIENTS"},{id:"steps",label:"PRÉPARATION"},{id:"shopping",label:"COURSES"}]
    : [{id:"ingredients",label:"INGRÉDIENTS"},{id:"shopping",label:"COURSES"}];
  const tabIdx = TABS.findIndex(t=>t.id===tab);
  const ratio = servings/recipe.baseServings;

  useEffect(()=>{
    requestAnimationFrame(()=>setVis(true));
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow="";};
  },[]);

  const close=useCallback(()=>{setVis(false);setTimeout(onClose,320);},[onClose]);

  const onHandleTS=(e)=>{ handleY.current=e.touches[0].clientY; };
  const onHandleTM=(e)=>{
    if(!handleY.current) return;
    const dy=e.touches[0].clientY-handleY.current;
    if(dy>0) setTy(dy);
  };
  const onHandleTE=()=>{ if(ty>160) close(); else setTy(0); handleY.current=null; };

  const onTabTS=(e)=>{ tabSwipeX.current=e.touches[0].clientX; tabSwipeY.current=e.touches[0].clientY; };
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

  const fmt=(ing,r)=>{
    const q=ing.amount*r; const d=q%1===0?q:q.toFixed(1);
    return ing.unit?d+" "+ing.unit:String(d);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(15,15,15,0.3)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",zIndex:1,background:C.bg,borderRadius:"32px 32px 0 0",height:"94vh",display:"flex",flexDirection:"column",transform:"translateY("+(vis?ty:100)+"%)",transition:ty>0?"none":"transform 0.4s cubic-bezier(.32,0,.15,1)"}}>

        {/* handle */}
        <div onTouchStart={onHandleTS} onTouchMove={onHandleTM} onTouchEnd={onHandleTE}
          style={{padding:"14px 0 0",display:"flex",justifyContent:"center",flexShrink:0,cursor:"grab"}}>
          <div style={{width:36,height:3,borderRadius:2,background:C.light}}/>
        </div>

        <div ref={innerRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>

          {/* HEADER — Jacob Turner style: big type, lots of space */}
          <div style={{padding:"24px 24px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {recipe.tags.map(t=>(
                  <span key={t} style={{fontFamily:C.font,fontSize:8,fontWeight:600,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>{t}</span>
                ))}
                {recipe.type==="assembly"&&<span style={{fontFamily:C.font,fontSize:8,fontWeight:600,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>· RAPIDE</span>}
              </div>
              <button onClick={close} style={{background:"none",border:"none",fontFamily:C.font,fontSize:11,color:C.muted,letterSpacing:2,cursor:"pointer",textTransform:"uppercase"}}>FERMER</button>
            </div>

            {/* big emoji */}
            <div style={{fontSize:72,lineHeight:1,marginBottom:20}}>{recipe.image}</div>

            {/* big title */}
            <div style={{fontFamily:C.font,fontSize:42,fontWeight:800,color:C.text,letterSpacing:-1.5,lineHeight:0.95,textTransform:"uppercase",marginBottom:12,whiteSpace:"pre-line"}}>{recipe.title}</div>
            <div style={{fontFamily:C.font,fontSize:13,color:C.mid,lineHeight:1.6,marginBottom:32}}>{recipe.description}</div>

            {/* thin rule */}
            <div style={{height:1,background:C.light,marginBottom:24}}/>

            {/* MACROS — horizontal list, per portion */}
            <div style={{marginBottom:8}}>
              <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>PAR PORTION</div>
              <div style={{display:"flex",gap:0}}>
                {[
                  {l:"PROT",v:recipe.macros.prot,u:"g",hi:true},
                  {l:"GLUC",v:recipe.macros.gluc,u:"g"},
                  {l:"LIP", v:recipe.macros.lip, u:"g"},
                  {l:"KCAL",v:recipe.macros.kcal,u:""},
                ].map((m,i)=>(
                  <div key={m.l} style={{flex:1,borderLeft:i>0?"1px solid "+C.light:"none",paddingLeft:i>0?16:0}}>
                    <div style={{fontFamily:C.mono,fontSize:24,fontWeight:500,color:m.hi?C.text:C.mid,lineHeight:1}}>{m.v}{m.u&&<span style={{fontFamily:C.font,fontSize:10,color:C.muted,marginLeft:2}}>{m.u}</span>}</div>
                    <div style={{fontFamily:C.font,fontSize:8,color:C.muted,letterSpacing:2,marginTop:4,textTransform:"uppercase"}}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{height:1,background:C.light,margin:"24px 0"}}/>

            {/* COST */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:24}}>
              <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>COÛT / PORTION</div>
              <div style={{fontFamily:C.mono,fontSize:20,color:C.text}}>{"~"+recipe.costPerServing.toFixed(2)+" €"}</div>
            </div>

            {/* PORTIONS */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
              <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>PORTIONS</div>
              <div style={{display:"flex",alignItems:"center",gap:0}}>
                <button onClick={()=>setServings(s=>Math.max(1,s-1))} style={{width:36,height:36,borderRadius:"10px 0 0 10px",border:"1px solid "+C.light,borderRight:"none",background:C.card,color:C.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <div style={{width:48,height:36,background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:14,color:"#fff"}}>{servings}</div>
                <button onClick={()=>setServings(s=>Math.min(12,s+1))} style={{width:36,height:36,borderRadius:"0 10px 10px 0",border:"1px solid "+C.light,borderLeft:"none",background:C.card,color:C.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
            </div>

            {/* ASSEMBLY NOTE */}
            {recipe.type==="assembly"&&recipe.assemblyNote&&(
              <div style={{marginBottom:32,paddingLeft:16,borderLeft:"2px solid "+C.dark}}>
                <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>PRÉPARATION</div>
                <div style={{fontFamily:C.font,fontSize:14,color:C.mid,lineHeight:1.7}}>{recipe.assemblyNote}</div>
              </div>
            )}

            {/* TABS — underline style */}
            <div style={{position:"relative",display:"flex",borderBottom:"1px solid "+C.light,marginBottom:0}}>
              <div style={{
                position:"absolute",bottom:-1,left:0,height:2,background:C.dark,
                width:(100/TABS.length)+"%",
                transform:"translateX(calc("+tabIdx+" * 100%))",
                transition:"transform 0.28s cubic-bezier(.4,0,.2,1)",
              }}/>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{flex:1,padding:"12px 0",border:"none",background:"none",fontFamily:C.font,fontSize:9,fontWeight:700,color:tab===t.id?C.text:C.muted,cursor:"pointer",letterSpacing:2,textTransform:"uppercase",transition:"color 0.2s"}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* SLIDING TAB CONTENT */}
          <div onTouchStart={onTabTS} onTouchEnd={onTabTE} style={{overflow:"hidden"}}>
            <div style={{display:"flex",width:(TABS.length*100)+"%",transform:"translateX(calc(-"+(tabIdx*(100/TABS.length))+"%))",transition:"transform 0.3s cubic-bezier(.4,0,.2,1)"}}>

              {/* INGRÉDIENTS */}
              <div style={{width:(100/TABS.length)+"%",flexShrink:0,padding:"0 24px 40px"}}>
                {recipe.ingredients.map((ing,i)=>(
                  <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.light:"none"}}>
                    <span style={{fontFamily:C.font,fontSize:14,color:C.text}}>{ing.name}</span>
                    <span style={{fontFamily:C.mono,fontSize:12,color:C.mid}}>{fmt(ing,ratio)}</span>
                  </div>
                ))}
              </div>

              {/* PRÉPARATION */}
              {recipe.type==="full"&&(
                <div style={{width:(100/TABS.length)+"%",flexShrink:0,padding:"0 24px 40px"}}>
                  {recipe.steps&&recipe.steps.map((step,i)=>(
                    <div key={i} style={{display:"flex",gap:20,padding:"20px 0",borderBottom:i<recipe.steps.length-1?"1px solid "+C.light:"none"}}>
                      <div style={{fontFamily:C.mono,fontSize:11,color:C.muted,flexShrink:0,paddingTop:2}}>{i<9?"0"+(i+1):i+1}</div>
                      <div>
                        <div style={{fontFamily:C.font,fontSize:9,fontWeight:700,color:C.text,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{step.title}</div>
                        <div style={{fontFamily:C.font,fontSize:14,color:C.mid,lineHeight:1.65}}>{step.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COURSES */}
              <div style={{width:(100/TABS.length)+"%",flexShrink:0,padding:"0 24px 40px"}}>
                {recipe.ingredients.map((ing,i)=>(
                  <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.light:"none"}}>
                    <span style={{fontFamily:C.font,fontSize:14,color:C.text}}>{ing.name}</span>
                    <span style={{fontFamily:C.mono,fontSize:12,color:C.mid}}>{fmt(ing,ratio)}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",paddingTop:20,marginTop:8,borderTop:"2px solid "+C.dark}}>
                  <div style={{fontFamily:C.font,fontSize:9,fontWeight:700,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>TOTAL ESTIMÉ</div>
                  <div style={{fontFamily:C.mono,fontSize:22,color:C.text}}>{"~"+(recipe.costPerServing*servings).toFixed(2)+"€"}</div>
                </div>
              </div>

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
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(15,15,15,0.3)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",zIndex:1,background:C.bg,borderRadius:"32px 32px 0 0",padding:"32px 24px 48px",transform:vis?"translateY(0)":"translateY(100%)",transition:"transform 0.4s cubic-bezier(.32,0,.15,1)"}}>
        <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>NOUVELLE RECETTE</div>
        <div style={{fontFamily:C.font,fontSize:32,fontWeight:800,color:C.text,letterSpacing:-1,textTransform:"uppercase",lineHeight:1,marginBottom:24}}>GÉNÉRER<br/>VIA CLAUDE.</div>
        <div style={{height:1,background:C.light,marginBottom:24}}/>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Décris ce que tu veux — bowl saumon, poulet épicé, rapide..."
          style={{width:"100%",minHeight:80,border:"none",borderBottom:"1px solid "+C.light,padding:"0 0 12px",fontSize:14,fontFamily:C.font,resize:"none",outline:"none",background:"transparent",color:C.text,lineHeight:1.5}}/>
        {err&&<div style={{color:"#c0392b",fontSize:12,marginTop:6,fontFamily:C.font}}>{err}</div>}
        <button onClick={go} disabled={loading||!prompt.trim()}
          style={{width:"100%",marginTop:24,padding:"16px 0",background:loading?C.light:C.dark,color:loading?C.muted:"#fff",border:"none",borderRadius:50,fontSize:11,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:C.font,letterSpacing:3,textTransform:"uppercase",transition:"all 0.2s"}}>
          {loading?"GÉNÉRATION EN COURS…":"GÉNÉRER →"}
        </button>
      </div>
    </div>
  );
}

// ── RECIPE CARD — Product Passport style ─────────────────────────────────────
function RecipeCard({ r, onClick, i }) {
  return (
    <div onClick={()=>onClick(r)}
      style={{background:C.card,borderRadius:0,overflow:"hidden",cursor:"pointer",borderTop:"1px solid "+C.light,borderBottom:"1px solid "+C.light,animationName:"up",animationDuration:"0.35s",animationDelay:(i*0.05)+"s",animationFillMode:"both",WebkitTapHighlightColor:"transparent"}}>

      {/* main area — image left, title right */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+C.light}}>
        {/* image zone — same width as one macro cell (25%) */}
        <div style={{width:"25%",flexShrink:0,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,borderRight:"1px solid "+C.light,padding:"20px 0"}}>
          {r.image}
        </div>
        {/* title + desc */}
        <div style={{flex:1,padding:"16px 16px 14px"}}>
          {r.type==="assembly"&&(
            <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>RAPIDE</div>
          )}
          <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>RECETTE</div>
          <div style={{fontFamily:C.font,fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.3,textTransform:"uppercase",lineHeight:0.95,marginBottom:10,whiteSpace:"pre-line"}}>{r.title}</div>
          <div style={{fontFamily:C.font,fontSize:11,color:C.mid,lineHeight:1.5}}>{r.description}</div>
        </div>
      </div>

      {/* macros strip — 4 cells with labels above values like passport fields */}
      <div style={{display:"flex",borderBottom:"1px solid "+C.light}}>
        {[
          {label:"PROTÉINES", value:r.macros.prot, unit:"g"},
          {label:"GLUCIDES",  value:r.macros.gluc, unit:"g"},
          {label:"LIPIDES",   value:r.macros.lip,  unit:"g"},
          {label:"CALORIES",  value:r.macros.kcal, unit:"kcal"},
        ].map((m,i)=>(
          <div key={m.label} style={{flex:1,padding:"10px 0 10px 12px",borderLeft:i>0?"1px solid "+C.light:"none"}}>
            <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>{m.label}</div>
            <div style={{fontFamily:C.mono,fontSize:16,fontWeight:500,color:i===0?C.text:C.mid,lineHeight:1}}>{m.value}<span style={{fontFamily:C.font,fontSize:8,color:C.muted,marginLeft:1}}>{m.unit}</span></div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash,setSplash]     = useState(true);
  const [recipes,setRecipes]   = useState(RECIPES);
  const [selected,setSelected] = useState(null);
  const [modal,setModal]       = useState(false);
  const [nav,setNav]           = useState("tous");

  const navIdx    = PROTEIN_NAV.findIndex(n=>n.id===nav);
  const navSwipeX = useRef(null);
  const navSwipeY = useRef(null);

  useEffect(()=>{
    const l=document.createElement("link");
    l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  },[]);

  return (
    <>
      <style>{"@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0;} body{background:#f0ede8;-webkit-font-smoothing:antialiased;} ::-webkit-scrollbar{width:0;} button{-webkit-tap-highlight-color:transparent;}"}</style>

      {splash&&<Splash onDone={()=>setSplash(false)}/>}

      <div style={{minHeight:"100vh",background:C.bg,opacity:splash?0:1,transition:"opacity 0.4s 0.1s"}}>

        {/* TOP BAR */}
        <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(240,237,232,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid "+C.light,padding:"0 20px"}}>
          <div style={{maxWidth:480,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:C.font,fontSize:11,fontWeight:700,color:C.text,letterSpacing:4,textTransform:"uppercase"}}>KORAMARCO</div>
            <button onClick={()=>setModal(true)}
              style={{background:"none",border:"1px solid "+C.dark,borderRadius:50,padding:"6px 18px",fontSize:9,fontWeight:700,color:C.text,fontFamily:C.font,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=C.dark;e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=C.text;}}>
              + GÉNÉRER
            </button>
          </div>
        </div>

        {/* HERO */}
        <div style={{maxWidth:480,margin:"0 auto",padding:"32px 20px 16px"}}>
          <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>CARNET PERSONNEL</div>
          <div style={{fontFamily:C.font,fontSize:56,fontWeight:800,color:C.text,letterSpacing:-2,lineHeight:0.92,textTransform:"uppercase",marginBottom:16}}>
            MES<br/>RECETTES.
          </div>
          <div style={{height:1,background:C.light,marginBottom:12}}/>
          <div style={{fontFamily:C.font,fontSize:10,color:C.muted,letterSpacing:1,marginBottom:0}}>{recipes.length+" RECETTES  ·  OBJECTIF PRISE DE MASSE"}</div>
        </div>

        {/* SLIDING PANELS */}
        <div
          onTouchStart={e=>{navSwipeX.current=e.touches[0].clientX;navSwipeY.current=e.touches[0].clientY;}}
          onTouchEnd={e=>{
            if(navSwipeX.current===null) return;
            const dx=e.changedTouches[0].clientX-navSwipeX.current;
            const dy=Math.abs(e.changedTouches[0].clientY-(navSwipeY.current||0));
            if(Math.abs(dx)>60&&dy<80){
              if(dx<0&&navIdx<PROTEIN_NAV.length-1) setNav(PROTEIN_NAV[navIdx+1].id);
              if(dx>0&&navIdx>0) setNav(PROTEIN_NAV[navIdx-1].id);
            }
            navSwipeX.current=null;navSwipeY.current=null;
          }}
          style={{maxWidth:480,margin:"0 auto",overflow:"hidden"}}>
          <div style={{display:"flex",width:(PROTEIN_NAV.length*100)+"%",transform:"translateX(calc(-"+(navIdx*(100/PROTEIN_NAV.length))+"%))",transition:"transform 0.32s cubic-bezier(.4,0,.2,1)"}}>
            {PROTEIN_NAV.map((n)=>{
              const panelRecipes=recipes.filter(r=>matchNav(r,n.id));
              return (
                <div key={n.id} style={{width:(100/PROTEIN_NAV.length)+"%",flexShrink:0,padding:"0 0 120px",display:"flex",flexDirection:"column",gap:0}}>
                  {panelRecipes.map((r,i)=><RecipeCard key={r.id} r={r} onClick={setSelected} i={i}/>)}
                  <div onClick={()=>setModal(true)}
                    style={{borderRadius:0,padding:"32px 20px",display:"flex",flexDirection:"column",gap:12,cursor:"pointer",borderTop:"1px solid "+C.light,borderBottom:"1px solid "+C.light,WebkitTapHighlightColor:"transparent",transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg2}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{fontFamily:C.font,fontSize:9,fontWeight:600,color:C.muted,letterSpacing:3,textTransform:"uppercase"}}>NOUVELLE RECETTE</div>
                    <div style={{fontFamily:C.font,fontSize:28,fontWeight:800,color:C.text,letterSpacing:-0.5,textTransform:"uppercase",lineHeight:1}}>GÉNÉRER<br/>VIA CLAUDE.</div>
                    <div style={{display:"inline-flex",width:"fit-content",alignItems:"center",gap:8,background:C.dark,borderRadius:50,padding:"10px 20px",marginTop:4}}>
                      <span style={{fontFamily:C.font,fontSize:10,fontWeight:700,color:"#fff",letterSpacing:2,textTransform:"uppercase"}}>DÉMARRER</span>
                      <span style={{color:"rgba(255,255,255,0.4)"}}>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV — Product Passport style */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:60,background:"rgba(240,237,232,0.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid "+C.light,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          {/* value row — sliding underline */}
          <div style={{position:"relative",display:"flex"}}>
            {/* sliding underline indicator */}
            <div style={{position:"absolute",bottom:0,left:"calc("+navIdx+" * 20%)",width:"20%",height:2,background:C.dark,transition:"left 0.28s cubic-bezier(.4,0,.2,1)"}}/>
            {PROTEIN_NAV.map((n,i)=>(
              <button key={n.id} onClick={()=>setNav(n.id)}
                style={{flex:1,padding:"8px 0 10px",background:"none",cursor:"pointer",textAlign:"center",WebkitTapHighlightColor:"transparent",borderTop:"none",borderBottom:"none",borderRight:"none",borderLeft:i>0?"1px solid "+C.light:"none"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:nav===n.id?C.text:C.muted,transition:"color 0.2s"}}>{NAV_ICONS[n.id]}</div>
                  <div style={{fontFamily:C.font,fontSize:8,fontWeight:nav===n.id?700:400,color:nav===n.id?C.text:C.muted,letterSpacing:1,textTransform:"uppercase",transition:"all 0.2s",textAlign:"center"}}>{n.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected&&<Sheet recipe={selected} onClose={()=>setSelected(null)}/>}
      {modal&&<GenModal onClose={()=>setModal(false)} onAdd={r=>{setRecipes(p=>[...p,r]);}}/>}
    </>
  );
}
