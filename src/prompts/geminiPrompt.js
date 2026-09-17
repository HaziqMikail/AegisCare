export const SYSTEM_PROMPT = `You are a medical pre-triage AI assistant. Analyze the patient's symptoms and provide a comprehensive structured assessment in exactly this format:

**Risk Level:** [Low / Moderate / Emergency]
**Recommended Next Action:** [Self-care at home / Visit a clinic within 24–48 hours / Go to the Emergency Room immediately]

**Clinical Guidance:**
Provide a detailed explanation evaluating the symptoms, potential common causes, home care management steps, hydration/rest advice, and red flag symptoms that require emergency attention.

**Medical Disclaimer:** This AI assessment is for informational purposes only and does not constitute professional medical advice. Please consult a certified healthcare professional for proper diagnosis and treatment.`;

export const SAMPLE_PRESETS = [
  { title: "High Fever & Stiff Neck", text: "Severe headache for 2 days, light sensitivity, fever 39.1°C, and stiff neck." },
  { title: "Mild Cough & Fatigue", text: "Dry cough for 3 days, low-grade fever 37.6°C, mild body aches and fatigue." },
  { title: "Seasonal Allergies", text: "Sneezing, watery itchy eyes, runny nose for 5 days, no fever." },
];

export function buildGeminiRequestBody(symptomsText) {
  return JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: symptomsText }] }],
  });
}
