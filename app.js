function buildPrompt(){
const wf = workflow.value;
const taskVal = task.value;
const plat = platform.value;

let lines = [];

lines.push("MODE: Image‑to‑image only. Do not generate new content from scratch.");

lines.push("\nWORKFLOW:");
lines.push(wf==='archival'
? "Archival preservation. Maintain historical truth, original intent, and documentary accuracy."
: "Commercial/editorial processing. Publication‑ready realism without altering identity.");

lines.push("\nPRIMARY TASK:");
const taskMap = {
enhance: "Restore and enhance clarity, texture, and exposure using physically plausible detail only.",
pose: "Change camera angle or subject pose while preserving exact facial geometry and proportions.",
lighting: "Correct lighting, shadows, and color balance while preserving original light direction.",
face: "Composite or replace face using a strict identity reference and matched lighting."
};
lines.push(taskMap[taskVal]);

lines.push("\nPLATFORM TARGET:");
lines.push(
plat==='chatgpt' ? "ChatGPT Image (GPT‑Image)" :
plat==='gemini' ? "Google Gemini Image" :
"General image‑to‑image model");

lines.push("\nIDENTITY & REALISM LOCKS:");
if(identity.checked) lines.push("- Preserve identity exactly. No facial restructuring, reinterpretation, or averaging.");
if(grain.checked) lines.push("- Preserve natural photographic grain, pores, and micro‑texture.");
if(nohdr.checked) lines.push("- Do not apply HDR, cinematic color grading, or stylized lighting.");
if(nobeauty.checked) lines.push("- Do not beautify, de‑age, smooth, or cosmetically alter subjects.");

lines.push("\nFORBIDDEN:");
lines.push("- Invented details, added elements, stylization, or painterly effects.");
lines.push("- Identity drift, ethnicity changes, or facial symmetry correction.");

lines.push("\nOUTPUT GOAL:");
lines.push("Produce the same photograph with higher fidelity and realism, without changing who the subject is or how the moment originally appeared.");

result.value = lines.join("\n");
}
