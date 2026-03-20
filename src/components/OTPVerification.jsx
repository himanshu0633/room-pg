import React, { useState, useRef, useEffect } from 'react';
import { HiMail, HiArrowLeft, HiRefresh, HiCheckCircle, HiClock, HiOutlineClipboardCopy } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const OTPVerification = ({ email, userId, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\s/g, '').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit code');
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    if (pastedData.length < 6) {
      inputRefs.current[pastedData.length].focus();
    } else {
      inputRefs.current[5].focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp: otpValue });
      toast.success('Email verified successfully!');
      setTimeout(() => onSuccess(), 1000);
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(300);
    
    try {
      await authAPI.resendOTP({ email, userId });
      toast.success('OTP resent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
      setCanResend(true);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setIsCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-600';
    if (timeLeft < 120) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getTimeIcon = () => {
    if (timeLeft < 60) return <HiClock className="animate-pulse" />;
    return <HiClock />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-fadeInUp">
          {/* Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          <div className="p-6 sm:p-8">
            {/* Back Button */}
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-all hover:translate-x-[-4px] group"
            >
              <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>

            {/* Icon with Pulse Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <HiMail className="text-4xl text-white animate-bounce-slow" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-center mb-2">
              We've sent a verification code to
            </p>
            
            {/* Email Display with Copy */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <p className="text-base sm:text-lg font-semibold text-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                {email}
              </p>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors relative group"
                title="Copy email"
              >
                <HiOutlineClipboardCopy className="text-lg" />
                {isCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength="1"
                  autoComplete="off"
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold 
                    border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all
                    ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                  `}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer with Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTimeIcon()}
                <p className="text-sm text-gray-600">
                  Time remaining: 
                  <span className={`font-semibold ml-1 ${getTimeColor()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeLeft < 60 ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${(timeLeft / 300) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={loading || otp.some(digit => !digit)}
              className={`
                w-full py-3 rounded-xl font-semibold transition-all transform
                flex items-center justify-center gap-2
                ${loading || otp.some(digit => !digit)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle className="text-xl" />
                  <span>Verify Email</span>
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    className="text-blue-600 font-semibold hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-all"
                  >
                    <HiRefresh className="text-lg animate-spin-slow" />
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400 inline-flex items-center gap-1">
                    <HiRefresh className="text-lg opacity-50" />
                    Resend OTP
                  </span>
                )}
              </p>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Didn't receive email? Check your spam folder or contact support
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;