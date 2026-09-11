import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Team, UserProfile } from '../../types';
import {
  Settings,
  Users,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
  UserCheck,
  RotateCcw,
  Sparkles,
  Info,
  X,
  UserPlus,
  Share2,
  ExternalLink,
  Download,
  Copy,
  Check,
  ImageIcon,
} from 'lucide-react';

export const ClassManagementView: React.FC = () => {
  const {
    classInfo,
    sections,
    teams,
    allUsers,
    createTeam,
    updateTeam,
    deleteTeam,
    updateClassInfo,
    assignStudentToTeam,
    removeStudentFromTeam,
    batchSetup8TeamsPerSection,
  } = useAuth();

  // Class settings edit states
  const [title, setTitle] = useState(classInfo.title);
  const [semester, setSemester] = useState(classInfo.semester);
  const [currentWeek, setCurrentWeek] = useState(classInfo.currentWeek);
  const [joinCode, setJoinCode] = useState(classInfo.joinCode);
  const [classUpdateNotice, setClassUpdateNotice] = useState<string | null>(null);

  // Section filter for team list
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Team creation form state
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTopic, setNewTeamTopic] = useState('');
  const [newTeamSection, setNewTeamSection] = useState(sections[0]?.id || 'sec-01');
  const [newTeamLeaderName, setNewTeamLeaderName] = useState('');
  const [newTeamMemberInput, setNewTeamMemberInput] = useState('');

  // Team editing modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamTopic, setEditTeamTopic] = useState('');
  const [editTeamSection, setEditTeamSection] = useState('');
  const [editTeamLeaderName, setEditTeamLeaderName] = useState('');
  const [editMemberNameToAdd, setEditMemberNameToAdd] = useState('');

  // Open Graph preview & share state
  const [copiedOgUrl, setCopiedOgUrl] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  // Handle class settings save
  const handleSaveClassSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassInfo({
      title,
      semester,
      currentWeek: Number(currentWeek),
      joinCode,
    });
    setClassUpdateNotice('교과목 설정이 업데이트되었습니다.');
    setTimeout(() => setClassUpdateNotice(null), 3000);
  };

  // Regenerate Join Code
  const handleRegenerateCode = () => {
    const randomCode = `DS2-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setJoinCode(randomCode);
    updateClassInfo({ joinCode: randomCode });
  };

  // Handle create team submit
  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('팀명을 입력해주세요.');
      return;
    }

    const leaderName = newTeamLeaderName.trim() || '팀장 학생';
    const leaderUid = `user-created-${Date.now()}-lead`;
    const memberNames = newTeamMemberInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const allMemberNames = [leaderName, ...memberNames.filter((m) => m !== leaderName)];
    const memberIds = allMemberNames.map((_, idx) => `user-created-${Date.now()}-${idx}`);

    await createTeam({
      name: newTeamName.trim(),
      topic: newTeamTopic.trim(),
      sectionId: newTeamSection,
      leaderId: leaderUid,
      memberIds,
    });

    setIsCreatingTeam(false);
    setNewTeamName('');
    setNewTeamTopic('');
    setNewTeamLeaderName('');
    setNewTeamMemberInput('');
    alert('새 팀이 성공적으로 등록되었습니다.');
  };

  // Open team edit modal
  const handleOpenEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamTopic(team.topic || '');
    setEditTeamSection(team.sectionId);
    setEditTeamLeaderName(team.leaderName);
    setEditMemberNameToAdd('');
  };

  // Save team edit
  const handleSaveEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    await updateTeam(editingTeam.id, {
      name: editTeamName.trim(),
      topic: editTeamTopic.trim(),
      sectionId: editTeamSection,
      leaderName: editTeamLeaderName.trim(),
    });

    setEditingTeam(null);
    alert('팀 정보가 성공적으로 수정되었습니다.');
  };

  // Add member in edit modal
  const handleAddMemberToEditingTeam = async () => {
    if (!editingTeam || !editMemberNameToAdd.trim()) return;
    const newName = editMemberNameToAdd.trim();
    const newId = `user-added-${Date.now()}`;
    const updatedMemberIds = [...editingTeam.memberIds, newId];
    const updatedMemberNames = [...editingTeam.memberNames, newName];

    await updateTeam(editingTeam.id, {
      memberIds: updatedMemberIds,
      memberNames: updatedMemberNames,
    });

    setEditingTeam({
      ...editingTeam,
      memberIds: updatedMemberIds,
      memberNames: updatedMemberNames,
    });
    setEditMemberNameToAdd('');
  };

  // Remove member in edit modal
  const handleRemoveMemberFromEditingTeam = async (memberIndex: number) => {
    if (!editingTeam) return;
    if (editingTeam.memberNames.length <= 1) {
      alert('팀에는 최소 1명 이상의 인원이 필요합니다.');
      return;
    }
    const updatedMemberIds = editingTeam.memberIds.filter((_, idx) => idx !== memberIndex);
    const updatedMemberNames = editingTeam.memberNames.filter((_, idx) => idx !== memberIndex);
    const newLeaderName = memberIndex === 0 ? updatedMemberNames[0] : editingTeam.leaderName;

    await updateTeam(editingTeam.id, {
      leaderName: newLeaderName,
      memberIds: updatedMemberIds,
      memberNames: updatedMemberNames,
    });

    setEditingTeam({
      ...editingTeam,
      leaderName: newLeaderName,
      memberIds: updatedMemberIds,
      memberNames: updatedMemberNames,
    });
  };

  // Delete team
  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`정말로 '${team.name}'을(를) 삭제하시겠습니까?`)) {
      await deleteTeam(team.id);
      alert('팀이 삭제되었습니다.');
    }
  };

  // Restore 16 teams (8 teams per section)
  const handleRestore16Teams = async () => {
    if (
      window.confirm(
        '01반 8개 팀과 02반 8개 팀(총 16팀)의 표준 프로젝트 팀 편성 상태로 초기화/복원하시겠습니까?'
      )
    ) {
      await batchSetup8TeamsPerSection();
      alert('01반(8팀) 및 02반(8팀) 총 16개 팀의 구성이 완료되었습니다.');
    }
  };

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    if (selectedSectionFilter === 'all') return true;
    return t.sectionId === selectedSectionFilter;
  });

  const sec01Teams = teams.filter((t) => t.sectionId === 'sec-01');
  const sec02Teams = teams.filter((t) => t.sectionId === 'sec-02');

  // Students waiting for assignment
  const unassignedStudents = (Object.values(allUsers) as UserProfile[]).filter(
    (u) => u.role === 'unassigned' || !u.teamId
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#D65A2F] uppercase tracking-wider">
            스튜디오 운영 관리
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
            담당: 김태선 교수
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[#202020] tracking-tight mt-1">
          교과목 · 분반 · 팀 구성 관리
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          김태선 교수의 01반(8개 팀) 및 02반(8개 팀)의 프로젝트 팀 빌딩, 학생 배정, 프로젝트 주제를 관리합니다.
        </p>
      </div>

      {/* 1. Quick Class Overview & 16-Team Target Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Teams Card */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">전체 팀 편성</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#202020] font-mono">
            {teams.length}
            <span className="text-xs font-normal text-stone-500 ml-1">/ 목표 16팀</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            01반 {sec01Teams.length}팀 + 02반 {sec02Teams.length}팀
          </div>
        </div>

        {/* 01반 Status Card */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">01반 편성 현황</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              sec01Teams.length === 8 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {sec01Teams.length === 8 ? '8팀 편성 완료' : `${sec01Teams.length}/8팀`}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">
            {sec01Teams.length}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            총 {sec01Teams.reduce((acc, t) => acc + t.memberIds.length, 0)}명 참여 중
          </div>
        </div>

        {/* 02반 Status Card */}
        <div className="bg-white border border-[#D8D4CD] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">02반 편성 현황</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              sec02Teams.length === 8 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {sec02Teams.length === 8 ? '8팀 편성 완료' : `${sec02Teams.length}/8팀`}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-mono">
            {sec02Teams.length}
            <span className="text-xs font-normal text-stone-500 ml-1">개 팀</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            총 {sec02Teams.reduce((acc, t) => acc + t.memberIds.length, 0)}명 참여 중
          </div>
        </div>
      </div>

      {/* 2. Team Composition & Management (Core Feature) */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D4CD] pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D65A2F]" />
            <div>
              <h3 className="text-base font-bold text-[#202020]">
                01반 · 02반 팀 구성 및 편성 ({filteredTeams.length}개 팀)
              </h3>
              <p className="text-xs text-stone-500">
                01반과 02반 각 8개 팀의 팀명, 주제, 팀장 및 팀원을 자유롭게 구성하고 편집할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRestore16Teams}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-md border border-[#D8D4CD] transition-colors"
              title="01반 8팀 + 02반 8팀(총 16팀) 표준 구성으로 자동 복원"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>16팀 표준 구성 복원</span>
            </button>
            <button
              onClick={() => setIsCreatingTeam(!isCreatingTeam)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D65A2F] text-white text-xs font-bold rounded-md hover:bg-[#b84821] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>새 팀 구성하기</span>
            </button>
          </div>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => setSelectedSectionFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedSectionFilter === 'all'
                ? 'bg-[#202020] text-white font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체 분반 ({teams.length}팀)
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionFilter(sec.id)}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedSectionFilter === sec.id
                  ? 'bg-[#202020] text-white font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {sec.name} ({teams.filter((t) => t.sectionId === sec.id).length}팀)
            </button>
          ))}
        </div>

        {/* Team Creation Form Box */}
        {isCreatingTeam && (
          <form
            onSubmit={handleCreateTeamSubmit}
            className="p-5 bg-[#F5F2EC] rounded-xl border border-[#D8D4CD] space-y-4 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#202020] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#D65A2F]" />
                <span>새 프로젝트 팀 추가 및 구성</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingTeam(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  소속 분반 <span className="text-[#D65A2F]">*</span>
                </label>
                <select
                  aria-label="소속 분반 선택"
                  value={newTeamSection}
                  onChange={(e) => setNewTeamSection(e.target.value)}
                  className="w-full p-2 bg-white border border-[#D8D4CD] rounded font-medium"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  팀명 <span className="text-[#D65A2F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 01반 1팀 (LUMA Studio)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#D8D4CD] rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  팀장 이름 <span className="text-[#D65A2F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 이지우 (팀장)"
                  value={newTeamLeaderName}
                  onChange={(e) => setNewTeamLeaderName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#D8D4CD] rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                프로젝트 주제 / 제작 가구 품목
              </label>
              <input
                type="text"
                placeholder="예: 1인 가구 소형 가변형 벤치 겸 수납 가구"
                value={newTeamTopic}
                onChange={(e) => setNewTeamTopic(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D4CD] rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                팀원 이름 (쉼표로 구분하여 여러 명 입력)
              </label>
              <input
                type="text"
                placeholder="예: 박민재, 강하늘, 윤서진"
                value={newTeamMemberInput}
                onChange={(e) => setNewTeamMemberInput(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D4CD] rounded"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                팀장을 제외한 나머지 팀원 이름을 쉼표(,)로 구분해 입력하세요.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8D4CD]">
              <button
                type="button"
                onClick={() => setIsCreatingTeam(false)}
                className="px-3.5 py-1.5 bg-stone-200 text-stone-700 rounded font-bold hover:bg-stone-300"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#202020] text-white rounded font-bold hover:bg-black"
              >
                팀 구성 등록
              </button>
            </div>
          </form>
        )}

        {/* Teams Grid (16 teams display) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTeams.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-[#D8D4CD] bg-white hover:border-stone-400 space-y-3 text-xs shadow-xs transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {t.sectionName}
                    </span>
                    <span className="font-bold text-[#D65A2F] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {t.memberIds.length}명
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#202020] mt-1">{t.name}</h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditTeam(t)}
                    className="p-1.5 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200"
                    title="팀 정보 및 인원 수정"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(t)}
                    className="p-1.5 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200"
                    title="팀 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {t.topic && (
                <div className="p-2 bg-stone-50 rounded border border-stone-200 text-stone-700">
                  <span className="font-semibold text-stone-900 mr-1">주제:</span>
                  <span>{t.topic}</span>
                </div>
              )}

              <div className="space-y-1 text-stone-600 pt-1 border-t border-stone-100">
                <div>
                  팀장: <strong className="text-stone-900 font-bold">{t.leaderName}</strong>
                </div>
                <div>
                  팀원: <span className="text-stone-800">{t.memberNames.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Class Basic Settings Form */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#D8D4CD] pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D65A2F]" />
            <h3 className="text-base font-bold text-[#202020]">교과목 기본 정보 설정</h3>
          </div>
          {classUpdateNotice && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {classUpdateNotice}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveClassSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">교과목명</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-[#202020] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">학기</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-[#202020] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                현재 진행 주차 (1~15)
              </label>
              <select
                aria-label="현재 진행 주차 선택"
                value={currentWeek}
                onChange={(e) => setCurrentWeek(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-[#D8D4CD] rounded text-[#202020] font-bold focus:bg-white"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    {w}주차
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">학생 참여 코드</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 p-2.5 bg-stone-50 border border-[#D8D4CD] rounded font-mono font-bold text-[#D65A2F] uppercase"
                />
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded border border-[#D8D4CD] transition-colors"
                >
                  재발급
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#202020] text-white font-bold rounded-lg hover:bg-black transition-colors"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>

      {/* 4. Open Graph Social Card & Deployment Share Settings */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D4CD] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D65A2F]" />
            <div>
              <h3 className="text-base font-bold text-[#202020]">
                배포용 오픈 그래프(Open Graph) 소셜 공유 카드
              </h3>
              <p className="text-xs text-stone-500">
                카카오톡, 슬랙, 노션, 트위터/X 등에 링크 공유 시 자동으로 표시되는 1200×630 프리뷰 카드입니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/og-image.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>원본 이미지 열기</span>
            </a>
            <a
              href="/og-image.png"
              download="ds2-team-tracker-og.png"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG 다운로드</span>
            </a>
          </div>
        </div>

        {/* Live Visual Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: The OG Image Banner Preview */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#D65A2F]" />
                생성된 1200 × 630 오픈 그래프 이미지
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                PNG & SVG 준비 완료
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#D8D4CD] shadow-sm bg-[#F5F2EC] aspect-[1200/630] group">
              <img
                src="/og-image.png"
                alt="DSII TEAM TRACKER Open Graph Social Card Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              * 정규 1.91:1 비율(1200×630px)로 제작되어 카카오톡 인앱 브라우저 및 메신저 썸네일 잘림 현상이 없습니다.
            </p>
          </div>

          {/* Right: Social Share Preview Simulator (KakaoTalk / Slack style) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-700 block mb-2">
                메신저(카카오톡·슬랙) 공유 시 노출 예시
              </span>
              {/* Simulated Chat Message Card */}
              <div className="bg-[#FAF8F5] border border-[#D8D4CD] rounded-xl p-3.5 shadow-xs space-y-2.5 max-w-sm">
                <div className="rounded-lg overflow-hidden border border-[#D8D4CD] aspect-[1200/630] bg-stone-100">
                  <img
                    src="/og-image.png"
                    alt="Social Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                    designdtusio-git-main-hitaesun-1542s-projects.vercel.app
                  </span>
                  <h4 className="text-sm font-bold text-[#202020] leading-snug">
                    DSII TEAM TRACKER · 디자인스튜디오 II
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    김태선 교수 디자인스튜디오 II 15주 팀 프로젝트 관리 시스템 (01반·02반 16개 팀 주간 진척·산출물·크리틱 피드백)
                  </p>
                </div>
              </div>
            </div>

            {/* Share Link & One-Click Copy */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-stone-700">
                공식 배포 공유 링크 (Vercel)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/"
                  className="w-full p-2 text-xs font-mono bg-stone-50 border border-[#D8D4CD] rounded-lg text-stone-700 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      'https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/'
                    );
                    setCopiedOgUrl(true);
                    setTimeout(() => setCopiedOgUrl(false), 2500);
                  }}
                  className="shrink-0 px-3 py-2 bg-[#D65A2F] hover:bg-[#b84821] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedOgUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>링크 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meta tags preview toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const metaTags = `<meta property="og:type" content="website" />
<meta property="og:site_name" content="DSII TEAM TRACKER" />
<meta property="og:title" content="DSII TEAM TRACKER · 디자인스튜디오 II" />
<meta property="og:description" content="김태선 교수 디자인스튜디오 II 15주 팀 프로젝트 관리 시스템 (01반·02반 16개 팀 주간 진척·산출물·크리틱 피드백)" />
<meta property="og:url" content="https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/" />
<meta property="og:image" content="https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="DSII TEAM TRACKER · 디자인스튜디오 II" />
<meta name="twitter:description" content="김태선 교수 디자인스튜디오 II 15주 팀 프로젝트 관리 시스템 (01반·02반 16개 팀 주간 진척·산출물·크리틱 피드백)" />
<meta name="twitter:image" content="https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/og-image.png" />`;
                  navigator.clipboard.writeText(metaTags);
                  setCopiedTags(true);
                  setTimeout(() => setCopiedTags(false), 2500);
                }}
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline flex items-center gap-1"
              >
                {copiedTags ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">HTML 메타 태그 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>배포용 HTML Open Graph & Twitter 태그 클립보드 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Unassigned Students & Participation Approval */}
      <div className="bg-white border border-[#D8D4CD] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D8D4CD] pb-3">
          <UserCheck className="w-5 h-5 text-[#D65A2F]" />
          <h3 className="text-base font-bold text-[#202020]">참여 학생 배정 대기 목록</h3>
        </div>

        {unassignedStudents.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-stone-600">
              참여 코드를 입력하고 팀 배정을 기다리는 학생 목록입니다.
            </p>
            <div className="divide-y divide-[#D8D4CD] border border-[#D8D4CD] rounded-lg">
              {unassignedStudents.map((st) => (
                <div
                  key={st.uid}
                  className="p-3 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#202020] text-sm mr-2">{st.displayName}</span>
                    <span className="text-stone-500 font-mono">{st.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`${st.displayName} 팀 배정 선택`}
                      className="bg-white border border-[#D8D4CD] rounded px-2.5 py-1 text-xs text-stone-700"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignStudentToTeam(st.uid, e.target.value, false);
                          alert(`${st.displayName} 학생이 해당 팀에 배정되었습니다.`);
                        }
                      }}
                    >
                      <option value="" disabled>
                        팀 선택 후 배정
                      </option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.sectionName} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">배정 대기 중인 학생이 없습니다.</p>
        )}
      </div>

      {/* Team Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#D8D4CD] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#D8D4CD] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#D65A2F]" />
                <h3 className="text-base font-bold text-[#202020]">팀 구성 및 정보 수정</h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">소속 분반</label>
                  <select
                    value={editTeamSection}
                    onChange={(e) => setEditTeamSection(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-[#D8D4CD] rounded font-medium"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">팀명</label>
                  <input
                    type="text"
                    required
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-[#D8D4CD] rounded font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  프로젝트 주제 / 가구 디자인 품목
                </label>
                <input
                  type="text"
                  value={editTeamTopic}
                  onChange={(e) => setEditTeamTopic(e.target.value)}
                  placeholder="예: 1인 가구 소형 가변형 벤치 겸 수납 가구"
                  className="w-full p-2 bg-stone-50 border border-[#D8D4CD] rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">팀장 이름</label>
                <input
                  type="text"
                  required
                  value={editTeamLeaderName}
                  onChange={(e) => setEditTeamLeaderName(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-[#D8D4CD] rounded font-bold text-stone-900"
                />
              </div>

              {/* Members List & Management inside Modal */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-700">
                  현재 소속 팀원 ({editingTeam.memberNames.length}명)
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {editingTeam.memberNames.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200"
                    >
                      <span className="font-medium text-stone-800">
                        {name} {idx === 0 ? '(팀장)' : ''}
                      </span>
                      {editingTeam.memberNames.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromEditingTeam(idx)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold px-1.5 py-0.5 rounded hover:bg-rose-50"
                        >
                          제외
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add member input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="추가할 팀원 이름 입력..."
                    value={editMemberNameToAdd}
                    onChange={(e) => setEditMemberNameToAdd(e.target.value)}
                    className="flex-1 p-2 bg-stone-50 border border-[#D8D4CD] rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddMemberToEditingTeam}
                    className="px-3 py-2 bg-stone-800 text-white font-bold rounded hover:bg-black flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>추가</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D4CD]">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg transition-colors"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#202020] text-white font-bold rounded-lg hover:bg-black transition-colors"
                >
                  수정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
