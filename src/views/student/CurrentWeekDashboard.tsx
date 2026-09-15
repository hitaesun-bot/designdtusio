import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WeeklyReport, EvidenceFile, EvidenceLink } from '../../types';
import { StatusTag } from '../../components/common/StatusTag';
import { ProgressBar } from '../../components/common/ProgressBar';
import { validateFileUpload } from '../../firebase/config';
import {
  FileText,
  Upload,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Save,
  Send,
  RefreshCw,
  Info,
  ShieldCheck,
  Edit3,
  Users,
  X,
  UserPlus,
  Crown,
  ChevronRight,
  Unlock,
} from 'lucide-react';

export const CurrentWeekDashboard: React.FC = () => {
  const {
    currentUser,
    classInfo,
    activeTeam,
    teams,
    reports,
    feedbacks,
    saveReport,
    updateTeam,
    selectStudentTeam,
  } = useAuth();

  // Selected week (defaults to classInfo.currentWeek, e.g. 3)
  const [selectedWeek, setSelectedWeek] = useState<number>(() => classInfo.currentWeek || 3);
  const phase =
    selectedWeek <= 5
      ? '탐색·리서치'
      : selectedWeek <= 8
      ? '아이디에이션'
      : selectedWeek <= 13
      ? '시각화·개발'
      : '정리·발표';

  // Find existing report for this team and week
  const existingReport = activeTeam
    ? reports.find((r) => r.teamId === activeTeam.id && r.week === selectedWeek)
    : undefined;

  // Find feedback for this report
  const existingFeedback = existingReport
    ? feedbacks.find((f) => f.reportId === existingReport.id)
    : undefined;

  // Form states
  const [progress, setProgress] = useState<number>(existingReport?.progress ?? 50);
  const [prevWeekProgress, setPrevWeekProgress] = useState<number>(0);
  const [weeklyResult, setWeeklyResult] = useState<string>(existingReport?.weeklyResult ?? '');
  const [issue, setIssue] = useState<string>(existingReport?.issue ?? '');
  const [noIssue, setNoIssue] = useState<boolean>(existingReport?.noIssue ?? false);
  const [nextAction, setNextAction] = useState<string>(existingReport?.nextAction ?? '');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>(existingReport?.evidenceFiles ?? []);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>(existingReport?.evidenceLinks ?? []);

  // Form input UI helpers
  const [linkType, setLinkType] = useState<'googleDrive' | 'figma' | 'other'>('figma');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkDesc, setLinkDesc] = useState<string>('');
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isForceEditUnlocked, setIsForceEditUnlocked] = useState<boolean>(false);

  // Team edit modal state (for students & team leaders)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [editTeamName, setEditTeamName] = useState<string>('');
  const [editTeamTopic, setEditTeamTopic] = useState<string>('');
  const [editLeaderName, setEditLeaderName] = useState<string>('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [newMemberInput, setNewMemberInput] = useState<string>('');
  const [teamModalError, setTeamModalError] = useState<string | null>(null);

  const handleOpenTeamModal = () => {
    if (!activeTeam) return;
    setEditTeamName(activeTeam.name);
    setEditTeamTopic(activeTeam.topic || '');
    setEditLeaderName(activeTeam.leaderName);
    setEditMembers(
      activeTeam.memberNames && activeTeam.memberNames.length > 0
        ? [...activeTeam.memberNames]
        : [activeTeam.leaderName]
    );
    setNewMemberInput('');
    setTeamModalError(null);
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;
    if (!editTeamName.trim()) {
      setTeamModalError('팀명을 입력해주세요.');
      return;
    }

    const cleanMembers = editMembers.filter((m) => m.trim().length > 0);
    let finalMembers = [...cleanMembers];
    if (editLeaderName.trim() && !finalMembers.includes(editLeaderName.trim())) {
      finalMembers.unshift(editLeaderName.trim());
    }

    await updateTeam(activeTeam.id, {
      name: editTeamName.trim(),
      topic: editTeamTopic.trim(),
      leaderName: editLeaderName.trim() || activeTeam.leaderName,
      memberNames: finalMembers,
    });

    setIsTeamModalOpen(false);
    setNotification({
      type: 'success',
      text: '우리 팀 정보(팀명·프로젝트 주제·팀원 명단)가 성공적으로 저장되었습니다.',
    });
  };

  const handleAddMember = () => {
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;
    if (editMembers.includes(trimmed)) {
      setTeamModalError('이미 등록된 팀원입니다.');
      return;
    }
    setEditMembers((prev) => [...prev, trimmed]);
    setNewMemberInput('');
    setTeamModalError(null);
  };

  const handleRemoveMember = (nameToRemove: string) => {
    if (editMembers.length <= 1) {
      setTeamModalError('최소 1명 이상의 팀원이 등록되어 있어야 합니다.');
      return;
    }
    setEditMembers((prev) => prev.filter((m) => m !== nameToRemove));
    if (editLeaderName === nameToRemove) {
      const remaining = editMembers.filter((m) => m !== nameToRemove);
      if (remaining.length > 0) {
        setEditLeaderName(remaining[0]);
      }
    }
    setTeamModalError(null);
  };

  // Sync state when existingReport or selectedWeek changes
  useEffect(() => {
    if (existingReport) {
      setProgress(existingReport.progress);
      setWeeklyResult(existingReport.weeklyResult);
      setIssue(existingReport.issue);
      setNoIssue(existingReport.noIssue);
      setNextAction(existingReport.nextAction);
      setEvidenceFiles(existingReport.evidenceFiles || []);
      setEvidenceLinks(existingReport.evidenceLinks || []);
    } else {
      setProgress(50);
      setWeeklyResult('');
      setIssue('');
      setNoIssue(false);
      setNextAction('');
      setEvidenceFiles([]);
      setEvidenceLinks([]);
    }

    // Check previous week progress
    if (activeTeam) {
      const prevReport = reports.find((r) => r.teamId === activeTeam.id && r.week === selectedWeek - 1);
      if (prevReport) {
        setPrevWeekProgress(prevReport.progress);
      } else {
        setPrevWeekProgress(0);
      }
    }
  }, [existingReport, activeTeam, reports, selectedWeek]);

  // Is editing allowed
  const isApproved = existingReport?.status === 'approved';
  const isNeedsRevision = existingReport?.status === 'needsRevision';
  const isFeedbackPending = existingReport?.status === 'feedbackPending';
  // Read-only only if approved and user has not clicked unlock
  const isReadOnly = isApproved && !isForceEditUnlocked;

  // Add evidence link
  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    // Validate HTTPS url
    try {
      const parsed = new URL(linkUrl.trim());
      if (parsed.protocol !== 'https:') {
        setNotification({ type: 'error', text: '외부 링크는 보안을 위해 HTTPS 주소만 허용됩니다.' });
        return;
      }
    } catch {
      setNotification({ type: 'error', text: '유효한 HTTPS URL 형식이 아닙니다.' });
      return;
    }

    const newLink: EvidenceLink = {
      id: `link-${Date.now()}`,
      type: linkType,
      url: linkUrl.trim(),
      description: linkDesc.trim() || undefined,
    };

    setEvidenceLinks((prev) => [...prev, newLink]);
    setLinkUrl('');
    setLinkDesc('');
  };

  const handleRemoveLink = (id: string) => {
    setEvidenceLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // Handle local/storage file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        setFileUploadError(validation.error || '파일 검증 실패');
        return;
      }

      const newFile: EvidenceFile = {
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      };

      setEvidenceFiles((prev) => [...prev, newFile]);
    }

    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Submit or Draft action
  const handleSave = async (isSubmit: boolean) => {
    if (!activeTeam) return;

    setIsSubmitting(true);
    setNotification(null);

    const result = await saveReport(
      {
        week: selectedWeek,
        phase,
        progress,
        weeklyResult,
        issue: noIssue ? '' : issue,
        noIssue,
        nextAction,
        evidenceFiles,
        evidenceLinks,
        forceEdit: isForceEditUnlocked,
      },
      isSubmit
    );

    setIsSubmitting(false);

    if (result.success) {
      setNotification({ type: 'success', text: result.message });
      setIsForceEditUnlocked(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setNotification({ type: 'error', text: result.message });
    }
  };

  if (!activeTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#D8D4CD] max-w-lg mx-auto mt-12 space-y-4">
        <Info className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-[#202020]">소속된 팀이 없습니다</h3>
        <p className="text-sm text-stone-600">
          교수자의 분반 및 팀 배정을 기다리고 있습니다. 배정이 완료되면 주간 보고서를 작성하거나 열람할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. Team Switcher & Quick Selector for Students */}
      <div className="bg-[#FAF8F5] border border-[#D8D4CD] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#202020] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            {activeTeam.sectionName?.replace('반', '') || '01'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D65A2F] uppercase">내 소속 팀</span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-medium">자유롭게 소속 팀을 선택하여 보고서를 작성할 수 있습니다</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base sm:text-lg font-extrabold text-[#202020]">
                {activeTeam.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold">
                {activeTeam.sectionName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="team-select" className="sr-only">
            팀 선택
          </label>
          <select
            id="team-select"
            aria-label="팀 선택"
            value={activeTeam.id}
            onChange={(e) => selectStudentTeam(e.target.value)}
            className="bg-white border border-[#D8D4CD] rounded-lg px-3 py-2 text-xs font-bold text-[#202020] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#D65A2F] cursor-pointer"
          >
            <optgroup label="01반 (8팀)">
              {teams
                .filter((t) => t.sectionId === 'sec-01')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (팀장: {t.leaderName})
                  </option>
                ))}
            </optgroup>
            <optgroup label="02반 (8팀)">
              {teams
                .filter((t) => t.sectionId === 'sec-02')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (팀장: {t.leaderName})
                  </option>
                ))}
            </optgroup>
          </select>

          <button
            type="button"
            onClick={handleOpenTeamModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-[#D65A2F] border border-[#F0BCA7] rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>팀명·팀원 수정</span>
          </button>
        </div>
      </div>

      {/* 2. Week Navigation Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
          <span>주차별 보고서 선택 (현재 {classInfo.currentWeek}주차 진행 중):</span>
          <span className="font-bold text-[#D65A2F]">
            {selectedWeek}주차 · {phase}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === classInfo.currentWeek;
            const isSelected = w === selectedWeek;
            const weekReport = reports.find((r) => r.teamId === activeTeam.id && r.week === w);
            return (
              <button
                key={w}
                type="button"
                onClick={() => {
                  setSelectedWeek(w);
                  setIsForceEditUnlocked(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#202020] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#FFF3EC] text-[#D65A2F] border border-[#F0BCA7] hover:bg-[#FFE6D9]'
                    : 'bg-white text-stone-600 border border-[#D8D4CD] hover:bg-stone-50'
                }`}
              >
                <span>{w}주차</span>
                {isCurrent && (
                  <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-[#D65A2F] text-white' : 'bg-[#D65A2F] text-white'}`}>
                    현재
                  </span>
                )}
                {weekReport && !isSelected && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      weekReport.status === 'approved'
                        ? 'bg-emerald-500'
                        : weekReport.status === 'needsRevision'
                        ? 'bg-amber-500'
                        : weekReport.status === 'feedbackPending'
                        ? 'bg-sky-500'
                        : 'bg-stone-300'
                    }`}
                    title={weekReport.status}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Header Card: Current Week & Phase Summary */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
            <span>{classInfo.semester}</span>
            <span>·</span>
            <span>15주 가구디자인스튜디오(2)</span>
          </div>
          <h2 className="text-2xl font-bold text-[#202020] tracking-tight">
            {selectedWeek}주차 주간 보고서 · {phase}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-stone-600 pt-0.5">
            <span>
              팀명: <strong className="text-[#202020]">{activeTeam.name}</strong> ({activeTeam.sectionName})
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>팀장: <strong className="text-[#202020]">{activeTeam.leaderName}</strong></span>
            </span>
            {activeTeam.topic && (
              <>
                <span>·</span>
                <span className="text-stone-500 line-clamp-1 max-w-xs" title={activeTeam.topic}>
                  주제: {activeTeam.topic}
                </span>
              </>
            )}
            {activeTeam.memberNames && activeTeam.memberNames.length > 0 && (
              <>
                <span>·</span>
                <span className="text-stone-500 text-xs">
                  팀원: {activeTeam.memberNames.join(', ')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {existingReport && (
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs text-stone-500 mb-1">보고서 상태</span>
              <StatusTag status={existingReport.status} size="lg" />
            </div>
          )}
          {isApproved && (
            <button
              type="button"
              onClick={() => setIsForceEditUnlocked((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-700" />
              <span>{isForceEditUnlocked ? '편집 잠금' : '내용 수정하기'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium flex items-center justify-between gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 hover:opacity-75"
          >
            닫기
          </button>
        </div>
      )}

      {/* Professor Feedback Banner if exists */}
      {existingFeedback && (
        <div
          className={`rounded-xl border p-5 space-y-3 ${
            existingFeedback.reviewStatus === 'approved'
              ? 'bg-emerald-50/70 border-emerald-200'
              : existingFeedback.reviewStatus === 'needsRevision'
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-rose-50/80 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/10 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#202020]" />
              <h3 className="text-sm font-bold text-[#202020]">
                교수자 피드백 ({existingFeedback.professorName})
              </h3>
            </div>
            <StatusTag status={existingFeedback.reviewStatus} size="sm" />
          </div>

          <div className="space-y-2 text-sm text-[#202020]">
            <div>
              <span className="font-semibold text-stone-700 block text-xs mb-0.5">
                교수 의견:
              </span>
              <p className="bg-white/80 p-3 rounded border border-black/5 whitespace-pre-line leading-relaxed">
                {existingFeedback.comment}
              </p>
            </div>

            <div>
              <span className="font-semibold text-stone-700 block text-xs mb-0.5">
                다음 주 과업 (학생 필수 수행):
              </span>
              <p className="bg-white/80 p-3 rounded border border-black/5 font-medium text-[#D65A2F]">
                {existingFeedback.nextTask}
              </p>
            </div>

            {existingFeedback.dueDate && (
              <div className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>완료 기한: <strong>{existingFeedback.dueDate}</strong></span>
              </div>
            )}
          </div>

          {isNeedsRevision && (
            <div className="pt-2 text-xs font-medium text-amber-900">
              ※ 교수자의 보완 요청에 따라 내용을 수정한 뒤 하단의 <strong>[보완 후 재제출]</strong> 버튼을 눌러주세요.
            </div>
          )}
        </div>
      )}

      {/* Main 5-Item Submission Form */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 md:p-8 space-y-8 shadow-xs">
        {/* Section 1: Progress Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="progress-slider" className="text-sm font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#202020] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>진행률 (0~100%)</span>
              <span className="text-rose-600 text-xs">*필수</span>
            </label>
            <span className="text-xl font-extrabold text-[#D65A2F] font-mono">{progress}%</span>
          </div>

          <div className="space-y-2">
            <input
              id="progress-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              disabled={isReadOnly}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2.5 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer accent-[#D65A2F] disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-stone-400 font-mono">
              <span>0% (시작)</span>
              <span>25%</span>
              <span>50% (중간)</span>
              <span>75%</span>
              <span>100% (완료)</span>
            </div>
          </div>

          {prevWeekProgress > 0 && progress < prevWeekProgress && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                주의: 이전 주차 진행률({prevWeekProgress}%)보다 현재 설정값({progress}%)이 낮습니다.
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Weekly Results (min 20 chars) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="weekly-result" className="text-sm font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#202020] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>이번 주 결과</span>
              <span className="text-rose-600 text-xs">*최소 20자</span>
            </label>
            <span
              className={`text-xs font-mono ${
                weeklyResult.trim().length >= 20 ? 'text-emerald-700 font-semibold' : 'text-stone-400'
              }`}
            >
              {weeklyResult.trim().length} / 20자 이상
            </span>
          </div>
          <p className="text-xs text-stone-500">
            이번 주에 팀에서 실제로 제작, 분석, 스케치, 모델링 등 완료한 작업 결과를 명확하게 작성하세요.
          </p>
          <textarea
            id="weekly-result"
            rows={4}
            value={weeklyResult}
            disabled={isReadOnly}
            onChange={(e) => setWeeklyResult(e.target.value)}
            placeholder="예: 1인 가구 소형 주거공간에 적합한 가변형 벤치 겸 수납가구의 메커니즘을 3가지 대안으로 스케치 모델링 완료했습니다. 회전 힌지 링크와 슬라이딩 트랙의 치수 간섭을 검토했습니다..."
            className="w-full p-3.5 rounded-lg border border-[#D8D4CD] bg-stone-50/50 text-[#202020] text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F] disabled:bg-stone-100 leading-relaxed"
          />
        </div>

        {/* Section 3: Evidence Materials (Files & Links) */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#202020] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>증빙자료 (파일 업로드 및 외부 링크)</span>
            </label>
            <p className="text-xs text-stone-500 mt-1">
              이미지(JPG, PNG, WEBP), 문서(PDF, PPT, PPTX) 최대 20MB / 실행파일 금지 / 외부 링크(Google Drive, Figma 등)
            </p>
          </div>

          {/* File Upload Area */}
          {!isReadOnly && (
            <div className="border-2 border-dashed border-[#D8D4CD] rounded-lg p-5 text-center hover:bg-[#F5F2EC]/40 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-[#D65A2F]" />
                <span className="text-sm font-medium text-[#202020]">
                  파일을 드래그하거나 <span className="text-[#D65A2F] underline">찾아보기</span>
                </span>
                <span className="text-xs text-stone-400">
                  최대 20MB (JPG, PNG, WEBP, PDF, PPT, PPTX)
                </span>
              </label>
            </div>
          )}

          {fileUploadError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{fileUploadError}</span>
            </div>
          )}

          {/* Uploaded File List */}
          {evidenceFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-600">등록된 파일 ({evidenceFiles.length}개):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {evidenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded border border-[#D8D4CD] bg-stone-50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-[#D65A2F] flex-shrink-0" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-medium text-stone-800 hover:text-[#D65A2F] underline"
                      >
                        {file.name}
                      </a>
                      <span className="text-stone-400 text-[11px] whitespace-nowrap">
                        ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                      </span>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="파일 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Link Input */}
          {!isReadOnly && (
            <div className="bg-[#F5F2EC] p-4 rounded-lg border border-[#D8D4CD] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#202020]">
                <Link2 className="w-4 h-4 text-[#D65A2F]" />
                <span>외부 링크 추가 (HTTPS 필수)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  aria-label="외부 링크 유형"
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as any)}
                  className="bg-white border border-[#D8D4CD] rounded px-3 py-2 text-xs font-medium text-[#202020]"
                >
                  <option value="figma">Figma 링크</option>
                  <option value="googleDrive">Google Drive 링크</option>
                  <option value="other">기타 외부 링크</option>
                </select>

                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="sm:col-span-2 bg-white border border-[#D8D4CD] rounded px-3 py-2 text-xs text-[#202020]"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="링크 설명 (예: 3D CAD 모델링 원본, 보드 등)"
                  className="flex-1 bg-white border border-[#D8D4CD] rounded px-3 py-2 text-xs text-[#202020]"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-[#202020] text-white text-xs font-bold rounded hover:bg-black transition-colors whitespace-nowrap"
                >
                  링크 추가
                </button>
              </div>

              {linkType === 'googleDrive' && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  💡 <strong>Google Drive 권한 주의</strong>: 교수자가 열람할 수 있도록 링크 공유 권한을 &apos;링크가 있는 모든 사용자(뷰어)&apos;로 설정했는지 확인하세요.
                </div>
              )}
            </div>
          )}

          {/* Registered Links List */}
          {evidenceLinks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-600">등록된 외부 링크 ({evidenceLinks.length}개):</span>
              <div className="space-y-1.5">
                {evidenceLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2.5 rounded border border-[#D8D4CD] bg-stone-50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 uppercase">
                        {link.type === 'googleDrive' ? 'Drive' : link.type}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[#D65A2F] hover:underline font-medium flex items-center gap-1"
                      >
                        <span>{link.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {link.description && (
                        <span className="text-stone-500">· {link.description}</span>
                      )}
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="링크 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Issues & Roadblocks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="issue-textarea" className="text-sm font-bold text-[#202020] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#202020] text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>문제점 (제작·재료·구조·일정 등)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noIssue}
                disabled={isReadOnly}
                onChange={(e) => {
                  setNoIssue(e.target.checked);
                  if (e.target.checked) setIssue('');
                }}
                className="rounded text-[#D65A2F] focus:ring-[#D65A2F] w-4 h-4"
              />
              <span className="font-medium">현재 문제 없음</span>
            </label>
          </div>
          <p className="text-xs text-stone-500">
            제작 공정, 재료 수급, 구조적 안정성, 역할 분담 등의 애로사항이 있으면 기록하세요.
          </p>
          <textarea
            id="issue-textarea"
            rows={3}
            value={issue}
            disabled={isReadOnly || noIssue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder={noIssue ? '현재 문제 없음으로 체크되었습니다.' : '발생한 문제점이나 교수님의 조언이 필요한 내용을 입력하세요...'}
            className="w-full p-3.5 rounded-lg border border-[#D8D4CD] bg-stone-50/50 text-[#202020] text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F] disabled:bg-stone-100 leading-relaxed"
          />
        </div>

        {/* Section 5: Next Action Plans */}
        <div className="space-y-2">
          <label htmlFor="next-action" className="text-sm font-bold text-[#202020] flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#202020] text-white text-xs flex items-center justify-center font-bold">5</span>
            <span>다음 할 일 (Next Steps)</span>
            <span className="text-rose-600 text-xs">*필수</span>
          </label>
          <p className="text-xs text-stone-500">
            다음 주까지 수행할 구체적인 과업과 가능하면 담당 팀원 및 완료 예정일을 기재하세요.
          </p>
          <textarea
            id="next-action"
            rows={3}
            value={nextAction}
            disabled={isReadOnly}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="예: 1:5 스케일 폼보드 목업 제작 및 힌지 결합부 3D 프린팅 하드웨어 결합 시험 (담당: 박민재, 강하늘 / 완료예정: 9월 17일)"
            className="w-full p-3.5 rounded-lg border border-[#D8D4CD] bg-stone-50/50 text-[#202020] text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D65A2F] disabled:bg-stone-100 leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[#D8D4CD] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500">
            {existingReport?.submittedAt && (
              <span>최근 제출: {new Date(existingReport.submittedAt).toLocaleString('ko-KR')}</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isApproved && !isForceEditUnlocked ? (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>교수자 승인 완료됨</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForceEditUnlocked(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Unlock className="w-3.5 h-3.5 text-amber-700" />
                  <span>내용 수정하기 (편집 활성화)</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSave(false)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#D8D4CD] bg-white text-stone-700 text-sm font-bold hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? '저장 중...' : '임시저장'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSave(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#D65A2F] text-white text-sm font-bold hover:bg-[#b84821] transition-colors shadow-xs cursor-pointer"
                >
                  {isNeedsRevision ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{isSubmitting ? '제출 중...' : '보완 후 재제출'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? '제출 중...' : '교수님께 제출'}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Info & Members Edit Modal for Students */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#D8D4CD] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D8D4CD] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D65A2F]" />
                <h3 className="text-base font-bold text-[#202020]">우리 팀 정보 및 팀원 구성 관리</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamModal} className="p-6 space-y-5">
              <p className="text-xs text-stone-500">
                학생들이 직접 팀명, 가구 프로젝트 주제, 팀장 및 팀원 명단을 수정할 수 있습니다. 저장 시 전체 시스템에 즉시 반영됩니다.
              </p>

              {teamModalError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{teamModalError}</span>
                </div>
              )}

              {/* 1. 팀명 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  팀명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  placeholder="예: 01반 1팀 (LUMA Studio) 또는 아르코 디자인"
                  className="w-full p-2.5 text-sm bg-stone-50 border border-[#D8D4CD] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D65A2F]"
                />
              </div>

              {/* 2. 프로젝트 주제 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  가구 프로젝트 주제 및 형태
                </label>
                <input
                  type="text"
                  value={editTeamTopic}
                  onChange={(e) => setEditTeamTopic(e.target.value)}
                  placeholder="예: 1인 가구를 위한 모듈형 수납 스툴 시스템"
                  className="w-full p-2.5 text-sm bg-stone-50 border border-[#D8D4CD] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D65A2F]"
                />
              </div>

              {/* 3. 팀장 지정 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>팀장 (주간 보고서 제출 대표자)</span>
                </label>
                {editMembers.length > 0 ? (
                  <select
                    value={editLeaderName}
                    onChange={(e) => setEditLeaderName(e.target.value)}
                    className="w-full p-2.5 text-sm bg-stone-50 border border-[#D8D4CD] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D65A2F]"
                  >
                    {editMembers.map((name) => (
                      <option key={name} value={name}>
                        {name} {name === editLeaderName ? '(현재 팀장)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editLeaderName}
                    onChange={(e) => setEditLeaderName(e.target.value)}
                    className="w-full p-2.5 text-sm bg-stone-50 border border-[#D8D4CD] rounded-lg"
                  />
                )}
                <p className="text-[11px] text-stone-500">
                  * 팀장으로 지정된 학생에게 주간 진척 보고서 제출 권한이 부여됩니다.
                </p>
              </div>

              {/* 4. 팀원 명단 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  팀원 명단 ({editMembers.length}명)
                </label>

                {/* Member Chips */}
                <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-xl border border-[#D8D4CD] min-h-[50px] items-center">
                  {editMembers.map((member) => {
                    const isCurrentLeader = member === editLeaderName;
                    return (
                      <span
                        key={member}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          isCurrentLeader
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'bg-white text-stone-800 border border-stone-300'
                        }`}
                      >
                        {isCurrentLeader && <Crown className="w-3 h-3 text-amber-600" />}
                        <span>{member}</span>
                        {isCurrentLeader && <span className="text-[10px] text-amber-700">(팀장)</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          className="text-stone-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                          title="팀원에서 제거"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Add member row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    placeholder="추가할 팀원 학생 이름 (예: 김하늘)"
                    className="flex-1 p-2 text-xs bg-white border border-[#D8D4CD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D65A2F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="shrink-0 px-3 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>팀원 추가</span>
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D8D4CD]">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#D65A2F] hover:bg-[#b84821] text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  수정 내용 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
