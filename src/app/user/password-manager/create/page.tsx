'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants, HTMLMotionProps } from 'framer-motion';
import { Check, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';

const containerVariants: Variants = { hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } } };

interface PanelProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
}
const Panel = ({ children, className = '', ...props }: PanelProps) => (
    <motion.div variants={itemVariants} className={`bg-white dark:bg-[#1a2332] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`} {...props}>
        {children}
    </motion.div>
);

const DecryptingText = ({ targetText }: { targetText: string }) => {
    const [currentText, setCurrentText] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const scramble = useCallback(() => {
        let iteration = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentText(targetText.split("").map((_, index) => {
                if (index < iteration) return targetText[index];
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
            }).join(""));
            if (iteration >= targetText.length) { if(intervalRef.current) clearInterval(intervalRef.current); }
            iteration += 1 / 3;
        }, 30);
    },[targetText]);
    useEffect(() => { scramble(); return () => { if(intervalRef.current) clearInterval(intervalRef.current); } }, [targetText, scramble]);
    return <span className="text-2xl md:text-3xl font-mono tracking-wider break-all text-center text-gray-800 dark:text-gray-100">{currentText}</span>;
};

const BaseHouse = () => (
<motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -200, opacity: 0 }} layout className="relative w-[450px] lg:w-[540px]">
<svg className="w-full h-auto" viewBox="0 0 600 360">
<defs>
<pattern id="wall-bricks" patternUnits="userSpaceOnUse" width="80" height="30">
<rect width="80" height="30" fill="#e7e5e4"/>
<rect x="0" y="0" width="78" height="28" fill="#f5f5f4" rx="2"/>
<rect x="40" y="15" width="38" height="13" fill="#e7e5e4" rx="2"/>
</pattern>
<linearGradient id="roof-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
<stop offset="0%" stopColor="#ef4444" />
<stop offset="100%" stopColor="#b91c1c" />
</linearGradient>
<linearGradient id="window-glass" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stopColor="#a5f3fc" />
<stop offset="100%" stopColor="#e0f2fe" />
</linearGradient>
<linearGradient id="door-gradient" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stopColor="#78350f" />
<stop offset="100%" stopColor="#451a03" />
</linearGradient>
<filter id="deepShadow" x="-20%" y="-20%" width="140%" height="140%">
<feDropShadow dx="10" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.25"/>
</filter>
</defs>
<g filter="url(#deepShadow)">
<rect x="0" y="340" width="600" height="20" fill="#a8a29e"/>
<rect x="25" y="180" width="550" height="160" fill="url(#wall-bricks)" stroke="#d6d3d1" strokeWidth="1"/>
<path d="M0 190 L300 50 L600 190 H0 Z" fill="url(#roof-gradient)" />
<path d="M-10 195 L300 55 L610 195" stroke="#7f1d1d" strokeWidth="12" strokeLinejoin="round" fill="none"/>
<rect x="420" y="80" width="50" height="80" fill="url(#wall-bricks)" stroke="#d6d3d1"/>
<rect x="410" y="65" width="70" height="15" fill="#b91c1c" rx="3"/>
<rect x="100" y="220" width="100" height="90" fill="#f1f5f9" rx="4"/>
<rect x="105" y="225" width="90" height="80" fill="url(#window-glass)" rx="2"/>
<line x1="150" y1="225" x2="150" y2="305" stroke="#94a3b8" strokeWidth="3"/>
<line x1="105" y1="265" x2="195" y2="265" stroke="#94a3b8" strokeWidth="3"/>
<rect x="400" y="220" width="100" height="90" fill="#f1f5f9" rx="4"/>
<rect x="405" y="225" width="90" height="80" fill="url(#window-glass)" rx="2"/>
<line x1="450" y1="225" x2="450" y2="305" stroke="#94a3b8" strokeWidth="3"/>
<line x1="405" y1="265" x2="495" y2="265" stroke="#94a3b8" strokeWidth="3"/>
<rect x="260" y="220" width="80" height="120" fill="url(#door-gradient)" rx="4"/>
<circle cx="325" cy="280" r="5" fill="#facc15"/>
</g>
</svg>
</motion.div>
);

const BuildingFloor = ({ color }: { color: string }) => (
<motion.div layout initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -150 }} className="relative w-[450px] lg:w-[540px]">
<svg className="w-full h-auto" viewBox="0 0 600 110">
<defs>
<linearGradient id="floor-window-glass-page" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stopColor="#e0f2fe" />
<stop offset="100%" stopColor="#f0f9ff" />
</linearGradient>
<filter id="floorShadow-page">
<feDropShadow dx="8" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.2"/>
</filter>
</defs>
<g filter="url(#floorShadow-page)">
<rect x="25" y="5" width="550" height="100" fill={color} rx="8"/>
<rect x="100" y="25" width="100" height="60" fill="#f1f5f9" rx="4"/>
<rect x="105" y="30" width="90" height="50" fill="url(#floor-window-glass-page)" rx="2"/>
<line x1="150" y1="30" x2="150" y2="80" stroke="#94a3b8" strokeWidth="3"/>
<line x1="105" y1="55" x2="195" y2="55" stroke="#94a3b8" strokeWidth="3"/>
<rect x="400" y="25" width="100" height="60" fill="#f1f5f9" rx="4"/>
<rect x="405" y="30" width="90" height="50" fill="url(#floor-window-glass-page)" rx="2"/>
<line x1="450" y1="30" x2="450" y2="80" stroke="#94a3b8" strokeWidth="3"/>
<line x1="405" y1="55" x2="495" y2="55" stroke="#94a3b8" strokeWidth="3"/>
</g>
</svg>
</motion.div>
);

type CreationMode = 'generator' | 'manual';

const BuildingStrengthMeter = ({ length, mode }: { length: number, mode: CreationMode }) => {
  const calculateFloors = useCallback(() => { if (length >= 25) return 5; if (length >= 20) return 4; if (length >= 16) return 3; if (length >= 12) return 2; if (length >= 8) return 1; return 0; }, [length]);
  const getStrengthLabel = (len: number): { label: string; color: string } => { if (len >= 25) return { label: 'Very Strong', color: 'text-blue-500' }; if (len >= 20) return { label: 'Strong', color: 'text-yellow-500' }; if (len >= 16) return { label: 'Good', color: 'text-green-500' }; if (len >= 12) return { label: 'Fair', color: 'text-orange-500' }; if (len >= 8) return { label: 'Weak', color: 'text-red-500' }; return { label: 'Very Weak', color: 'text-gray-500' }; };
  const [floors, setFloors] = useState(calculateFloors());
  const floorColors = ["#f87171", "#fb923c", "#4ade80", "#facc15", "#60a5fa"];
  
  useEffect(() => { setFloors(calculateFloors()); }, [length, calculateFloors]);
  
  const showBase = mode === 'manual' || length >= 4; 
  const { label, color } = getStrengthLabel(length);

  return (
    <motion.div variants={itemVariants} className="h-full w-full relative flex flex-col justify-start items-center pb-4">
      <div className="flex flex-col items-center gap-1">
        <AnimatePresence>{showBase && <BaseHouse />}</AnimatePresence>
        <AnimatePresence>
          {Array.from({ length: floors }).map((_, i) => (
            <BuildingFloor key={i} color={floorColors[i % floorColors.length]} />
          ))}
        </AnimatePresence>
      </div>
      {showBase && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Password Strength</p>
          <p className={`text-lg font-bold ${color}`}>{label}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const SuccessModal = ({ username, website, password, onClose }: { username: string, website: string, password: string, onClose: () => void }) => {
    const [isCopied, setIsCopied] = useState(false); const [runConfetti, setRunConfetti] = useState(true);
    useEffect(() => { const timer = setTimeout(() => setRunConfetti(false), 5000); return () => clearTimeout(timer); }, []);
    const copyToClipboard = () => { navigator.clipboard.writeText(password); setIsCopied(true); setTimeout(() => setIsCopied(false), 2500); };
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>{runConfetti && <Confetti gravity={0.15} numberOfPieces={200} recycle={false} />}<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-white dark:bg-[#1a2332] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"><div className="p-8 space-y-6"><div className="text-center"><div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full"><CheckCircle className="text-green-500" size={32} /></div><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-3">Credential Secured</h2><p className="text-gray-500 dark:text-gray-400 text-sm">Your new credential has been saved.</p></div><div className="space-y-3 bg-gray-50 dark:bg-[#101828] border border-gray-200 dark:border-gray-700 p-4 rounded-xl"><div className="flex justify-between items-center gap-4"><span className="text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">Username</span><span className="font-medium text-gray-700 dark:text-gray-200 break-all text-right">{username}</span></div><div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div><div className="flex justify-between items-center gap-4"><span className="text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">Website</span><span className="font-medium text-gray-700 dark:text-gray-200 break-all text-right">{website}</span></div></div><div className="bg-gray-100 dark:bg-[#101828] p-4 rounded-lg flex items-center justify-between gap-4 border border-gray-200 dark:border-gray-700"><span className="font-mono text-blue-600 dark:text-blue-400 text-lg break-all">{password}</span><motion.button onClick={copyToClipboard} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0">{isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}</motion.button></div><motion.button onClick={onClose} className="w-full mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-white font-semibold">Done</motion.button></div></motion.div></motion.div>);
};

type CredentialType = 'smart' | 'memorable' | 'pin';
type SmartOptions = { length: number; uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean; };
type MemorableOptions = { words: number; separator: string; capitalize: boolean; };
type PinOptions = { length: number; };
type Options = { smart: SmartOptions; memorable: MemorableOptions; pin: PinOptions; };
const defaultOptions: Options = { smart: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }, memorable: { words: 4, separator: '-', capitalize: true }, pin: { length: 6 } };

export default function CreatePasswordPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<CreationMode>('generator');
    const [credentialType, setCredentialType] = useState<CredentialType>('smart');
    const [options, setOptions] = useState<Options>(defaultOptions);
    const [generatedCredential, setGeneratedCredential] = useState('');
    const [manualPassword, setManualPassword] = useState('');
    const [website, setWebsite] = useState('');
    const [customUsername, setCustomUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedCredentialDetails, setSavedCredentialDetails] = useState({ username: '', website: '', password: '' });
    
    const generateCredential = useCallback(async () => {
        if (mode === 'manual') return;
        setIsCopied(false);
        try {
            const response = await apiFetch('/password-generator/user/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: credentialType, options: options[credentialType] })
            });
            setGeneratedCredential(response.password);
        } catch (error) {
            const errorMessage = (error as any).message || (error as any).error || 'Unknown API Error';
            console.error("Failed to generate password:", errorMessage);
            setGeneratedCredential("Error generating password!");
        }
    }, [credentialType, options, mode]);

    useEffect(() => {
        if (mode === 'generator') {
            generateCredential();
        }
    }, [generateCredential, mode]);

    const handleOptionChange = (type: CredentialType, key: string, value: any) => {
        setOptions(prev => ({ ...prev, [type]: { ...prev[type], [key]: value } }));
    };

    const handleSave = async () => {
        const passwordToSave = mode === 'manual' ? manualPassword : generatedCredential;
        if (!website || !passwordToSave) {
            return;
        }
        setIsSaving(true);
        try {
            await apiFetch('/password-generator/user/passwords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    website: website, 
                    password: passwordToSave,
                    custom_username: customUsername 
                })
            });
            
            setSavedCredentialDetails({ 
                username: customUsername || user?.display_name || user?.username || 'Your Account', 
                website: website, 
                password: passwordToSave 
            });
            setShowSuccessModal(true);
            setWebsite('');
            setCustomUsername('');
            setManualPassword('');
            if (mode === 'generator') {
                generateCredential();
            }
            router.refresh();
        } catch (error) {
            console.error("Save Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedCredential) return;
        navigator.clipboard.writeText(generatedCredential);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getActiveLength = () => {
        if (mode === 'manual') {
            return manualPassword.length;
        }
        return credentialType === 'smart' ? options.smart.length : credentialType === 'memorable' ? options.memorable.words * 6 : options.pin.length;
    };

    const currentLength = getActiveLength();
    const smartOptionLabels: { [key: string]: string } = { uppercase: 'ABC', lowercase: 'abc', numbers: '123', symbols: '#$&' };
    
    return (
        <>
            <AnimatePresence>
                {showSuccessModal && <SuccessModal {...savedCredentialDetails} onClose={() => setShowSuccessModal(false)} />}
            </AnimatePresence>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/2 flex-shrink-0 space-y-6">
                    <Panel className="p-1.5 flex justify-center gap-1">
                        {(['generator', 'manual'] as CreationMode[]).map(m => (
                            <button key={m} onClick={() => setMode(m)} className="relative w-full px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                {mode === m && <motion.div layoutId="active-mode-pill" className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />}
                                <span className="relative z-10 capitalize font-semibold">{m}</span>
                            </button>
                        ))}
                    </Panel>
                    <Panel className="p-6">
                        <div className="flex flex-col gap-4">
                            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website Name or URL (e.g., Google)" className="w-full bg-gray-100 dark:bg-[#101828] border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:placeholder:text-gray-500 text-base" />
                            <input type="text" value={customUsername} onChange={(e) => setCustomUsername(e.target.value)} placeholder="Custom Username (optional)" className="w-full bg-gray-100 dark:bg-[#101828] border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:placeholder:text-gray-500 text-base" />
                            {mode === 'manual' && (
                                <input type="text" value={manualPassword} onChange={(e) => setManualPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-gray-100 dark:bg-[#101828] border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 dark:placeholder:text-gray-500 text-base font-mono" />
                            )}
                            <motion.button onClick={handleSave} disabled={isSaving || !website || (mode === 'manual' ? !manualPassword : !generatedCredential)} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg text-white font-semibold disabled:bg-blue-400 dark:disabled:bg-blue-700 disabled:cursor-not-allowed">{isSaving ? 'Saving...' : 'Save Securely'}</motion.button>
                        </div>
                    </Panel>
                    {mode === 'generator' && (
                        <>
                            <Panel initial="hidden" animate="visible" className="p-1.5 flex justify-center gap-1">
                                {(['smart', 'memorable', 'pin'] as CredentialType[]).map(type => (
                                    <button key={type} onClick={() => setCredentialType(type)} className="relative w-full px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                        {credentialType === type && <motion.div layoutId="active-pill" className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />}
                                        <span className="relative z-10 capitalize font-semibold">{type}</span>
                                    </button>
                                ))}
                            </Panel>
                            <Panel initial="hidden" animate="visible" className="p-6 flex flex-col items-center justify-center gap-3 min-h-[140px]">
                                <div className="w-full text-center">
                                    <AnimatePresence mode="wait">
                                        <DecryptingText targetText={generatedCredential} />
                                    </AnimatePresence>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <motion.button onClick={generateCredential} className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-[#101828]"><RefreshCw size={18} /></motion.button>
                                    <motion.button onClick={copyToClipboard} className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-[#101828]">
                                        {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                    </motion.button>
                                </div>
                            </Panel>
                            <Panel initial="hidden" animate="visible" className="p-6">
                                <AnimatePresence mode="wait">
                                    {credentialType === 'smart' && (
                                        <motion.div key="smart" className="space-y-5">
                                            <div className="flex flex-col">
                                                <label className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2"><span>Length</span> <strong className="dark:text-gray-200">{options.smart.length}</strong></label>
                                                <input type="range" min="6" max="64" value={options.smart.length} onChange={(e) => handleOptionChange('smart', 'length', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"/>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                {(['uppercase', 'lowercase', 'numbers', 'symbols'] as (keyof SmartOptions)[]).map(key => (
                                                    <div key={key} onClick={() => handleOptionChange('smart', key, !options.smart[key])} className="flex items-center gap-3 cursor-pointer">
                                                        <div className={`w-5 h-5 rounded-md border-2 ${options.smart[key] ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center`}>
                                                            {options.smart[key] && <Check size={14} className="text-white" />}
                                                        </div>
                                                        <label className="text-base cursor-pointer select-none dark:text-gray-200">{smartOptionLabels[key as keyof typeof smartOptionLabels]}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                    {credentialType === 'memorable' && (
                                        <motion.div key="memorable" className="space-y-5">
                                            <div className="flex flex-col">
                                                <label className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2"><span>Words</span> <strong className="dark:text-gray-200">{options.memorable.words}</strong></label>
                                                <input type="range" min="3" max="10" value={options.memorable.words} onChange={(e) => handleOptionChange('memorable', 'words', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"/>
                                            </div>
                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOptionChange('memorable', 'capitalize', !options.memorable.capitalize)}>
                                                <div className={`w-5 h-5 rounded-md border-2 ${options.memorable.capitalize ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center`}>
                                                    {options.memorable.capitalize && <Check size={14} className="text-white" />}
                                                </div>
                                                <label className="text-base cursor-pointer select-none dark:text-gray-200">Capitalize</label>
                                            </div>
                                        </motion.div>
                                    )}
                                    {credentialType === 'pin' && (
                                        <motion.div key="pin" className="space-y-5">
                                            <div className="flex flex-col">
                                                <label className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2"><span>Length</span> <strong className="dark:text-gray-200">{options.pin.length}</strong></label>
                                                <input type="range" min="4" max="20" value={options.pin.length} onChange={(e) => handleOptionChange('pin', 'length', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"/>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Panel>
                        </>
                    )}
                </div>
                <div className="w-full lg:w-1/2 flex-shrink-0 self-stretch">
                    <BuildingStrengthMeter length={currentLength} mode={mode} />
                </div>
            </motion.div>
        </>
    );
}