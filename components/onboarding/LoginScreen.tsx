
import React, { useState, useRef, useEffect } from 'react';
import { Flame, Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, Check } from 'lucide-react';

interface Props {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (isSignUp && !termsAccepted) return;
    
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        if (isSignUp) {
            setStep('otp');
        } else {
            onLogin(username);
        }
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]; // limit to 1 char
    if (!/^\d*$/.test(value)) return; // only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace moves back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => !digit)) return; // Ensure all filled

    setLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      onLogin(username);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-acid-green/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-punch-blue/10 rounded-full blur-[80px] animate-pulse-slow delay-1000 pointer-events-none"></div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-4 shadow-xl rotate-3 transform hover:rotate-6 transition-transform">
                    <Flame size={40} className="text-acid-green fill-acid-green" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mb-1">
                    Commit<span className="text-transparent bg-clip-text bg-gradient-to-r from-acid-green to-orange-400">AI</span>
                </h1>
                <p className="text-gray-500 font-bold text-sm tracking-wide">You v/s Who?</p>
            </div>

            <div className="glass-panel bg-white/80 p-8 rounded-[40px] shadow-glass relative transition-all duration-500">
                
                {step === 'auth' ? (
                    <>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                            <button 
                                onClick={() => setIsSignUp(true)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isSignUp ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Sign Up
                            </button>
                            <button 
                                onClick={() => setIsSignUp(false)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!isSignUp ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Log In
                            </button>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute top-4 left-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            {isSignUp && (
                                <div className="relative group animate-in slide-in-from-top-2 fade-in">
                                    <Mail className="absolute top-4 left-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            )}

                            <div className="relative group">
                                <Lock className="absolute top-4 left-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            {isSignUp && (
                                <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div 
                                        onClick={() => setTermsAccepted(!termsAccepted)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer transition-all group"
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                            {termsAccepted && <Check size={16} className="text-white" />}
                                        </div>
                                        <div className="flex-1 text-xs text-gray-500 leading-tight">
                                            I accept the <span className="font-bold text-black underline">Terms & Conditions</span> and Privacy Policy
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading || (isSignUp && !termsAccepted)}
                                    className={`
                                        w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-gray-900 transition-all
                                        ${(isSignUp && !termsAccepted) ? 'opacity-50 cursor-not-allowed transform-none' : 'active:scale-95'}
                                    `}
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Loading...</span>
                                    ) : (
                                        <>
                                            {isSignUp ? 'Start Journey' : 'Enter Arena'} <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* OTP SCREEN */
                    <div className="animate-in slide-in-from-right-10 fade-in duration-300">
                        <button 
                            onClick={() => setStep('auth')}
                            className="absolute top-8 left-8 text-gray-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="text-center mb-8 mt-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={32} className="text-black" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
                            <p className="text-xs text-gray-500 font-medium mt-1 px-4">
                                We sent a 4-digit code to <br/><span className="text-black font-bold">{email || 'your email'}</span>
                            </p>
                        </div>

                        <form onSubmit={handleOtpSubmit}>
                            <div className="flex justify-between gap-3 mb-8">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => otpRefs.current[idx] = el}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        className="w-full aspect-square bg-gray-50 border-2 border-transparent focus:border-acid-green focus:bg-white text-center text-2xl font-black rounded-2xl outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || otp.some(d => !d)}
                                className={`
                                    w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl transition-all
                                    ${otp.some(d => !d) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900 active:scale-95'}
                                `}
                            >
                                {loading ? (
                                    <span className="animate-pulse">Verifying...</span>
                                ) : (
                                    <>Verify Access <ArrowRight size={18} /></>
                                )}
                            </button>

                            <div className="text-center mt-6">
                                <button type="button" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
                                    Resend Code
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
