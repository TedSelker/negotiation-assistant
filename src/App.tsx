/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  MessageSquare, 
  Shield, 
  Target, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Scale,
  Users,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the negotiation parameters
type Level = 'High' | 'Medium' | 'Low';

interface AnalysisResult {
  observations: string[];
  negotiationType: 'Distributive' | 'Integrative';
  negotiationTypeReasoning: string;
  pertinentStrategies: ('Competitive' | 'Collaborative' | 'Compromising' | 'Avoiding')[];
  strategyReasoning: string;
  suggestedResponse: string;
  toneAdvice: string;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [trustLevel, setTrustLevel] = useState<Level>('Medium');
  const [importance, setImportance] = useState<Level>('Medium');
  const [urgency, setUrgency] = useState<Level>('Medium');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeNegotiation = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Analyze the following negotiation text or context:
        "${inputText}"

        Consider these parameters:
        - Relationship Trust Level: ${trustLevel} (Low trust suggests more competitive behavior, High trust suggests more collaborative)
        - Outcome Importance: ${importance} (High importance suggests more aggressive/firm behavior)
        - Urgency: ${urgency} (High urgency often requires compromising to reach a quick deal)

        Provide a structured analysis including:
        1. Observations: Key things noticed in the text that affect the response.
        2. Negotiation Type: Choose between "Distributive" (for fixed resources/one-off) or "Integrative" (for sustained relationship/value creation).
        3. Pertinent Strategies: Choose from "Competitive", "Collaborative", "Compromising", or "Avoiding".
        4. Suggested Response: A draft response to the text.
        5. Tone Advice: How the response should sound.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              observations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key observations from the text"
              },
              negotiationType: {
                type: Type.STRING,
                enum: ["Distributive", "Integrative"],
                description: "The primary negotiation approach"
              },
              negotiationTypeReasoning: {
                type: Type.STRING,
                description: "Why this negotiation type was chosen"
              },
              pertinentStrategies: {
                type: Type.ARRAY,
                items: { 
                  type: Type.STRING,
                  enum: ["Competitive", "Collaborative", "Compromising", "Avoiding"]
                },
                description: "Specific strategies that apply"
              },
              strategyReasoning: {
                type: Type.STRING,
                description: "Why these strategies are pertinent"
              },
              suggestedResponse: {
                type: Type.STRING,
                description: "A drafted response for the user"
              },
              toneAdvice: {
                type: Type.STRING,
                description: "Advice on the tone to strike"
              }
            },
            required: [
              "observations", 
              "negotiationType", 
              "negotiationTypeReasoning", 
              "pertinentStrategies", 
              "strategyReasoning", 
              "suggestedResponse", 
              "toneAdvice"
            ]
          }
        }
      });

      const analysis = JSON.parse(response.text) as AnalysisResult;
      setResult(analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze the text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const LevelSelector = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon,
    description 
  }: { 
    label: string, 
    value: Level, 
    onChange: (v: Level) => void, 
    icon: any,
    description: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['Low', 'Medium', 'High'] as Level[]).map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
              value === level 
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 italic leading-tight">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-gray-200">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Negotiation Assistant</h1>
              <p className="text-xs text-gray-500 font-medium">Strategic Response Analyzer</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Trust</span>
            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Outcome</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Urgency</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Negotiation Context
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste the email, message, or describe the negotiation situation here..."
                  className="w-full h-48 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-6 pt-2">
                <LevelSelector 
                  label="Relationship Trust" 
                  value={trustLevel} 
                  onChange={setTrustLevel}
                  icon={Users}
                  description="Low trust leads to competitive tactics; High trust enables collaboration."
                />
                <LevelSelector 
                  label="Outcome Importance" 
                  value={importance} 
                  onChange={setImportance}
                  icon={Target}
                  description="High importance requires more assertiveness and firm positioning."
                />
                <LevelSelector 
                  label="Urgency Level" 
                  value={urgency} 
                  onChange={setUrgency}
                  icon={Zap}
                  description="High urgency often necessitates compromising to reach a quick agreement."
                />
              </div>

              <button
                onClick={analyzeNegotiation}
                disabled={isAnalyzing || !inputText.trim()}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:shadow-none"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Strategy...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Analysis
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </section>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Strategy Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Negotiation Type</span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          result.negotiationType === 'Integrative' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {result.negotiationType}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold">{result.negotiationType}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{result.negotiationTypeReasoning}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Pertinent Strategies</span>
                        <div className="flex gap-1">
                          {result.pertinentStrategies.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-600">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold">{result.pertinentStrategies.join(' & ')}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{result.strategyReasoning}</p>
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold">Key Observations</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {result.observations.map((obs, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <p className="text-sm text-gray-600 leading-relaxed">{obs}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Response */}
                  <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-bold text-white">Suggested Response</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Tone: {result.toneAdvice}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-white/5 rounded-xl p-5 font-mono text-sm text-gray-200 leading-relaxed border border-white/5">
                        {result.suggestedResponse}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-500 italic">
                          * Review and customize this draft to fit your specific voice.
                        </p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(result.suggestedResponse)}
                          className="text-[10px] font-bold uppercase tracking-wider text-white hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Copy to Clipboard
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200 rounded-3xl p-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Scale className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-lg font-bold text-gray-400">No Analysis Yet</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Input your negotiation text and select parameters to generate a strategic response.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-40 grayscale">
            <Scale className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">Negotiation Assistant</span>
          </div>
          <div className="flex gap-8">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase text-gray-400">Distributive</span>
              <p className="text-[10px] text-gray-500">Fixed-sum, win-lose focus.</p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase text-gray-400">Integrative</span>
              <p className="text-[10px] text-gray-500">Value-creation, win-win focus.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
