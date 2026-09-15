import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  ClassInfo,
  Section,
  Team,
  WeeklyReport,
  Feedback,
  UserRole,
  FeedbackReviewStatus,
  WeeklyCurriculum,
  DEFAULT_CURRICULUM,
} from '../types';
import {
  INITIAL_CLASS,
  INITIAL_SECTIONS,
  INITIAL_TEAMS,
  INITIAL_REPORTS,
  INITIAL_FEEDBACKS,
  DEMO_USERS,
} from '../data/demoData';
import {
  initializeFirebaseWithConfig,
  getFirebaseInstances,
  googleProvider,
  FirebaseClientConfig,
} from '../firebase/config';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConfigured: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  classInfo: ClassInfo;
  sections: Section[];
  teams: Team[];
  reports: WeeklyReport[];
  feedbacks: Feedback[];
  curriculum: WeeklyCurriculum[];
  allUsers: Record<string, UserProfile>;
  activeTeam: Team | null;
  // Actions
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: (personaKey?: string) => void;
  switchDemoPersona: (personaKey: string) => void;
  selectStudentTeam: (teamId: string, studentName?: string) => void;
  saveReport: (report: Partial<WeeklyReport>, isSubmit: boolean) => Promise<{ success: boolean; message: string; reportId?: string }>;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string }>;
  createTeam: (teamData: { name: string; sectionId: string; leaderId: string; memberIds: string[]; topic?: string }) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  assignStudentToTeam: (studentUid: string, teamId: string, isLeader?: boolean) => Promise<void>;
  removeStudentFromTeam: (studentUid: string, teamId: string) => Promise<void>;
  updateCurriculumItem: (week: number, updates: Partial<WeeklyCurriculum>) => Promise<void>;
  batchSetup8TeamsPerSection: () => Promise<void>;
  requestJoinClass: (code: string) => Promise<{ success: boolean; message: string }>;
  updateClassInfo: (updates: Partial<ClassInfo>) => Promise<void>;
  switchRole: (role: 'student' | 'professor', teamId?: string) => void;
  getRoleUrls: () => { studentUrl: string; professorUrl: string };
  resetAllProgressToZero: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Defaults to true for AI Studio live preview
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (params.get('role') === 'professor' || hash.includes('professor')) {
          return DEMO_USERS.professor;
        }
        if (params.get('role') === 'student' || hash.includes('student')) {
          return DEMO_USERS.lumaLeader;
        }
      }
      const saved = localStorage.getItem('ds2_currentUser_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid) return parsed;
      }
    } catch {}
    // Default to student view for easy student access
    return DEMO_USERS.lumaLeader;
  });

  // App Data State
  const [classInfo, setClassInfo] = useState<ClassInfo>(() => {
    try {
      const saved = localStorage.getItem('ds2_classInfo_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return { ...parsed, currentWeek: 3 };
        }
      }
    } catch {}
    return { ...INITIAL_CLASS, currentWeek: 3 };
  });

  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('ds2_teams_w3_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TEAMS;
  });

  const [reports, setReports] = useState<WeeklyReport[]>(() => {
    try {
      const saved = localStorage.getItem('ds2_reports_w3_clean_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_REPORTS;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    try {
      const saved = localStorage.getItem('ds2_feedbacks_w3_clean_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_FEEDBACKS;
  });

  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>(DEMO_USERS);
  const [curriculum, setCurriculum] = useState<WeeklyCurriculum[]>(() => {
    try {
      const saved = localStorage.getItem('ds2_curriculum_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CURRICULUM;
  });

  // Local storage synchronization effects
  useEffect(() => {
    try {
      localStorage.setItem('ds2_teams_w3_v6', JSON.stringify(teams));
    } catch {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('ds2_reports_w3_clean_v6', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('ds2_feedbacks_w3_clean_v6', JSON.stringify(feedbacks));
    } catch {}
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('ds2_classInfo_v6', JSON.stringify(classInfo));
    } catch {}
  }, [classInfo]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ds2_currentUser_v6', JSON.stringify(currentUser));
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('ds2_curriculum_v3', JSON.stringify(curriculum));
    } catch {}
  }, [curriculum]);

  // Fetch server config on mount
  useEffect(() => {
    async function checkServerConfig() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (data.isConfigured) {
            const clientConfig: FirebaseClientConfig = {
              apiKey: data.apiKey,
              authDomain: data.authDomain,
              projectId: data.projectId,
              storageBucket: data.storageBucket,
              messagingSenderId: data.messagingSenderId,
              appId: data.appId,
            };
            const initialized = initializeFirebaseWithConfig(clientConfig);
            if (initialized) {
              setIsFirebaseConfigured(true);
              setIsDemoMode(false);
              setupFirebaseAuthListener(initialized.auth, initialized.db);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Could not contact /api/config, running with demo/client state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkServerConfig();
  }, []);

  // Firebase auth state change listener
  const setupFirebaseAuthListener = (auth: any, db: any) => {
    onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        try {
          // Server-side role verification
          const roleRes = await fetch('/api/auth/verify-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          });
          const roleData = await roleRes.json();
          const isServerProfessor = roleData.isProfessor;

          // Check or create Firestore user doc
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);

          let userProfile: UserProfile;
          if (userSnapshot.exists()) {
            const data = userSnapshot.data() as any;
            userProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || data.displayName || '사용자',
              role: isServerProfessor ? 'professor' : (data.role || 'unassigned'),
              classId: data.classId || null,
              sectionId: data.sectionId || null,
              teamId: data.teamId || null,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          } else {
            userProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '사용자',
              role: isServerProfessor ? 'professor' : 'unassigned',
              classId: isServerProfessor ? 'ds2-2026-2' : null,
              sectionId: null,
              teamId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, {
              ...userProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          setCurrentUser(userProfile);
          setupFirestoreRealtimeSync(db);
        } catch (e) {
          console.error('Error synchronizing Firebase user:', e);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
  };

  // Real-time Firestore sync
  const setupFirestoreRealtimeSync = (db: any) => {
    // Classes
    onSnapshot(collection(db, 'classes'), (snap) => {
      if (!snap.empty) {
        const cls = snap.docs[0].data() as ClassInfo;
        setClassInfo({ ...cls, id: snap.docs[0].id });
      }
    });
    // Sections
    onSnapshot(collection(db, 'sections'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Section));
      if (list.length > 0) setSections(list);
    });
    // Teams
    onSnapshot(collection(db, 'teams'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Team));
      if (list.length > 0) setTeams(list);
    });
    // Weekly reports
    onSnapshot(collection(db, 'weeklyReports'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as WeeklyReport));
      if (list.length > 0) setReports(list);
    });
    // Feedbacks
    onSnapshot(collection(db, 'feedback'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Feedback));
      if (list.length > 0) setFeedbacks(list);
    });
  };

  // Google Login
  const loginWithGoogle = async () => {
    const { auth } = getFirebaseInstances();
    if (!auth) {
      throw new Error('Firebase가 연결되지 않았습니다. 환경변수 설정을 확인하거나 데모 모드를 이용하세요.');
    }
    await signInWithPopup(auth, googleProvider);
  };

  // Logout
  const logout = async () => {
    const { auth } = getFirebaseInstances();
    if (auth && !isDemoMode) {
      await firebaseSignOut(auth);
    }
    setFirebaseUser(null);
    setCurrentUser(null);
  };

  // Demo mode switch persona
  const enableDemoMode = (personaKey = 'professor') => {
    setIsDemoMode(true);
    setCurrentUser(DEMO_USERS[personaKey] || DEMO_USERS.professor);
  };

  const switchDemoPersona = (personaKey: string) => {
    if (DEMO_USERS[personaKey]) {
      setCurrentUser(DEMO_USERS[personaKey]);
    }
  };

  // Select team for student
  const selectStudentTeam = (teamId: string, studentName?: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    const userProfile: UserProfile = {
      uid: `student-${targetTeam.id}`,
      email: `${targetTeam.id}@student.ac.kr`,
      displayName: studentName || targetTeam.leaderName || `${targetTeam.name} 학생`,
      role: 'teamLeader',
      classId: targetTeam.classId,
      sectionId: targetTeam.sectionId,
      teamId: targetTeam.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(userProfile);
    try {
      localStorage.setItem('ds2_currentUser_v6', JSON.stringify(userProfile));
    } catch {}
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'student');
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Compute active team for current student (defaults to first team so screen is never blank)
  const activeTeam = currentUser?.teamId
    ? teams.find((t) => t.id === currentUser.teamId) || teams[0] || null
    : teams[0] || null;

  // Save or submit weekly report
  const saveReport = useCallback(
    async (
      reportData: Partial<WeeklyReport> & { forceEdit?: boolean },
      isSubmit: boolean
    ): Promise<{ success: boolean; message: string; reportId?: string }> => {
      if (!currentUser) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      // Find target team: from reportData, currentUser, or fallback to active team
      const targetTeamId = reportData.teamId || currentUser.teamId || teams[0]?.id;
      if (!targetTeamId) {
        return { success: false, message: '배정된 팀이 없습니다.' };
      }

      const team = teams.find((t) => t.id === targetTeamId);
      if (!team) {
        return { success: false, message: '해당 팀을 찾을 수 없습니다.' };
      }

      // Unassigned role check
      if (currentUser.role === 'unassigned') {
        return { success: false, message: '팀을 먼저 선택해주세요.' };
      }

      const targetWeek = reportData.week || classInfo.currentWeek;
      const existingReport = reports.find((r) => r.teamId === targetTeamId && r.week === targetWeek);

      // Validate required fields on submission
      if (isSubmit) {
        if (typeof reportData.progress !== 'number' || reportData.progress < 0 || reportData.progress > 100) {
          return { success: false, message: '진행률을 0%~100% 사이로 지정해주세요.' };
        }
        if (!reportData.weeklyResult || reportData.weeklyResult.trim().length < 20) {
          return { success: false, message: '이번 주 결과는 최소 20자 이상 구체적으로 작성해야 합니다.' };
        }
        if (!reportData.noIssue && (!reportData.issue || reportData.issue.trim().length === 0)) {
          return { success: false, message: '문제점을 작성하거나 "현재 문제 없음"을 체크해주세요.' };
        }
        if (!reportData.nextAction || reportData.nextAction.trim().length === 0) {
          return { success: false, message: '다음 주까지 수행할 구체적인 과업(할 일)을 작성해주세요.' };
        }
      }

      const newStatus = isSubmit ? 'feedbackPending' : 'draft';
      const reportId = existingReport?.id || `report-${targetTeamId}-w${targetWeek}`;

      const updatedReport: WeeklyReport = {
        id: reportId,
        classId: classInfo.id,
        sectionId: team.sectionId,
        teamId: targetTeamId,
        teamName: team.name,
        week: targetWeek,
        phase: reportData.phase || (targetWeek <= 5 ? '탐색·리서치' : targetWeek <= 8 ? '아이디에이션' : targetWeek <= 13 ? '시각화·개발' : '정리·발표'),
        progress: reportData.progress ?? (existingReport?.progress || 0),
        weeklyResult: reportData.weeklyResult ?? (existingReport?.weeklyResult || ''),
        issue: reportData.issue ?? (existingReport?.issue || ''),
        noIssue: reportData.noIssue ?? (existingReport?.noIssue || false),
        nextAction: reportData.nextAction ?? (existingReport?.nextAction || ''),
        evidenceFiles: reportData.evidenceFiles ?? (existingReport?.evidenceFiles || []),
        evidenceLinks: reportData.evidenceLinks ?? (existingReport?.evidenceLinks || []),
        status: newStatus,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName,
        submittedAt: isSubmit ? new Date().toISOString() : existingReport?.submittedAt || null,
        updatedAt: new Date().toISOString(),
      };

      // In Live Firebase mode
      if (isFirebaseConfigured && !isDemoMode) {
        try {
          const { db } = getFirebaseInstances();
          if (db) {
            const docRef = doc(db, 'weeklyReports', reportId);
            await setDoc(docRef, {
              ...updatedReport,
              updatedAt: serverTimestamp(),
              ...(isSubmit ? { submittedAt: serverTimestamp() } : {}),
            }, { merge: true });
          }
        } catch (err) {
          console.warn('Firestore report write error:', err);
        }
      }

      // Update local state and localStorage
      setReports((prev) => {
        const index = prev.findIndex((r) => r.id === reportId);
        let next: WeeklyReport[];
        if (index >= 0) {
          next = [...prev];
          next[index] = updatedReport;
        } else {
          next = [...prev, updatedReport];
        }
        try {
          localStorage.setItem('ds2_reports_w3_clean_v6', JSON.stringify(next));
        } catch {}
        return next;
      });

      return {
        success: true,
        message: isSubmit
          ? `${targetWeek}주차 보고서가 성공적으로 제출되었습니다. (피드백 대기)`
          : `${targetWeek}주차 보고서가 임시저장되었습니다.`,
        reportId,
      };
    },
    [currentUser, teams, classInfo, reports, isFirebaseConfigured, isDemoMode]
  );

  // Professor submits feedback
  const submitFeedback = useCallback(
    async (
      feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<{ success: boolean; message: string }> => {
      if (!currentUser || currentUser.role !== 'professor') {
        return { success: false, message: '피드백 작성 권한은 교수자에게만 있습니다.' };
      }

      const feedbackId = `fb-${feedbackData.teamId}-w${Date.now()}`;
      const now = new Date().toISOString();

      const newFeedback: Feedback = {
        ...feedbackData,
        id: feedbackId,
        createdAt: now,
        updatedAt: now,
      };

      // In Live Firebase mode
      if (isFirebaseConfigured && !isDemoMode) {
        const { db } = getFirebaseInstances();
        if (db) {
          const fbDoc = doc(db, 'feedback', feedbackId);
          await setDoc(fbDoc, {
            ...newFeedback,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          // Update report status in Firestore
          const reportDoc = doc(db, 'weeklyReports', feedbackData.reportId);
          await updateDoc(reportDoc, {
            status: feedbackData.reviewStatus,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Update local feedback state
      setFeedbacks((prev) => [newFeedback, ...prev]);

      // Update corresponding weekly report status immediately
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === feedbackData.reportId) {
            return {
              ...r,
              status: feedbackData.reviewStatus,
              updatedAt: now,
            };
          }
          return r;
        })
      );

      const statusLabels: Record<FeedbackReviewStatus, string> = {
        approved: '승인',
        needsRevision: '보완 요청',
        delayed: '지연 처리',
      };

      return {
        success: true,
        message: `피드백이 성공적으로 전달되었습니다. (${statusLabels[feedbackData.reviewStatus]})`,
      };
    },
    [currentUser, isFirebaseConfigured, isDemoMode]
  );

  // Create team (Professor only)
  const createTeam = async (teamData: {
    name: string;
    sectionId: string;
    leaderId: string;
    memberIds: string[];
    topic?: string;
  }) => {
    const sec = sections.find((s) => s.id === teamData.sectionId);
    const newTeamId = `team-${Date.now().toString(36)}`;
    const leaderUser = allUsers[teamData.leaderId] || { displayName: '팀장' };
    const memberNames = teamData.memberIds.map((mId) => allUsers[mId]?.displayName || mId);

    const newTeam: Team = {
      id: newTeamId,
      classId: classInfo.id,
      sectionId: teamData.sectionId,
      sectionName: sec?.name || '01반',
      name: teamData.name,
      topic: teamData.topic || '',
      leaderId: teamData.leaderId,
      leaderName: leaderUser.displayName,
      memberIds: teamData.memberIds,
      memberNames,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTeams((prev) => [...prev, newTeam]);

    // Update user roles and teamIds
    setAllUsers((prev) => {
      const updated = { ...prev };
      teamData.memberIds.forEach((mId) => {
        if (updated[mId]) {
          updated[mId] = {
            ...updated[mId],
            teamId: newTeamId,
            sectionId: teamData.sectionId,
            classId: classInfo.id,
            role: mId === teamData.leaderId ? 'teamLeader' : 'teamMember',
          };
        }
      });
      return updated;
    });
  };

  // Update team
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    let updatedTeam: Team | null = null;
    setTeams((prev) => {
      const nextTeams = prev.map((t) => {
        if (t.id !== teamId) return t;
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        // If sectionId updated, also update sectionName
        if (updates.sectionId) {
          const sec = sections.find((s) => s.id === updates.sectionId);
          if (sec) updated.sectionName = sec.name;
        }
        updatedTeam = updated;
        return updated;
      });
      try {
        localStorage.setItem('ds2_teams_w3_v6', JSON.stringify(nextTeams));
      } catch {}
      return nextTeams;
    });

    // Update teamName across reports if renamed
    if (updates.name) {
      setReports((prev) => {
        const next = prev.map((r) => (r.teamId === teamId ? { ...r, teamName: updates.name! } : r));
        try {
          localStorage.setItem('ds2_reports_w3_clean_v6', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // In Live Firebase mode, sync to Firestore
    if (isFirebaseConfigured && !isDemoMode) {
      try {
        const { db } = getFirebaseInstances();
        if (db && updatedTeam) {
          const docRef = doc(db, 'teams', teamId);
          await setDoc(docRef, updatedTeam, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore updateTeam error:', err);
      }
    }
  };

  // Delete team
  const deleteTeam = async (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setAllUsers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((uid) => {
        if (updated[uid].teamId === teamId) {
          updated[uid] = {
            ...updated[uid],
            teamId: null,
            role: 'unassigned',
          };
        }
      });
      return updated;
    });
  };

  // Remove student from team
  const removeStudentFromTeam = async (studentUid: string, teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const newMemberIds = t.memberIds.filter((id) => id !== studentUid);
        const newMemberNames = newMemberIds.map((id) => allUsers[id]?.displayName || id);
        const isLeader = t.leaderId === studentUid;
        const newLeaderId = isLeader ? (newMemberIds[0] || '') : t.leaderId;
        const newLeaderName = isLeader ? (allUsers[newLeaderId]?.displayName || '미정') : t.leaderName;
        return {
          ...t,
          leaderId: newLeaderId,
          leaderName: newLeaderName,
          memberIds: newMemberIds,
          memberNames: newMemberNames,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setAllUsers((prev) => {
      if (!prev[studentUid]) return prev;
      return {
        ...prev,
        [studentUid]: {
          ...prev[studentUid],
          teamId: null,
          role: 'unassigned',
        },
      };
    });
  };

  // Assign student to team
  const assignStudentToTeam = async (studentUid: string, teamId: string, isLeader = false) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const newMemberIds = Array.from(new Set([...team.memberIds, studentUid]));
    const studentUser = allUsers[studentUid];
    const newLeaderId = isLeader ? studentUid : team.leaderId;
    const newLeaderName = isLeader && studentUser ? studentUser.displayName : team.leaderName;

    updateTeam(teamId, {
      leaderId: newLeaderId,
      leaderName: newLeaderName,
      memberIds: newMemberIds,
    });

    setAllUsers((prev) => {
      if (!prev[studentUid]) return prev;
      return {
        ...prev,
        [studentUid]: {
          ...prev[studentUid],
          teamId,
          sectionId: team.sectionId,
          classId: team.classId,
          role: isLeader ? 'teamLeader' : 'teamMember',
        },
      };
    });
  };

  // Update curriculum item
  const updateCurriculumItem = async (week: number, updates: Partial<WeeklyCurriculum>) => {
    setCurriculum((prev) =>
      prev.map((item) => (item.week === week ? { ...item, ...updates } : item))
    );
  };

  // Batch setup 8 teams per section
  const batchSetup8TeamsPerSection = async () => {
    setTeams(INITIAL_TEAMS);
    try {
      localStorage.setItem('ds2_teams_v3', JSON.stringify(INITIAL_TEAMS));
    } catch {}
  };

  // Request join class with code
  const requestJoinClass = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (code.trim().toUpperCase() !== classInfo.joinCode.toUpperCase()) {
      return { success: false, message: '유효하지 않은 참여 코드입니다. 교수자에게 확인해주세요.' };
    }
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, classId: classInfo.id, role: 'unassigned' } : null));
    }
    return {
      success: true,
      message: '교과목 참여 코드가 인증되었습니다. 교수자의 분반 및 팀 배정을 기다려주세요.',
    };
  };

  // Update class info
  const updateClassInfo = async (updates: Partial<ClassInfo>) => {
    setClassInfo((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('ds2_classInfo_v4', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (isFirebaseConfigured && !isDemoMode) {
      try {
        const { db } = getFirebaseInstances();
        if (db) {
          const docRef = doc(db, 'classes', classInfo.id);
          await setDoc(docRef, updates, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore updateClassInfo error:', err);
      }
    }
  };

  // Switch Role between student and professor
  const switchRole = useCallback((role: 'student' | 'professor', teamId?: string) => {
    if (role === 'student') {
      const targetTeam = teamId ? teams.find((t) => t.id === teamId) : (activeTeam || teams[0]);
      const studentProfile: UserProfile = {
        uid: targetTeam ? `student-${targetTeam.id}` : 'user-luma-leader',
        email: `${targetTeam?.id || 'luma'}@student.ac.kr`,
        displayName: targetTeam?.leaderName || '학생',
        role: 'teamLeader',
        classId: classInfo.id,
        sectionId: targetTeam?.sectionId || 'sec-01',
        teamId: targetTeam?.id || 'team-luma',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(studentProfile);
      try {
        localStorage.setItem('ds2_currentUser_v6', JSON.stringify(studentProfile));
      } catch {}
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('role', 'student');
        window.history.replaceState(null, '', url.toString());
      }
    } else {
      setCurrentUser(DEMO_USERS.professor);
      try {
        localStorage.setItem('ds2_currentUser_v6', JSON.stringify(DEMO_USERS.professor));
      } catch {}
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('role', 'professor');
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [teams, activeTeam, classInfo.id]);

  // Compute URLs for sharing
  const getRoleUrls = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        studentUrl: 'https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/?role=student',
        professorUrl: 'https://designdtusio-git-main-hitaesun-1542s-projects.vercel.app/?role=professor',
      };
    }
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return {
      studentUrl: `${origin}${pathname}?role=student`,
      professorUrl: `${origin}${pathname}?role=professor`,
    };
  }, []);

  // Reset all progress to 0% and clear reports
  const resetAllProgressToZero = async () => {
    setReports([]);
    setFeedbacks([]);
    try {
      localStorage.setItem('ds2_reports_w3_clean_v6', JSON.stringify([]));
      localStorage.setItem('ds2_feedbacks_w3_clean_v6', JSON.stringify([]));
    } catch {}
  };

  // Sync role from URL parameters on mount & popstate
  useEffect(() => {
    const handleUrlRole = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const roleParam = params.get('role');
      if (roleParam === 'student' || hash.includes('student')) {
        if (currentUser?.role === 'professor') {
          switchRole('student');
        }
      } else if (roleParam === 'professor' || hash.includes('professor')) {
        if (currentUser?.role !== 'professor') {
          switchRole('professor');
        }
      }
    };

    handleUrlRole();
    window.addEventListener('popstate', handleUrlRole);
    return () => window.removeEventListener('popstate', handleUrlRole);
  }, [currentUser?.role, switchRole]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isFirebaseConfigured,
        isDemoMode,
        isLoading,
        classInfo,
        sections,
        teams,
        reports,
        feedbacks,
        curriculum,
        allUsers,
        activeTeam,
        loginWithGoogle,
        logout,
        enableDemoMode,
        switchDemoPersona,
        selectStudentTeam,
        saveReport,
        submitFeedback,
        createTeam,
        updateTeam,
        deleteTeam,
        assignStudentToTeam,
        removeStudentFromTeam,
        updateCurriculumItem,
        batchSetup8TeamsPerSection,
        requestJoinClass,
        updateClassInfo,
        switchRole,
        getRoleUrls,
        resetAllProgressToZero,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
