
function buildPrompt() {
  const workflow = workflowText();
  const task = taskText();
  const platform = platformText();

  let safety = [];
  if(identity.checked) safety.push("Preserve identity exactly. No facial structure, age, ethnicity, or expression changes.");
  if(grain.checked) safety.push("Preserve organic grain and sensor noise.");
  if(nohdr.checked) safety.push("No HDR, cinematic grading, glow, or stylization.");
  if(nobeauty.checked) safety.push("No beautification, de‑aging, reshaping, or smoothing.");

  const prompt = `
PLATFORM TARGET:
${platform}

MODE:
Image‑to‑image only. Do not generate a new image.

CORE TASK:
${task}

WORKFLOW:
${workflow}

SAFETY LOCKS (NON‑NEGOTIABLE):
${safety.map(s => "- " + s).join("\n")}

OUTPUT GOAL:
A higher‑quality, realistic version of the same image, improving clarity and realism without altering identity, intent, or historical truth.
`.trim();

  document.getElementById("result").value = prompt;
}

function workflowText() {
  return workflow.value === "archival"
    ? "Archival preservation. Historical accuracy prioritized. Minimal intervention."
    : "Commercial/editorial enhancement. Publication‑ready polish without identity drift.";
}

function taskText() {
  return {
    enhance: "Enhance overall image quality, texture, and exposure.",
    pose: "Adjust camera angle or pose while preserving exact facial identity.",
    lighting: "Refine lighting, shadows, and color balance.",
    face: "Replace face using strict identity reference."
  }[task.value];
}

function platformText() {
  return {
    general: "General image‑to‑image model",
    chatgpt: "ChatGPT Image (GPT‑Image)",
    gemini: "Google Gemini Image (nano‑banana)"
  }[platform.value];
}
