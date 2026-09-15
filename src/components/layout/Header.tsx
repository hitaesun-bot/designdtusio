import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ShieldCheck, Users, Database, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenFirebaseGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFirebaseGuide }) => {
  const {
    currentUser,
    isFirebaseConfigured,
    isDemoMode,
    switchDemoPersona,
    logout,
    classInfo,
  } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'professor':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-700" /> 교수자
          </span>
        );
      case 'teamLeader':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            <Users className="w-3.5 h-3.5 text-amber-700" /> 학생 팀장
          </span>
        );
      case 'teamMember':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-800 border border-stone-300">
            <Users className="w-3.5 h-3.5 text-stone-600" /> 일반 팀원
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
            배정 대기
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-[#D8D4CD] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#202020] text-white flex items-center justify-center font-bold text-base tracking-tighter">
            DS2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#202020] tracking-tight">
                DSII TEAM TRACKER
              </h1>
              <span className="hidden sm:inline-block text-xs font-medium text-[#D65A2F] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {classInfo.currentWeek}주차 · {classInfo.currentWeek <= 5 ? '탐색·리서치' : classInfo.currentWeek <= 8 ? '아이디에이션' : classInfo.currentWeek <= 13 ? '시각화·개발' : '정리·발표'}
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              {classInfo.title} ({classInfo.englishTitle}) · {classInfo.semester}
            </p>
          </div>
        </div>

        {/* Right tools and User menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Firebase / Demo mode badge */}
          {isFirebaseConfigured ? (
            <span className="hidden lg:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-600" /> Firebase 실시간 연동
            </span>
          ) : (
            <button
              onClick={onOpenFirebaseGuide}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Firebase 연결 가이드 확인"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Firebase 연결 안내</span>
              <span className="sm:hidden">연결 안내</span>
            </button>
          )}

          {/* Persona selector for quick preview & testing */}
          {isDemoMode && (
            <div className="flex items-center gap-1 bg-[#F5F2EC] p-1 rounded-md border border-[#D8D4CD]">
              <span className="text-xs font-semibold text-stone-600 pl-1 hidden xl:inline">
                역할 전환:
              </span>
              <select
                aria-label="데모 역할 전환"
                className="text-xs bg-white border border-[#D8D4CD] rounded px-2 py-1 text-[#202020] font-medium focus:outline-none focus:ring-1 focus:ring-[#D65A2F]"
                value={
                  currentUser?.role === 'professor'
                    ? 'professor'
                    : currentUser?.uid === 'user-luma-leader'
                    ? 'lumaLeader'
                    : currentUser?.uid === 'user-luma-member1'
                    ? 'lumaMember'
                    : currentUser?.uid === 'user-morrow-leader'
                    ? 'morrowLeader'
                    : currentUser?.uid === 'user-form-leader'
                    ? 'formLeader'
                    : currentUser?.uid === 'user-layer-leader'
                    ? 'layerLeader'
                    : 'unassignedStudent'
                }
                onChange={(e) => switchDemoPersona(e.target.value)}
              >
                <option value="professor">교수자 (김태선 교수)</option>
                <option value="lumaLeader">LUMA 팀장 (이지우 - 65% 제출)</option>
                <option value="lumaMember">LUMA 팀원 (박민재 - 열람 전용)</option>
                <option value="morrowLeader">Morrow 팀장 (송태윤 - 보완요청)</option>
                <option value="formLeader">Form&Habit 팀장 (한도현 - 승인)</option>
                <option value="layerLeader">Layer 팀장 (최서연 - 지연)</option>
                <option value="unassignedStudent">미배정 학생 (정다은)</option>
              </select>
            </div>
          )}

          {/* User profile & logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#D8D4CD]">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#202020]">
                    {currentUser.displayName}
                  </span>
                  {getRoleBadge(currentUser.role)}
                </div>
                <span className="text-[11px] text-stone-500">{currentUser.email}</span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
