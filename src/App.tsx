import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { LoginView } from './views/common/LoginView';
import { AccessDeniedView } from './views/common/AccessDeniedView';
import { FirebaseSetupScreen } from './components/firebase/FirebaseSetupScreen';
import { CurrentWeekDashboard } from './views/student/CurrentWeekDashboard';
import { TimelineView } from './views/student/TimelineView';
import { JoinClassView } from './views/student/JoinClassView';
import { OverviewDashboard } from './views/professor/OverviewDashboard';
import { TeamDetailFeedbackView } from './views/professor/TeamDetailFeedbackView';
import { ClassManagementView } from './views/professor/ClassManagementView';
import { WeeklyCurriculumView } from './views/common/WeeklyCurriculumView';
import { TestVerificationBar } from './components/common/TestVerificationBar';

function AppContent() {
  const { currentUser, isLoading, teams } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-luma');
  const [showFirebaseGuide, setShowFirebaseGuide] = useState<boolean>(false);
  const [showAccessDenied, setShowAccessDenied] = useState<boolean>(false);

  // Sync default tab when user changes role
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'professor') {
      setActiveTab('overview');
    } else if (currentUser.role === 'teamLeader' || currentUser.role === 'teamMember') {
      setActiveTab('current-week');
    } else {
      setActiveTab('join');
    }
    setShowAccessDenied(false);
  }, [currentUser?.role, currentUser?.uid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#D65A2F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          DSII TEAM TRACKER 로딩 중...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex flex-col justify-between">
        <LoginView onOpenFirebaseGuide={() => setShowFirebaseGuide(true)} />
        {showFirebaseGuide && (
          <FirebaseSetupScreen
            isModal={true}
            onClose={() => setShowFirebaseGuide(false)}
            onContinueDemo={() => setShowFirebaseGuide(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex flex-col">
      {/* Top Header */}
      <Header onOpenFirebaseGuide={() => setShowFirebaseGuide(true)} />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setShowAccessDenied(false);
            setActiveTab(tab);
          }}
          selectedTeamId={selectedTeamId}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {showAccessDenied ? (
            <AccessDeniedView onGoBack={() => setShowAccessDenied(false)} />
          ) : activeTab === 'overview' ? (
            <OverviewDashboard
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                setActiveTab('teams');
              }}
            />
          ) : activeTab === 'weekly' ? (
            <WeeklyCurriculumView
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                setActiveTab('teams');
              }}
            />
          ) : activeTab === 'teams' ? (
            <TeamDetailFeedbackView
              selectedTeamId={selectedTeamId}
              onBack={() => setActiveTab('overview')}
            />
          ) : activeTab === 'manage' ? (
            <ClassManagementView />
          ) : activeTab === 'current-week' ? (
            <CurrentWeekDashboard />
          ) : activeTab === 'timeline' ? (
            <TimelineView />
          ) : (
            <JoinClassView />
          )}
        </main>
      </div>

      {/* Verification Test Runner Bar */}
      <TestVerificationBar
        onNavigateToTab={(tab, teamId) => {
          setShowAccessDenied(false);
          if (teamId) setSelectedTeamId(teamId);
          setActiveTab(tab);
        }}
        onSimulateAccessDenied={() => {
          setShowAccessDenied(true);
        }}
      />

      {/* Firebase Setup Modal */}
      {showFirebaseGuide && (
        <FirebaseSetupScreen
          isModal={true}
          onClose={() => setShowFirebaseGuide(false)}
          onContinueDemo={() => setShowFirebaseGuide(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
