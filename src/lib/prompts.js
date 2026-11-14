// A starter library of prompts for AI-assisted coding. Use {{placeholders}} for the parts you fill in.

export const PROMPT_CATEGORIES = ['Planning', 'Building', 'Debugging', 'Refactoring', 'Testing', 'Review & security', 'Docs & git', 'UI & design'];

export const PROMPTS = [
    {
        id: 'plan-feature',
        category: 'Planning',
        title: 'Plan a feature before coding',
        prompt: `I want to add {{feature}} to this project.\n\nBefore writing any code:\n1. Read the relevant files and summarize how things work today.\n2. List the files you expect to change and why.\n3. Propose a step-by-step plan with the smallest useful first step.\n4. List risks, unknowns and questions you need answered.\n\nDo not make changes yet. Wait for my approval.`
    },
    {
        id: 'spec-from-idea',
        category: 'Planning',
        title: 'Turn an idea into a spec',
        prompt: `Turn this idea into a short product spec: {{idea}}\n\nInclude: the problem, target users, core user flows, a must-have vs nice-to-have list, data the app stores, edge cases, and what is explicitly out of scope. Keep it under one page and ask me up to 5 clarifying questions at the end.`
    },
    {
        id: 'choose-stack',
        category: 'Planning',
        title: 'Pick a tech stack',
        prompt: `I am building {{project}}. My experience level is {{experience}} and I want to {{goal}}.\n\nRecommend a simple tech stack (frontend, backend, database, hosting). Give one recommended option and one alternative, explain the trade-offs in plain language, and flag anything that will be hard to change later.`
    },
    {
        id: 'scaffold-app',
        category: 'Building',
        title: 'Scaffold a small app',
        prompt: `Build {{app}} using {{stack}}.\n\nRequirements:\n{{requirements}}\n\nWork in small steps: first the project structure and a running "hello world", then one feature at a time. After each step tell me how to run it and what to check. Keep dependencies minimal and explain any you add.`
    },
    {
        id: 'add-feature',
        category: 'Building',
        title: 'Add a feature that matches the codebase',
        prompt: `Add {{feature}}.\n\nFirst look at how similar features are built in this repo and follow the same patterns, naming and folder layout. Reuse existing helpers instead of adding new ones. Keep the change focused: do not refactor unrelated code. When done, summarize what changed and how to test it.`
    },
    {
        id: 'api-endpoint',
        category: 'Building',
        title: 'Create an API endpoint',
        prompt: `Create a {{method}} endpoint at {{path}} that {{behavior}}.\n\nValidate all input, return consistent error responses with proper status codes, never trust client data, and avoid leaking internal details in errors. Add tests for the success case and at least three failure cases.`
    },
    {
        id: 'fix-bug',
        category: 'Debugging',
        title: 'Fix a bug with evidence',
        prompt: `There is a bug: {{symptom}}\n\nExpected: {{expected}}\nActual: {{actual}}\n\nFirst reproduce it or explain exactly why you believe it happens, pointing at the lines responsible. Then fix the root cause (not just the symptom) with the smallest change, and add a test that fails before the fix and passes after.`
    },
    {
        id: 'explain-error',
        category: 'Debugging',
        title: 'Explain an error message',
        prompt: `Explain this error in plain language, list the 3 most likely causes in order of probability, and tell me how to confirm each one:\n\n\`\`\`\n{{error}}\n\`\`\`\n\nRelevant code or context:\n{{context}}`
    },
    {
        id: 'debug-slow',
        category: 'Debugging',
        title: 'Find a performance problem',
        prompt: `{{what}} is slow. Help me find out why before changing anything.\n\nSuggest how to measure it, which parts are the most likely bottlenecks, and what to check first. Only after we have evidence, propose the fix with the biggest impact for the least complexity.`
    },
    {
        id: 'refactor-safe',
        category: 'Refactoring',
        title: 'Refactor without changing behavior',
        prompt: `Refactor {{target}} to be easier to read and maintain.\n\nRules: keep behavior identical, keep the public interface the same, make changes in small steps, and run the tests after each step. If there are no tests for this code, write characterization tests first. Do not add new dependencies.`
    },
    {
        id: 'simplify',
        category: 'Refactoring',
        title: 'Simplify over-engineered code',
        prompt: `Review {{target}} and find unnecessary abstraction, duplicated logic, dead code and over-complicated control flow. Propose the simplest version that still does the job, show a before/after, and explain what you removed and why it is safe.`
    },
    {
        id: 'migrate',
        category: 'Refactoring',
        title: 'Migrate to a new library or version',
        prompt: `Migrate this project from {{from}} to {{to}}.\n\nRead the official migration guide first. List breaking changes that affect us, then migrate in small commits, running the build and tests after each one. Stop and ask if something is ambiguous instead of guessing.`
    },
    {
        id: 'write-tests',
        category: 'Testing',
        title: 'Write tests for existing code',
        prompt: `Write tests for {{target}} using {{framework}}.\n\nCover the normal cases, edge cases (empty, null, very large, unusual characters) and error handling. Test behavior, not implementation details. Keep each test small with a clear name. Do not modify the code under test; if you find a bug, report it instead.`
    },
    {
        id: 'tdd-feature',
        category: 'Testing',
        title: 'Build a feature test-first',
        prompt: `Implement {{feature}} using test-driven development.\n\nStep 1: write failing tests that describe the behavior. Step 2: show me the failures. Step 3: write the minimum code to make them pass. Step 4: refactor. Work one behavior at a time.`
    },
    {
        id: 'code-review',
        category: 'Review & security',
        title: 'Review my changes',
        prompt: `Review the current changes like a strict but friendly senior engineer.\n\nLook for: correctness bugs, missed edge cases, error handling, security issues, performance traps, unclear naming and missing tests. Group findings by severity (must fix, should fix, nit) and quote the exact lines. Do not rewrite everything; only point out problems and suggest fixes.`
    },
    {
        id: 'security-audit',
        category: 'Review & security',
        title: 'Security audit',
        prompt: `Audit {{target}} for security problems.\n\nCheck input validation, injection (SQL, command, XSS), authentication and authorization, secrets in code or logs, unsafe dependencies, insecure defaults and data exposure. For each finding give the risk, a minimal example of how it could be abused, and a concrete fix.`
    },
    {
        id: 'ai-code-check',
        category: 'Review & security',
        title: 'Double-check AI-written code',
        prompt: `Act as a skeptical reviewer of code that an AI wrote. Find things that look right but are not: invented APIs or options, wrong library versions, silent error swallowing, missing validation, race conditions, hard-coded secrets and tests that cannot fail. Verify each claim against the real documentation or code, and list what you could not verify.`
    },
    {
        id: 'readme',
        category: 'Docs & git',
        title: 'Write a README',
        prompt: `Write a README for this project. Read the code first so every command and path is real. Include: what it does in one sentence, a quick start (install, run, test), configuration, a short architecture overview and how to contribute. Keep it scannable and do not invent features.`
    },
    {
        id: 'commit-message',
        category: 'Docs & git',
        title: 'Write a commit message',
        prompt: `Look at the staged changes and write a Conventional Commits message: a subject line under 72 characters in the imperative mood, then a short body explaining why the change was made (not what, the diff shows that). Mention breaking changes explicitly.`
    },
    {
        id: 'pr-description',
        category: 'Docs & git',
        title: 'Write a pull request description',
        prompt: `Write a pull request description for this branch.\n\nSections: Summary (2 sentences), What changed (bullets), How to test (numbered steps), Screenshots needed (yes/no), Risks and rollout notes. Be specific and base it on the real diff.`
    },
    {
        id: 'explain-code',
        category: 'Docs & git',
        title: 'Explain code to a beginner',
        prompt: `Explain {{target}} to someone who is new to {{language}}. Walk through it step by step, define any jargon the first time it appears, and finish with a short summary and one thing I could try changing to learn more.`
    },
    {
        id: 'ui-from-description',
        category: 'UI & design',
        title: 'Build a UI from a description',
        prompt: `Build the UI for {{screen}} using {{framework}}.\n\nStyle: {{style}}. It must work on mobile first, be keyboard accessible, support light and dark mode and use semantic HTML. Reuse the existing components and design tokens. Show empty, loading and error states, not just the happy path.`
    },
    {
        id: 'polish-ui',
        category: 'UI & design',
        title: 'Polish an existing UI',
        prompt: `Improve the look and usability of {{target}} without changing its functionality. Check spacing consistency, typography hierarchy, color contrast (WCAG AA), focus states, touch target size, responsive behavior and microcopy. List each issue and fix it using the existing design tokens.`
    },
    {
        id: 'accessibility',
        category: 'UI & design',
        title: 'Accessibility check',
        prompt: `Audit {{target}} for accessibility against WCAG 2.1 AA. Check labels, headings structure, keyboard navigation, focus order and visibility, ARIA misuse, color contrast, alt text and motion. Give each issue a severity and the exact code fix.`
    }
];
