import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  CalendarDays,
  FileEdit,
  History,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'weekly'
  | 'teams'
  | 'manage'
  | 'current-week'
  | 'timeline'
  | 'join';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedTeamId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedTeamId,
}) => {
  const { currentUser, classInfo, activeTeam } = useAuth();
  const role = currentUser?.role || 'unassigned';

  return (
    <aside className="w-full md:w-64 bg-white border-r border-[#D8D4CD] flex-shrink-0 flex flex-col justify-between">
      <div className="p-4 space-y-6">
        {/* Class Overview Card in Sidebar */}
        <div className="bg-[#F5F2EC] rounded-lg p-3.5 border border-[#D8D4CD]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D65A2F] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>학기 진행 단계</span>
          </div>
          <div className="text-sm font-bold text-[#202020] mb-0.5">
            {classInfo.currentWeek}주차 · 아이디에이션
          </div>
          <div className="text-xs text-stone-600 mb-2">
            전체 15주 중 6주차 진행 중 (6~8주 아이디에이션)
          </div>

          {activeTeam && (
            <div className="pt-2 border-t border-[#D8D4CD] text-xs">
              <span className="text-stone-500">소속 팀: </span>
              <span className="font-bold text-[#202020]">
                {activeTeam.sectionName} / {activeTeam.name}
              </span>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {role === 'professor' ? (
            <>
              <div className="px-3 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                교수자 메뉴
              </div>
              <button
                onClick={() => onSelectTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>전체 팀 현황판</span>
              </button>

              <button
                onClick={() => onSelectTab('weekly')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'weekly'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>주차별 내용 정리 (1~15주)</span>
              </button>

              <button
                onClick={() => onSelectTab('teams')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>팀 상세 및 피드백</span>
              </button>

              <button
                onClick={() => onSelectTab('manage')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>교과목·분반·팀 구성</span>
              </button>
            </>
          ) : role === 'teamLeader' || role === 'teamMember' ? (
            <>
              <div className="px-3 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                학생 프로젝트 메뉴
              </div>
              <button
                onClick={() => onSelectTab('current-week')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'current-week'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>
                  {role === 'teamLeader' ? '주간 보고서 작성' : '이번 주 보고서 열람'}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('weekly')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'weekly'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>주차별 내용 정리 (커리큘럼)</span>
              </button>

              <button
                onClick={() => onSelectTab('timeline')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <History className="w-4 h-4" />
                <span>15주 누적 타임라인</span>
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                수업 참여
              </div>
              <button
                onClick={() => onSelectTab('join')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'join'
                    ? 'bg-[#202020] text-white'
                    : 'text-stone-700 hover:bg-[#F5F2EC]'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>참여 코드 및 배정 대기</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Studio Guide Footer */}
      <div className="p-4 border-t border-[#D8D4CD] bg-stone-50 text-xs text-stone-600">
        <div className="font-semibold text-[#202020] mb-1">
          {classInfo.department} {classInfo.grade}
        </div>
        <div>
          {classInfo.title}
        </div>
        <div className="text-[11px] text-stone-400 mt-1">
          코드: {classInfo.joinCode}
        </div>
      </div>
    </aside>
  );
};
