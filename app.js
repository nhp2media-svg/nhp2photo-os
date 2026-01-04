// AI Photo OS Branded Rebuild V2 (static, no external deps)

const el = (id) => document.getElementById(id);

const TASK_DEFS = {
  enhance: {
    risk: "low",
    optionsHTML: `
      <label>Enhancement strength</label>
      <select id="enh_strength">
        <option value="low">Low (safest)</option>
        <option value="med" selected>Medium</option>
        <option value="high">High (risk: artifacts)</option>
      </select>
      <label>Artifact cleanup</label>
      <select id="enh_cleanup">
        <option value="gentle" selected>Gentle (recommended)</option>
        <option value="standard">Standard</option>
        <option value="aggressive">Aggressive (risk: wax/edges)</option>
      </select>
    `
  },
  lighting: {
    risk: "low",
    optionsHTML: `
      <label>Exposure balancing</label>
      <select id="light_exposure">
        <option value="gentle" selected>Gentle (recommended)</option>
        <option value="balanced">Balanced</option>
        <option value="strong">Strong (risk: modernized look)</option>
      </select>
      <label>White balance</label>
      <select id="light_wb">
        <option value="preserve" selected>Preserve original cast</option>
        <option value="neutralize">Neutralize slightly</option>
        <option value="strict_skin">Match skin to original (strict)</option>
      </select>
    `
  },
  texture: {
    risk: "low",
    optionsHTML: `
      <label>Grain handling</label>
      <select id="tex_grain">
        <option value="preserve" selected>Preserve (recommended)</option>
        <option value="normalize">Normalize slightly</option>
        <option value="reduce">Reduce a bit (risk: wax)</option>
      </select>
      <label>Skin texture</label>
      <select id="tex_skin">
        <option value="natural" selected>Natural pores + micro-variation</option>
        <option value="soft">Softer but realistic</option>
        <option value="detail">More detail (risk: synthetic)</option>
      </select>
    `
  },
  upscale: {
    risk: "low",
    optionsHTML: `
      <label>Target size</label>
      <select id="up_target">
        <option value="2x">2× upscale</option>
        <option value="4k">4K</option>
        <option value="8k" selected>8K</option>
        <option value="4x">4× upscale (risk: invented detail)</option>
      </select>
      <label>Sharpening</label>
      <select id="up_sharp">
        <option value="none">None</option>
        <option value="gentle" selected>Gentle (recommended)</option>
        <option value="strong">Strong (risk: halos)</option>
      </select>
    `
  },
  pose: {
    risk: "med",
    optionsHTML: `
      <label>Change type</label>
      <select id="pose_type">
        <option value="camera" selected>Camera angle only</option>
        <option value="pose">Pose only</option>
        <option value="both">Pose + camera angle</option>
      </select>
      <label>Rotate axis</label>
      <select id="pose_axis">
        <option value="yaw" selected>Yaw (left/right)</option>
        <option value="pitch">Pitch (up/down)</option>
        <option value="roll">Roll (tilt)</option>
      </select>
      <label>Rotation degrees</label>
      <select id="pose_deg">
        <option value="10" selected>10° (safest)</option>
        <option value="20">20°</option>
        <option value="30">30°</option>
        <option value="45">45° (high drift risk)</option>
      </select>
      <label>Apply to</label>
      <select id="pose_target">
        <option value="head" selected>Head only</option>
        <option value="body">Body only</option>
        <option value="both">Head + body</option>
      </select>
    `
  },
  face_replace: {
    risk: "high",
    optionsHTML: `
      <label>Match priority</label>
      <select id="fr_match">
        <option value="both" selected>Angle + lighting + grain (recommended)</option>
        <option value="angle">Angle + perspective</option>
        <option value="lighting">Lighting + grain</option>
      </select>
      <label>Blend edge softness</label>
      <select id="fr_blend">
        <option value="soft" selected>Soft (natural)</option>
        <option value="medium">Medium</option>
        <option value="tight">Tight (risk: seams)</option>
      </select>
    `
  }
};

const LIB = [
  {id:"A1", mode:"archival", task:"enhance", title:"Archival Enhance (Identity-Locked)", text:
`Image-to-image restoration. Preserve historical truth. Improve clarity and compression artifacts gently. Preserve faces exactly. Restore realistic film grain and natural skin texture; do not smooth or beautify. Maintain original lighting direction and color cast. Forbid invented details or added elements.`},
  {id:"C1", mode:"commercial", task:"lighting", title:"Editorial Lighting + Color (Safe)", text:
`Image-to-image editorial enhancement. Balance exposure and color while preserving identity. Maintain realistic shadows and highlights; do not apply HDR or cinematic grading. Preserve skin tone; reduce color noise and banding without altering facial structure.`},
  {id:"P1", mode:"archival", task:"pose", title:"Pose/Angle Safe 10–20°", text:
`Image-to-image. Change camera yaw by 10–20° while preserving exact facial geometry and identity. Recalculate lighting physically for the new angle; preserve grain and texture. Do not beautify, reshape, or invent details. Stop if face drift occurs.`},
  {id:"F1", mode:"commercial", task:"face_replace", title:"Strict Face Replace (Identity Source Authoritative)", text:
`Composite workflow: use the provided identity source as authoritative for facial structure. Match yaw/pitch/roll, perspective, exposure, and grain to the base. Blend edges naturally. Forbid face averaging or blending multiple identities. Keep the scene unchanged.`},
];

function setTaskOptions(){
  const t = el("task").value;
  el("taskOptions").innerHTML = TASK_DEFS[t]?.optionsHTML || "";
  updateRiskBadge();
}

function riskScore(){
  const wf = el("wf").value;
  const t = el("task").value;

  let score = 10;
  let notes = [];
  if(wf === "archival"){ score += 6; notes.push("Archival mode: higher sensitivity to historical truth."); }

  const base = {enhance:10, lighting:10, texture:12, upscale:14, pose:35, face_replace:50};
  score += (base[t] || 12);

  if(el("lock_identity").checked){ score -= 10; notes.push("Identity lock enabled."); }
  if(el("keep_grain").checked){ score -= 3; }
  if(el("no_hdr").checked){ score -= 3; }
  if(el("no_beauty").checked){ score -= 4; }
  if(el("no_invent").checked){ score -= 4; }

  if(t === "pose") notes.push("Pose/angle changes synthesize geometry; keep degrees low.");
  if(t === "face_replace") notes.push("Face replacement is highest drift risk.");

  score = Math.max(0, Math.min(100, score));
  return {score, notes};
}

function updateRiskBadge(){
  const {score, notes} = riskScore();
  const badge = el("riskBadge");
  const notesEl = el("riskNotes");

  if(score >= 60){
    badge.className = "risk-badge high";
    badge.textContent = "High";
  } else if(score >= 35){
    badge.className = "risk-badge med";
    badge.textContent = "Medium";
  } else {
    badge.className = "risk-badge low";
    badge.textContent = "Low";
  }
  notesEl.textContent = notes.join(" ");
}

function platformLabel(){
  const p = el("platform").value;
  if(p === "flux") return "Flux (Pro/Max/Dev/Kontext)";
  if(p === "chatgpt") return "ChatGPT Image (GPT-Image)";
  if(p === "gemini") return "Google Gemini Image (nano-banana)";
  return "General image-to-image model";
}

function workflowBlock(){
  const wf = el("wf").value;
  if(wf === "archival"){
    return [
      "ARCHIVAL WORKFLOW: Preserve historical truth and documentary accuracy.",
      "Keep changes minimal and physically plausible.",
      "Do not modernize the photo (no “new camera” look)."
    ].join("\n");
  }
  return [
    "COMMERCIAL/EDITORIAL WORKFLOW: Publication-ready polish without identity drift.",
    "Allow gentle cleanup and clarity, but forbid cosmetic reshaping."
  ].join("\n");
}

function safetyBlock(){
  const lines = [];
  lines.push("IDENTITY & REALISM LOCK (CRITICAL):");
  if(el("lock_identity").checked) lines.push("- Preserve all identities exactly as shown in the input. No face reshaping, averaging, or reinterpretation.");
  lines.push("- Do not change age, ethnicity, skin tone, expression, or proportions.");
  if(el("no_beauty").checked) lines.push("- Forbid beautification: no smoothing, de-aging, symmetry correction, or 'perfect skin'.");
  lines.push("");
  lines.push("TEXTURE & DETAIL:");
  if(el("keep_grain").checked) lines.push("- Preserve organic film grain / sensor noise; do not remove completely.");
  lines.push("- Restore natural skin texture (subtle pores, micro-variation). Avoid wax/plastic texture.");
  lines.push("");
  lines.push("LIGHTING & COLOR:");
  lines.push("- Maintain original lighting direction; keep shadows physically consistent.");
  if(el("no_hdr").checked) lines.push("- No HDR, cinematic grade, teal/orange, bloom, glow, or oversharpening.");
  lines.push("");
  lines.push("STRICTLY FORBID:");
  if(el("no_invent").checked) lines.push("- No hallucinated details, added objects, invented backgrounds, or extra people.");
  lines.push("- No stylization (CGI, illustration, painterly, anime).");
  return lines.join("\n");
}

function taskDirectives(){
  const t = el("task").value;
  const lines = [];
  lines.push("TASK DIRECTIVES:");
  if(t === "enhance"){
    const strength = el("enh_strength")?.value || "med";
    const cleanup = el("enh_cleanup")?.value || "gentle";
    lines.push(`- Enhance full image realism at ${strength.toUpperCase()} strength.`);
    lines.push(`- Reduce compression artifacts: ${cleanup}.`);
    lines.push("- Improve clarity only where physically plausible (hair, fabric, metal).");
    lines.push("- Do not invent micro-details; reconstruct existing detail faithfully.");
  } else if(t === "lighting"){
    const exp = el("light_exposure")?.value || "gentle";
    const wb = el("light_wb")?.value || "preserve";
    lines.push(`- Balance exposure: ${exp}. Preserve highlight roll-off; avoid clipped whites.`);
    lines.push(`- White balance: ${wb.replace('_',' ')}.`);
    lines.push("- Preserve skin tone and original ambient color cast unless correction is explicitly required.");
  } else if(t === "texture"){
    const g = el("tex_grain")?.value || "preserve";
    const s = el("tex_skin")?.value || "natural";
    lines.push(`- Grain handling: ${g}. Keep it photographic, not procedural.`);
    lines.push(`- Skin texture: ${s}. Avoid blotchy or AI 'pore map' artifacts.`);
    lines.push("- Reduce banding and blockiness without smoothing away pores or freckles.");
  } else if(t === "upscale"){
    const target = el("up_target")?.value || "8k";
    const sharp = el("up_sharp")?.value || "gentle";
    lines.push(`- Upscale target: ${target}.`);
    lines.push(`- Sharpening: ${sharp}. Avoid halos and crunchy edges.`);
    lines.push("- Preserve faces exactly; do not 'rebuild' facial features.");
  } else if(t === "pose"){
    const type = el("pose_type")?.value || "camera";
    const axis = el("pose_axis")?.value || "yaw";
    const deg = el("pose_deg")?.value || "10";
    const target = el("pose_target")?.value || "head";
    lines.push(`- Change type: ${type}.`);
    lines.push(`- Rotate ${target} by ${deg}° using ${axis} (yaw/pitch/roll).`);
    lines.push("- Preserve exact facial geometry. Do NOT replace the face with a 'new' face.");
    lines.push("- Recalculate lighting and shadows physically for the new angle.");
    lines.push("- Keep clothing, tattoos, and background consistent; no added elements.");
  } else if(t === "face_replace"){
    const match = el("fr_match")?.value || "both";
    const blend = el("fr_blend")?.value || "soft";
    lines.push(`- Match priority: ${match}. Align yaw/pitch/roll and perspective.`);
    lines.push(`- Blend edges: ${blend}. Match grain and noise to the base.`);
    lines.push("- Identity source is authoritative. Forbid averaging or mixing identities.");
    lines.push("- Keep the base photo composition unchanged (background/lighting direction).");
  }
  return lines.join("\n");
}

function buildPrompt(){
  updateRiskBadge();

  const prompt = [
    `PLATFORM TARGET: ${platformLabel()}`,
    `MODE: Image-to-image only. Do not generate a new image from scratch.`,
    "",
    workflowBlock(),
    "",
    taskDirectives(),
    "",
    safetyBlock(),
    "",
    "OUTPUT GOAL: The same photograph, higher quality and more realistic, without changing who the subjects are or how the moment originally looked."
  ].join("\n");

  el("out").value = prompt;
}

function copyOut(){
  const txt = el("out").value || "";
  navigator.clipboard.writeText(txt);
}

function downloadOut(){
  const txt = el("out").value || "";
  const blob = new Blob([txt], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "AI_Photo_OS_Prompt.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function lintPrompt(){
  const txt = (el("lintIn").value || "").toLowerCase();
  const out = el("lintOut");
  out.innerHTML = "";

  const rules = [
    {k:["average","blend identities","face merge"], lvl:"bad", msg:"Identity blending/averaging increases drift. Prefer identity lock + strict match."},
    {k:["de-age","younger","beautify","perfect skin","symmetry"], lvl:"warn", msg:"Beautification/de-aging cues often rewrite faces. Use 'forbid beautification' and 'preserve age cues'."},
    {k:["hdr","cinematic","teal orange","bloom","glow"], lvl:"warn", msg:"Cinematic/HDR language pushes stylization and hallucination. Prefer neutral, photographic corrections."},
    {k:["add","insert","new background","replace background","extra people"], lvl:"bad", msg:"Adding elements increases hallucination risk. Lock composition and forbid added objects."},
    {k:["8k","upscale","4x"], lvl:"good", msg:"Upscaling is fine if you forbid invented detail and keep grain/texture natural."},
  ];

  let hits = 0;
  for(const r of rules){
    if(r.k.some(w => txt.includes(w))){
      hits++;
      const d = document.createElement("div");
      d.className = "lint-item " + r.lvl;
      d.innerHTML = `<strong>${r.lvl.toUpperCase()}</strong> — ${r.msg}`;
      out.appendChild(d);
    }
  }
  if(!hits){
    const d = document.createElement("div");
    d.className = "lint-item good";
    d.innerHTML = "<strong>GOOD</strong> — No common drift triggers detected.";
    out.appendChild(d);
  }
}

function libRender(list){
  const host = el("libList");
  host.innerHTML = "";
  if(!list.length){
    host.innerHTML = `<div class="muted">No matches.</div>`;
    return;
  }
  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "lib-card";
    card.innerHTML = `
      <div class="top">
        <div class="title">${item.title}</div>
        <div class="muted small">${item.mode.toUpperCase()} • ${item.task.toUpperCase()}</div>
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn" data-copy="${item.id}">Copy</button>
      </div>
      <textarea spellcheck="false" style="margin-top:10px; min-height:160px">${item.text}</textarea>
    `;
    host.appendChild(card);
  });

  host.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-copy");
      const it = LIB.find(x => x.id === id);
      if(it) navigator.clipboard.writeText(it.text);
    });
  });
}

function libApply(){
  const m = el("libMode").value;
  const t = el("libTask").value;
  const list = LIB.filter(p => (m==="any" || p.mode===m) && (t==="any" || p.task===t));
  libRender(list);
}

function init(){
  // builder
  setTaskOptions();
  el("task").addEventListener("change", setTaskOptions);
  ["wf","platform","lock_identity","keep_grain","no_hdr","no_beauty","no_invent"].forEach(id => {
    el(id).addEventListener("change", updateRiskBadge);
  });
  el("btnBuild").addEventListener("click", buildPrompt);
  el("btnCopy").addEventListener("click", copyOut);
  el("btnDownload").addEventListener("click", downloadOut);

  // lint
  el("btnLint").addEventListener("click", lintPrompt);
  el("btnLintClear").addEventListener("click", () => { el("lintIn").value=""; el("lintOut").innerHTML=""; });

  // library
  el("libApply").addEventListener("click", libApply);
  libRender(LIB);
}
init();
