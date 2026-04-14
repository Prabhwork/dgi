"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Building2, FileText, CheckCircle, 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Presentation, Camera, ExternalLink, Video, 
  Globe, Trash2, ChevronRight, ChevronLeft
} from "lucide-react";

export default function BusinessApplyPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showPopup, setShowPopup] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps = [
    { title: "Basic Details", icon: User },
    { title: "Verification", icon: ShieldCheck },
    { title: "Business Profile", icon: Building2 },
    { title: "About", icon: FileText },
    { title: "Media & Socials", icon: Presentation },
    { title: "Security", icon: Camera },
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
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
            if (!(formData[key] instanceof File)) {
                dataToSubmit.append(key, formData[key]);
            }
        });

        if (selfie) {
            const response = await fetch(selfie);
            const blob = await response.blob();
            dataToSubmit.append('selfie', blob, 'selfie.jpg');
        }

        const fileKeys = ['businessImages', 'pitchDeck'];
        fileKeys.forEach(key => {
            if (formData[key] instanceof File) {
                dataToSubmit.append(key, formData[key]);
            }
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/event/business`, {
            method: 'POST',
            body: dataToSubmit
        });

        if (!response.ok) throw new Error('Submission failed');

        setShowPopup(true);
        setFormData({});
        setSelfie(null);
        setStep(1);
    } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
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
      alert("Could not access camera. Please ensure you have granted permission.");
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
    <div className="bg-[#f8fafc] min-h-screen pt-32 pb-24 font-poppins relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-sky-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            Phase 1: Listing
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter"
          >
            Business <span className="text-sky-600">Register.</span>
          </motion.h1>
          <p className="text-slate-500 font-medium italic text-lg">Empowering Indian enterprises with strategic global capital.</p>
        </div>

        <div className="flex items-center justify-between mb-20 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-[2px] bg-sky-600 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
          
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step > i + 1 ? "bg-sky-600 text-white" : step === i + 1 ? "bg-white border-2 border-sky-600 text-sky-600 shadow-lg shadow-sky-100 scale-110" : "bg-white border-2 border-slate-100 text-slate-300"}`}>
                <s.icon size={20} />
              </div>
              <span className={`absolute -bottom-8 text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${step === i + 1 ? "text-sky-600" : "text-slate-300"}`}>{s.title}</span>
            </div>
          ))}
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
              className="bg-white p-8 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-sky-100/30 space-y-10"
            >
              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <User className="text-sky-600" size={32} /> Basic <span className="text-sky-600">Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Business Name" name="businessName" value={formData.businessName || ''} onChange={(e: any) => updateFormData('businessName', e.target.value)} placeholder="Enter your business name" required />
                    <InputField label="Owner Name" name="ownerName" value={formData.ownerName || ''} onChange={(e: any) => updateFormData('ownerName', e.target.value)} placeholder="Full name of the owner" required />
                    <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber || ''} onChange={(e: any) => updateFormData('mobileNumber', e.target.value)} placeholder="+91 XXXXX XXXXX" required />
                    <InputField label="Email" name="email" value={formData.email || ''} onChange={(e: any) => updateFormData('email', e.target.value)} type="email" placeholder="you@business.com" required />
                    <InputField label="City" name="city" value={formData.city || ''} onChange={(e: any) => updateFormData('city', e.target.value)} placeholder="City" required />
                    <InputField label="State" name="state" value={formData.state || ''} onChange={(e: any) => updateFormData('state', e.target.value)} placeholder="State" required />
                    <InputField label="Pincode" name="pincode" value={formData.pincode || ''} onChange={(e: any) => updateFormData('pincode', e.target.value)} placeholder="Pincode" required />
                  </div>
                </div>
              )}

              {/* Step 2: Verification */}
              {step === 2 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <ShieldCheck className="text-sky-600" size={32} /> Identity <span className="text-sky-600">Verification</span>
                  </h3>
                  <div className="space-y-6">
                    <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber || ''} onChange={(e: any) => updateFormData('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" required />
                    <InputField label="GST Number" name="gstNumber" value={formData.gstNumber || ''} onChange={(e: any) => updateFormData('gstNumber', e.target.value)} placeholder="GSTIN" required />
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Business Registration Type</label>
                      <select 
                        name="registrationType"
                        value={formData.registrationType || ''}
                        onChange={(e) => updateFormData('registrationType', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all appearance-none"
                      >
                        <option value="">Select registration type</option>
                        <option>Proprietorship</option>
                        <option>Partnership</option>
                        <option>LLP</option>
                        <option>Private Limited</option>
                        <option>Public Limited</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Business Profile */}
              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <Building2 className="text-sky-600" size={32} /> Business <span className="text-sky-600">Profile</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Category" name="category" value={formData.category || ''} onChange={(e: any) => updateFormData('category', e.target.value)} placeholder="e.g. Technology, FMCG" required />
                    <InputField label="Sub-category" name="subCategory" value={formData.subCategory || ''} onChange={(e: any) => updateFormData('subCategory', e.target.value)} placeholder="e.g. SaaS, Organic Foods" />
                    <InputField label="Years of Operation" name="yearsOfOperation" value={formData.yearsOfOperation || ''} onChange={(e: any) => updateFormData('yearsOfOperation', e.target.value)} placeholder="e.g. 3" />
                    <InputField label="Team Size" name="teamSize" value={formData.teamSize || ''} onChange={(e: any) => updateFormData('teamSize', e.target.value)} placeholder="e.g. 15" />
                    <InputField label="Current Revenue (optional)" name="currentRevenue" value={formData.currentRevenue || ''} onChange={(e: any) => updateFormData('currentRevenue', e.target.value)} placeholder="₹ Annual Revenue" />
                    <InputField label="Funding Required (₹)" name="fundingRequired" value={formData.fundingRequired || ''} onChange={(e: any) => updateFormData('fundingRequired', e.target.value)} placeholder="₹ Amount" required />
                    <InputField label="Equity Offering (%)" name="equityOffering" value={formData.equityOffering || ''} onChange={(e: any) => updateFormData('equityOffering', e.target.value)} placeholder="e.g. 10%" required />
                  </div>
                </div>
              )}

              {/* Step 4: About */}
              {step === 4 && (
                <div className="space-y-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit">
                    <FileText className="text-sky-600" size={32} /> About your <span className="text-sky-600">Business</span>
                  </h3>
                  <div className="space-y-6">
                    <TextAreaField label="About Us" name="aboutUs" value={formData.aboutUs || ''} onChange={(e: any) => updateFormData('aboutUs', e.target.value)} placeholder="Tell us about your business..." required />
                    <TextAreaField label="Vision & Mission" name="visionMission" value={formData.visionMission || ''} onChange={(e: any) => updateFormData('visionMission', e.target.value)} placeholder="What is your vision and mission?" />
                    <TextAreaField label="Problem You Are Solving" name="problemSolving" value={formData.problemSolving || ''} onChange={(e: any) => updateFormData('problemSolving', e.target.value)} placeholder="What problem does your business solve?" />
                  </div>
                </div>
              )}

              {/* Step 5: Media & Socials */}
              {step === 5 && (
                <div className="space-y-8">
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit mb-4">
                        <Presentation className="text-sky-600" size={32} /> Assets & <span className="text-sky-600">Media</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Business Images</label>
                            <input 
                                type="file" 
                                onChange={(e: any) => updateFormData('businessImages', e.target.files[0])}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Pitch Deck (PDF)</label>
                            <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e: any) => updateFormData('pitchDeck', e.target.files[0])}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all" 
                            />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-slate-100">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 border-b-4 border-sky-600 pb-2 w-fit mb-4">
                        <Globe className="text-sky-600" size={32} /> Digital <span className="text-sky-600">Presence</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Website (optional)" name="website" value={formData.website || ''} onChange={(e: any) => updateFormData('website', e.target.value)} placeholder="https://yourbusiness.com" icon={Globe} />
                        <InputField label="Instagram (optional)" name="instagram" value={formData.instagram || ''} onChange={(e: any) => updateFormData('instagram', e.target.value)} placeholder="@handle" icon={Camera} />
                        <InputField label="LinkedIn (optional)" name="linkedin" value={formData.linkedin || ''} onChange={(e: any) => updateFormData('linkedin', e.target.value)} placeholder="LinkedIn profile URL" icon={ExternalLink} />
                        <InputField label="YouTube (optional)" name="youtube" value={formData.youtube || ''} onChange={(e: any) => updateFormData('youtube', e.target.value)} placeholder="YouTube channel URL" icon={Video} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Security & Selfie */}
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
                            <p className="text-slate-500 text-sm font-medium italic">Camera will be activated to verify your identity. Please ensure your face is clearly visible.</p>
                            
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Document Upload (Aadhaar/GST Copy)</label>
                    <input type="file" required className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-6 py-4 text-xs font-bold" />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black italic uppercase tracking-tighter text-sm transition-colors"
                  >
                    <ChevronLeft size={20} /> Back
                  </button>
                )}
                
                <button 
                  type="submit" 
                  disabled={step === 6 && !selfie}
                  className={`ml-auto flex items-center gap-3 font-black text-lg py-5 px-12 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${step === 6 ? "bg-sky-600 shadow-sky-200" : "bg-slate-900 shadow-slate-200"} text-white`}
                >
                  {step === 6 ? "SUBMIT APPLICATION" : "CONTINUE"} <ChevronRight size={20} />
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
              className="relative bg-white p-12 rounded-[4rem] shadow-2xl max-w-md w-full text-center border border-sky-100"
            >
              <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sky-100">
                <CheckCircle className="text-white" size={48} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Application Sent!</h2>
              <p className="text-slate-500 font-bold italic mb-8">Thank you for registering. Our team will review your business profile and reach out within 2-3 business hours. Check your email for confirmation.</p>
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
      <label className="text-[10px] font-black uppercase tracking-widest text_slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">
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
