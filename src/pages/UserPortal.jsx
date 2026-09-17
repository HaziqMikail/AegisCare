import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Sparkles,
  Zap,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  FileCheck2,
  Activity,
  Flame
} from "lucide-react";
import { GEMINI_ENDPOINT, CONTRACT_ADDRESS } from "../constants";

const SYSTEM_PROMPT = `You are a medical pre-triage AI assistant. Analyze the patient's symptoms and provide a structured assessment in exactly this format:

**Risk Level:** [Low / Moderate / Emergency]
**Recommended Next Action:** [Self-care at home / Visit a clinic within 24–48 hours / Go to the Emergency Room immediately]
**Medical Disclaimer:** This AI assessment is for informational purposes only and does not constitute professional medical advice. Please consult a certified healthcare professional for proper diagnosis and treatment.

Keep your assessment concise, clear, and compassionate. Do not diagnose specific conditions.`;

const SAMPLE_PRESETS = [
  {
    title: "High Fever & Stiff Neck",
    text: "Persistent severe headache for 2 days, light sensitivity, fever around 39.1°C, and stiff neck when bending forward.",
    tag: "High Severity Test",
  },
  {
    title: "Mild Cough & Fatigue",
    text: "Dry cough for 3 days, low-grade fever 37.6°C, mild body aches, fatigue, but breathing normally without shortness of breath.",
    tag: "Moderate Severity Test",
  },
  {
    title: "Seasonal Allergy Symptoms",
    text: "Sneezing, watery itchy eyes, clear runny nose for 5 days, no fever, no throat pain, worse when outdoors near grass.",
    tag: "Low Risk Test",
  },
];

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
      // Step 1 — Query Gemini API
      setStep(1);
      setStatus("Querying Gemini 2.5 Flash AI Engine…");

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
        throw new Error(errData?.error?.message || "Gemini API request failed.");
      }

      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("Received empty assessment from Gemini model.");
      setAssessment(aiText);

      // Step 2 — Write on-chain to BOT Chain
      setStep(2);
      setStatus("Awaiting MetaMask cryptographic signature…");

      const tx = await contract.logAdvice(symptoms, aiText, { gasLimit: 3000000 });
      setStatus("Transaction submitted to BOT Chain — awaiting block confirmation…");

      await tx.wait();
      setTxHash(tx.hash);
      setStep("done");
      setStatus("Assessment permanently notarized on-chain!");
    } catch (err) {
      console.error(err);
      setStep("error");
      setStatus(`Execution error: ${err.message || "Failed to process triage pipeline."}`);
    }
  };

  return (
    <main className="portal-container">
      {/* Hero Badge & Title */}
      <div className="portal-hero">
        <div className="hero-glow-accent" />
        <div className="portal-badge-pill">
          <Sparkles className="icon-xs text-purple" />
          <span>Google Gemini 2.5 Flash × BOT Chain Verification</span>
        </div>
        <h1 className="portal-title">Verifiable AI Pre-Triage</h1>
        <p className="portal-subtitle">
          Submit your health symptoms to receive instant structured AI pre-triage advice. Every assessment is cryptographically signed and permanently logged on the BOT Chain ledger to prevent retroactive tampering or data opacity.
        </p>
      </div>

      {/* Wallet Gate Banner */}
      {!account && (
        <div className="info-banner">
          <AlertCircle className="icon-md text-sky" />
          <div className="banner-text">
            <strong>Wallet Authentication Required</strong>
            <p>Connect your MetaMask wallet using the header button to start an AI health assessment and mint your verifiable record.</p>
          </div>
        </div>
      )}

      {/* Interactive Symptom Input Card */}
      <div className="card card-glow">
        <div className="card-header-flex">
          <div className="card-title-group">
            <Stethoscope className="card-icon text-blue" />
            <div>
              <h2 className="card-heading">Describe Patient Symptoms</h2>
              <p className="card-subtext">Detailed symptom descriptions improve AI pre-triage accuracy.</p>
            </div>
          </div>
        </div>

        {/* Quick Presets for Hackathon Judges / Testers */}
        <div className="presets-wrapper">
          <span className="presets-label">
            <Flame className="icon-xs text-amber" /> Quick Test Presets:
          </span>
          <div className="presets-chips">
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => setSymptoms(p.text)}
                disabled={!account}
              >
                <span>{p.title}</span>
                <span className="preset-tag">{p.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="input-wrapper">
          <textarea
            id="symptom-input"
            className="symptom-textarea"
            placeholder="Describe current symptoms, duration, body temperature, pain levels, and any relevant health context..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={!account}
            rows={5}
          />
        </div>

        <div className="card-footer-flex">
          <div className="field-hint">
            {symptoms.length < 10 ? (
              <span className="hint-warning">Type at least 10 characters to activate AI pipeline</span>
            ) : (
              <span className="hint-success">
                <CheckCircle2 className="icon-xs inline" /> {symptoms.length} characters entered
              </span>
            )}
          </div>

          <button
            className={`btn-primary ${step === 1 || step === 2 ? "btn-loading" : ""}`}
            onClick={runTriage}
            disabled={!isReady || step === 1 || step === 2}
          >
            {step === 1 && (
              <>
                <Loader2 className="spinner-icon" /> Step 1/2: AI Assessment…
              </>
            )}
            {step === 2 && (
              <>
                <Loader2 className="spinner-icon" /> Step 2/2: Mining On-Chain…
              </>
            )}
            {(step === null || step === "done" || step === "error") && (
              <>
                <Zap className="icon-sm" /> Generate &amp; Notarize On-Chain
              </>
            )}
          </button>
        </div>

        {/* Status Pipeline Progress Indicator */}
        {status && (
          <div className={`status-msg ${step === "error" ? "status-error" : step === "done" ? "status-success" : "status-info"}`}>
            <div className="status-header">
              {step === 1 && <span className="step-badge step-badge--ai"><Cpu className="icon-xs" /> Step 1: Gemini AI Inference</span>}
              {step === 2 && <span className="step-badge step-badge--chain"><Layers className="icon-xs" /> Step 2: Blockchain Notarization</span>}
              {step === "done" && <span className="step-badge step-badge--complete"><CheckCircle2 className="icon-xs" /> Complete</span>}
              {step === "error" && <span className="step-badge step-badge--err"><AlertCircle className="icon-xs" /> Error</span>}
            </div>
            <p className="status-body">{status}</p>
          </div>
        )}
      </div>

      {/* AI Assessment Preview Card */}
      {assessment && (
        <div className="card assessment-card">
          <div className="assessment-header">
            <div className="assessment-title-group">
              <Cpu className="assessment-icon text-purple" />
              <div>
                <h2 className="assessment-title">Verifiable AI Triage Report</h2>
                <span className="assessment-sub">Model: gemini-2.5-flash</span>
              </div>
            </div>
            <span className="badge badge-ai-verified">
              <ShieldCheck className="icon-xs" /> Cryptographically Bound
            </span>
          </div>

          <div className="assessment-body">
            {assessment.split("\n").map((line, i) =>
              line.trim() ? (
                <p key={i} className={line.startsWith("**") ? "assessment-heading" : "assessment-text"}>
                  {line.replace(/\*\*/g, "")}
                </p>
              ) : (
                <br key={i} />
              )
            )}
          </div>

          {txHash && (
            <div className="tx-confirmed">
              <CheckCircle2 className="tx-icon-svg text-green" />
              <div className="tx-info">
                <span className="tx-label">Confirmed Block Transaction Hash:</span>
                <code className="tx-hash">{txHash}</code>
              </div>
              <a
                href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="btn-explorer"
              >
                Explorer <ExternalLink className="icon-xs" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Architecture Cards */}
      <div className="architecture-section">
        <h3 className="section-title">End-to-End Cryptographic Architecture</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrapper step-bg-blue">
              <Stethoscope className="step-svg text-blue" />
            </div>
            <h4>1. Symptom Input</h4>
            <p>Patient inputs symptoms into the AegisCare interface with optional prompt guardrails.</p>
          </div>

          <div className="step-card">
            <div className="step-icon-wrapper step-bg-purple">
              <Cpu className="step-svg text-purple" />
            </div>
            <h4>2. Gemini 2.5 Flash</h4>
            <p>Google Gemini processes structured risk triage (Risk Level, Action, Medical Disclaimer).</p>
          </div>

          <div className="step-card">
            <div className="step-icon-wrapper step-bg-green">
              <Layers className="step-svg text-green" />
            </div>
            <h4>3. BOT Chain Notary</h4>
            <p>MetaMask signs `logAdvice()` payload permanently into `AIAdvisor.sol` state storage.</p>
          </div>
        </div>
      </div>

      {/* Discrete Admin Link as requested */}
      <div className="admin-access-footer">
        <Lock className="icon-xs text-muted" />
        <span>Healthcare Supervisor or Compliance Auditor?</span>
        <Link to="/admin" className="admin-discrete-link">
          Access Restricted Audit Portal <ArrowRight className="icon-xs" />
        </Link>
      </div>
    </main>
  );
}
