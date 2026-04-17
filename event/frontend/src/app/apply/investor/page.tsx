"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, UserCheck, Wallet, CheckCircle, 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Briefcase, Camera, Trash2, ChevronRight, ChevronLeft,
  Target, Award, Clock, ExternalLink, Video, Globe
} from "lucide-react";

function InvestorFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState<any>({
    preferredCategories: [],
    investmentType: []
  });
  const [showPopup, setShowPopup] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps = [
    { title: "Personal Details", icon: User },
    { title: "Verification", icon: ShieldCheck },
    { title: "Investment Profile", icon: Wallet },
    { title: "Experience", icon: Award },
    { title: "Intent & Status", icon: Clock },
    { title: "Security", icon: Camera },
  ];

  // Sync step with URL
  useEffect(() => {
    const s = searchParams.get('step');
    if (s) {
      const stepNum = parseInt(s);
      if (stepNum >= 1 && stepNum <= 6) {
        setStep(stepNum);
      }
    }
  }, [searchParams]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('investor_registration_draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved draft");
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(formData).length > 2 || (formData.preferredCategories?.length > 0) || (formData.investmentType?.length > 0)) {
      localStorage.setItem('investor_registration_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const updateStep = (newStep: number) => {
    setStep(newStep);
    router.push(`?step=${newStep}`);
  };

  const handleNext = () => updateStep(step + 1);
  const handleBack = () => updateStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
        handleNext();
        return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
        const dataToSubmit = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                dataToSubmit.append(key, formData[key].join(','));
            } else if (!(formData[key] instanceof File)) {
                dataToSubmit.append(key, formData[key]);
            }
        });

        if (selfie) {
            const response = await fetch(selfie);
            const blob = await response.blob();
            dataToSubmit.append('selfie', blob, 'selfie.jpg');
        }

        if (formData.documentUpload instanceof File) {
            dataToSubmit.append('documentUpload', formData.documentUpload);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/event/investor`, {
            method: 'POST',
            body: dataToSubmit
        });

        if (!response.ok) throw new Error('Registration failed');

        setShowPopup(true);
        setFormData({ preferredCategories: [], investmentType: [] });
        localStorage.removeItem('investor_registration_draft');
        setSelfie(null);
        updateStep(1);
    } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Something went wrong.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    setFormData((prev: any) => {
        const arr = prev[field] || [];
        if (arr.includes(value)) {
            return { ...prev, [field]: arr.filter((i: string) => i !== value) };
        } else {
            return { ...prev, [field]: [...arr, value] };
        }
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 400, 300);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setSelfie(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };


  return (
    <div className="bg-[#f8fafc] min-h-screen pt-24 md:pt-32 pb-24 font-poppins relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-sky-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            Verified Deal Flow
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter"
          >
            Investor <span className="text-sky-600">Register.</span>
          </motion.h1>
          <p className="text-slate-500 font-medium italic text-lg">Join India's most exclusive network of high-net-worth investors.</p>
        </div>

        <div className="mb-20 overflow-x-auto pt-4 pb-8 scrollbar-hide">
          <div className="flex items-center justify-between relative min-w-[600px] max-w-2xl mx-auto px-10">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-[2px] bg-sky-600 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
            
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step > i + 1 ? "bg-sky-600 text-white" : step === i + 1 ? "bg-white border-2 border-sky-600 text-sky-600 shadow-lg shadow-sky-100 scale-110" : "bg-white border-2 border-slate-100 text-slate-300"}`}>
                  <s.icon size={18} className="md:size-[20px]" />
                </div>
                <span className={`absolute -bottom-8 text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${step === i + 1 ? "text-sky-600" : "text-slate-300"}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
            {status && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl font-bold italic text-center ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                    {status.message}
                </motion.div>
            )}
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-2xl shadow-sky-100/30 space-y-10"
            >
              {step === 1 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <User className="text-sky-600" size={32} /> Basic <span className="text-sky-600">Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Name" name="fullName" value={formData.fullName || ''} onChange={(e: any) => updateFormData('fullName', e.target.value)} placeholder="Your full name" required />
                    <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber || ''} onChange={(e: any) => updateFormData('mobileNumber', e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" required />
                    <InputField label="Email" name="email" value={formData.email || ''} onChange={(e: any) => updateFormData('email', e.target.value)} placeholder="you@email.com" type="email" required />
                    <InputField label="Location" name="location" value={formData.location || ''} onChange={(e: any) => updateFormData('location', e.target.value)} placeholder="City, State" required />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <ShieldCheck className="text-sky-600" size={32} /> Identity <span className="text-sky-600">Verification</span>
                  </h3>
                  <div className="space-y-6">
                    <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber || ''} onChange={(e: any) => updateFormData('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" required />
                    <InputField label="GST Number (optional)" name="gstNumber" value={formData.gstNumber || ''} onChange={(e: any) => updateFormData('gstNumber', e.target.value)} placeholder="GSTIN (if applicable)" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <Wallet className="text-sky-600" size={32} /> Investment <span className="text-sky-600">Profile</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Investment Range</label>
                        <select 
                            required 
                            name="investmentRange"
                            value={formData.investmentRange || ''}
                            onChange={(e) => updateFormData('investmentRange', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none appearance-none transition-all"
                        >
                            <option value="">Select investment range</option>
                            <option>5L - 25L</option>
                            <option>25L - 1Cr</option>
                            <option>1Cr - 5Cr</option>
                            <option>5Cr+</option>
                        </select>
                    </div>
                    <InputField label="Preferred Location" name="preferredLocation" value={formData.preferredLocation || ''} onChange={(e: any) => updateFormData('preferredLocation', e.target.value)} placeholder="e.g. Bangalore, Pan-India" required />
                    
                    <div className="md:col-span-2 space-y-4 pt-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Preferred Categories (multi-select)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {["Technology", "FMCG", "Healthcare", "EdTech", "FinTech", "AgriTech", "Real Estate", "Manufacturing", "E-Commerce", "Sustainability"].map((cat) => (
                                <label key={cat} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formData.preferredCategories?.includes(cat) ? "bg-sky-50 border-sky-200" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.preferredCategories?.includes(cat)}
                                        onChange={() => toggleArrayItem('preferredCategories', cat)}
                                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
                                    />
                                    <span className="text-xs font-bold text-slate-700">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <Award className="text-sky-600" size={32} /> Type & <span className="text-sky-600">Experience</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Investment Type</label>
                        <div className="flex flex-wrap gap-4">
                            {["Equity", "Partnership", "Loan"].map((type) => (
                                <label key={type} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${formData.investmentType?.includes(type) ? "bg-sky-600 text-white border-sky-600" : "bg-slate-50 border-slate-100 hover:bg-slate-50"}`}>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={formData.investmentType?.includes(type)}
                                        onChange={() => toggleArrayItem('investmentType', type)}
                                    />
                                    <span className="text-xs font-bold">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <TextAreaField label="Previously Invested Businesses" name="previousInvestments" value={formData.previousInvestments || ''} onChange={(e: any) => updateFormData('previousInvestments', e.target.value)} placeholder="List businesses you've previously invested in..." required />
                    <TextAreaField label="Industry Experience" name="industryExperience" value={formData.industryExperience || ''} onChange={(e: any) => updateFormData('industryExperience', e.target.value)} placeholder="Describe your industry experience..." required />
                    <TextAreaField label="Portfolio (optional)" name="portfolio" value={formData.portfolio || ''} onChange={(e: any) => updateFormData('portfolio', e.target.value)} placeholder="Share your investment portfolio details..." />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <Clock className="text-sky-600" size={32} /> Current <span className="text-sky-600">Availability</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: "Active Investor", desc: "Actively looking to invest", icon: TrendingUp },
                        { title: "Passive Investor", desc: "Open to opportunities", icon: Wallet }
                    ].map((item, i) => (
                        <label key={i} className={`flex flex-col items-center text-center gap-4 p-10 rounded-[3rem] border cursor-pointer transition-all group ${formData.availability === item.title ? "bg-sky-600 text-white border-sky-600 shadow-xl shadow-sky-100" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}>
                            <input 
                                type="radio" 
                                name="availability" 
                                className="hidden" 
                                checked={formData.availability === item.title}
                                onChange={() => updateFormData('availability', item.title)}
                            />
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${formData.availability === item.title ? "bg-white/20" : "bg-white"}`}>
                                <item.icon className={formData.availability === item.title ? "text-white" : "text-sky-600"} size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase tracking-tighter italic">{item.title}</h4>
                                <p className={`text-xs font-medium italic ${formData.availability === item.title ? "text-white/70" : "text-slate-500"}`}>{item.desc}</p>
                            </div>
                        </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <Camera className="text-sky-600" size={32} /> Final <span className="text-sky-600">Security</span>
                  </h3>
                  
                  <div className="bg-sky-50 rounded-[3rem] p-10 text-center border border-sky-100 relative overflow-hidden">
                    {!selfie ? (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm mb-4">
                                <Camera className="text-sky-600" size={32} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Selfie Capture</h4>
                            <p className="text-slate-500 text-sm font-medium italic">Camera will be activated to verify your identity. Both Investor and Business users require this step.</p>
                            
                            {isCameraActive ? (
                                <div className="space-y-4">
                                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-[400px] mx-auto rounded-3xl border-4 border-white shadow-xl bg-black" />
                                    <button 
                                        type="button"
                                        onClick={captureSelfie}
                                        className="bg-sky-600 text-white font-black px-12 py-4 rounded-full shadow-lg shadow-sky-200 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        CAPTURE NOW
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={startCamera}
                                    className="bg-slate-900 text-white font-black px-12 py-4 rounded-full shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                                >
                                    ACTIVATE CAMERA
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative inline-block">
                                <img src={selfie} alt="Selfie" className="w-full max-w-[400px] mx-auto rounded-3xl border-4 border-white shadow-xl" />
                                <button 
                                    onClick={() => setSelfie(null)}
                                    className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-green-600 font-bold italic">
                                <CheckCircle size={20} />
                                <span>Identity Verified Successfully</span>
                            </div>
                        </div>
                    )}
                    <canvas ref={canvasRef} width="400" height="300" className="hidden" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity Document Upload</label>
                    <input 
                        type="file" 
                        required 
                        onChange={(e: any) => updateFormData('documentUpload', e.target.files[0])}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all" 
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black italic uppercase tracking-tighter text-sm transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft size={20} /> Back
                  </button>
                )}
                
                <button 
                  type="submit" 
                  disabled={(step === 6 && !selfie) || isSubmitting}
                  className={`ml-auto flex items-center gap-3 font-black text-lg py-5 px-12 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${step === 6 ? "bg-sky-600 shadow-sky-200" : "bg-slate-900 shadow-slate-200"} text-white disabled:opacity-50`}
                >
                  {isSubmitting ? "PROCESSING..." : step === 6 ? "SUBMIT REGISTRATION" : "CONTINUE"} <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </div>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl max-w-md w-full text-center border border-sky-100"
            >
              <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sky-100">
                <CheckCircle className="text-white" size={48} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Profile Received!</h2>
              <p className="text-slate-500 font-bold italic mb-8">Thank you for registering. Our verification team will review your profile and reach out within 24 business hours. Check your email for confirmation.</p>
              <button 
                onClick={() => setShowPopup(false)}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InvestorApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvestorFormContent />
    </Suspense>
  );
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required = false, icon: Icon }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={18} />}
        <input 
          name={name}
          value={value}
          onChange={onChange}
          required={required} 
          type={type} 
          className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${Icon ? "pl-16" : "px-6"} py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all placeholder:text-slate-300`}
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, required = false }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">
        {label}
      </label>
      <textarea 
        name={name}
        value={value}
        onChange={onChange}
        required={required} 
        rows={4}
        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all placeholder:text-slate-300 resize-none"
        placeholder={placeholder} 
      />
    </div>
  );
}
