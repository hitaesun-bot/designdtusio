import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WeeklyReport, Feedback, PHASE_RANGES, getProjectPhase } from '../../types';
import { StatusTag } from '../../components/common/StatusTag';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  Calendar,
  ChevronRight,
  FileText,
  Link2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  X,
} from 'lucide-react';

interface TimelineViewProps {
  teamIdOverride?: string; // If viewed by professor for a specific team
}

export const TimelineView: React.FC<TimelineViewProps> = ({ teamIdOverride }) => {
  const { activeTeam, teams, reports, feedbacks, classInfo, curriculum } = useAuth();

  const currentTeam = teamIdOverride
    ? teams.find((t) => t.id === teamIdOverride)
    : activeTeam;

  const [selectedWeek, setSelectedWeek] = useState<number>(classInfo.currentWeek);
  const [selectedReportModal, setSelectedReportModal] = useState<WeeklyReport | null>(null);

  if (!currentTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#D8D4CD] max-w-lg mx-auto mt-12">
        <p className="text-sm text-stone-600">선택된 팀이 없거나 배정된 팀이 없습니다.</p>
      </div>
    );
  }

  // Get reports for this team
  const teamReports = reports.filter((r) => r.teamId === currentTeam.id);

  // Overall statistics
  const submittedCount = teamReports.filter(
    (r) => r.status === 'submitted' || r.status === 'feedbackPending' || r.status === 'approved' || r.status === 'needsRevision'
  ).length;
  const submissionRate = Math.round((submittedCount / classInfo.currentWeek) * 100);
  const latestReport = teamReports.find((r) => r.week === classInfo.currentWeek);
  const currentProgress = latestReport?.progress ?? 0;

  // Build full 15-week array
  const weeks = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Team Summary Header */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D65A2F] uppercase tracking-wider mb-1">
            <span>{currentTeam.sectionName}</span>
            <span>·</span>
            <span>15주 프로젝트 아카이브</span>
          </div>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight">
            {currentTeam.name}
          </h2>
          <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>팀장: <strong>{currentTeam.leaderName}</strong></span>
            <span>팀원: {currentTeam.memberNames.filter(n => !n.includes('팀장')).join(', ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 bg-[#F5F2EC] p-3 rounded-lg border border-[#D8D4CD]">
          <div>
            <div className="text-[11px] font-semibold text-stone-500">현재 진행률</div>
            <div className="text-lg font-extrabold text-[#D65A2F] font-mono">{currentProgress}%</div>
          </div>
          <div className="sm:border-l sm:border-[#D8D4CD] sm:pl-4">
            <div className="text-[11px] font-semibold text-stone-500">누적 제출률</div>
            <div className="text-lg font-extrabold text-[#202020] font-mono">
              {submittedCount} / {classInfo.currentWeek}주 ({submissionRate}%)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Phases Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PHASE_RANGES.map((phaseItem) => {
          const isCurrent =
            classInfo.currentWeek >= phaseItem.min && classInfo.currentWeek <= phaseItem.max;
          return (
            <div
              key={phaseItem.phase}
              className={`p-3 rounded-lg border text-xs ${
                isCurrent
                  ? 'bg-white border-[#D65A2F] ring-1 ring-[#D65A2F] shadow-xs'
                  : 'bg-stone-50 border-[#D8D4CD] text-stone-600'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className={isCurrent ? 'text-[#D65A2F]' : 'text-stone-700'}>
                  {phaseItem.phase}
                </span>
                <span className="text-[11px] font-mono text-stone-500">{phaseItem.weeks}</span>
              </div>
              <div className="text-[11px] text-stone-500">
                {isCurrent ? '현재 진행 중인 단계' : classInfo.currentWeek > phaseItem.max ? '완료 단계' : '예정 단계'}
              </div>
            </div>
          );
        })}
      </div>

      {/* 15-Week Timeline List */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-[#D8D4CD] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202020] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D65A2F]" />
            <span>15주차 전체 타임라인 현황</span>
          </h3>
          <span className="text-xs text-stone-500">주차 카드를 클릭하면 상세 보고서와 피드백을 확인합니다.</span>
        </div>

        <div className="divide-y divide-[#D8D4CD]">
          {weeks.map((weekNum) => {
            const phaseName = getProjectPhase(weekNum);
            const currItem = curriculum.find((c) => c.week === weekNum);
            const report = teamReports.find((r) => r.week === weekNum);
            const feedback = report ? feedbacks.find((f) => f.reportId === report.id) : undefined;
            const isFutureWeek = weekNum > classInfo.currentWeek;
            const isCurrentWeek = weekNum === classInfo.currentWeek;

            return (
              <div
                key={weekNum}
                onClick={() => {
                  if (report) setSelectedReportModal(report);
                }}
                className={`p-4 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  report ? 'hover:bg-[#F5F2EC]/60 cursor-pointer' : 'bg-stone-50/50 opacity-75'
                } ${isCurrentWeek ? 'bg-orange-50/30' : ''}`}
              >
                {/* Left: Week & Phase */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-xs ${
                      isCurrentWeek
                        ? 'bg-[#D65A2F] text-white shadow-xs'
                        : report
                        ? 'bg-[#202020] text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    <span>{weekNum}</span>
                    <span className="text-[9px] font-normal leading-none">주차</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#202020]">{weekNum}주차</span>
                      {isCurrentWeek && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#D65A2F] border border-orange-200">
                          NOW
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500">{phaseName}</span>
                    {currItem && (
                      <div className="text-[11px] text-stone-600 font-medium line-clamp-1 mt-0.5">
                        {currItem.topic}
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Progress Bar & Result Summary */}
                <div className="flex-1 w-full sm:w-auto px-0 sm:px-4">
                  {report ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[280px] md:max-w-[360px] text-stone-700 font-medium">
                          {report.weeklyResult ? report.weeklyResult.substring(0, 45) + '...' : '내용 없음'}
                        </span>
                        <span className="font-mono font-bold text-stone-800 ml-2">{report.progress}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#D65A2F] h-1.5 rounded-full"
                          style={{ width: `${report.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">
                      {isFutureWeek ? '진행 예정 주차입니다.' : '보고서가 제출되지 않았습니다.'}
                    </div>
                  )}
                </div>

                {/* Right: Status Tag, Issue, & Date */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
                  {report ? (
                    <>
                      {report.issue && !report.noIssue && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> 이슈
                        </span>
                      )}
                      <StatusTag status={report.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-stone-400 hidden sm:block" />
                    </>
                  ) : (
                    <span className="text-xs text-stone-400">
                      {isFutureWeek ? '예정' : '미제출'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl border border-[#D8D4CD] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D8D4CD] flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#D65A2F] uppercase">
                    {selectedReportModal.week}주차 보고서
                  </span>
                  <StatusTag status={selectedReportModal.status} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-[#202020] mt-0.5">
                  {currentTeam.name} · {selectedReportModal.phase}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Progress */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase mb-1">진행률</div>
                <ProgressBar progress={selectedReportModal.progress} size="md" />
              </div>

              {/* Weekly Results */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase mb-1">이번 주 결과</div>
                <p className="p-3.5 bg-stone-50 rounded-lg border border-[#D8D4CD] text-[#202020] whitespace-pre-line leading-relaxed">
                  {selectedReportModal.weeklyResult || '결과가 작성되지 않았습니다.'}
                </p>
              </div>

              {/* Evidence Files & Links */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase mb-2">증빙 자료</div>
                {selectedReportModal.evidenceFiles && selectedReportModal.evidenceFiles.length > 0 ? (
                  <div className="space-y-1.5 mb-2">
                    {selectedReportModal.evidenceFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 rounded border border-stone-200 bg-stone-50 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#D65A2F]" />
                          <span className="font-medium text-stone-800">{f.name}</span>
                          <span className="text-stone-400">({(f.size / (1024 * 1024)).toFixed(1)}MB)</span>
                        </div>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#D65A2F] hover:underline flex items-center gap-1"
                        >
                          <span>다운로드 / 열람</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">등록된 파일이 없습니다.</p>
                )}

                {selectedReportModal.evidenceLinks && selectedReportModal.evidenceLinks.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {selectedReportModal.evidenceLinks.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-2 rounded border border-stone-200 bg-stone-50 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Link2 className="w-4 h-4 text-sky-600" />
                          <span className="font-mono text-stone-800 truncate">{l.url}</span>
                          {l.description && <span className="text-stone-500">({l.description})</span>}
                        </div>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
                        >
                          <span>링크 이동</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Issues */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase mb-1">문제점 및 건의사항</div>
                <div className="p-3.5 bg-stone-50 rounded-lg border border-[#D8D4CD] text-stone-800">
                  {selectedReportModal.noIssue ? (
                    <span className="text-emerald-700 font-medium">현재 발생한 문제 없음</span>
                  ) : (
                    selectedReportModal.issue || '작성된 문제점이 없습니다.'
                  )}
                </div>
              </div>

              {/* Next Actions */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase mb-1">다음 할 일</div>
                <p className="p-3.5 bg-stone-50 rounded-lg border border-[#D8D4CD] text-stone-800 whitespace-pre-line leading-relaxed">
                  {selectedReportModal.nextAction || '계획이 작성되지 않았습니다.'}
                </p>
              </div>

              {/* Professor Feedback Section in Modal */}
              {(() => {
                const fb = feedbacks.find((f) => f.reportId === selectedReportModal.id);
                if (!fb) return null;
                return (
                  <div className="p-4 rounded-lg bg-orange-50/60 border border-orange-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#202020] text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#D65A2F]" />
                        <span>교수 피드백 ({fb.professorName})</span>
                      </div>
                      <StatusTag status={fb.reviewStatus} size="sm" />
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-stone-700">의견:</div>
                      <p className="p-2.5 bg-white rounded border border-orange-100 text-stone-800 whitespace-pre-line">
                        {fb.comment}
                      </p>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-stone-700">다음 주 과업:</div>
                      <p className="p-2.5 bg-white rounded border border-orange-100 text-[#D65A2F] font-bold">
                        {fb.nextTask}
                      </p>
                    </div>

                    {fb.dueDate && (
                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>완료 기한: {fb.dueDate}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Metadata */}
              <div className="pt-2 border-t border-stone-200 text-xs text-stone-400 flex flex-wrap justify-between gap-2">
                <span>작성자: {selectedReportModal.submittedByName || '팀장'}</span>
                {selectedReportModal.submittedAt && (
                  <span>제출일시: {new Date(selectedReportModal.submittedAt).toLocaleString('ko-KR')}</span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-[#D8D4CD] flex justify-end">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-2 bg-[#202020] text-white text-xs font-bold rounded-md hover:bg-black transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
