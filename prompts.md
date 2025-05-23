You are an expert AI architect and senior software engineer specializing in building intelligent automation tools for developers. Your task is to design a comprehensive blueprint for a "Full-Stack Developer & DevOps AI Agent" (let's call it "DevAgent").

**DevAgent's Core Objective:**
DevAgent will act as an autonomous assistant to human developers. It will ingest tasks (e.g., Jira tickets), understand the requirements, and then perform the full development lifecycle: designing solutions, writing code, implementing tests (TDD), committing to version control, creating pull requests, assisting with deployment, and even troubleshooting issues. It aims to improve developer performance, free up their time from repetitive tasks, and ensure high-quality, production-ready software.

**Key Principles to Embed in DevAgent's Design & Operation:**
1.  **Architectural Best Practices:** Emphasize modularity, scalability, maintainability, and separation of concerns.
2.  **DRY (Don't Repeat Yourself):** The agent should strive for this in the code it generates and in its own operational logic.
3.  **TDD (Test-Driven Development):** Test generation and execution must be integral to its workflow. The agent should ideally write tests *before* or *alongside* feature code.
4.  **Production-Ready Code:** Output should be clean, well-documented, efficient, and secure.
5.  **Agentic Capabilities:** DevAgent needs to plan, execute multi-step tasks, use tools, and reflect on its actions.
6.  **Iterative Development & Feedback:** The agent must be able to incorporate feedback from human developers (e.g., on PRs) and iterate on its solutions.
7.  **Comprehensive Documentation & Communication:** It must document its work (READMEs, code comments, PR descriptions, Jira updates) and communicate progress/blockers/review requests (Slack/Teams).

**Input & Context for DevAgent:**
*   Primary Input: Jira tickets (or similar ticketing system API integration) containing problem descriptions, user stories, bug reports, etc.
*   Contextual Information: Access to existing codebase (repo), project documentation, architectural guidelines, and potentially a knowledge base.

**Core LLM Engine for DevAgent:**
*   The agent will leverage a powerful LLM like Gemini 2.5 (or a future equivalent) via its API for core reasoning, code generation, and understanding tasks.

**High-Level Agent Workflow (Conceptual):**
1.  **Task Ingestion & Understanding:** Parse ticket, clarify ambiguities (potentially by asking questions via a designated channel if necessary).
2.  **Solution Design & Planning:** Break down the problem, outline steps, identify affected components, and select appropriate technologies/patterns.
3.  **Code & Test Generation:** Implement the solution and corresponding tests (unit, integration).
4.  **Local Testing & Iteration:** Run tests, debug, and refine code.
5.  **Version Control:** Commit changes with meaningful messages. Create a new branch.
6.  **Pull Request & Communication:** Push branch, create PR with detailed description, and notify team (e.g., via Slack/Teams) for review.
7.  **Feedback Incorporation:** Monitor PR for comments, understand feedback, and iterate on the code.
8.  **Deployment Assistance:** Once approved, assist with or trigger deployment pipelines.
9.  **Post-Deployment Monitoring & Troubleshooting:** (Advanced) Potentially monitor logs or alerts and suggest/attempt fixes.
10. **Ticket Update:** Update the Jira ticket with progress, resolution, and links to PRs/commits.

**Your Task - Design DevAgent:**

Please provide a detailed architectural design for DevAgent. Specifically, address the following:

1.  **Overall Architecture:**
    *   Propose a high-level architecture (e.g., microservices, modular monolith). Justify your choice, considering scalability, maintainability, and complexity. If microservices, outline the key services.
    *   How would these components interact? (e.g., message queues, APIs).

2.  **Key Modules/Components of DevAgent:**
    *   Describe the purpose and primary responsibilities of each essential module. Examples might include:
        *   `Ticket Ingestion & Interpretation Engine`
        *   `Solution Planning & Strategy Module`
        *   `Code Generation & Refinement Core` (interfacing with Gemini 2.5)
        *   `Test Generation & Execution Framework`
        *   `Version Control (Git) Interaction Module`
        *   `CI/CD Pipeline Integration Module`
        *   `Communication & Notification Module` (Slack, Teams, Jira)
        *   `Feedback Processing & Iteration Loop`
        *   `State Management & Orchestration Engine` (to manage the multi-step agentic flow)
        *   `Knowledge Base / Context Management Module` (for project-specific info)

3.  **Technology Stack Recommendation (for building DevAgent itself):**
    *   Suggest a modern, developer-friendly framework/language(s) to build DevAgent. Consider ease of development, library support (especially for AI/LLM integration, API calls, etc.), and performance. Examples: Python with FastAPI/Django, Node.js with Express/NestJS, Go.
    *   What libraries or tools would be crucial (e.g., LangChain/LlamaIndex for LLM orchestration, libraries for Git, API clients)?

4.  **Data Flow & State Management:**
    *   How will DevAgent manage state across its multi-step processes for a given task?
    *   How will context (from tickets, codebase, feedback) be passed between modules?

5.  **TDD Implementation Strategy for DevAgent:**
    *   How would DevAgent concretely implement TDD? For example, would it prompt Gemini to generate test skeletons first? How would it ensure test coverage?

6.  **Interaction with External Systems:**
    *   Detail how DevAgent would interface with:
        *   Ticketing Systems (e.g., Jira API)
        *   Version Control (e.g., Git, GitHub/GitLab API)
        *   Communication Platforms (e.g., Slack/Teams APIs)
        *   CI/CD Systems (e.g., Jenkins, GitLab CI, GitHub Actions via API or webhooks)
        *   The Gemini 2.5 API

7.  **Agentic Loop & Decision Making:**
    *   How will the agent decide the next step? How will it handle errors or unexpected situations?
    *   How can it be designed to "learn" or improve from its interactions and feedback (even if it's just refining its internal prompts or strategies)?

8.  **Security Considerations:**
    *   What are the key security concerns (e.g., API keys, access to codebases) and how should they be addressed in the design?

9.  **Scalability & Reliability:**
    *   How can DevAgent be designed to handle multiple concurrent tasks or requests from different developers/teams?
    *   How to ensure its operations are reliable?

10. **Developer Experience for those *using* DevAgent:**
    *   How can DevAgent be made easy and intuitive for developers to delegate tasks to and interact with? (e.g., simple commands, clear feedback).
    *   Consider how tools like "Cline" (command-line interfaces) or "Cursor" (IDE integration) offer good developer experiences that DevAgent could emulate or integrate with.

**Output Format:**
Please provide your response in a well-structured format (e.g., using Markdown). Be clear, concise, and provide justifications for your design choices. Think of this as the foundational design document for building DevAgent.

---

**Why this prompt is structured this way:**

*   **Sets a Clear Role:** Tells Cursor *how* to think.
*   **Defines the End Goal (DevAgent):** Clearly describes what needs to be designed.
*   **Lists Core Principles:** Ensures the AI considers these crucial aspects throughout its design.
*   **Specifies Inputs/Outputs:** Provides context for the agent's operation.
*   **Breaks Down the Request:** Asks for specific architectural components, tech stack, data flow, etc., guiding the AI to produce a detailed response.
*   **Highlights Key Integrations:** Forces consideration of how DevAgent interacts with the outside world.
*   **Encourages Best Practices:** TDD, DRY, production-readiness are explicitly requested.
*   **"Cline and Cursor as examples":** This is subtly woven into "Developer Experience" to inspire how DevAgent might interact, rather than asking Cursor to *build something exactly like* Cline/Cursor.
*   **Focus on Design, Not Implementation Code:** This prompt aims to get a *blueprint* from Cursor, which is a more manageable first step. You can then use parts of this blueprint to generate more specific prompts for code generation.

By using this prompt, you should get a solid architectural outline from Cursor, which you can then refine and use as a basis for further, more granular prompts to actually start building the components of your DevAgent.