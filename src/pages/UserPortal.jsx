import { useState } from "react";
import { ethers } from "ethers";
import { Stethoscope, Zap, Loader2, Cpu, Layers } from "lucide-react";
import { GEMINI_ENDPOINT, CONTRACT_ADDRESS, CONTRACT_ABI, BOT_CHAIN, AUTO_SIGNER_PRIVATE_KEY } from "../constants";
import { SAMPLE_PRESETS, buildGeminiRequestBody } from "../prompts/geminiPrompt";
import AssessmentResult from "../components/AssessmentResult";

const RPC_URL = BOT_CHAIN.rpcUrls[0];
const CHAIN_CONFIG = { chainId: 968, name: "Datagram" };

export default function UserPortal({ account, contract }) {
  const [symptoms, setSymptoms] = useState("");
  const [assessment, setAssessment] = useState("");
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(null); // null | 1 | 2 | "done" | "error"
  const [txHash, setTxHash] = useState(null);

  const isReady = symptoms.trim().length > 10;

  const runTriage = async () => {
    if (!isReady) return;
    setTxHash(null);
    setAssessment("");

    try {
      // Step 1 — Query Gemini AI
      setStep(1);
      setStatus("Querying Gemini AI Engine…");

      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildGeminiRequestBody(symptoms),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("Received empty response from Gemini model.");
      setAssessment(aiText);

      // Step 2 — Log On-Chain
      setStep(2);
      setStatus("Notarizing assessment on BOT Chain…");

      let activeContract = contract;
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_CONFIG);

      // Priority 1: If auto-signer private key is configured in .env, use auto-signer
      if (AUTO_SIGNER_PRIVATE_KEY) {
        try {
          const autoWallet = new ethers.Wallet(AUTO_SIGNER_PRIVATE_KEY, provider);
          activeContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, autoWallet);
        } catch (wErr) {
          throw new Error("Invalid VITE_AUTO_SIGNER_PRIVATE_KEY in .env! You pasted a public wallet address (0x3AfD...). Please export and paste your 64-character Private Key from MetaMask (Account Details -> Show Private Key).");
        }
      } else if (!activeContract || !activeContract.signer) {
        // Priority 2: Use MetaMask if connected
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = web3Provider.getSigner();
          activeContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        }
      }

      if (!activeContract || !activeContract.signer) {
        throw new Error("Please connect MetaMask wallet or add VITE_AUTO_SIGNER_PRIVATE_KEY to .env for automated signing.");
      }

      // Explicit gas price (25 Gwei required threshold for BOT Chain node)
      const txOptions = {
        gasLimit: 3000000,
        gasPrice: ethers.utils.parseUnits("25", "gwei"),
      };

      const tx = await activeContract.logAdvice(symptoms, aiText, txOptions);
      setStatus("Transaction submitted — mining block…");

      await tx.wait();
      setTxHash(tx.hash);
      setStep("done");
      setStatus("Logged on-chain successfully!");
    } catch (err) {
      console.error("Triage Execution Error:", err);
      setStep("error");
      const errMsg = err?.reason || err?.error?.message || err?.message || "Failed to process triage transaction.";
      setStatus(`Error: ${errMsg}`);
    }
  };

  return (
    <main className="portal-container">
      {/* Page Header */}
      <div className="portal-title-wrapper">
        <h1 className="portal-title" style={{ textAlign: 'center', fontSize: '2.5rem' }}>AI Health Pre-Triage</h1>
      </div>

      {/* Symptom Form Card */}
      <div className="card">
        <div className="card-header-flex">
          <div className="card-title-group">
            <Stethoscope className="card-icon text-blue" />
            <h2 className="card-heading">Describe Symptoms</h2>
          </div>
        </div>

        {/* Presets */}
        <div className="presets-wrapper">
          <span className="presets-label">Sample Inputs:</span>
          <div className="presets-chips">
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => setSymptoms(p.text)}
                disabled={step === 1 || step === 2}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          id="symptom-input"
          className="symptom-textarea"
          placeholder="Enter symptoms here..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          disabled={step === 1 || step === 2}
          rows={4}
        />

        <div className="card-footer-flex">
          <span className="field-hint">
            {symptoms.length < 10
              ? `${Math.max(0, 10 - symptoms.length)} more chars required`
              : `${symptoms.length} chars`}
          </span>

          <button
            className={`btn-primary ${step === 1 || step === 2 ? "btn-loading" : ""}`}
            onClick={runTriage}
            disabled={!isReady || step === 1 || step === 2}
          >
            {step === 1 && (
              <>
                <Loader2 className="spinner-icon" /> Querying AI…
              </>
            )}
            {step === 2 && (
              <>
                <Loader2 className="spinner-icon" /> Mining On-Chain…
              </>
            )}
            {(step === null || step === "done" || step === "error") && (
              <>
                <Zap className="icon-sm" /> Generate &amp; Log On-Chain
              </>
            )}
          </button>
        </div>

        {/* Loading Progress Animation Box */}
        {(step === 1 || step === 2) && (
          <div className="loading-progress-box">
            <div className="step-indicators">
              <div className={`step-dot ${step === 1 ? "step-dot--active" : "step-dot--done"}`}>
                <Cpu className="icon-xs" />
                <span>1. Gemini AI Analysis</span>
              </div>
              <div className="step-line" />
              <div className={`step-dot ${step === 2 ? "step-dot--active" : ""}`}>
                <Layers className="icon-xs" />
                <span>2. Blockchain Mining</span>
              </div>
            </div>
            <div className="loading-bar-track">
              <div className={`loading-bar-fill ${step === 2 ? "loading-bar-fill--step2" : ""}`} />
            </div>
            <p className="loading-status-text">{status}</p>
          </div>
        )}

        {/* Error or Done Status */}
        {(step === "done" || step === "error") && status && (
          <div className={`status-msg ${step === "error" ? "status-error" : "status-success"}`}>
            {status}
          </div>
        )}
      </div>

      {/* Neatly Organized Assessment Result Component */}
      {assessment && <AssessmentResult assessment={assessment} txHash={txHash} />}
    </main >
  );
}
