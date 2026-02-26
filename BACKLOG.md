# IFN Community Project Backlog

This document tracks pending work, missing features, and improvements for the IFN Community website. The goal is to reach a **10/10 rating** for all target personas.

## 📊 Status & Persona Ratings

| Persona | Current Rating | 10/10 Success Criteria |
| :--- | :---: | :--- |
| **Early-Stage Founder** | 8/10 | Functional "Founder Toolkit", interactive visa guide, easy application. |
| **Scaling Founder** | 7/10 | Investor pipeline access, peer-founder matching, high-signal events. |
| **Mentor / Coach** | 4/10 | Dedicated landing page, mentor application flow, portal access. |
| **Investor / Partner** | 5/10 | Functional partners page, network data visibility, sponsorship info. |

---

## 🔴 High Priority (Immediate Fixes & Core Content)

- [x] **Hero Alignment**: Fixed spacing between animated words and "Connects."
- [ ] **Fix Partners Page**: Investigate and fix the loading issue on `/partners`.
- [ ] **Mentorship Landing Page**: Build out `src/pages/Mentorship.tsx` from a placeholder to a conversion-focused page for mentors.
- [ ] **Investor Pipeline**: Initial data gathered and stored in [VC_BACKLOG.md](file:///Users/venkatvellaichamy/Library/CloudStorage/GoogleDrive-venkatvellaichamy@gmail.com/My%20Drive/projects/ifn.community-antigravity/ifn.community/VC_BACKLOG.md). Future: Create a section or page dedicated to investors.
- [ ] **Contact Form Submission**: Implement a real backend or service (e.g., Formspree/Netlify) for `src/pages/Contact.tsx`.

## 🟡 Medium Priority (Features & Enhancements)

- [x] **Resource Hub Redesign (Phase 1)**: Published full page architecture with all audiences, stages, and resource cards on `/resources`.
- [ ] **Resource Hub Content (Phase 2 - Month 1-2)**: Build out the US Market Entry section first — high value content.
- [ ] **Resource Hub Content (Phase 3 - Month 2-4)**: Complete Aspiring Founders and Tech Startups sections.
- [ ] **Resource Hub Content (Phase 4 - Month 4-6)**: Complete SMB section and add video content across all sections.
- [ ] **Loading Optimization**: Implement better transition states or pre-fetching to reduce "Loading..." flickers between routes.
- [ ] **Chapter Map**: Create an interactive map or list of global chapters in `src/pages/Chapters.tsx`.
- [ ] **Membership Details**: Define membership tiers and benefits in `src/pages/Membership.tsx`.
- [ ] **Blog/Resources**: Implement CMS or static rendering for `src/pages/Blog.tsx` and `src/pages/Playbooks.tsx`.

## 🟢 Low Priority (Polish & Infrastructure)

- [ ] **SEO Optimization**: Add unique Meta tags, OpenGraph data, and Twitter cards for all routes.
- [ ] **Social Links**: Update footer social icons with real IFN handles.
- [ ] **Dark Mode Support**: Implement a theme toggle for better accessibility.
- [x] **Performance Optimization (Batch 1)**:
  - [x] Implement `loading="lazy"` on all non-hero images (Home, About, Events).
  - [x] Resize oversized hero images (e.g., About page Unsplash `w=2070` -> `w=1200`).
  - [x] Add `<link rel="preload">` for critical LCP assets (hero images).
  - [x] Optimize font loading (Resolved via CDN fallback & preconnect for reliability).
- [x] **Automated Performance Audit**: Implemented script at `scripts/audit-performance.js` and added `npm run audit` command.
- [ ] **Automated Testing Suite**: Implement Vitest (unit) and Playwright (E2E) covering all components and personas to protect against regressions.

---
*Last Updated: Feb 25, 2026*
