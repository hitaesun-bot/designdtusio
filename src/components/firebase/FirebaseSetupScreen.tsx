import React from 'react';
import { Shield, Database, CheckCircle2, Copy, Play, ArrowRight, ExternalLink } from 'lucide-react';

interface FirebaseSetupScreenProps {
  onContinueDemo: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const FirebaseSetupScreen: React.FC<FirebaseSetupScreenProps> = ({
  onContinueDemo,
  isModal = false,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const envSample = `# .env 설정 예시
FIREBASE_API_KEY="AIzaSy..."
FIREBASE_AUTH_DOMAIN="ds2-studio.firebaseapp.com"
FIREBASE_PROJECT_ID="ds2-studio"
FIREBASE_STORAGE_BUCKET="ds2-studio.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="123456789"
FIREBASE_APP_ID="1:123456789:web:abcdef"

# 교수자 권한 이메일 (쉼표 구분, 서버 검증용)
PROFESSOR_EMAILS="professor@university.ac.kr, advisor@studio.design"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xs border border-[#D8D4CD] p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span>Firebase 연결 안내</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202020] tracking-tight">
            Firebase 연결이 필요합니다
          </h2>
          <p className="text-sm text-stone-600">
            실제 인증 및 데이터 저장을 위해 Google Firebase 프로젝트 환경변수 설정이 필요합니다.
          </p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 text-sm font-semibold"
          >
            닫기
          </button>
        )}
      </div>

      {/* Quick launch demo mode banner */}
      <div className="bg-[#F5F2EC] border border-[#D8D4CD] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#202020]">
            💡 즉시 UI 및 기능 검토가 필요하신가요?
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            4개 팀과 15주 데이터가 준비된 <strong>개발 전용 데모 모드</strong>로 교수자 및 학생 역할을 즉시 체험할 수 있습니다.
          </p>
        </div>
        <button
          onClick={onContinueDemo}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#D65A2F] text-white text-sm font-bold hover:bg-[#c04e25] transition-colors shadow-xs cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>데모 모드로 체험하기</span>
        </button>
      </div>

      {/* Setup instructions */}
      <div className="space-y-4 pt-2 border-t border-[#D8D4CD]">
        <h3 className="text-sm font-bold text-[#202020]">
          프로덕션 / 실사용 환경변수 등록 방법
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
          <div className="p-3 rounded border border-stone-200 bg-stone-50 space-y-1">
            <div className="font-bold text-[#202020]">1. Firebase Console 설정</div>
            <p className="text-stone-600">
              Firebase 콘솔에서 Authentication (Google 로그인), Cloud Firestore, Cloud Storage를 활성화합니다.
            </p>
          </div>

          <div className="p-3 rounded border border-stone-200 bg-stone-50 space-y-1">
            <div className="font-bold text-[#202020]">2. 교수자 권한 보호</div>
            <p className="text-stone-600">
              <code>PROFESSOR_EMAILS</code> 변수에 교수자의 구글 이메일을 등록하면 서버가 토큰 검증 후 역할을 부여합니다.
            </p>
          </div>
        </div>

        {/* Code snippet */}
        <div className="relative">
          <div className="flex items-center justify-between bg-stone-800 text-stone-300 text-xs px-4 py-2 rounded-t-md font-mono">
            <span>.env 또는 Cloud Run 환경변수</span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '복사하기'}</span>
            </button>
          </div>
          <pre className="p-4 bg-stone-900 text-stone-100 text-xs font-mono rounded-b-md overflow-x-auto leading-relaxed">
            {envSample}
          </pre>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {content}
    </div>
  );
};
