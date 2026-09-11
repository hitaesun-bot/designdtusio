import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface TestVerificationBarProps {
  onNavigateToTab: (tab: any, teamId?: string) => void;
  onSimulateAccessDenied: () => void;
}

export const TestVerificationBar: React.FC<TestVerificationBarProps> = ({
  onNavigateToTab,
  onSimulateAccessDenied,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { switchDemoPersona, saveReport, submitFeedback, classInfo } = useAuth();
  const [activeTestMessage, setActiveTestMessage] = useState<string | null>(null);

  // Run Test 1
  const runTest1 = async () => {
    switchDemoPersona('lumaLeader');
    onNavigateToTab('current-week');
    setActiveTestMessage('테스트 1 실행: 팀장(이지우)으로 전환되었습니다. 6주차 진행률 65% 및 과업을 확인하고 [교수님께 제출]을 클릭해보세요. (이미 입력 완료된 상태)');
  };

  // Run Test 2
  const runTest2 = async () => {
    switchDemoPersona('professor');
    onNavigateToTab('teams', 'team-luma');
    setActiveTestMessage('테스트 2 실행: 교수자(김태선 교수)로 전환되었습니다. LUMA 팀의 [테스트2 예시 채우기] 후 [피드백 저장 및 학생에게 전달]을 누르면 학생 화면에 보완 상태와 재제출 버튼이 반영됩니다.');
  };

  // Run Test 3
  const runTest3 = () => {
    onSimulateAccessDenied();
    setActiveTestMessage('테스트 3 실행: 일반 팀원(박민재)이 보고서 수정 페이지에 직접 접근하여 시스템 보안 정책에 의해 [접근 권한이 없습니다] 화면으로 안전하게 차단되었습니다.');
  };

  return (
    <aside aria-label="요구사항 검증 테스트 도구" className="fixed bottom-0 inset-x-0 z-40 bg-[#202020] text-white border-t border-stone-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold tracking-tight">
            요구사항 검증 테스트 시나리오 (3가지 필수 테스트)
          </span>
          {activeTestMessage && (
            <span className="hidden md:inline-block text-[11px] text-amber-300 truncate max-w-xl">
              {activeTestMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium"
          >
            <span>{isOpen ? '패널 접기' : '테스트 도구 열기'}</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-stone-800 p-4 bg-[#181818]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Test 1 Card */}
            <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">테스트 1: 팀장 보고서 제출</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  학생 팀장
                </span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                팀장이 6주차 진행률 65%, 결과, 증빙, 문제점, 다음 할 일을 입력하고 제출 → 교수자 현황판에 즉시 &apos;피드백 대기&apos;로 반영
              </p>
              <button
                onClick={runTest1}
                className="w-full py-1.5 px-2.5 rounded bg-[#D65A2F] text-white font-bold hover:bg-[#b84821] flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>테스트 1 바로 실행하기</span>
              </button>
            </div>

            {/* Test 2 Card */}
            <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">테스트 2: 교수 피드백 (보완)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  교수자
                </span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                교수자가 &apos;보완&apos; 및 &apos;접합 구조를 1:1 목업으로 검증할 것&apos; 입력 → 학생 화면에 피드백과 과업이 표시되고 재제출 버튼 활성화
              </p>
              <button
                onClick={runTest2}
                className="w-full py-1.5 px-2.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-600 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>테스트 2 바로 실행하기</span>
              </button>
            </div>

            {/* Test 3 Card */}
            <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">테스트 3: 권한 차단 검증</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  보안 검증
                </span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                일반 팀원이 보고서 수정 화면/URL에 직접 접근 시도시 차단되며 &apos;접근 권한이 없습니다&apos; 화면 표시
              </p>
              <button
                onClick={runTest3}
                className="w-full py-1.5 px-2.5 rounded bg-rose-800 text-white font-bold hover:bg-rose-700 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>테스트 3 바로 실행하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
