# 🧠 AI Learning Platform — Multi-Agent Architecture Plan

> **Note:** Supersedes the earlier stack in `REQUIREMENTS.md` (Node/Express/Gemini/Render) — this spec moves to **FastAPI + CrewAI**, deployed entirely on **Vercel**.

## Stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | Deployed on Vercel |
| Backend hosting | Deployed on Vercel |
| Agent orchestration | CrewAI (multi-agent) |
| LLM provider | Google Gemini API (powers all CrewAI agents) |
| UI/UX | Premium, animated, polished — smooth motion, strong typography |

---

## Agent Orchestration

```mermaid
flowchart TD
    USER["👤 User Input<br/>topic · level · goals · time"] --> CPA["🧭 Course Planner Agent"]

    CPA -->|spawn concurrently| MGA1["📘 Module Generator<br/>Agent 1"]
    CPA -->|spawn concurrently| MGA2["📘 Module Generator<br/>Agent 2"]
    CPA -->|spawn concurrently| MGAN["📘 Module Generator<br/>Agent N"]

    MGA1 --> L["📄 Lessons<br/>4–5 per module"]
    MGA2 --> L
    MGAN --> L

    L --> QA["❓ Quiz Agent"]
    L --> VLA["📺 Video Learning Agent"]
    L --> HTA["🗣️ Hinglish Teacher Agent"]
    L --> VIS["🎨 Visual Learning Agent"]

    QA --> DONE["✅ Finished Lesson"]
    VLA --> DONE
    HTA --> DONE
    VIS --> DONE

    DONE --> TUTOR["🤖 AI Tutor Agent<br/>split-view · grounded in course content"]
    TUTOR --> USER

    style CPA fill:#7c3aed,color:#fff
    style TUTOR fill:#0ea5e9,color:#fff
    style MGA1 fill:#059669,color:#fff
    style MGA2 fill:#059669,color:#fff
    style MGAN fill:#059669,color:#fff
```

---

## Concurrent Course Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant API as FastAPI
    participant CPA as Course Planner Agent
    participant MGA as Module Generator Agents (parallel)
    participant DB

    User->>API: POST /generate-course {topic, level, goals, time}
    API->>CPA: kickoff crew
    CPA->>CPA: draft module roadmap

    par Module 1
        CPA->>MGA: generate Module 1 (4-5 lessons)
    and Module 2
        CPA->>MGA: generate Module 2 (4-5 lessons)
    and Module N
        CPA->>MGA: generate Module N (4-5 lessons)
    end

    MGA-->>CPA: all modules + lessons
    CPA->>DB: persist course
    CPA-->>API: course ready
    API-->>User: navigable course
```

*Concurrency across Module Generator Agents is the key lever for cutting total generation time.*

---

## Agent Responsibilities

| Agent | Responsibility |
|---|---|
| **Course Planner** | Builds the roadmap from topic/level/goals/time; spawns Module Generator Agents concurrently |
| **Module Generator** (×N) | One module each — 4–5 lessons with explanations, examples, interactive exercises, takeaways, embedded visuals |
| **Quiz Agent** | End-of-lesson quiz (MCQ / True-False / fill-blank / coding); instant grading, explanations, progress tracking |
| **Video Learning Agent** | 2–3 relevant YouTube videos; on-demand AI notes (summary, key concepts, timestamps, revision notes, takeaways) |
| **Hinglish Teacher Agent** | "Explain in Hinglish" button → simplified Hinglish text + natural audio narration |
| **Visual Learning Agent** | Mind maps, flowcharts, concept maps, process diagrams, timelines, comparison tables |
| **AI Tutor Agent** | Persistent split-view panel; answers grounded in course content, simplifies concepts, real-time doubt resolution |

---

## Lesson Page Layout

```mermaid
flowchart LR
    subgraph PAGE["Lesson Page"]
        direction LR
        MAIN["📖 Lesson Content<br/>explanation · examples · visuals · quiz"]
        TUTOR["🤖 AI Tutor<br/>split-view panel (right)"]
        MAIN --- TUTOR
    end
```
