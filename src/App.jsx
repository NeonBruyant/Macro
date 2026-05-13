import { useState, useEffect, useRef, useCallback } from "react";

// ── TOKENS - Jacob Turner style ───────────────────────────────────────────────
const C = {
  bg:    "#E7DDDD",   // fond crème
  bg2:   "#DDD0D0",
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

// SVG icons - filaire minimaliste, lisible à petite taille
const NAV_ICONS = {
  // Tous - grille 2x2 simple
  tous:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  // Poulet - drumstick SVG original
  poulet:  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.02625 29.375C6.63466 28.8921 6.3559 28.3278 6.21036 27.7233C6.06481 27.1188 6.05615 26.4895 6.185 25.8813C5.56181 26.0041 4.91911 25.9868 4.30341 25.8307C3.68771 25.6747 3.11441 25.3836 2.625 24.9788C-0.491252 21.8625 4.35125 17.02 7.72 21.6038L11.4887 17.7625L14.1412 20.4138L10.375 24.2575C14.9875 27.5988 10.1437 32.5 7.02625 29.375Z"/><path d="M15.0875 21.3612L10.6687 16.94C8.30498 14.5775 18.7125 -5.15752 27.935 4.06498C37.2225 13.35 17.15 23.4225 15.0875 21.3612Z"/></svg>,
  // Bœuf - steak SVG original
  rouge:   <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.125 1.625C10.8098 1.625 7.63037 2.94196 5.28617 5.28617C2.94196 7.63037 1.625 10.8098 1.625 14.125V24.75C1.625 26.2418 2.21763 27.6726 3.27252 28.7275C4.32742 29.7824 5.75816 30.375 7.25 30.375C8.74184 30.375 10.1726 29.7824 11.2275 28.7275C12.2824 27.6726 12.875 26.2418 12.875 24.75C12.875 23.2582 13.4676 21.8274 14.5225 20.7725C15.5774 19.7176 17.0082 19.125 18.5 19.125H21.625C23.9456 19.125 26.1712 18.2031 27.8122 16.5622C29.4531 14.9212 30.375 12.6956 30.375 10.375C30.375 8.05436 29.4531 5.82876 27.8122 4.18782C26.1712 2.54687 23.9456 1.625 21.625 1.625H14.125Z"/><path d="M15.375 5.375C12.7229 5.375 10.1793 6.42857 8.30397 8.30393C6.42861 10.1793 5.37504 12.7228 5.37504 15.375V17.25C5.30881 18.1581 5.59754 19.0565 6.18043 19.7559C6.76332 20.4554 7.59489 20.9014 8.50004 21C11 21 8.64754 15.375 17.25 15.375H21.625C22.9511 15.375 24.2229 14.8482 25.1606 13.9105C26.0983 12.9729 26.625 11.7011 26.625 10.375C26.625 9.04892 26.0983 7.77715 25.1606 6.83947C24.2229 5.90178 22.9511 5.375 21.625 5.375H15.375Z"/><path d="M6 24.75C6 25.0815 6.1317 25.3995 6.36612 25.6339C6.60054 25.8683 6.91848 26 7.25 26C7.58152 26 7.89946 25.8683 8.13388 25.6339C8.3683 25.3995 8.5 25.0815 8.5 24.75C8.5 24.4185 8.3683 24.1005 8.13388 23.8661C7.89946 23.6317 7.58152 23.5 7.25 23.5C6.91848 23.5 6.60054 23.6317 6.36612 23.8661C6.1317 24.1005 6 24.4185 6 24.75Z"/></svg>,
  // Poisson - forme reconnaissable
  poisson: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12c0 0 2-5 7-5s8 5 8 5-3 5-8 5-7-5-7-5z"/><path d="M3 8c0 0 0 4 3 4"/><path d="M3 16c0 0 0-4 3-4"/><circle cx="17" cy="11.5" r="0.8" fill="currentColor" stroke="none"/></svg>,
  // Végé - feuille simple
  vege:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V11"/><path d="M12 11c0-4 3-8 9-9-1 6-4 9-9 9z"/><path d="M12 11c0-4-3-8-9-9 1 6 4 9 9 9z"/></svg>,
};

function matchNav(r, id) { return id==="tous" || r.proteinSource===id; }

const API_URL = "https://api.anthropic.com/v1/messages";

// ── DATA ──────────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    id:1, title:"PATATE DOUCE\nFARCIE BŒUF",
    photo:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
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
    photo:"https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80",
    tags:["BATCH COOKING"], proteinSource:"poulet",
    macros:{kcal:580,prot:48,gluc:68,lip:10},
    image:"🍚", costPerServing:4.50,
    description:"Fromage blanc en finition - crémeux sans les lipides.",
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
    photo:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80",
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
    photo:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
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
    photo:"https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80",
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
      {title:"RIZ",content:"Cuire al dente - finira au four."},
      {title:"CURRY",content:"Ail + gingembre + pâte curry + poulet. 5 min."},
      {title:"LÉGUMES",content:"Champignons + poivron + petits pois + lait de coco + soja. 5 min."},
      {title:"GRATIN",content:"Riz + préparation dans un plat. 20 min à 180°C."},
      {title:"SERVICE",content:"Coriandre fraîche."},
    ],
  },
  {
    id:6, title:"DAHL PATATE\nDOUCE COCO",
    photo:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
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
    photo:"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80",
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

const Logo = ({size=20, color="currentColor"}) => (
  <svg width={size} height={size*272/290} viewBox="0 0 290 272" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M88.2427 0L88.6452 0.171791C88.8954 1.28118 88.7825 10.9674 88.7818 12.8559L88.7933 183.501C85.689 186.193 81.4513 190.671 78.4753 193.646L0.720902 271.426L0.509234 271.372C-0.373391 269.97 0.15992 105.42 0.157405 88.1723C3.90605 84.1124 7.95584 80.1097 11.9018 76.2285C37.5166 51.0356 62.4921 25.0369 88.2427 0Z" fill={color}/>
    <path d="M203.721 81.5663C204.134 83.4088 203.883 101.105 203.876 104.439L203.865 163.373C231.749 192.015 261.128 220.592 289.389 248.987L167.644 249.001C159.414 241.102 151.001 232.409 142.901 224.312L102.02 183.368C112.357 172.476 124.321 160.997 135.005 150.313L203.721 81.5663Z" fill={color}/>
  </svg>
);

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [p,setP]=useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setP(1),300);
    const t2=setTimeout(()=>setP(2),1800);
    const t3=setTimeout(()=>onDone(),2400);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:p===2?0:1,transition:p===2?"opacity 0.5s":"none"}}>
      {/* picto centré */}
      <div style={{opacity:p>=0?1:0,transform:p>=0?"scale(1)":"scale(0.85)",transition:"opacity 0.6s, transform 0.6s cubic-bezier(.175,.885,.32,1.275)"}}>
        <Logo size={64} color={C.text}/>
      </div>
      {/* version en bas */}
      <div style={{position:"absolute",bottom:48,fontFamily:C.mono,fontSize:9,color:C.muted,letterSpacing:2,opacity:p>=1?1:0,transition:"opacity 0.5s 0.4s"}}>
        v1.0
      </div>
    </div>
  );
}

// ── BOTTOM SHEET ─────────────────────────────────────────────────────────────
function Sheet({ recipe, onClose }) {
  const innerRef  = useRef(null);
  const tabSwipeX = useRef(null);
  const tabSwipeY = useRef(null);
  const startY    = useRef(null);
  const [vis,     setVis]      = useState(false);
  const [closing, setClosing]  = useState(false);
  const [servings,setServings] = useState(recipe.baseServings);
  const [tab,     setTab]      = useState("ingredients");

  const TABS   = [{id:"ingredients",label:"INGRÉDIENTS"},{id:"steps",label:"PRÉPARATION"},{id:"shopping",label:"COURSES"}];
  const tabIdx = TABS.findIndex(t=>t.id===tab);
  const ratio  = servings/recipe.baseServings;

  useEffect(()=>{
    requestAnimationFrame(()=>setVis(true));
    document.body.style.overflow="hidden";
    return()=>{ document.body.style.overflow=""; };
  },[]);

  const close = useCallback(()=>{
    setClosing(true);
    setTimeout(onClose, 320);
  },[onClose]);

  // Drag handle to dismiss only
  const onHTS=(e)=>{ startY.current=e.touches[0].clientY; };
  const onHTM=(e)=>{};
  const onHTE=(e)=>{
    if(startY.current===null) return;
    const dy=e.changedTouches[0].clientY-startY.current;
    if(dy>80) close();
    startY.current=null;
  };

  // Tab swipe
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
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(15,15,15,0.3)",opacity:vis&&!closing?1:0,transition:"opacity 0.3s",backdropFilter:"blur(3px)"}}/>
      <div style={{
        position:"relative",zIndex:1,background:C.bg,
        borderRadius:"16px 16px 0 0",
        maxHeight:"92vh",display:"flex",flexDirection:"column",
        transform:vis&&!closing?"translateY(0)":"translateY(100%)",
        transition:"transform 0.35s cubic-bezier(.32,0,.15,1)",
      }}>
        {/* handle — drag zone */}
        <div onTouchStart={onHTS} onTouchMove={onHTM} onTouchEnd={onHTE}
          style={{padding:"12px 0 0",display:"flex",justifyContent:"center",flexShrink:0,cursor:"grab",touchAction:"none"}}>
          <div style={{width:32,height:3,borderRadius:2,background:C.light}}/>
        </div>

        {/* title */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px 12px",borderBottom:"1px solid "+C.light,flexShrink:0}}>
          <div style={{fontFamily:C.font,fontSize:13,fontWeight:800,color:C.text,letterSpacing:-0.3,textTransform:"uppercase",lineHeight:1,whiteSpace:"pre-line"}}>{recipe.title}</div>
          <div onClick={close} style={{fontFamily:C.font,fontSize:9,color:C.muted,letterSpacing:2,cursor:"pointer",textTransform:"uppercase",flexShrink:0,marginLeft:12}}>FERMER</div>
        </div>

        <div ref={innerRef} style={{overflowY:"auto",WebkitOverflowScrolling:"touch",flex:1}}>

          {/* MACROS */}
          <div style={{display:"flex",borderBottom:"1px solid "+C.light}}>
            {[
              {l:"PROTÉINES",v:recipe.macros.prot,u:"g"},
              {l:"GLUCIDES", v:recipe.macros.gluc,u:"g"},
              {l:"LIPIDES",  v:recipe.macros.lip, u:"g"},
              {l:"CALORIES", v:recipe.macros.kcal,u:""},
            ].map((m,i)=>(
              <div key={m.l} style={{width:"25%",borderRight:i<3?"1px solid "+C.light:"none",padding:"12px 0 10px 14px",boxSizing:"border-box"}}>
                <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{m.l}</div>
                <div style={{fontFamily:C.mono,fontSize:18,color:i===0?C.text:C.mid,lineHeight:1}}>{m.v}<span style={{fontFamily:C.font,fontSize:9,color:C.muted,marginLeft:1}}>{m.u}</span></div>
              </div>
            ))}
          </div>

          {/* PORTIONS */}
          <div style={{display:"flex",borderBottom:"1px solid "+C.light,height:56,overflow:"hidden"}}>
            <div style={{width:"62.5%",borderRight:"1px solid "+C.light,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 0 0 14px",boxSizing:"border-box",flexShrink:0}}>
              <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>PORTIONS</div>
              <div style={{fontFamily:C.font,fontSize:9,color:C.muted}}>Ajuste les quantités</div>
            </div>
            <div onClick={()=>setServings(s=>Math.max(1,s-1))}
              style={{width:"12.5%",borderRight:"1px solid "+C.light,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:20,color:C.text,cursor:"pointer",userSelect:"none",boxSizing:"border-box",flexShrink:0}}>-</div>
            <div style={{width:"12.5%",borderRight:"1px solid "+C.light,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:16,fontWeight:600,color:C.text,boxSizing:"border-box",flexShrink:0}}>{servings}</div>
            <div onClick={()=>setServings(s=>Math.min(12,s+1))}
              style={{width:"12.5%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:20,color:C.text,cursor:"pointer",userSelect:"none",boxSizing:"border-box",flexShrink:0}}>+</div>
          </div>

          {/* COÛT */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"12px 20px",borderBottom:"1px solid "+C.light}}>
            <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:1.5,textTransform:"uppercase"}}>COÛT / PORTION</div>
            <div style={{fontFamily:C.mono,fontSize:16,color:C.text}}>{"~"+recipe.costPerServing.toFixed(2)+" €"}</div>
          </div>

          {/* TABS */}
          <div onTouchStart={onTabTS} onTouchEnd={onTabTE}>
            <div style={{position:"relative",display:"flex",borderBottom:"1px solid "+C.light}}>
              <div style={{position:"absolute",bottom:-1,left:0,height:2,background:C.dark,width:"33.333%",transform:"translateX(calc("+tabIdx+" * 100%))",transition:"transform 0.28s cubic-bezier(.4,0,.2,1)"}}/>
              {TABS.map((t,i)=>(
                <div key={t.id} onClick={()=>setTab(t.id)}
                  style={{flex:1,padding:"11px 0",borderLeft:i>0?"1px solid "+C.light:"none",fontFamily:C.font,fontSize:8,fontWeight:700,color:tab===t.id?C.text:C.muted,cursor:"pointer",letterSpacing:2,textTransform:"uppercase",transition:"color 0.2s",textAlign:"center"}}>
                  {t.label}
                </div>
              ))}
            </div>

            <div style={{overflow:"hidden"}}>
              <div style={{display:"flex",width:"300%",transform:"translateX(calc(-"+(tabIdx*(100/3))+"%))",transition:"transform 0.3s cubic-bezier(.4,0,.2,1)"}}>

                <div style={{width:"33.333%",flexShrink:0}}>
                  {recipe.ingredients.map((ing,i)=>(
                    <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"13px 20px",borderBottom:"1px solid "+C.light}}>
                      <span style={{fontFamily:C.font,fontSize:13,color:C.text}}>{ing.name}</span>
                      <span style={{fontFamily:C.mono,fontSize:12,color:C.mid}}>{fmt(ing,ratio)}</span>
                    </div>
                  ))}
                </div>

                <div style={{width:"33.333%",flexShrink:0}}>
                  {(recipe.steps&&recipe.steps.length>0
                    ? recipe.steps
                    : [{title:"PRÉPARATION",content:recipe.assemblyNote||""}]
                  ).map((step,i)=>(
                    <div key={i} style={{display:"flex",borderBottom:"1px solid "+C.light}}>
                      <div style={{width:44,flexShrink:0,borderRight:"1px solid "+C.light,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:14}}>
                        <span style={{fontFamily:C.mono,fontSize:10,color:C.muted}}>{i<9?"0"+(i+1):i+1}</span>
                      </div>
                      <div style={{flex:1,padding:"13px 20px"}}>
                        <div style={{fontFamily:C.font,fontSize:8,fontWeight:700,color:C.text,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{step.title}</div>
                        <div style={{fontFamily:C.font,fontSize:13,color:C.mid,lineHeight:1.6}}>{step.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{width:"33.333%",flexShrink:0}}>
                  {recipe.ingredients.map((ing,i)=>(
                    <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"13px 20px",borderBottom:"1px solid "+C.light}}>
                      <span style={{fontFamily:C.font,fontSize:13,color:C.text}}>{ing.name}</span>
                      <span style={{fontFamily:C.mono,fontSize:12,color:C.mid}}>{fmt(ing,ratio)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 20px",borderTop:"2px solid "+C.dark}}>
                    <div style={{fontFamily:C.font,fontSize:7,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>TOTAL ESTIMÉ</div>
                    <div style={{fontFamily:C.mono,fontSize:20,color:C.text}}>{"~"+(recipe.costPerServing*servings).toFixed(2)+"€"}</div>
                  </div>
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
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Décris ce que tu veux - bowl saumon, poulet épicé, rapide..."
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

// ── RECIPE CARD - Product Passport style ─────────────────────────────────────
function RecipeCard({ r, onClick, i }) {
  return (
    <div onClick={()=>onClick(r)}
      style={{background:"transparent",borderRadius:0,overflow:"hidden",cursor:"pointer",marginBottom:16,animationName:"up",animationDuration:"0.35s",animationDelay:(i*0.05)+"s",animationFillMode:"both",WebkitTapHighlightColor:"transparent"}}>

      {/* main area - image left, title right */}
      <div style={{display:"flex",borderBottom:"1px solid "+C.light}}>
        <div style={{width:"25%",flexShrink:0,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,borderRight:"1px solid "+C.light,padding:"20px 0",boxSizing:"border-box"}}>
          {r.image}
        </div>
        <div style={{width:"75%",padding:"16px 16px 14px",boxSizing:"border-box"}}>
          <div style={{fontFamily:C.font,fontSize:7,fontWeight:600,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>
            {r.type==="assembly" ? "RECETTE RAPIDE" : "RECETTE"}
          </div>
          <div style={{fontFamily:C.font,fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.3,textTransform:"uppercase",lineHeight:0.95,marginBottom:10,whiteSpace:"pre-line"}}>{r.title}</div>
          <div style={{fontFamily:C.font,fontSize:11,color:C.mid,lineHeight:1.5}}>{r.description}</div>
        </div>
      </div>

      {/* macros strip */}
      <div style={{display:"flex",borderBottom:"1px solid "+C.light}}>
        {[
          {label:"PROTÉINES", value:r.macros.prot, unit:"g"},
          {label:"GLUCIDES",  value:r.macros.gluc, unit:"g"},
          {label:"LIPIDES",   value:r.macros.lip,  unit:"g"},
          {label:"CALORIES",  value:r.macros.kcal, unit:"kcal"},
        ].map((m,i)=>(
          <div key={m.label} style={{width:"25%",padding:"10px 0 10px 12px",borderRight:i<3?"1px solid "+C.light:"none",boxSizing:"border-box"}}>
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
  const scrollRef = useRef(null);

  const changeNav = (id) => {
    setNav(id);
    window.scrollTo({top:0, behavior:"smooth"});
  };

  useEffect(()=>{
    const l=document.createElement("link");
    l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  },[]);

  return (
    <>
      <style>{"@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0;} body{background:#E7DDDD;-webkit-font-smoothing:antialiased;} ::-webkit-scrollbar{width:0;} button{-webkit-tap-highlight-color:transparent;}"}</style>

      {splash&&<Splash onDone={()=>setSplash(false)}/>}

      <div ref={scrollRef} style={{minHeight:"100vh",background:C.bg,opacity:splash?0:1,transition:"opacity 0.4s 0.1s"}}>

        {/* TOP BAR */}
        <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(231,221,221,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid "+C.light,padding:"0 20px"}}>
          <div style={{maxWidth:480,margin:"0 auto",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Logo size={16} color={C.text}/>
              <div style={{fontFamily:C.font,fontSize:11,fontWeight:700,color:C.text,letterSpacing:4,textTransform:"uppercase"}}>KORAMACRO</div>
            </div>

          </div>
        </div>

        {/* SLIDING PANELS */}
        <div
          onTouchStart={e=>{navSwipeX.current=e.touches[0].clientX;navSwipeY.current=e.touches[0].clientY;}}
          onTouchEnd={e=>{
            if(navSwipeX.current===null) return;
            const dx=e.changedTouches[0].clientX-navSwipeX.current;
            const dy=Math.abs(e.changedTouches[0].clientY-(navSwipeY.current||0));
            if(Math.abs(dx)>60&&dy<80){
              if(dx<0&&navIdx<PROTEIN_NAV.length-1) changeNav(PROTEIN_NAV[navIdx+1].id);
              if(dx>0&&navIdx>0) changeNav(PROTEIN_NAV[navIdx-1].id);
            }
            navSwipeX.current=null;navSwipeY.current=null;
          }}
          style={{maxWidth:480,margin:"0 auto",overflow:"hidden"}}>
          <div style={{display:"flex",width:(PROTEIN_NAV.length*100)+"%",transform:"translateX(calc(-"+(navIdx*(100/PROTEIN_NAV.length))+"%))",transition:"transform 0.32s cubic-bezier(.4,0,.2,1)",alignItems:"flex-start"}}>
            {PROTEIN_NAV.map((n)=>{
              const panelRecipes=recipes.filter(r=>matchNav(r,n.id));
              return (
                <div key={n.id} style={{width:(100/PROTEIN_NAV.length)+"%",flexShrink:0,padding:"0 0 120px",display:"flex",flexDirection:"column",gap:0}}>
                  {panelRecipes.map((r,i)=><RecipeCard key={r.id} r={r} onClick={setSelected} i={i}/>)}

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV - Product Passport style */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:60,background:"rgba(231,221,221,0.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid "+C.light,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          {/* value row - sliding underline */}
          <div style={{position:"relative",display:"flex"}}>
            {/* sliding underline indicator */}
            <div style={{position:"absolute",bottom:0,left:"calc("+navIdx+" * 20%)",width:"20%",height:2,background:C.dark,transition:"left 0.28s cubic-bezier(.4,0,.2,1)"}}/>
            {PROTEIN_NAV.map((n,i)=>(
              <button key={n.id} onClick={()=>changeNav(n.id)}
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
