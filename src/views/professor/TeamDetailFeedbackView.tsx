import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedbackReviewStatus, WeeklyReport } from '../../types';
import { StatusTag } from '../../components/common/StatusTag';
import { ProgressBar } from '../../components/common/ProgressBar';
import { TimelineView } from '../student/TimelineView';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  FileText,
  Link2,
  Calendar,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface TeamDetailFeedbackViewProps {
  selectedTeamId: string;
  onBack: () => void;
}

export const TeamDetailFeedbackView: React.FC<TeamDetailFeedbackViewProps> = ({
  selectedTeamId,
  onBack,
}) => {
  const { currentUser, teams, reports, feedbacks, submitFeedback, classInfo } = useAuth();

  const team = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const [selectedWeek, setSelectedWeek] = useState<number>(classInfo.currentWeek);

  // Find report for this team and selected week
  const report = reports.find((r) => r.teamId === team.id && r.week === selectedWeek);
  const feedbackList = feedbacks.filter((f) => f.teamId === team.id);
  const currentFeedback = report ? feedbackList.find((f) => f.reportId === report.id) : undefined;

  // Feedback form state
  const [reviewStatus, setReviewStatus] = useState<FeedbackReviewStatus>(
    currentFeedback?.reviewStatus || 'needsRevision'
  );
  const [comment, setComment] = useState<string>(currentFeedback?.comment || '');
  const [nextTask, setNextTask] = useState<string>(currentFeedback?.nextTask || '');
  const [dueDate, setDueDate] = useState<string>(currentFeedback?.dueDate || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string | null>(null);

  // Quick preset button for Test 2!
  const applyTest2Preset = () => {
    setReviewStatus('needsRevision');
    setComment('접합 구조를 1:1 목업으로 검증할 것. 하중 분산과 부재 결합부의 흔들림을 집중적으로 확인하세요.');
    setNextTask('1:1 스케일 부재 목업 결합 시험 및 조인트 부위 3D 렌더링 보완');
    setDueDate('2026-09-18');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) {
      alert('피드백을 작성할 주간 보고서가 존재하지 않습니다.');
      return;
    }
    if (!comment.trim()) {
      alert('교수 의견을 입력해주세요.');
      return;
    }
    if (!nextTask.trim()) {
      alert('다음 주까지 수행해야 할 과업을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackSuccessMessage(null);

    const result = await submitFeedback({
      classId: classInfo.id,
      sectionId: team.sectionId,
      teamId: team.id,
      reportId: report.id,
      week: selectedWeek,
      professorId: currentUser?.uid || 'prof-kim',
      professorName: currentUser?.displayName || '김태선 교수',
      reviewStatus,
      comment: comment.trim(),
      nextTask: nextTask.trim(),
      dueDate: dueDate ? dueDate : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFeedbackSuccessMessage(result.message);
      setTimeout(() => setFeedbackSuccessMessage(null), 4000);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#202020] px-3 py-1.5 rounded bg-white border border-[#D8D4CD] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>전체 팀 현황판으로 돌아가기</span>
        </button>

        {/* Team selector tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-md">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                // switch to this team
                window.location.hash = `#team-${t.id}`;
              }}
              className={`text-xs px-2.5 py-1 rounded font-medium whitespace-nowrap ${
                t.id === team.id
                  ? 'bg-[#202020] text-white font-bold'
                  : 'bg-white text-stone-600 border border-[#D8D4CD] hover:bg-stone-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Team Header Info Card */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D65A2F] uppercase mb-1">
            <span>{team.sectionName}</span>
            <span>·</span>
            <span>팀 프로젝트 상세 & 교수 피드백</span>
          </div>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight">{team.name}</h2>
          <div className="text-xs text-stone-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              팀장: <strong className="text-stone-900">{team.leaderName}</strong>
            </span>
            <span>
              팀원: {team.memberNames.filter((n) => !n.includes('팀장')).join(', ')}
            </span>
          </div>
        </div>

        {/* Week Selector for this team */}
        <div className="bg-[#F5F2EC] p-3 rounded-lg border border-[#D8D4CD] flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase">
              주차 선택
            </label>
            <select
              aria-label="주차 선택"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-white border border-[#D8D4CD] rounded px-3 py-1.5 text-xs font-bold text-[#202020] mt-0.5"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}주차 {w === classInfo.currentWeek ? '(현재 주차)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="border-l border-[#D8D4CD] pl-3">
            <span className="block text-[11px] font-bold text-stone-500 uppercase">
              해당 주차 상태
            </span>
            <div className="mt-1">
              <StatusTag status={report ? report.status : 'delayed'} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left (Student Report Details) & Right (Professor Feedback Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Weekly Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8D4CD] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D65A2F]" />
                <h3 className="text-base font-bold text-[#202020]">
                  {selectedWeek}주차 학생 제출 보고서
                </h3>
              </div>
              {report?.submittedAt && (
                <span className="text-xs text-stone-500">
                  제출: {new Date(report.submittedAt).toLocaleString('ko-KR')}
                </span>
              )}
            </div>

            {report ? (
              <div className="space-y-5 text-sm">
                {/* 1. Progress */}
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase mb-1">
                    1. 진행률
                  </div>
                  <ProgressBar progress={report.progress} size="lg" />
                </div>

                {/* 2. Weekly Results */}
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase mb-1">
                    2. 이번 주 결과
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg border border-[#D8D4CD] text-[#202020] whitespace-pre-line leading-relaxed">
                    {report.weeklyResult}
                  </div>
                </div>

                {/* 3. Evidence Materials */}
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase mb-2">
                    3. 증빙 자료
                  </div>
                  {report.evidenceFiles && report.evidenceFiles.length > 0 ? (
                    <div className="space-y-1.5 mb-3">
                      {report.evidenceFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2.5 rounded border border-stone-200 bg-stone-50 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#D65A2F] flex-shrink-0" />
                            <span className="font-semibold text-stone-800 truncate">
                              {f.name}
                            </span>
                            <span className="text-stone-400">
                              ({(f.size / (1024 * 1024)).toFixed(1)}MB)
                            </span>
                          </div>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-[#D65A2F] hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
                          >
                            <span>다운로드/열람</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic mb-2">업로드된 파일 없음</p>
                  )}

                  {report.evidenceLinks && report.evidenceLinks.length > 0 && (
                    <div className="space-y-1.5">
                      {report.evidenceLinks.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between p-2.5 rounded border border-stone-200 bg-stone-50 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                              {l.type}
                            </span>
                            <span className="font-mono text-stone-800 truncate">{l.url}</span>
                            {l.description && (
                              <span className="text-stone-500">· {l.description}</span>
                            )}
                          </div>
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
                          >
                            <span>바로가기</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Issues */}
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase mb-1">
                    4. 문제점
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-lg border border-[#D8D4CD]">
                    {report.noIssue ? (
                      <span className="text-emerald-700 font-semibold text-xs">
                        ✓ 학생 팀이 &apos;현재 문제 없음&apos;으로 보고함
                      </span>
                    ) : (
                      <div className="text-xs text-amber-900 font-medium">
                        {report.issue || '작성된 문제점이 없습니다.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Next Actions */}
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase mb-1">
                    5. 다음 할 일
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-lg border border-[#D8D4CD] text-xs text-stone-800 whitespace-pre-line leading-relaxed">
                    {report.nextAction}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-stone-400 space-y-2">
                <p className="text-sm font-semibold">
                  {selectedWeek}주차에 등록된 학생 보고서가 없습니다.
                </p>
                <p className="text-xs">
                  아직 학생 팀장이 보고서를 임시저장하거나 제출하지 않았습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Professor Feedback Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-[#D65A2F]/40 rounded-xl p-6 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-[#D8D4CD] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D65A2F]" />
                <h3 className="text-base font-bold text-[#202020]">교수 피드백 작성</h3>
              </div>

              {/* Quick test preset trigger */}
              <button
                type="button"
                onClick={applyTest2Preset}
                className="text-[11px] font-semibold text-[#D65A2F] bg-orange-50 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100"
                title="테스트 2 보완 의견 자동 채우기"
              >
                테스트2 예시 채우기
              </button>
            </div>

            {feedbackSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedbackSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* 1. Review Status Radio Selection */}
              <div>
                <label className="block text-xs font-bold text-[#202020] uppercase mb-2">
                  검토 상태 지정 <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved')}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                        : 'bg-stone-50 border-[#D8D4CD] text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>승인 (Approved)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('needsRevision')}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'needsRevision'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600'
                        : 'bg-stone-50 border-[#D8D4CD] text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>보완 (Revision)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('delayed')}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      reviewStatus === 'delayed'
                        ? 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-600'
                        : 'bg-stone-50 border-[#D8D4CD] text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>지연 (Delayed)</span>
                  </button>
                </div>
                <div className="text-[11px] text-stone-500 mt-1.5">
                  {reviewStatus === 'approved' && '• 보고서를 승인하며, 다음 주차 진행을 허가합니다.'}
                  {reviewStatus === 'needsRevision' && '• 학생에게 보완 요청과 재제출 버튼이 활성화됩니다.'}
                  {reviewStatus === 'delayed' && '• 제작 일정 지연 또는 심각한 미달 상태로 분류됩니다.'}
                </div>
              </div>

              {/* 2. Professor Comment */}
              <div>
                <label className="block text-xs font-bold text-[#202020] uppercase mb-1">
                  교수 의견 <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="학생들에게 전달할 구체적인 디자인 피드백 및 조언을 입력하세요..."
                  className="w-full p-3 rounded-lg border border-[#D8D4CD] bg-stone-50 text-xs text-[#202020] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F] leading-relaxed"
                />
              </div>

              {/* 3. Next Task for Students */}
              <div>
                <label className="block text-xs font-bold text-[#202020] uppercase mb-1">
                  다음 주까지 수행해야 할 과업 <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={nextTask}
                  onChange={(e) => setNextTask(e.target.value)}
                  placeholder="예: 접합 구조를 1:1 목업으로 검증하고 하중 결합 사진을 첨부할 것"
                  className="w-full p-3 rounded-lg border border-[#D8D4CD] bg-stone-50 text-xs text-[#202020] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F] leading-relaxed font-medium"
                />
              </div>

              {/* 4. Due Date (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#202020] uppercase mb-1">
                  완료 예정일 (선택)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#D8D4CD] bg-stone-50 text-xs text-[#202020] focus:bg-white"
                />
              </div>

              {/* Submit Feedback Button */}
              <button
                type="submit"
                disabled={isSubmitting || !report}
                className="w-full py-3 px-4 rounded-lg bg-[#D65A2F] text-white text-xs font-bold hover:bg-[#c04e25] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>피드백 저장 및 학생에게 전달</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 15-Week Timeline for this Team */}
      <div className="pt-6 border-t border-[#D8D4CD]">
        <h3 className="text-lg font-bold text-[#202020] mb-4">
          {team.name}의 15주 전체 타임라인 기록
        </h3>
        <TimelineView teamIdOverride={team.id} />
      </div>
    </div>
  );
};
