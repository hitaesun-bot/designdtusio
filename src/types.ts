export type UserRole = 'professor' | 'teamLeader' | 'teamMember' | 'unassigned';

export type ProjectPhase = '탐색·리서치' | '아이디에이션' | '시각화·개발' | '정리·발표';

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'feedbackPending'
  | 'needsRevision'
  | 'approved'
  | 'delayed';

export type FeedbackReviewStatus = 'approved' | 'needsRevision' | 'delayed';

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface EvidenceLink {
  id: string;
  type: 'googleDrive' | 'figma' | 'other';
  url: string;
  description?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  classId: string | null;
  sectionId: string | null;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassInfo {
  id: string;
  title: string;
  englishTitle: string;
  semester: string;
  department: string;
  grade: string;
  professorIds: string[];
  joinCode: string;
  startDate: string;
  totalWeeks: number;
  currentWeek: number;
  createdAt: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
}

export interface Team {
  id: string;
  classId: string;
  sectionId: string;
  sectionName: string;
  name: string;
  topic?: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  memberNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReport {
  id: string;
  classId: string;
  sectionId: string;
  teamId: string;
  teamName: string;
  week: number;
  phase: ProjectPhase;
  progress: number;
  weeklyResult: string;
  issue: string;
  noIssue: boolean;
  nextAction: string;
  evidenceFiles: EvidenceFile[];
  evidenceLinks: EvidenceLink[];
  status: ReportStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string | null;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  reportId: string;
  teamId: string;
  professorId: string;
  professorName: string;
  reviewStatus: FeedbackReviewStatus;
  comment: string;
  nextTask: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function getProjectPhase(week: number): ProjectPhase {
  if (week >= 1 && week <= 5) return '탐색·리서치';
  if (week >= 6 && week <= 8) return '아이디에이션';
  if (week >= 9 && week <= 13) return '시각화·개발';
  return '정리·발표';
}

export const PHASE_RANGES = [
  { phase: '탐색·리서치', weeks: '1~5주', min: 1, max: 5 },
  { phase: '아이디에이션', weeks: '6~8주', min: 6, max: 8 },
  { phase: '시각화·개발', weeks: '9~13주', min: 9, max: 13 },
  { phase: '정리·발표', weeks: '14~15주', min: 14, max: 15 },
] as const;

export interface WeeklyCurriculum {
  week: number;
  phase: ProjectPhase;
  topic: string;
  milestone: string;
  deliverable: string;
  tips?: string;
}

export const DEFAULT_CURRICULUM: WeeklyCurriculum[] = [
  {
    week: 1,
    phase: '탐색·리서치',
    topic: '스튜디오 오리엔테이션 및 01/02반 8개 팀 구성',
    milestone: '팀 빌딩 완료, 프로젝트 대주제(리빙/퍼니처) 선정 및 역할 배분',
    deliverable: '팀 구성 프로필 시트 및 프로젝트 초기 관심사 정의서',
    tips: '팀원별 강점(기구 설계, 3D 렌더링, CMF, 그래픽 패널)을 고르게 분배하세요.',
  },
  {
    week: 2,
    phase: '탐색·리서치',
    topic: '타깃 사용자 라이프스타일 분석 및 페르소나 정의',
    milestone: '1인 가구, 협소 주택, 재택근무 등 구체적 주거 맥락의 페인포인트 도출',
    deliverable: '심층 사용자 인터뷰 일지 및 2인 이상 타깃 페르소나 보드',
    tips: '단순 추측이 아닌 실제 사용 환경 관찰 및 사진 아카이빙이 필수적입니다.',
  },
  {
    week: 3,
    phase: '탐색·리서치',
    topic: '시장 및 산업 벤치마킹 조사 / 기술 결구 선행사례 분석',
    milestone: '국내외 가구 브랜드 및 유사 기구 메커니즘 10종 이상 비교 분석',
    deliverable: '경쟁 제품 포지셔닝 맵 및 하드웨어 힌지/결합 분석표',
    tips: '비슷한 문제를 해결한 다른 제품의 메커니즘(힌지, 레일, 체결구)을 집중 분석하세요.',
  },
  {
    week: 4,
    phase: '탐색·리서치',
    topic: '디자인 컨셉 도출 및 무드보드 / CMF 방향성 수립',
    milestone: '디자인 철학, 키워드 3가지, 조형 언어 및 소재(Wood, Metal, Fabric) 결정',
    deliverable: '디자인 키워드 무드보드 및 초기 디자인 스케치 30컷',
    tips: '추상적인 형용사 대신 구체적인 재질감과 비례감을 시각적으로 제시하세요.',
  },
  {
    week: 5,
    phase: '탐색·리서치',
    topic: '1단계 탐색·리서치 종합 크리틱 및 아이디어 수렴',
    milestone: '리서치 근거를 바탕으로 3개 후보 디자인 대안 압축',
    deliverable: '1단계 종합 리서치 프레젠테이션 (PDF) 및 아이디어 스케치북',
    tips: '왜 이 가구가 지금 사용자에게 필요한지 논리적 인과관계를 입증해야 합니다.',
  },
  {
    week: 6,
    phase: '아이디에이션',
    topic: '가구 구조 메커니즘 구체화 및 3D 스케치 모델링 (현재 진행 주차)',
    milestone: '치수 간섭 검토, 하중 지지점 분석, 핵심 가변/수납 작동 기구 3D 검증',
    deliverable: '3D CAD 스케치 렌더링, 치수 간섭 검토서 및 주간 진척 보고서',
    tips: '김태선 교수의 주요 피드백: 접합부 하중과 휨 변형을 반드시 실물 스케일로 검토할 것.',
  },
  {
    week: 7,
    phase: '아이디에이션',
    topic: '1:5 축소 스케일 스터디 목업(폼보드/클레이/3D프린팅) 제작',
    milestone: '비례감, 실제 크기 대비 사용성, 파트별 결합 시뮬레이션 실증',
    deliverable: '축소 목업 실물 사진 5각도, 조립 분해도 및 작동 영상 클립',
    tips: '컴퓨터 화면 속 치수와 실물 비례는 크게 다릅니다. 빠른 스케일 모델로 비례를 확인하세요.',
  },
  {
    week: 8,
    phase: '아이디에이션',
    topic: '중간 평가 (Mid-term Evaluation) 및 디자인 최종안 확정',
    milestone: '01반/02반 전체 16팀 공개 크리틱 진행, 최종 1:1 제작 도면 승인',
    deliverable: '중간평가 패널(A1), 1:1 실물 제작 계획서 및 재료 발주 내역서',
    tips: '김태선 교수 중간 평가 반영: 승인된 팀만 9주차 실물 1:1 제작 단계로 진입할 수 있습니다.',
  },
  {
    week: 9,
    phase: '시각화·개발',
    topic: '정밀 3D CAD 모델링 및 2D 제작 삼면도(Top/Front/Side) 작성',
    milestone: '부재별 정밀 치수(mm), 가공 공차, CNC/레이저 커팅 도면 완성',
    deliverable: '2D 가공 도면(DWG/PDF), 부품 BOM(Bill of Materials) 목록표',
    tips: '목재 결 방향 수축팽창(2~3mm)과 볼트/너트 유격을 도면에 명시해야 합니다.',
  },
  {
    week: 10,
    phase: '시각화·개발',
    topic: 'CMF 사양 확정, 원자재 수급 및 1차 파트 가공 착수',
    milestone: '목재, 알루미늄, 특수 하드웨어 구매 완료 및 부재 정밀 재단',
    deliverable: '원자재 입고 검수 사진, CMF 샘플 스와치 보드',
    tips: '자재 납기 지연이 없도록 공방 및 벤더사와 사전에 일정을 조율하세요.',
  },
  {
    week: 11,
    phase: '시각화·개발',
    topic: '1:1 실물 크기 프로토타입 1차 가조립 및 결구 결합 시험',
    milestone: '모든 부품의 1차 드라이 조립, 하중 지지 및 유격 점검',
    deliverable: '1차 가조립 실물 사진, 조립 오차 기록부 및 보완 계획',
    tips: '접착제(본드)를 바르기 전 반드시 드라이 피팅(Dry-fitting)으로 전체 조립성을 확인하세요.',
  },
  {
    week: 12,
    phase: '시각화·개발',
    topic: '구조 보강, 작동 기구 미세 조정 및 샌딩/표면 마감',
    milestone: '유격 및 처짐 현상 해결, 샌딩(#120~#400) 및 오일/도장 마감',
    deliverable: '작동 테스트 영상, 표면 마감 전/후 디테일 컷',
    tips: '가구의 완성도는 모서리 라운딩(Chamfer/Fillet)과 표면 마감 품질에서 결정됩니다.',
  },
  {
    week: 13,
    phase: '시각화·개발',
    topic: '최종 1:1 워킹 프로토타입(Working Prototype) 완성 및 사용성 평가',
    milestone: '실제 주거 환경 내 배치, 성인 하중 실사용 검증 및 결함 제로화',
    deliverable: '완성 제품 고해상도 사진(배경 스튜디오), 사용성 테스트 설문 결과서',
    tips: '기능 작동 시 소음이나 유격이 없는지 꼼꼼히 점검하고 보강하세요.',
  },
  {
    week: 14,
    phase: '정리·발표',
    topic: '전문 사진 스튜디오 제품 촬영 및 전시용 그래픽 패널(A0/A1) 디자인',
    milestone: '라이프스타일 컷 촬영, 컨셉-프로세스-도면을 집약한 전시 그래픽 완성',
    deliverable: '스튜디오 촬영본 10장, 전시 패널 시안(AI/PDF), 리플릿 디자인',
    tips: '가구 단독 컷뿐만 아니라 사람이 실제 사용하는 라이프스타일 씬을 꼭 담으세요.',
  },
  {
    week: 15,
    phase: '정리·발표',
    topic: '최종 졸업/과제 파이널 크리틱 및 15주 프로젝트 총람 전시',
    milestone: '01반·02반 16팀 실물 가구 전시 및 김태선 교수 최종 종합 평가',
    deliverable: '최종 프로세스 북(Booklet), 파이널 피칭 발표, 전시 디스플레이',
    tips: '15주간의 시행착오와 성장 과정(목업 아카이브)을 함께 전시하면 완성도가 배가됩니다.',
  },
];
