import { useState } from "react";
import { GEMINI_ENDPOINT } from "../constants";

const SYSTEM_PROMPT = `You are a medical pre-triage AI assistant. Analyze the patient's symptoms and provide a structured assessment in exactly this format:

**Risk Level:** [Low / Moderate / Emergency]
**Recommended Next Action:** [Self-care at home / Visit a clinic within 24–48 hours / Go to the Emergency Room immediately]
**Medical Disclaimer:** This AI assessment is for informational purposes only and does not constitute professional medical advice. Please consult a certified healthcare professional for proper diagnosis and treatment.

Keep your assessment concise, clear, and compassionate. Do not diagnose specific conditions.`;

export default function UserPortal({ account, contract }) {
  const [symptoms, setSymptoms] = useState("");
  const [assessment, setAssessment] = useState("");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(null); // null | 1 | 2 | "done" | "error"
  const [txHash, setTxHash] = useState(null);

  const isReady = account && contract && symptoms.trim().length > 10;

  const runTriage = async () => {
    if (!isReady) return;
    setTxHash(null);
    setAssessment("");

    try {
      // Step 1 — Query Gemini
      setStep(1);
      setStatus("Querying Gemini AI…");

      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: symptoms }] }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error?.message || "Gemini API error");
      }

      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("Empty response from Gemini API");
      setAssessment(aiText);

      // Step 2 — Write to blockchain
      setStep(2);
      setStatus("Awaiting MetaMask approval…");

      const tx = await contract.logAdvice(symptoms, aiText, { gasLimit: 3000000 });
      setStatus("Transaction submitted — waiting for block confirmation…");

      await tx.wait();
      setTxHash(tx.hash);
      setStep("done");
      setStatus("✓ Assessment logged on-chain successfully!");
    } catch (err) {
      console.error(err);
      setStep("error");
      setStatus(`Error: ${err.message || "Unknown error occurred"}`);
    }
  };

  return (
    <main className="portal-container">
      {/* Hero */}
      <div className="portal-hero">
        <div className="portal-hero-icon">🩺</div>
        <h1 className="portal-title">AI Health Pre-Triage</h1>
        <p className="portal-subtitle">
          Describe your symptoms and receive an AI-assisted assessment — permanently logged on the blockchain for accountability and transparency.
        </p>
      </div>

      {/* Wallet gate */}
      {!account && (
        <div className="info-banner">
          <span>🦊</span>
          <span>Connect your MetaMask wallet using the button above to begin.</span>
        </div>
      )}

      {/* Symptom Input */}
      <div className="card">
        <label className="field-label" htmlFor="symptom-input">
          Describe Your Symptoms
        </label>
        <textarea
          id="symptom-input"
          className="symptom-textarea"
          placeholder="e.g. Persistent headache for 2 days, light sensitivity, slight fever around 38.5°C, and neck stiffness…"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          disabled={!account}
          rows={5}
        />
        <div className="field-hint">
          {symptoms.length < 10
            ? `${Math.max(0, 10 - symptoms.length)} more characters needed`
            : `${symptoms.length} characters — ready to assess`}
        </div>

        <button
          className={`btn-primary ${step === 1 || step === 2 ? "btn-loading" : ""}`}
          onClick={runTriage}
          disabled={!isReady || step === 1 || step === 2}
        >
          {step === 1 && <><span className="spinner" /> Querying Gemini AI…</>}
          {step === 2 && <><span className="spinner" /> Signing Transaction…</>}
          {(step === null || step === "done" || step === "error") && (
            <><span>⚡</span> Generate &amp; Log to Chain</>
          )}
        </button>

        {/* Status indicator */}
        {status && (
          <div className={`status-msg ${step === "error" ? "status-error" : step === "done" ? "status-success" : "status-info"}`}>
            {step === 1 && <div className="step-badge">Step 1 of 2</div>}
            {step === 2 && <div className="step-badge">Step 2 of 2</div>}
            {status}
          </div>
        )}
      </div>

      {/* AI Assessment Preview */}
      {assessment && (
        <div className="card assessment-card">
          <div className="assessment-header">
            <span className="assessment-icon">🤖</span>
            <h2 className="assessment-title">AI Assessment</h2>
            <span className="badge badge-ai">gemini-2.5-flash</span>
          </div>
          <div className="assessment-body">
            {assessment.split("\n").map((line, i) =>
              line.trim() ? (
                <p key={i} className={line.startsWith("**") ? "assessment-heading" : "assessment-text"}>
                  {line.replace(/\*\*/g, "")}
                </p>
              ) : <br key={i} />
            )}
          </div>
          {txHash && (
            <div className="tx-confirmed">
              <span className="tx-icon">✓</span>
              <span className="tx-label">On-chain hash:</span>
              <code className="tx-hash">{txHash.slice(0, 20)}…{txHash.slice(-8)}</code>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="how-it-works">
        <h3 className="how-title">How AegisCare Works</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <p>Enter your symptoms into the form above</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <p>Gemini AI generates a structured triage assessment</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <p>MetaMask signs the record onto the BOT Chain permanently</p>
          </div>
        </div>
      </div>
    </main>
  );
}
