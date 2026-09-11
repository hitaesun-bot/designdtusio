# DSII TEAM TRACKER - Security Specification & Access Control

## 1. Core Data Invariants
- **Identity Integrity**: Students cannot escalate their own role to `professor` or alter their team assignment without authorization.
- **Team Isolation**: Students can only view and interact with data belonging to their assigned team. Cross-team unauthorized viewing or editing is strictly prohibited.
- **Role Tiering**:
  - `professor`: Full read/write access to classes, sections, teams, weekly reports, and sole authority to issue feedback and assign students.
  - `teamLeader`: Authorized to create and update weekly reports for their assigned team only when the report is not in an `approved` terminal state.
  - `teamMember`: Read-only access to their team's weekly reports and professor feedback. Forbidden from modifying or submitting reports.
- **Report Immutability**:
  - Once a report is marked `approved` by the professor, students cannot modify it.
  - When marked `needsRevision`, the team leader is permitted to resubmit changes.
- **Evidence Storage Security**:
  - Maximum upload size is strictly 20MB per file.
  - Permitted MIME types: JPEG, PNG, WEBP, PDF, PPT, PPTX. Executable binaries (.exe, .sh, .bat, etc.) are strictly rejected.
  - External links must be HTTPS and must correspond to valid URL structures.

## 2. The "Dirty Dozen" Vulnerability Payloads
1. **Payload 1 (Self-Role Escalation)**: Student attempting to write `{ role: "professor" }` into `/users/{uid}`.
2. **Payload 2 (Cross-Team Report Injection)**: Team A's leader attempting to write a report for `teamId: "team_b"`.
3. **Payload 3 (Approved Report Overwrite)**: Team leader attempting to mutate an already `approved` report.
4. **Payload 4 (Team Member Direct Mutation)**: A regular `teamMember` attempting to update `weeklyResult` or `progress`.
5. **Payload 5 (Fake Professor Feedback)**: Student attempting to write directly to `/feedback/{feedbackId}`.
6. **Payload 6 (Shadow Field Injection)**: Creating a report with unverified properties (`{ ghostField: true, adminBypass: true }`).
7. **Payload 7 (Unbounded String Attack)**: Sending a 500KB string payload into `weeklyResult` or `issue`.
8. **Payload 8 (Negative Progress / Out of Range)**: Setting `progress: 150` or `progress: -20`.
9. **Payload 9 (Executable Upload Attack)**: Uploading `malware.exe` or MIME `application/x-dosexec` to Firebase Storage.
10. **Payload 10 (File Size Abuse)**: Uploading a 50MB file exceeding the 20MB studio cap.
11. **Payload 11 (Non-HTTPS External Link)**: Injecting `javascript:...` or `http://...` into `evidenceLinks`.
12. **Payload 12 (ID Path Traversal / Poisoning)**: Attempting document path injection like `../../system`.

All 12 attacks are blocked deterministically by `firestore.rules` and `storage.rules`.
