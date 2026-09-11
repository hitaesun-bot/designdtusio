import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedViewProps {
  message?: string;
  onGoBack?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  message = '해당 보고서를 수정하거나 접근할 권한이 없습니다. 보고서 작성 및 수정은 해당 팀의 팀장만 가능합니다.',
  onGoBack,
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#D8D4CD] rounded-xl p-8 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#202020]">접근 권한이 없습니다</h2>
          <p className="text-sm text-stone-600 leading-relaxed">{message}</p>
        </div>

        <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-xs text-stone-500 text-left space-y-1">
          <div className="font-semibold text-stone-700">보안 정책 안내:</div>
          <div>• 일반 팀원은 보고서와 교수 피드백 열람만 가능합니다.</div>
          <div>• 다른 팀의 보고서 및 자료는 접근할 수 없습니다.</div>
          <div>• 승인된 보고서는 학생이 임의로 수정할 수 없습니다.</div>
        </div>

        {onGoBack && (
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#202020] text-white text-sm font-medium hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기</span>
          </button>
        )}
      </div>
    </div>
  );
};
