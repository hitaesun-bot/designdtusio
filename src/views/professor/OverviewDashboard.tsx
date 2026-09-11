import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Team, WeeklyReport, ReportStatus, getProjectPhase } from '../../types';
import { StatusTag } from '../../components/common/StatusTag';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface OverviewDashboardProps {
  onSelectTeam: (teamId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onSelectTeam }) => {
  const { classInfo, sections, teams, reports } = useAuth();

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(classInfo.currentWeek);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Compute team status for the selected week
  const teamStatusList = useMemo(() => {
    return teams.map((team) => {
      const report = reports.find((r) => r.teamId === team.id && r.week === selectedWeek);
      const hasIssue = report && !report.noIssue && Boolean(report.issue && report.issue.trim().length > 0);

      // Determine computed status according to Section 6 rules:
      // - submitted -> feedbackPending
      // - has issue -> attention (if not approved)
      // - professor needsRevision -> needsRevision
      // - delayed / missing past deadline -> delayed
      // - professor approved -> approved
      let computedStatus: ReportStatus | 'notStarted' = 'notStarted';
      if (report) {
        computedStatus = report.status;
      } else {
        computedStatus = 'delayed'; // missing week
      }

      return {
        team,
        report,
        hasIssue,
        status: computedStatus,
        progress: report?.progress ?? 0,
        updatedAt: report?.updatedAt ?? team.updatedAt,
      };
    });
  }, [teams, reports, selectedWeek]);

  // Overall metric counts for top cards
  const metrics = useMemo(() => {
    const totalTeams = teams.length;
    let submittedCount = 0;
    let feedbackPendingCount = 0;
    let attentionCount = 0;
    let delayedCount = 0;

    teamStatusList.forEach((item) => {
      if (item.report && (item.report.status === 'submitted' || item.report.status === 'feedbackPending')) {
        feedbackPendingCount++;
      }
      if (item.report && item.report.submittedAt) {
        submittedCount++;
      }
      if (item.hasIssue || item.status === 'needsRevision') {
        attentionCount++;
      }
      if (item.status === 'delayed' || !item.report) {
        delayedCount++;
      }
    });

    return {
      totalTeams,
      submittedCount,
      feedbackPendingCount,
      attentionCount,
      delayedCount,
    };
  }, [teams.length, teamStatusList]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teamStatusList.filter((item) => {
      if (selectedSection !== 'all' && item.team.sectionId !== selectedSection) return false;
      if (selectedPhase !== 'all' && getProjectPhase(selectedWeek) !== selectedPhase) return false;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'attention') {
          if (!item.hasIssue && item.status !== 'needsRevision') return false;
        } else if (item.status !== selectedStatus) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.team.name.toLowerCase().includes(query);
        const matchesLeader = item.team.leaderName.toLowerCase().includes(query);
        if (!matchesName && !matchesLeader) return false;
      }
      return true;
    });
  }, [teamStatusList, selectedSection, selectedPhase, selectedWeek, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
            {classInfo.semester} · {classInfo.title}
          </span>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight">
            전체 팀 현황판
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            15주 팀 프로젝트 진행률, 제출 상태, 문제점 및 피드백 현황을 한눈에 모니터링합니다.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white border border-[#D8D4CD] p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-[#202020] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>카드형</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'table' ? 'bg-[#202020] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>테이블형</span>
          </button>
        </div>
      </div>

      {/* Top 5 Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Teams */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">전체 팀 수</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#202020] font-mono">
            {metrics.totalTeams}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            01반 8팀, 02반 8팀 (총 16팀)
          </div>
        </div>

        {/* 2. Submitted this week */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">이번 주 제출</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {metrics.submittedCount}
            <span className="text-xs font-normal text-stone-500 ml-1">/ {metrics.totalTeams}</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            제출률 {Math.round((metrics.submittedCount / metrics.totalTeams) * 100)}%
          </div>
        </div>

        {/* 3. Feedback Pending */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">피드백 대기</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700 font-mono">
            {metrics.feedbackPendingCount}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            교수 검토 필요
          </div>
        </div>

        {/* 4. Attention Teams */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">주의 · 보완 팀</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-800 font-mono">
            {metrics.attentionCount}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            이슈 발생 / 보완 요청
          </div>
        </div>

        {/* 5. Delayed Teams */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">지연 팀</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-mono">
            {metrics.delayedCount}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            미제출 또는 기한 초과
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#202020]">
          <Filter className="w-3.5 h-3.5 text-[#D65A2F]" />
          <span>필터 및 검색</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Section filter */}
          <div>
            <label className="block text-stone-500 font-medium mb-1">분반</label>
            <select
              aria-label="분반 선택"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-stone-50 border border-[#D8D4CD] rounded px-2.5 py-2 text-[#202020] font-medium"
            >
              <option value="all">전체 분반</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Week filter */}
          <div>
            <label className="block text-stone-500 font-medium mb-1">조회 주차</label>
            <select
              aria-label="조회 주차 선택"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full bg-stone-50 border border-[#D8D4CD] rounded px-2.5 py-2 text-[#202020] font-medium"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}주차 ({getProjectPhase(w)}) {w === classInfo.currentWeek ? '★ 현재' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Phase filter */}
          <div>
            <label className="block text-stone-500 font-medium mb-1">프로젝트 단계</label>
            <select
              aria-label="프로젝트 단계 선택"
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full bg-stone-50 border border-[#D8D4CD] rounded px-2.5 py-2 text-[#202020] font-medium"
            >
              <option value="all">전체 단계</option>
              <option value="탐색·리서치">탐색·리서치 (1~5주)</option>
              <option value="아이디에이션">아이디에이션 (6~8주)</option>
              <option value="시각화·개발">시각화·개발 (9~13주)</option>
              <option value="정리·발표">정리·발표 (14~15주)</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-stone-500 font-medium mb-1">검토 상태</label>
            <select
              aria-label="검토 상태 선택"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-50 border border-[#D8D4CD] rounded px-2.5 py-2 text-[#202020] font-medium"
            >
              <option value="all">전체 상태</option>
              <option value="feedbackPending">피드백 대기</option>
              <option value="approved">승인 완료</option>
              <option value="needsRevision">보완 요청</option>
              <option value="attention">주의 (이슈/보완)</option>
              <option value="delayed">지연 / 미제출</option>
              <option value="draft">임시저장</option>
            </select>
          </div>

          {/* Search query */}
          <div>
            <label className="block text-stone-500 font-medium mb-1">팀명 / 팀장 검색</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="팀명 또는 팀장 이름..."
                className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-[#D8D4CD] rounded text-[#202020]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Cards Grid or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map(({ team, report, hasIssue, status, progress, updatedAt }) => (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="bg-white border border-[#D8D4CD] hover:border-[#D65A2F] rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4 relative group"
            >
              {/* Header inside Card */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {team.sectionName}
                    </span>
                    <span className="text-xs text-stone-500">
                      팀장: <strong className="text-stone-800">{team.leaderName}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#202020] mt-1 group-hover:text-[#D65A2F] transition-colors">
                    {team.name}
                  </h3>
                  {team.topic && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      주제: {team.topic}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <StatusTag status={status as any} size="sm" />
                  {hasIssue && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> 문제점 보고됨
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <ProgressBar progress={progress} size="md" />
              </div>

              {/* Weekly Result Snippet */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700">
                <div className="font-semibold text-stone-900 mb-0.5 flex items-center justify-between">
                  <span>{selectedWeek}주차 과업 결과</span>
                  {report?.evidenceFiles?.length ? (
                    <span className="text-[11px] text-[#D65A2F] font-normal">
                      증빙 {report.evidenceFiles.length}개
                    </span>
                  ) : null}
                </div>
                <p className="line-clamp-2 leading-relaxed text-stone-600">
                  {report?.weeklyResult || '아직 주간 보고서가 등록되지 않았습니다.'}
                </p>
              </div>

              {/* Footer inside card */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D8D4CD] text-xs text-stone-500">
                <span>
                  {report?.submittedAt
                    ? `제출: ${new Date(report.submittedAt).toLocaleDateString('ko-KR')}`
                    : '미제출'}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#202020] group-hover:text-[#D65A2F]">
                  <span>피드백 및 상세 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#D8D4CD] rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-[#D8D4CD] text-stone-600 font-semibold uppercase">
              <tr>
                <th className="p-3.5">분반</th>
                <th className="p-3.5">팀명</th>
                <th className="p-3.5">팀장</th>
                <th className="p-3.5">주차</th>
                <th className="p-3.5">진행률</th>
                <th className="p-3.5">검토 상태</th>
                <th className="p-3.5">문제점</th>
                <th className="p-3.5">제출 일시</th>
                <th className="p-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CD]">
              {filteredTeams.map(({ team, report, hasIssue, status, progress }) => (
                <tr
                  key={team.id}
                  onClick={() => onSelectTeam(team.id)}
                  className="hover:bg-[#F5F2EC]/60 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-medium text-stone-600">{team.sectionName}</td>
                  <td className="p-3.5 font-bold text-[#202020]">{team.name}</td>
                  <td className="p-3.5 text-stone-700">{team.leaderName}</td>
                  <td className="p-3.5 font-mono text-stone-600">{selectedWeek}주차</td>
                  <td className="p-3.5 font-mono font-bold text-[#D65A2F]">{progress}%</td>
                  <td className="p-3.5">
                    <StatusTag status={status as any} size="sm" />
                  </td>
                  <td className="p-3.5">
                    {hasIssue ? (
                      <span className="text-amber-800 font-semibold">있음</span>
                    ) : (
                      <span className="text-stone-400">없음</span>
                    )}
                  </td>
                  <td className="p-3.5 text-stone-500">
                    {report?.submittedAt
                      ? new Date(report.submittedAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTeam(team.id);
                      }}
                      className="px-2.5 py-1 bg-[#202020] text-white rounded text-xs font-bold hover:bg-black"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTeams.length === 0 && (
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-12 text-center text-stone-500 space-y-2">
          <p className="text-sm font-semibold text-stone-700">해당 조건에 일치하는 팀이 없습니다.</p>
          <p className="text-xs">필터 조건을 재설정하거나 검색어를 변경해주세요.</p>
        </div>
      )}
    </div>
  );
};
