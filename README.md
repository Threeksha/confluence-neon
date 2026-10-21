
Confluence 2026 — IEEE CS PESU
A responsive, single-page website for Confluence 2026, the flagship hackathon by IEEE Computer Society, PES University. The site helps visitors explore the event, browse its themes and roadmap, find answers to common questions, and reach the registration form.

Live site: https://confluence-neon.vercel.app

Before submitting, verify that this production URL opens in an incognito window without requiring a Vercel login.

Highlights
Event landing page: Confluence branding, event introduction, and primary navigation.
Theme exploration: eight theme cards with descriptions and visual media.
Roadmap: a four-phase journey from discovery and registration to project presentation.
Participation and registration: clear calls to action, including a link to the registration form.
FAQs: a dedicated section for common visitor questions.
Interactive visual design: canvas-based hero effects, a connected-particle network, cursor interaction, and click-triggered particle bursts.
Hidden interactions: a Secret Terminal and visual Easter eggs. These are for fun only and are not authentication or security controls.
Motion considerations: interactive effects include reduced-motion handling where implemented.
Technology choices
Astro — used as a static-site generator (SSG) to pre-render the page into HTML at build time.
HTML, CSS, and browser JavaScript — used for page structure, responsive visual styling, and client-side interactions.
Canvas — used for the custom particle and visual effects.
GitHub — source control and the place where committed project changes are stored.
Vercel — hosting for the generated static site, with deployments connected to the Git repository.
Google Forms — handles registration; the website itself does not provide a custom registration backend.
Astro's static output is suitable for an event-information site because most content is read-only. The browser only needs to run JavaScript for interactive features, rather than rendering the entire page through a client-side framework.

Project structure
confluence-neon/
├── public/                       # Public static assets
├── src/
│   ├── components/
│   │   └── Animations.astro      # Animation component
│   └── pages/
│       └── index.astro           # Main Confluence landing page
├── astro.config.mjs              # Astro configuration
├── package.json                  # Project scripts and dependencies
├── package-lock.json             # Locked dependency versions
└── .gitignore                    # Excludes build output, dependencies, and local secrets
Current architecture note: the main landing page currently orchestrates much of the section markup, styles, and browser interactions from src/pages/index.astro. The project is being refactored into smaller reusable components and separate data, style, and script modules. Update this section once that refactor has been applied and tested in the actual repository.

Run locally
Requirements
Node.js with npm
Git (optional for local development, required for the repository workflow)
Install dependencies
npm install
Start the development server
npm run dev
Open the local URL printed in the terminal (Astro commonly uses http://localhost:4321/). Keep the terminal running while testing.

Create a production build
npm run build
Astro writes the static production output to dist/.

Preview the production build locally
Run this after a successful build:

npm run preview
Windows PowerShell note: if PowerShell blocks npm.ps1 because of its execution policy, use the Windows command shim instead: npm.cmd install, npm.cmd run dev, npm.cmd run build, or npm.cmd run preview.

Development and deployment workflow
Make and save changes locally in VS Code.

Run the development server and test the changed feature.

Verify the production build with npm.cmd run build on Windows.

Commit and push the tested changes to GitHub:

git add .
git commit -m "Describe the change"
git push
Vercel should create a new deployment when the connected branch receives a push. Check the Vercel deployment status and test the production URL after the build succeeds.

Do not commit .env files, access tokens, passwords, or other secrets. Review git status and the staged file list before pushing.

SEO, accessibility, and performance
The page includes a document title, meta description, and basic Open Graph title and description.
Semantic landmarks such as header, nav, main, and section organize the page content.
Decorative canvases should remain hidden from assistive technology, and interactive controls should retain accessible names and keyboard behavior.
The production build can be checked with npm.cmd run build before deployment.
Some theme imagery and videos use remote Unsplash and Pixabay URLs, so their availability and load performance depend on those providers and the visitor's connection.
Before final submission, verify the canonical URL and full social-sharing metadata, add or confirm sitemap generation and public/robots.txt, and test keyboard use, contrast, reduced-motion behavior, image loading, and mobile layouts. Do not describe those items as complete until they are implemented and checked.

Design and implementation decisions
A single-page layout keeps the event information easy to discover without forcing visitors through multiple routes.
Theme and roadmap content is represented as data in the page, making repeated cards consistent.
The hero's canvas interactions are custom browser-side effects, so the visual experience does not depend on a separate animation library.
Registration is delegated to Google Forms rather than introducing an unnecessary backend for this static event site.
Visual polish is balanced with readability by keeping the central text area clear of the more active particle effects.
Final verification checklist
npm.cmd run build completes successfully.
The public production URL works without a Vercel sign-in prompt.
Navigation, theme interactions, FAQs, registration, Secret Terminal, and visual Easter eggs work as expected.
Mobile and desktop layouts are checked.
Sitemap, robots.txt, canonical metadata, and social preview are verified.
README architecture matches the files actually present in the final repository.
