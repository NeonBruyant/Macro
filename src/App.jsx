import { useState, useEffect, useRef, useCallback } from "react";

// ── TOKENS (no template literals used in JSX styles) ──────────────────────────
const C = {
  bg:      "#f2ede6",
  bg2:     "#e8e1d8",
  card:    "#faf8f5",
  dark:    "#18160f",
  mid:     "#7a756e",
  light:   "#ddd7ce",
  accent:  "#c04a20",
  text:    "#18160f",
  t2:      "#6e6860",
  t3:      "#b0a89e",
  font:    "'Cormorant Garamond', Georgia, serif",
  sans:    "'Outfit', system-ui, sans-serif",
  mono:    "'DM Mono', monospace",
};

const CARD_COLORS = [
  {bg:"#d4c4a8",text:"#3a2e1a"},
  {bg:"#b8cfc0",text:"#1a3028"},
  {bg:"#c4a8a8",text:"#3a1a1a"},
  {bg:"#a8b8cc",text:"#1a2838"},
  {bg:"#c8c0a0",text:"#302818"},
  {bg:"#b0c8b0",text:"#182818"},
  {bg:"#c8b0c0",text:"#301828"},
];

function getBudgetLabel(c) {
  if (c < 2) return "< 2 €";
  if (c <= 4) return "2 – 4 €";
  return "4 € +";
}

const BUDGET_TAGS = ["Tous prix","< 2 €","2 – 4 €","4 € +"];
const ALL_TAGS    = ["Tous","Prise de masse","Batch cooking","Viande rouge","Végétarien","Équilibré"];
const API_URL     = "https://api.anthropic.com/v1/messages";

// ── DATA ──────────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    id:1, title:"Patate Douce\nFarcie Bœuf",
    tags:["Prise de masse","Viande rouge"],
    macros:{kcal:595,prot:50,gluc:69,lip:14},
    image:"🍠", cardColor:CARD_COLORS[0], costPerServing:3.80,
    description:"Bœuf haché 5%, sauce fromage blanc herbée.",
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
    id:2, title:"Risotto Poulet\nChampignons",
    tags:["Prise de masse","Batch cooking"],
    macros:{kcal:580,prot:48,gluc:68,lip:10},
    image:"🍚", cardColor:CARD_COLORS[1], costPerServing:4.50,
    description:"Fromage blanc en finition pour le crémeux sans les lipides.",
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
    id:3, title:"Roll Pan\nFajitas Poulet",
    tags:["Prise de masse","Batch cooking"],
    macros:{kcal:361,prot:31,gluc:42,lip:8},
    image:"🌯", cardColor:CARD_COLORS[2], costPerServing:2.20,
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
      {title:"Montage",content:"Wraps 10 sec micro. Fromage blanc + farce + feta + jalapeño. Rouler serré."},
      {title:"Gratin",content:"Mozzarella. 20 min à 180°C."},
    ],
  },
  {
    id:4, title:"Hot Honey\nBeef Bowl",
    tags:["Prise de masse","Viande rouge"],
    macros:{kcal:610,prot:46,gluc:55,lip:18},
    image:"🥩", cardColor:CARD_COLORS[3], costPerServing:5.20,
    description:"Bœuf haché, patate douce rôtie, avocat, sauce miel-sriracha.",
    type:"assembly",
    assemblyNote:"Rôtir la patate douce en dés (200°C, 25 min). Cuire le bœuf avec oignon + ail, finir avec miel-sriracha hors du feu. Assembler : riz → bœuf → patate → avocat. Sauce yaourt grec + cottage cheese par-dessus.",
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
    id:5, title:"Gratin Thaï\nPoulet Coco",
    tags:["Batch cooking","Équilibré"],
    macros:{kcal:520,prot:45,gluc:40,lip:16},
    image:"🥥", cardColor:CARD_COLORS[4], costPerServing:3.60,
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
    id:6, title:"Dahl Patate\nDouce Coco",
    tags:["Végétarien","Batch cooking"],
    macros:{kcal:490,prot:22,gluc:65,lip:12},
    image:"🫘", cardColor:CARD_COLORS[5], costPerServing:1.80,
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
    id:7, title:"Wraps Poulet\nBlé Complet",
    tags:["Batch cooking","Équilibré"],
    macros:{kcal:361,prot:31,gluc:38,lip:8},
    image:"🫓", cardColor:CARD_COLORS[6], costPerServing:2.90,
    description:"Farce poulet-poivrons, sauce fromage blanc, gratinés.",
    type:"assembly",
    assemblyNote:"Faire revenir poulet + ail + oignon + épices (7–8 min). Ajouter poivrons, 4 min. Wraps 10 sec micro. Fromage blanc + farce, rouler serré. Mozzarella + four 15–20 min à 180°C.",
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

// ── AI ────────────────────────────────────────────────────────────────────────
async function generateRecipe(prompt) {
  const sys = "Assistant nutrition prise de masse. Reponds en JSON ONLY no backticks no markdown. Schema: {\"title\":\"\",\"tags\":[\"\"],\"macros\":{\"kcal\":0,\"prot\":0,\"gluc\":0,\"lip\":0},\"image\":\"emoji\",\"description\":\"\",\"type\":\"full\",\"costPerServing\":3.5,\"baseServings\":2,\"ingredients\":[{\"id\":\"01\",\"name\":\"\",\"amount\":0,\"unit\":\"\"}],\"steps\":[{\"title\":\"\",\"content\":\"\"}],\"assemblyNote\":\"\"}";
  const res = await fetch(API_URL, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content:prompt}]})
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type==="text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setP(1), 500);
    const t2 = setTimeout(() => setP(2), 2100);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",opacity:p===2?0:1,transition:p===2?"opacity 0.65s":"none"}}>
      <div style={{textAlign:"center",opacity:p>=0?1:0,transform:p>=0?"translateY(0)":"translateY(20px)",transition:"opacity 0.8s, transform 0.8s"}}>
        <div style={{fontFamily:C.font,fontSize:68,fontWeight:400,color:"#f2ede6",letterSpacing:3,lineHeight:1}}>KM</div>
        <div style={{fontFamily:C.font,fontSize:18,fontWeight:300,color:"#f2ede6",letterSpacing:10,marginTop:10,opacity:p>=1?1:0,transition:"opacity 0.7s 0.3s"}}>KORAMARCO</div>
        <div style={{width:40,height:1,background:C.accent,margin:"20px auto 0",opacity:p>=1?1:0,transition:"opacity 0.6s 0.5s"}}/>
        <div style={{fontFamily:C.sans,fontSize:10,color:"rgba(242,237,230,0.35)",letterSpacing:4,textTransform:"uppercase",marginTop:14,opacity:p>=1?1:0,transition:"opacity 0.5s 0.7s"}}>
          Nutrition · Performance
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM SHEET ──────────────────────────────────────────────────────────────
function Sheet({ recipe, onClose }) {
  const innerRef = useRef(null);
  const startY = useRef(null);
  const [vis, setVis] = useState(false);
  const [ty, setTy] = useState(0);
  const [servings, setServings] = useState(recipe.baseServings);
  const [tab, setTab] = useState("ingredients");
  const ratio = servings / recipe.baseServings;
  const TABS = recipe.type==="full"
    ? [{id:"ingredients",label:"Ingrédients"},{id:"steps",label:"Préparation"},{id:"shopping",label:"Courses"}]
    : [{id:"ingredients",label:"Ingrédients"},{id:"shopping",label:"Courses"}];

  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const close = useCallback(() => { setVis(false); setTimeout(onClose, 320); }, [onClose]);

  const onTS = (e) => { if (innerRef.current?.scrollTop > 0) return; startY.current = e.touches[0].clientY; };
  const onTM = (e) => {
    if (!startY.current) return;
    if (innerRef.current?.scrollTop > 0) { startY.current = null; return; }
    const d = e.touches[0].clientY - startY.current;
    if (d > 0) setTy(d);
  };
  const onTE = () => { if (ty > 100) close(); else setTy(0); startY.current = null; };

  const fmt = (ing, r) => {
    const q = ing.amount * r;
    const d = q % 1 === 0 ? q : q.toFixed(1);
    return ing.unit ? d + " " + ing.unit : String(d);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(24,22,15,0.5)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(4px)"}}/>
      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{position:"relative",zIndex:1,background:C.card,borderRadius:"26px 26px 0 0",height:"92vh",display:"flex",flexDirection:"column",transform:"translateY("+(vis?ty:100)+"%)",transition:ty>0?"none":"transform 0.38s cubic-bezier(.32,0,.15,1)",boxShadow:"0 -4px 40px rgba(0,0,0,0.14)"}}>

        {/* handle */}
        <div style={{padding:"14px 0 0",display:"flex",justifyContent:"center",flexShrink:0}}>
          <div style={{width:34,height:3,borderRadius:2,background:C.light}}/>
        </div>

        <div ref={innerRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>

          {/* colored header */}
          <div style={{height:220,background:recipe.cardColor.bg,position:"relative",display:"flex",alignItems:"flex-end",flexShrink:0}}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(250,248,245,0.98) 100%)"}}/>
            <div style={{position:"absolute",top:16,right:16}}>
              <button onClick={close} style={{background:"rgba(0,0,0,0.12)",border:"none",color:recipe.cardColor.text,fontSize:16,width:32,height:32,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>×</button>
            </div>
            <div style={{position:"absolute",top:16,left:20,display:"flex",gap:6,flexWrap:"wrap"}}>
              {recipe.tags.map(t => (
                <span key={t} style={{fontFamily:C.sans,fontSize:8,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(0,0,0,0.45)",background:"rgba(255,255,255,0.5)",padding:"3px 10px",borderRadius:20,backdropFilter:"blur(4px)"}}>{t}</span>
              ))}
              {recipe.type === "assembly" && (
                <span style={{fontFamily:C.sans,fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.accent,background:"rgba(255,255,255,0.6)",padding:"3px 10px",borderRadius:20}}>Rapide</span>
              )}
            </div>
            <div style={{position:"relative",padding:"0 24px 16px",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div style={{fontSize:56,lineHeight:1}}>{recipe.image}</div>
              <div style={{fontFamily:C.mono,fontSize:28,fontWeight:500,color:C.accent,lineHeight:1}}>{recipe.macros.prot}<span style={{fontFamily:C.sans,fontSize:11,color:C.t2,marginLeft:3}}>g prot</span></div>
            </div>
          </div>

          <div style={{padding:"20px 24px 0"}}>
            {/* title */}
            <div style={{fontFamily:C.font,fontSize:38,fontWeight:600,color:C.text,lineHeight:1.05,letterSpacing:-0.5,marginBottom:6,whiteSpace:"pre-line"}}>{recipe.title}</div>
            <div style={{fontFamily:C.sans,fontSize:13,color:C.t2,lineHeight:1.5,marginBottom:22}}>{recipe.description}</div>

            {/* macros grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
              {[
                {l:"Protéines",v:Math.round(recipe.macros.prot*ratio),u:"g",hi:true},
                {l:"Calories",v:Math.round(recipe.macros.kcal*ratio),u:"kcal",hi:false},
                {l:"Glucides",v:Math.round(recipe.macros.gluc*ratio),u:"g",hi:false},
                {l:"Lipides",v:Math.round(recipe.macros.lip*ratio),u:"g",hi:false},
              ].map(m => (
                <div key={m.l} style={{background:m.hi?C.dark:C.bg,borderRadius:14,padding:"11px 6px",textAlign:"center"}}>
                  <div style={{fontFamily:C.mono,fontSize:17,fontWeight:500,color:m.hi?"#f2ede6":C.text,lineHeight:1}}>{m.v}</div>
                  <div style={{fontFamily:C.sans,fontSize:8,color:m.hi?"rgba(242,237,230,0.45)":C.t3,marginTop:3,letterSpacing:0.5,textTransform:"uppercase"}}>{m.u}</div>
                  <div style={{fontFamily:C.sans,fontSize:8,color:m.hi?"rgba(242,237,230,0.4)":C.t3,marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>

            {/* cost row */}
            <div style={{background:C.bg,borderRadius:14,padding:"11px 16px",marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:C.sans,fontSize:10,fontWeight:600,color:C.t2,letterSpacing:1.5,textTransform:"uppercase"}}>Coût estimé</span>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span style={{fontFamily:C.mono,fontSize:18,fontWeight:500,color:C.accent}}>{(recipe.costPerServing*ratio).toFixed(2)}€</span>
                <span style={{fontFamily:C.sans,fontSize:10,color:C.t3}}>{"pour "+servings+" portion"+(servings>1?"s":"")}</span>
                <span style={{fontFamily:C.sans,fontSize:10,color:C.t3}}>{"· "+recipe.costPerServing.toFixed(2)+"€/pers"}</span>
              </div>
            </div>

            {/* portions */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:C.bg,borderRadius:14,marginBottom:22}}>
              <span style={{fontFamily:C.sans,fontSize:10,fontWeight:600,color:C.t2,letterSpacing:1.5,textTransform:"uppercase"}}>Portions</span>
              <div style={{display:"flex",alignItems:"center"}}>
                <button onClick={() => setServings(s => Math.max(1,s-1))} style={{width:36,height:36,borderRadius:"10px 0 0 10px",border:"1px solid "+C.light,borderRight:"none",background:C.card,color:C.text,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <div style={{width:46,height:36,background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:14,color:"#f2ede6",fontWeight:500}}>{servings}</div>
                <button onClick={() => setServings(s => Math.min(12,s+1))} style={{width:36,height:36,borderRadius:"0 10px 10px 0",border:"1px solid "+C.light,borderLeft:"none",background:C.card,color:C.text,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
            </div>

            {/* assembly note */}
            {recipe.type==="assembly" && recipe.assemblyNote && (
              <div style={{background:C.bg,borderRadius:14,padding:"14px 18px",marginBottom:22,borderLeft:"3px solid "+C.accent}}>
                <div style={{fontFamily:C.sans,fontSize:9,fontWeight:700,color:C.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Préparation rapide</div>
                <div style={{fontFamily:C.sans,fontSize:13,color:C.t2,lineHeight:1.7}}>{recipe.assemblyNote}</div>
              </div>
            )}

            {/* tabs */}
            <div style={{display:"flex",borderBottom:"1px solid "+C.light,marginBottom:20}}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{flex:1,padding:"10px 0",border:"none",background:"none",fontFamily:C.sans,fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:tab===t.id?C.text:C.t3,cursor:"pointer",borderBottom:"2px solid "+(tab===t.id?C.text:"transparent"),marginBottom:-1,transition:"all 0.15s"}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{padding:"0 24px 50px"}}>
            {tab==="ingredients" && recipe.ingredients.map((ing,i) => (
              <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.light:"none"}}>
                <span style={{fontFamily:C.sans,fontSize:14,color:C.text}}>{ing.name}</span>
                <span style={{fontFamily:C.mono,fontSize:12,fontWeight:500,color:C.accent}}>{fmt(ing,ratio)}</span>
              </div>
            ))}

            {tab==="steps" && recipe.steps && recipe.steps.map((step,i) => (
              <div key={i} style={{display:"flex",gap:18,paddingBottom:20,marginBottom:i<recipe.steps.length-1?20:0,borderBottom:i<recipe.steps.length-1?"1px solid "+C.light:"none"}}>
                <div style={{fontFamily:C.mono,fontSize:24,fontWeight:300,color:C.light,lineHeight:1.1,flexShrink:0,width:28,textAlign:"right"}}>{i<9?"0"+(i+1):i+1}</div>
                <div>
                  <div style={{fontFamily:C.sans,fontSize:9,fontWeight:700,color:C.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{step.title}</div>
                  <div style={{fontFamily:C.sans,fontSize:14,color:C.text,lineHeight:1.65}}>{step.content}</div>
                </div>
              </div>
            ))}

            {tab==="shopping" && (
              <div>
                <div style={{fontFamily:C.font,fontSize:22,color:C.text,marginBottom:16,fontWeight:600}}>
                  {"Liste · "+servings+" portion"+(servings>1?"s":"")}
                </div>
                {recipe.ingredients.map((ing,i) => (
                  <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<recipe.ingredients.length-1?"1px solid "+C.light:"none"}}>
                    <span style={{fontFamily:C.sans,fontSize:14,color:C.text}}>{ing.name}</span>
                    <span style={{fontFamily:C.mono,fontSize:12,fontWeight:500,color:C.accent}}>{fmt(ing,ratio)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GENERATE MODAL ────────────────────────────────────────────────────────────
function GenModal({ onClose, onAdd }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [vis, setVis] = useState(false);
  useEffect(() => requestAnimationFrame(() => setVis(true)), []);
  const close = () => { setVis(false); setTimeout(onClose, 300); };
  const go = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setErr("");
    try {
      const r = await generateRecipe(prompt);
      r.id = Date.now();
      r.cardColor = CARD_COLORS[Math.floor(Math.random()*CARD_COLORS.length)];
      onAdd(r); close();
    } catch { setErr("Erreur. Réessaie."); }
    finally { setLoading(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(24,22,15,0.5)",opacity:vis?1:0,transition:"opacity 0.3s",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",zIndex:1,background:C.card,borderRadius:"26px 26px 0 0",padding:"28px 24px 44px",transform:vis?"translateY(0)":"translateY(100%)",transition:"transform 0.38s cubic-bezier(.32,0,.15,1)"}}>
        <div style={{fontFamily:C.font,fontSize:32,fontWeight:600,color:C.text,marginBottom:5}}>Nouvelle recette</div>
        <div style={{fontFamily:C.sans,fontSize:12,color:C.t2,marginBottom:18,lineHeight:1.6}}>Décris ce que tu veux — KoraMarco génère la recette complète avec macros et coût.</div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ex: bowl saumon-avocat haute protéine, rapide…" style={{width:"100%",minHeight:88,borderRadius:14,border:"1.5px solid "+C.light,padding:"13px 16px",fontSize:13,fontFamily:C.sans,resize:"none",outline:"none",boxSizing:"border-box",color:C.text,background:C.bg}}/>
        {err && <div style={{color:C.accent,fontSize:12,marginTop:6,fontFamily:C.sans}}>{err}</div>}
        <button onClick={go} disabled={loading||!prompt.trim()} style={{width:"100%",marginTop:14,padding:"14px 0",background:loading?C.light:C.dark,color:loading?C.t3:"#f2ede6",border:"none",borderRadius:14,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:C.sans,letterSpacing:0.5,transition:"all 0.2s"}}>
          {loading ? "Génération en cours…" : "Générer"}
        </button>
      </div>
    </div>
  );
}

// ── RECIPE CARD ───────────────────────────────────────────────────────────────
function RecipeCard({ r, onClick, i }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(r)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{background:C.card,borderRadius:24,overflow:"hidden",cursor:"pointer",boxShadow:hov?"0 16px 48px rgba(24,22,15,0.12)":"0 2px 12px rgba(24,22,15,0.06)",transform:hov?"translateY(-3px)":"translateY(0)",transition:"all 0.22s cubic-bezier(.4,0,.2,1)",border:"1px solid "+C.light,animationName:"up",animationDuration:"0.4s",animationDelay:(i*0.05)+"s",animationFillMode:"both"}}
    >
      {/* colored image area */}
      <div style={{height:180,background:r.cardColor.bg,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:72,lineHeight:1,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.15))"}}>{r.image}</div>
        {/* top badges */}
        <div style={{position:"absolute",top:14,left:14,display:"flex",gap:5,flexWrap:"wrap"}}>
          {r.tags.slice(0,1).map(t => (
            <span key={t} style={{fontFamily:C.sans,fontSize:8,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:"rgba(0,0,0,0.45)",background:"rgba(255,255,255,0.55)",padding:"3px 9px",borderRadius:20,backdropFilter:"blur(6px)"}}>{t}</span>
          ))}
        </div>
        {r.type==="assembly" && (
          <span style={{position:"absolute",top:14,right:14,fontFamily:C.sans,fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.accent,background:"rgba(255,255,255,0.7)",padding:"3px 9px",borderRadius:20}}>Rapide</span>
        )}
        {/* cost pill */}
        <div style={{position:"absolute",bottom:14,right:14,background:"rgba(255,255,255,0.75)",backdropFilter:"blur(6px)",borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"baseline",gap:2}}>
          <span style={{fontFamily:C.mono,fontSize:13,fontWeight:500,color:C.accent}}>{"~"+r.costPerServing.toFixed(2)+"€"}</span>
          <span style={{fontFamily:C.sans,fontSize:8,color:C.t2}}>/pers</span>
        </div>
      </div>

      {/* info */}
      <div style={{padding:"16px 18px 18px"}}>
        <div style={{fontFamily:C.font,fontSize:20,fontWeight:600,color:C.text,lineHeight:1.1,marginBottom:6,whiteSpace:"pre-line"}}>{r.title}</div>
        <div style={{fontFamily:C.sans,fontSize:11,color:C.t2,marginBottom:14,lineHeight:1.5}}>{r.description}</div>
        {/* macro row */}
        <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
          <span style={{fontFamily:C.mono,fontSize:22,fontWeight:500,color:C.accent,lineHeight:1}}>{r.macros.prot}</span>
          <span style={{fontFamily:C.sans,fontSize:9,color:C.t3,letterSpacing:1,textTransform:"uppercase"}}>{"g prot  ·  "+r.macros.kcal+" kcal"}</span>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [recipes, setRecipes] = useState(RECIPES);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("Tous");
  const [budget, setBudget] = useState("Tous prix");

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);

  const filtered = recipes.filter(r => {
    const mt = tag==="Tous" || r.tags.includes(tag);
    const mb = budget==="Tous prix" || getBudgetLabel(r.costPerServing)===budget;
    const q = search.toLowerCase().trim();
    const ms = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.ingredients.some(ing => ing.name.toLowerCase().includes(q));
    return mt && mb && ms;
  });

  return (
    <>
      <style>{"@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0;} body{background:#f2ede6;-webkit-font-smoothing:antialiased;} ::-webkit-scrollbar{width:0;} button{-webkit-tap-highlight-color:transparent;}"}</style>

      {splash && <Splash onDone={() => setSplash(false)} />}

      <div style={{minHeight:"100vh",background:C.bg,opacity:splash?0:1,transition:"opacity 0.4s 0.1s"}}>

        {/* NAV */}
        <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(242,237,230,0.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid "+C.light,padding:"0 20px"}}>
          <div style={{maxWidth:480,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
            <div style={{fontFamily:C.font,fontSize:20,fontWeight:400,color:C.text,letterSpacing:4,textTransform:"uppercase"}}>KoraMarco</div>
            <button
              onClick={() => setModal(true)}
              style={{background:"none",border:"1px solid "+C.dark,borderRadius:20,padding:"6px 18px",fontSize:10,fontWeight:600,color:C.text,fontFamily:C.sans,letterSpacing:2,textTransform:"uppercase",transition:"all 0.15s"}}
              onMouseEnter={e => { e.currentTarget.style.background=C.dark; e.currentTarget.style.color="#f2ede6"; }}
              onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color=C.text; }}
            >+ Générer</button>
          </div>
        </nav>

        <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>

          {/* HERO */}
          <div style={{paddingTop:32,paddingBottom:8,animationName:"up",animationDuration:"0.5s",animationFillMode:"both"}}>
            <div style={{fontFamily:C.sans,fontSize:9,fontWeight:600,letterSpacing:5,color:C.accent,textTransform:"uppercase",marginBottom:10}}>Carnet personnel</div>
            <div style={{fontFamily:C.font,fontSize:48,fontWeight:300,color:C.text,lineHeight:0.95,letterSpacing:-1,marginBottom:16}}>
              Mes<br/><em>Recettes</em>
            </div>
            <div style={{height:1,background:C.light,marginBottom:16}}/>
            <div style={{fontFamily:C.sans,fontSize:11,color:C.t3,marginBottom:20}}>{recipes.length+" recettes · objectif prise de masse"}</div>
          </div>

          {/* SEARCH */}
          <div style={{marginBottom:14,animationName:"up",animationDuration:"0.5s",animationDelay:"0.04s",animationFillMode:"both"}}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Recette ou ingrédient…"
              style={{width:"100%",padding:"11px 0",border:"none",borderBottom:"1px solid "+C.light,fontSize:13,fontFamily:C.sans,background:"transparent",outline:"none",color:C.text,letterSpacing:0.2}}
              onFocus={e => e.target.style.borderBottomColor=C.dark}
              onBlur={e => e.target.style.borderBottomColor=C.light}
            />
          </div>

          {/* TAG FILTERS */}
          <div style={{display:"flex",gap:0,overflowX:"auto",borderBottom:"1px solid "+C.light,marginBottom:12,animationName:"up",animationDuration:"0.5s",animationDelay:"0.07s",animationFillMode:"both"}}>
            {ALL_TAGS.map(t => (
              <button key={t} onClick={() => setTag(t)} style={{padding:"9px 14px",border:"none",background:"none",whiteSpace:"nowrap",fontSize:9,fontWeight:700,fontFamily:C.sans,letterSpacing:1.5,textTransform:"uppercase",color:tag===t?C.text:C.t3,borderBottom:"2px solid "+(tag===t?C.text:"transparent"),marginBottom:-1,transition:"all 0.15s",flexShrink:0}}>
                {t}
              </button>
            ))}
          </div>

          {/* BUDGET FILTERS */}
          <div style={{display:"flex",gap:6,marginBottom:24,overflowX:"auto",animationName:"up",animationDuration:"0.5s",animationDelay:"0.1s",animationFillMode:"both"}}>
            {BUDGET_TAGS.map(b => (
              <button key={b} onClick={() => setBudget(b)} style={{padding:"5px 13px",borderRadius:20,border:"1px solid "+(budget===b?C.dark:C.light),whiteSpace:"nowrap",background:budget===b?C.dark:"transparent",color:budget===b?"#f2ede6":C.t2,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:C.sans,letterSpacing:0.8,transition:"all 0.15s",flexShrink:0}}>
                {b}
              </button>
            ))}
          </div>

          {(search||tag!=="Tous"||budget!=="Tous prix") && (
            <div style={{fontFamily:C.sans,fontSize:11,color:C.t3,marginBottom:16,letterSpacing:0.3}}>
              {filtered.length+" résultat"+(filtered.length>1?"s":"")}
              {search && <span>{" · "}<em style={{color:C.t2}}>{'"'+search+'"'}</em></span>}
            </div>
          )}

          {/* CARD LIST — single column, full width cards */}
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
            {filtered.map((r,i) => <RecipeCard key={r.id} r={r} onClick={setSelected} i={i} />)}

            {/* generate card */}
            <div
              onClick={() => setModal(true)}
              style={{background:C.card,borderRadius:24,border:"1.5px dashed "+C.light,minHeight:120,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:6,transition:"all 0.2s"}}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.dark; e.currentTarget.style.background=C.bg2; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.light; e.currentTarget.style.background=C.card; }}
            >
              <div style={{fontFamily:C.font,fontSize:28,color:C.t3,lineHeight:1}}>+</div>
              <div style={{fontFamily:C.font,fontSize:16,color:C.t2,fontStyle:"italic"}}>Générer une recette</div>
              <div style={{fontFamily:C.sans,fontSize:9,color:C.t3,letterSpacing:2,textTransform:"uppercase"}}>Via Claude AI</div>
            </div>
          </div>

          <div style={{height:48}}/>
        </div>
      </div>

      {selected && <Sheet recipe={selected} onClose={() => setSelected(null)} />}
      {modal && <GenModal onClose={() => setModal(false)} onAdd={r => setRecipes(p => [...p,r])} />}
    </>
  );
}
