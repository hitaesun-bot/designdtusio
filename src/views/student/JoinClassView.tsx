import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, CheckCircle2, Clock, Users, ArrowRight, AlertTriangle } from 'lucide-react';

export const JoinClassView: React.FC = () => {
  const { currentUser, classInfo, requestJoinClass } = useAuth();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isJoinedClass = currentUser?.classId === classInfo.id;
  const isAssignedTeam = Boolean(currentUser?.teamId);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const res = await requestJoinClass(code.trim());
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setCode('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Course Info Card */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
            {classInfo.semester} · {classInfo.department}
          </span>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight mt-0.5">
            {classInfo.title} ({classInfo.englishTitle})
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            본 교과목은 15주간의 팀 프로젝트 기반 디자인스튜디오 수업입니다.
          </p>
        </div>

        {/* Join Code Input Form (if not joined yet) */}
        {!isJoinedClass ? (
          <form onSubmit={handleSubmitCode} className="space-y-4 pt-4 border-t border-[#D8D4CD]">
            <div>
              <label htmlFor="join-code" className="block text-sm font-bold text-[#202020] mb-1">
                수업 참여 코드 입력
              </label>
              <p className="text-xs text-stone-500 mb-2">
                교수님이 오리엔테이션에서 공지한 참여 코드를 입력하세요. (테스트용 코드: <strong className="text-[#D65A2F] font-mono">{classInfo.joinCode}</strong>)
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="join-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="DS2-2026-STUDIO"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D8D4CD] bg-stone-50 text-sm font-mono tracking-wider text-[#202020] uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="px-5 py-2.5 bg-[#202020] text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>참여 등록</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">교과목 참여 코드가 인증되었습니다.</span>
              <p className="text-xs text-emerald-700 mt-0.5">
                등록 사용자: {currentUser?.displayName} ({currentUser?.email})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Waiting for Team Assignment Notice */}
      {!isAssignedTeam && (
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#202020]">
              교수자의 팀 배정을 기다리고 있습니다
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              교수자가 01분반 또는 02분반 및 팀(3~4명) 편성을 진행 중입니다. 배정이 완료되면 자동으로 팀 대시보드로 이동합니다.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 text-left max-w-md mx-auto space-y-1.5">
            <div className="font-bold text-[#202020] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D65A2F]" />
              <span>학생 역할 구분 안내:</span>
            </div>
            <div>• <strong>팀장 (teamLeader)</strong>: 매주 주간 진행 보고서 작성 및 교수 제출, 증빙자료 업로드 권한 부여</div>
            <div>• <strong>팀원 (teamMember)</strong>: 팀 보고서 및 교수 피드백 열람 권한 (다른 팀 자료 열람 불가)</div>
          </div>
        </div>
      )}
    </div>
  );
};
