# InternMatch – AI-Powered Internship Platform

InternMatch is a production-ready, full-stack web application designed for Gen-Z students. It explicitly targets internships, automates missing skill diagnostics, and builds highly curated AI cover letters and ATS-compliant resumes directly cross-referenced against exact job requirements.

## 🚀 Key Features

* **Strict Mandatory Onboarding**: Users must map their specific skills and roles into MongoDB before unlocking core portals, natively protected via Next.js Middleware.

* **Match % Feed System**: Jobs are dynamically scored in real-time. If a user natively lacks skills requested by the job, the percentage strictly bounds the match utilizing pure database references.

* **Skill Gap Analyzer & Architecting Roadmaps**: Dynamic interfaces mapping standard skills to requested roles generating structural learning timelines.

* **Anti-Hallucination AI Profiles**: Application generation strictly prevents falsifying data. The platform parses real user data using Google Gemini AI and forces manual completion if critical details (education, experience, etc.) are missing.

* **ATS Verified PDF Generator**: Uses `pdfkit` entirely backend-side parsing data explicitly mapping to the standard ATS 11pt Helvetica boundaries natively dropping "Not Provided" tags.

* **Gen-Z Immersive UI**: Fully integrated with Framer Motion logic. Uses rich glassmorphic `.bg-white/5` cards against `shadow-[0_0_30px_purple]` neon backdrops overlaying a global `black-to-pink` gradient viewport. 


## 🔧 Technical Stack

- **Framework:** Next.js 16 (App Router) + React 19  
- **Styles:** Tailwind CSS + Framer Motion  
- **Database:** MongoDB (Native NodeJS Driver Client)  
- **Auth:** NextAuth (Google/LinkedIn + Credentials) with secure JWT Middleware serialization  
- **AI Integration:** Google Gemini (`@google/generative-ai`)  
- **Exports:** PDFKit (Native API ReadableStream processing)

## 💻 Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd internmatch
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` inside the root and configure strictly matching this interface:

   ```bash
   # SYSTEM
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_a_random_secure_long_string

   # MONGODB CONNECTION
   MONGODB_URI=mongodb+srv://<auth>@<cluster>.mongodb.net/internmatch

   # AI DRIVER
   # System securely falls back to 'mock' behaviors automatically if no key is entered.
   GEMINI_API_KEY=YOUR_API_KEY_

   # OAUTH (Optional extensions)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   LINKEDIN_CLIENT_ID=
   LINKEDIN_CLIENT_SECRET=
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

Navigate to `http://localhost:3000` to interact with the platform natively!
