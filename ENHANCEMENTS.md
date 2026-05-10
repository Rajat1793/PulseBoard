# Pulse Board — Future Enhancements

> A curated list of planned features organized by priority and audience.

---

## 🧑‍💻 User-Centric Enhancements

### 1. More Question Types *(High Priority)*
Currently only single-choice MCQ is supported. Extend the question model and UI for:
- **Rating scale** — 1–5 stars or 1–10 NPS score
- **Open-ended text** — free-form written answer
- **Multi-select** — checkbox-style, pick multiple options
- **Yes/No toggle** — quick binary answer
- **Likert scale** — Strongly Agree → Strongly Disagree

### 2. Poll Templates *(High Priority)*
Pre-built templates for common use cases:
- Employee Satisfaction Survey
- Event Feedback Form
- Product NPS Survey
- Customer Onboarding Checklist

Users pick a template and customize it rather than starting from scratch.

### 3. Poll Duplication / Clone *(High Priority)*
A single "Duplicate" button on any poll card creates an identical draft. Useful for recurring polls (weekly standups, monthly feedback cycles).

### 4. CSV / PDF Export *(High Priority)*
- Download raw responses as `.csv` for spreadsheet analysis
- Export analytics chart view as a PDF report

### 5. Response Timeline Chart *(High Priority)*
A line chart on the Analytics page showing response volume over time (hourly/daily). Adds trend insight beyond just total counts.

### 6. Poll Scheduling (Start Date) *(High Priority)*
Add a `startsAt` field alongside `expiresAt` so polls can be created in advance and go live automatically at a scheduled time.

### 7. Response Notifications *(Medium Priority)*
- Email alert on each new response (toggleable per poll)
- Milestone notifications: "Your poll just hit 50 responses!"
- Optional daily digest email with poll stats

### 8. Custom Thank-You Page / Redirect *(Medium Priority)*
After submitting a response, redirect to a custom URL or display a configurable thank-you message. Makes embedded polls feel native to external sites.

### 9. Conditional / Branching Logic *(Medium Priority)*
Show question N only if the answer to question M was a specific option. Makes multi-question polls shorter and smarter for respondents.

### 10. Embed Code Generator *(Medium Priority)*
Auto-generate an `<iframe>` snippet on the Analytics page so any poll can be embedded in a website, Notion doc, or blog post.

### 11. Password-Protected Polls *(Medium Priority)*
Share a poll via link but require a secret password to access — useful for internal polls without forcing respondents to create an account.

### 12. Voter Verification via Email OTP *(Medium Priority)*
For non-auth polls, verify a respondent's email via a one-time passcode before accepting their submission. Prevents ballot stuffing.

### 13. Response Edit Window *(Low Priority)*
Allow authenticated respondents to update their answer within a configurable time window (e.g., 10 minutes) after submission.

### 14. Comment Field per Question *(Low Priority)*
An optional free-text box alongside each MCQ question to capture the reasoning behind a respondent's choice.

### 15. Poll Tags / Categories *(Low Priority)*
Tag polls by topic (HR, Product, Events) and filter/search the dashboard by tag.

---

## 🛡️ Admin-Centric Enhancements

### 16. Admin Dashboard *(High Priority)*
A separate `/admin` role with:
- Platform-wide stats (total users, polls, responses)
- Full list of polls with delete/flag controls
- User management (suspend, delete, role assignment)

### 17. Audit Log *(High Priority)*
Track and display key platform actions:
- Poll created / edited / deleted
- Results published / unpublished
- User login / registration
- Suspicious activity flags

### 18. Poll Moderation Queue *(Medium Priority)*
A flag system where respondents can report inappropriate polls. Admins review a queue and approve or remove flagged polls.

---

## 🔗 Integration Enhancements

### 19. Webhook / Slack / Discord Integration *(Medium Priority)*
Send a POST request (or Slack/Discord message) on each new poll response. Connects Pulse Board into existing team workflows and automation tools like Zapier or Make.

### 20. Teams / Workspaces *(Low Priority)*
Allow multiple collaborators to co-manage a shared set of polls under a team workspace — critical for organizational use.

---

## 📊 Suggested Implementation Order

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Question types (rating, multi-select, text) | High | High |
| 2 | CSV export | Low | High |
| 3 | Poll duplication | Low | High |
| 4 | Response timeline chart | Medium | High |
| 5 | Poll scheduling (start date) | Low | High |
| 6 | Admin dashboard | High | High |
| 7 | Poll templates | Medium | Medium |
| 8 | Response notifications (email) | Medium | Medium |
| 9 | Embed code generator | Low | Medium |
| 10 | Webhook / Slack integration | Medium | Medium |
