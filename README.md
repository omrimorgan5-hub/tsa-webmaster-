# NeuraLearn — AI Learning Portal

TSA Webmaster project: an interactive Artificial Intelligence learning portal aimed at
high school students (grades 9–12). The site demystifies AI with foundational concepts,
practical tools and techniques, and ethical guidance — plus gamification (XP, levels,
badges, and a progress dashboard) to keep learners engaged.

## Project structure

```
├── index.html              # Landing page + progress dashboard
├── css/
│   └── style.css           # Site styles
├── js/
│   └── app.js              # Gamification engine (XP, badges, quiz engine; localStorage)
├── learn/
│   ├── fundamentals.html   # Module 1: AI fundamentals + quiz
│   ├── tools.html          # Module 2: Practical AI tools + quiz
│   └── ethics.html         # Module 3: Ethical AI use + quiz
└── .devcontainer/
    └── devcontainer.json   # Codespace configuration
```

## Challenge requirements checklist

- [x] **Educational content modules (3):** AI fundamentals, practical AI tools/techniques, ethical AI usage
- [x] **Gamification & progress tracking:** XP per quiz answer, level-ups, digital badges
      (AI Explorer, Prompt Pro, Ethics Guardian, AI Master), and a progress dashboard
      on the landing page. Progress persists via `localStorage`.

## Run locally

```bash
npx --yes http-server -p 8080
# then open http://localhost:8080
```

## Open in a Codespace

1. On the repo page, click **Code → Codespaces → Create codespace on main**.
2. Once it loads, run `http-server -p 8080` in the terminal (installed automatically).
3. Open the forwarded port preview to view the site.
