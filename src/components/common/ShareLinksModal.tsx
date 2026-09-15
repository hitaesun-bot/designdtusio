import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Share2,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinksModal: React.FC<ShareLinksModalProps> = ({ isOpen, onClose }) => {
  const { getRoleUrls, switchRole, resetAllProgressToZero, currentUser } = useAuth();
  const [copiedType, setCopiedType] = useState<'student' | 'professor' | null>(null);
  const [resetDone, setResetDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const { studentUrl, professorUrl } = getRoleUrls();

  const handleCopy = (type: 'student' | 'professor', url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleReset = async () => {
    if (window.confirm('모든 팀의 보고서 및 진행률을 0%로 초기화하시겠습니까? (3주차 수업 시작 상태)')) {
      await resetAllProgressToZero();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#D8D4CD] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202020] text-white flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5 text-[#D65A2F]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#202020]">
                학생 & 교수자 접속 링크 분리 안내
              </h2>
              <p className="text-xs text-stone-500">
                각 역할에 맞는 URL을 복사하여 학생 및 교수자에게 전달할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {/* Student Link Card */}
          <div className="p-4 rounded-xl border border-orange-200 bg-[#FFF8F3] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-[#D65A2F]">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#202020]">1. 학생 접속용 링크</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-200 text-orange-900">
                      3주차 결과물 등록 & 팀 수정
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    학생들에게 이 링크를 배포하세요. 접속 즉시 3주차 결과물 등록 및 팀 정보 수정 화면으로 진입합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                readOnly
                type="text"
                value={studentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-orange-300 rounded-lg text-stone-700 select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy('student', studentUrl)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#D65A2F] text-white hover:bg-[#b84821] transition-all shadow-xs flex-shrink-0 cursor-pointer"
              >
                {copiedType === 'student' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>링크 복사</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  switchRole('student');
                  onClose();
                }}
                className="p-2 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-white bg-white/60 transition-colors flex-shrink-0"
                title="학생 화면으로 바로 전환"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Professor Link Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-stone-200 text-stone-800">
                  <ShieldCheck className="w-4 h-4 text-rose-700" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#202020]">2. 교수자 접속용 링크</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-900">
                      16개 팀 진도 관리 & 피드백
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    교수자가 16개 팀 전체 진도 현황을 모니터링하고 피드백을 전달할 때 사용하는 링크입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                readOnly
                type="text"
                value={professorUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-700 select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy('professor', professorUrl)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#202020] text-white hover:bg-black transition-all shadow-xs flex-shrink-0 cursor-pointer"
              >
                {copiedType === 'professor' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>링크 복사</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  switchRole('professor');
                  onClose();
                }}
                className="p-2 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-white bg-white/60 transition-colors flex-shrink-0"
                title="교수자 화면으로 바로 전환"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Week 3 Fresh Start Info */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              현재 <strong>3주차 탐색·리서치</strong> 단계가 활성화되어 있으며, 모든 팀의 진도가 0%로 깨끗하게 대기 중입니다.
            </span>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline flex-shrink-0 cursor-pointer"
            title="모든 팀의 제출 보고서 및 진행률을 다시 0%로 초기화"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{resetDone ? '초기화 완료' : '진도 재초기화'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
