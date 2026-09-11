import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjectPhase, WeeklyCurriculum, WeeklyReport } from '../../types';
import { StatusTag } from '../../components/common/StatusTag';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  CalendarDays,
  Target,
  FileCheck2,
  Lightbulb,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface WeeklyCurriculumViewProps {
  onSelectTeam: (teamId: string) => void;
}

export const WeeklyCurriculumView: React.FC<WeeklyCurriculumViewProps> = ({ onSelectTeam }) => {
  const {
    classInfo,
    sections,
    teams,
    reports,
    feedbacks,
    curriculum,
    updateCurriculumItem,
    currentUser,
  } = useAuth();

  const [selectedWeek, setSelectedWeek] = useState<number>(classInfo.currentWeek);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [activeViewTab, setActiveViewTab] = useState<'weekDetail' | 'fullRoadmap'>('weekDetail');

  // Edit curriculum modal state (Professor only)
  const [isEditingCurriculum, setIsEditingCurriculum] = useState<boolean>(false);
  const currentWeekItem = curriculum.find((c) => c.week === selectedWeek) || curriculum[0];
  const [editTopic, setEditTopic] = useState(currentWeekItem.topic);
  const [editMilestone, setEditMilestone] = useState(currentWeekItem.milestone);
  const [editDeliverable, setEditDeliverable] = useState(currentWeekItem.deliverable);
  const [editTips, setEditTips] = useState(currentWeekItem.tips || '');

  // When selected week changes, sync edit inputs
  const handleSelectWeek = (week: number) => {
    setSelectedWeek(week);
    const item = curriculum.find((c) => c.week === week);
    if (item) {
      setEditTopic(item.topic);
      setEditMilestone(item.milestone);
      setEditDeliverable(item.deliverable);
      setEditTips(item.tips || '');
    }
  };

  const handleSaveCurriculumEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurriculumItem(selectedWeek, {
      topic: editTopic.trim(),
      milestone: editMilestone.trim(),
      deliverable: editDeliverable.trim(),
      tips: editTips.trim(),
    });
    setIsEditingCurriculum(false);
    alert(`${selectedWeek}주차 강의 및 과업 내용이 저장되었습니다.`);
  };

  // Filter teams by section
  const displayedTeams = teams.filter((t) => {
    if (selectedSection === 'all') return true;
    return t.sectionId === selectedSection;
  });

  // Calculate week stats
  const weekReports = displayedTeams.map((t) => {
    const report = reports.find((r) => r.teamId === t.id && r.week === selectedWeek);
    const feedback = feedbacks.find((f) => f.teamId === t.id && f.week === selectedWeek);
    return {
      team: t,
      report,
      feedback,
      hasIssue: report && !report.noIssue && Boolean(report.issue?.trim()),
    };
  });

  const submittedCount = weekReports.filter((w) => w.report && w.report.submittedAt).length;
  const approvedCount = weekReports.filter((w) => w.report?.status === 'approved').length;
  const pendingCount = weekReports.filter(
    (w) => w.report && (w.report.status === 'submitted' || w.report.status === 'feedbackPending')
  ).length;
  const revisionCount = weekReports.filter((w) => w.report?.status === 'needsRevision').length;
  const delayedCount = weekReports.filter((w) => !w.report || w.report.status === 'delayed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
              {classInfo.semester} · {classInfo.title}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
              담당: 김태선 교수
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight mt-1">
            주차별 내용 정리
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            15주 전체 커리큘럼 목표, 필수 과업, 산출물과 01반·02반 16개 팀의 주차별 진행 상황을 종합 정리합니다.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-white border border-[#D8D4CD] p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setActiveViewTab('weekDetail')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeViewTab === 'weekDetail'
                ? 'bg-[#202020] text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            주차별 진척 상세
          </button>
          <button
            onClick={() => setActiveViewTab('fullRoadmap')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeViewTab === 'fullRoadmap'
                ? 'bg-[#202020] text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            15주 전체 로드맵 표
          </button>
        </div>
      </div>

      {/* Week Selector Bar (1 ~ 15 weeks) */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-[#202020] flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[#D65A2F]" />
            <span>학기 주차 선택 (1주 ~ 15주)</span>
          </span>
          <span className="text-stone-500">
            현재 학기 진행: <strong className="text-[#D65A2F]">{classInfo.currentWeek}주차</strong>
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-1.5 text-xs">
          {curriculum.map((item) => {
            const isSelected = item.week === selectedWeek;
            const isCurrent = item.week === classInfo.currentWeek;
            const isPast = item.week < classInfo.currentWeek;
            return (
              <button
                key={item.week}
                onClick={() => handleSelectWeek(item.week)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-[#202020] text-white border-[#202020] shadow-sm ring-2 ring-[#D65A2F]'
                    : isCurrent
                    ? 'bg-orange-50 text-orange-900 border-orange-300 font-bold hover:bg-orange-100'
                    : isPast
                    ? 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="font-mono font-bold text-sm leading-none">{item.week}주</span>
                <span className={`text-[10px] truncate max-w-full mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {item.phase.split('·')[0]}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D65A2F] mt-1"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeViewTab === 'weekDetail' ? (
        <>
          {/* Week Curriculum Focus Card */}
          <div className="bg-white border border-[#D8D4CD] rounded-xl p-5 shadow-xs space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D4CD] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#202020] text-white font-mono font-bold text-xs">
                  {currentWeekItem.week}주차
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F5F2EC] text-[#D65A2F] border border-[#D8D4CD]">
                  {currentWeekItem.phase}
                </span>
                {currentWeekItem.week === classInfo.currentWeek && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                    ★ 현재 진행 중인 주차
                  </span>
                )}
              </div>

              {currentUser?.role === 'professor' && (
                <button
                  onClick={() => setIsEditingCurriculum(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-[#D65A2F] px-2.5 py-1 rounded hover:bg-stone-100 transition-colors self-start sm:self-auto border border-[#D8D4CD]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>주차별 학습 목표 수정</span>
                </button>
              )}
            </div>

            {/* Curriculum Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Topic */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Layers className="w-4 h-4 text-[#D65A2F]" />
                  <span>강의 주제 및 주간 과업</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed text-sm">
                  {currentWeekItem.topic}
                </p>
              </div>

              {/* 2. Milestone */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>핵심 마일스톤 (성공 기준)</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed text-sm">
                  {currentWeekItem.milestone}
                </p>
              </div>

              {/* 3. Deliverable */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <FileCheck2 className="w-4 h-4 text-sky-600" />
                  <span>필수 제출물 및 산출물</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed text-sm">
                  {currentWeekItem.deliverable}
                </p>
              </div>
            </div>

            {/* Professor Tip / Guidelines */}
            {currentWeekItem.tips && (
              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-900 block mb-0.5">
                    김태선 교수의 주간 크리틱 가이드 & 유의사항:
                  </strong>
                  <span className="leading-relaxed text-amber-900/90">{currentWeekItem.tips}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section Filter & Stats Summary */}
          <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D65A2F]" />
                <h3 className="text-sm font-bold text-[#202020]">
                  {selectedWeek}주차 분반별 팀 진행 현황 ({displayedTeams.length}개 팀)
                </h3>
              </div>

              {/* Section Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => setSelectedSection('all')}
                  className={`px-3 py-1 rounded transition-colors ${
                    selectedSection === 'all'
                      ? 'bg-[#202020] text-white font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  전체 분반 (16팀)
                </button>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec.id)}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedSection === sec.id
                        ? 'bg-[#202020] text-white font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {sec.name} ({teams.filter((t) => t.sectionId === sec.id).length}팀)
                  </button>
                ))}
              </div>
            </div>

            {/* 5 Stats metrics for this week */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#D8D4CD] text-xs">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <div className="text-stone-500 font-medium">제출 완료</div>
                <div className="text-lg font-bold text-[#202020] font-mono mt-0.5">
                  {submittedCount} <span className="text-xs text-stone-500 font-normal">/ {displayedTeams.length}</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <div className="text-emerald-700 font-medium">승인 완료</div>
                <div className="text-lg font-bold text-emerald-800 font-mono mt-0.5">
                  {approvedCount}개 팀
                </div>
              </div>
              <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-200">
                <div className="text-sky-700 font-medium">피드백 대기</div>
                <div className="text-lg font-bold text-sky-800 font-mono mt-0.5">
                  {pendingCount}개 팀
                </div>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <div className="text-amber-700 font-medium">보완 요청</div>
                <div className="text-lg font-bold text-amber-800 font-mono mt-0.5">
                  {revisionCount}개 팀
                </div>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 col-span-2 sm:col-span-1">
                <div className="text-rose-700 font-medium">지연 / 미제출</div>
                <div className="text-lg font-bold text-rose-800 font-mono mt-0.5">
                  {delayedCount}개 팀
                </div>
              </div>
            </div>
          </div>

          {/* 16 Teams Grid for Selected Week */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekReports.map(({ team, report, feedback, hasIssue }) => {
              const status = report?.status || 'delayed';
              const progress = report?.progress ?? 0;

              return (
                <div
                  key={team.id}
                  onClick={() => onSelectTeam(team.id)}
                  className="bg-white border border-[#D8D4CD] hover:border-[#D65A2F] rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
                >
                  {/* Top line inside card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {team.sectionName}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          팀장: <strong className="text-stone-800">{team.leaderName}</strong>
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#202020] mt-1 group-hover:text-[#D65A2F] transition-colors">
                        {team.name}
                      </h4>
                      {team.topic && (
                        <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                          주제: {team.topic}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StatusTag status={status as any} size="sm" />
                      {hasIssue && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> 이슈 보고
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <ProgressBar progress={progress} size="sm" />
                  </div>

                  {/* Result & Feedback Summary */}
                  <div className="space-y-1.5 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <div>
                      <span className="font-bold text-stone-800 mr-1.5">과업 결과:</span>
                      <span className="text-stone-600 line-clamp-2">
                        {report?.weeklyResult || '등록된 주간 보고서가 없습니다.'}
                      </span>
                    </div>

                    {feedback && (
                      <div className="pt-1.5 border-t border-stone-200 text-emerald-900">
                        <span className="font-bold mr-1.5">김태선 교수 피드백:</span>
                        <span className="text-stone-700 line-clamp-2">{feedback.comment}</span>
                      </div>
                    )}
                  </div>

                  {/* Card bottom */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#D8D4CD] text-xs text-stone-500">
                    <span>
                      {report?.submittedAt
                        ? `제출: ${new Date(report.submittedAt).toLocaleDateString('ko-KR')}`
                        : '미제출'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#202020] group-hover:text-[#D65A2F]">
                      <span>피드백 및 상세 보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Full 15-Week Curriculum Roadmap Table */
        <div className="bg-white border border-[#D8D4CD] rounded-xl overflow-x-auto shadow-xs">
          <div className="p-4 border-b border-[#D8D4CD] bg-stone-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202020]">
                디자인스튜디오 II 15주 전체 커리큘럼 로드맵
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                4개 프로젝트 단계(탐색, 아이디에이션, 개발, 발표)의 주차별 주제 및 필수 산출물 총람
              </p>
            </div>
            <span className="text-xs font-bold text-[#D65A2F] bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
              현재 {classInfo.currentWeek}주차 진행 중
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase border-b border-[#D8D4CD]">
              <tr>
                <th className="p-3.5 w-16">주차</th>
                <th className="p-3.5 w-28">단계</th>
                <th className="p-3.5 min-w-[200px]">강의 주제 및 주요 과업</th>
                <th className="p-3.5 min-w-[220px]">핵심 마일스톤 (성공 기준)</th>
                <th className="p-3.5 min-w-[200px]">필수 제출 산출물</th>
                <th className="p-3.5 text-right w-20">이동</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CD]">
              {curriculum.map((item) => {
                const isCurrent = item.week === classInfo.currentWeek;
                return (
                  <tr
                    key={item.week}
                    onClick={() => {
                      setSelectedWeek(item.week);
                      setActiveViewTab('weekDetail');
                    }}
                    className={`hover:bg-[#F5F2EC]/70 cursor-pointer transition-colors ${
                      isCurrent ? 'bg-orange-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono font-bold text-stone-800">
                      {item.week}주차
                      {isCurrent && (
                        <span className="block text-[10px] text-[#D65A2F] font-sans">현재</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                        {item.phase}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-900 font-medium">{item.topic}</td>
                    <td className="p-3.5 text-stone-600 leading-relaxed">{item.milestone}</td>
                    <td className="p-3.5 text-stone-700 font-medium">{item.deliverable}</td>
                    <td className="p-3.5 text-right">
                      <button className="px-2.5 py-1 bg-[#202020] text-white rounded text-xs font-bold hover:bg-black">
                        보기
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Curriculum Modal (Professor Only) */}
      {isEditingCurriculum && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#D8D4CD] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#D8D4CD] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#D65A2F]" />
                <h3 className="text-base font-bold text-[#202020]">
                  {selectedWeek}주차 강의 목표 및 산출물 수정
                </h3>
              </div>
              <button
                onClick={() => setIsEditingCurriculum(false)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCurriculumEdit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  주간 강의 주제 및 과업
                </label>
                <input
                  type="text"
                  required
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  핵심 마일스톤 (성공 기준)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editMilestone}
                  onChange={(e) => setEditMilestone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  필수 제출물 및 산출물
                </label>
                <input
                  type="text"
                  required
                  value={editDeliverable}
                  onChange={(e) => setEditDeliverable(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  김태선 교수의 주간 크리틱 팁 및 유의사항 (선택)
                </label>
                <textarea
                  rows={2}
                  value={editTips}
                  onChange={(e) => setEditTips(e.target.value)}
                  placeholder="예: 접합부 하중과 휨 변형을 반드시 실물 스케일로 검토할 것."
                  className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-stone-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D8D4CD]">
                <button
                  type="button"
                  onClick={() => setIsEditingCurriculum(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#202020] text-white font-bold rounded-lg hover:bg-black transition-colors"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
