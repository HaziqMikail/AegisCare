export const SYSTEM_PROMPT = `You are a medical pre-triage AI assistant. Analyze the patient's symptoms and provide a comprehensive structured assessment in exactly this format:

**Risk Level:** [Low / Moderate / High Priority]
**Recommended Next Action:** [Continue home monitoring / Schedule an in-person clinic visit soon / Prioritize immediate medical attention]


**Clinical Guidance:**
Provide a detailed explanation evaluating the symptoms, potential common causes, home care management steps, hydration/rest advice, and red flag symptoms that require emergency attention.


**Medical Disclaimer:** This AI assessment is for informational purposes only and does not constitute professional medical advice. Please consult a certified healthcare professional for proper diagnosis and treatment.`;

export const SAMPLE_PRESETS = [
  { title: "High Fever", text: "Severe headache for 2 days, light sensitivity, fever 39.1°C, and stiff neck." },
  { title: "Mild Cough", text: "Dry cough for 3 days, low-grade fever 37.6°C, mild body aches and fatigue." },
  { title: "Seasonal Allergies", text: "Sneezing, watery itchy eyes, runny nose for 5 days, no fever." },
];

export function buildGeminiRequestBody(symptomsText) {
  return JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: symptomsText }] }],
  });
}
