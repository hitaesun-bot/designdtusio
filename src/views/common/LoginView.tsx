import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Users, HelpCircle, ArrowRight, Play, AlertTriangle } from 'lucide-react';

interface LoginViewProps {
  onOpenFirebaseGuide: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenFirebaseGuide }) => {
  const { loginWithGoogle, enableDemoMode, isFirebaseConfigured, classInfo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#D8D4CD] rounded-2xl p-8 shadow-xs space-y-8 text-center">
        {/* Course badge & title */}
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#202020] text-white flex items-center justify-center font-bold text-lg mx-auto">
            DS2
          </div>
          <div>
            <span className="text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
              {classInfo.semester} · {classInfo.department}
            </span>
            <h2 className="text-2xl font-bold text-[#202020] tracking-tight mt-1">
              DSII TEAM TRACKER
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Design Studio II · Team Progress Management
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login actions */}
        <div className="space-y-3">
          {/* Google Sign in button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#D8D4CD] rounded-xl text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google 계정으로 로그인</span>
          </button>

          {/* Quick Demo Mode for immediate evaluation */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D8D4CD]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-stone-400">또는 바로 체험</span>
            </div>
          </div>

          <button
            onClick={() => enableDemoMode('professor')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#202020] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-2xs cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>데모 모드로 시작하기</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Firebase Config Notice */}
        {!isFirebaseConfigured && (
          <div className="text-left p-3.5 rounded-lg bg-[#F5F2EC] border border-[#D8D4CD] text-xs text-stone-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#202020]">💡 Firebase 환경변수 안내</span>
              <button
                onClick={onOpenFirebaseGuide}
                className="text-xs font-semibold text-[#D65A2F] underline hover:text-[#b84821]"
              >
                설정 방법 보기
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">
              Google Firebase 키를 등록하면 실제 Google 로그인 및 클라우드 DB 저장이 연동됩니다.
            </p>
          </div>
        )}

        <div className="pt-2 text-[11px] text-stone-400">
          Design Studio II · 15주 팀 프로젝트 관리 시스템
        </div>
      </div>
    </div>
  );
};
