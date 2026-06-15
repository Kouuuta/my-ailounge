# Agentic Coding Attribute Matrix (2026)

A standardized rubric for scoring and benchmarking agentic coding models. Use it to rate any model on six attributes, compare models head-to-head, and track regression/improvement across releases.

---

## Scoring Scale

| Score | Tier | Meaning |
| :--- | :--- | :--- |
| **95–100** | Elite | State-of-the-art. Best-in-class on this attribute; sets the reference bar. |
| **90–94** | Excellent | Top-tier. Handles nearly everything; rare, minor gaps. |
| **80–89** | Strong | Reliable on most real work; occasional misses on hard cases. |
| **70–79** | Good | Competent on common tasks; needs review on complex ones. |
| **60–69** | Usable w/ supervision | Works, but requires active oversight and correction. |
| **< 60** | Significant limitations | Frequent failures; not dependable for unsupervised work. |

> A score is only meaningful with evidence. Every attribute score must cite the tasks/benchmarks that produced it (see [Benchmark Protocol](#benchmark-protocol)).

---

## The Six Attributes

| Code | Attribute | Description |
| :--- | :--- | :--- |
| **INT** | Intelligence | Raw coding intelligence, reasoning, debugging, architecture. |
| **STR** | Strength | Execution power, long tasks, large-codebase handling, persistence. |
| **AGI** | Agility | Planning, adaptability, autonomous problem decomposition. |
| **DEX** | Dexterity | Tool calling, MCPs, APIs, structured outputs, agent reliability. |
| **CTX** | Context | Effective use of large context and codebase understanding. |
| **AUT** | Autonomy | Ability to operate independently with minimal prompting. |

---

## Attribute Rubrics

Each attribute defines what to measure, what each tier looks like, and how to test it.

### INT — Intelligence

**Measures:** correctness of solutions, depth of reasoning, debugging ability, quality of architectural decisions.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Solves novel, multi-constraint problems correctly first pass. Diagnoses subtle root causes (race conditions, memory, off-by-one in distributed logic). Proposes sound, idiomatic architecture. |
| 80–94 | Strong algorithmic and design reasoning; resolves most bugs; occasional miss on deep edge cases. |
| 70–79 | Handles standard problems well; needs hints for hard debugging or non-obvious design. |
| 60–69 | Correct on routine logic; struggles with multi-step reasoning and root-cause analysis. |
| < 60 | Frequent logic errors; surface-level debugging; weak architectural judgment. |

**Test with:** algorithmic problem sets, real bug-fix tasks with known root causes, "explain and fix" on subtle defects, design-the-system prompts scored against a reference solution.

### STR — Strength

**Measures:** sustained execution over long tasks, ability to work in large codebases, persistence to completion without giving up or drifting.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Completes long multi-file refactors end-to-end. Holds coherence over hundreds of steps. No drift, no premature "done." Recovers state after interruptions. |
| 80–94 | Sustains long tasks with minor drift; finishes large jobs with light steering. |
| 70–79 | Handles medium tasks; loses thread on very long sessions or huge repos. |
| 60–69 | Completes short tasks; stalls, loops, or abandons on long/large work. |
| < 60 | Frequently quits early, repeats itself, or breaks unrelated code on scale. |

**Test with:** large-repo migrations (e.g. framework upgrade across N files), multi-hour refactors, tasks requiring 50+ tool turns, "fix all instances across the codebase" sweeps.

### AGI — Agility

**Measures:** quality of planning, decomposition of ambiguous goals, adaptation when the first approach fails.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Produces clear, correctly-ordered plans for ambiguous goals. Re-plans intelligently on failure. Identifies dependencies and risks unprompted. |
| 80–94 | Solid plans; adapts well to most failures; minor sequencing errors. |
| 70–79 | Plans common work adequately; rigid when the approach breaks. |
| 60–69 | Plans only with explicit structure; poor recovery from dead ends. |
| < 60 | Jumps to code without a plan; thrashes when blocked. |

**Test with:** underspecified feature requests, tasks where the obvious approach fails midway (forcing a pivot), multi-component features requiring ordering and dependency awareness.

### DEX — Dexterity

**Measures:** reliable tool/MCP/API use, valid structured outputs, correct argument construction, recovery from tool errors.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Picks the right tool every time, constructs valid args, parallelizes independent calls, recovers cleanly from tool errors, emits schema-valid structured output. |
| 80–94 | Reliable tool use; rare malformed call; recovers from most errors. |
| 70–79 | Generally correct tool use; occasional bad args or missed parallelism. |
| 60–69 | Frequent malformed calls or wrong tool choice; weak error recovery. |
| < 60 | Unreliable tool calling; invalid schemas; loops on tool failures. |

**Test with:** multi-tool workflows, MCP server interactions, forced structured-output (JSON schema) tasks, injected tool failures to test recovery, parallel-call opportunities.

### CTX — Context

**Measures:** effective use of large context windows and accurate understanding of an existing codebase.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Uses full context without losing detail. Locates relevant code accurately in large repos. No hallucinated APIs; respects existing conventions and patterns. |
| 80–94 | Strong codebase grasp; rare lost detail in very long context. |
| 70–79 | Understands local context; misses cross-file relationships sometimes. |
| 60–69 | Frequently forgets earlier context; invents APIs; ignores conventions. |
| < 60 | Loses the thread quickly; hallucinates structure; mismatched patterns. |

**Test with:** "needle in haystack" retrieval at high context fill, questions requiring cross-file synthesis, tasks that must match existing project conventions, large-document reasoning.

### AUT — Autonomy

**Measures:** how much the model achieves with minimal prompting, including verification of its own work.

| Tier | Behavior |
| :--- | :--- |
| 95–100 | Delivers complete, verified results from a one-line goal. Self-checks (runs tests/builds), fixes its own failures, asks only when genuinely blocked. |
| 80–94 | Mostly autonomous; self-verifies; needs occasional nudge. |
| 70–79 | Completes with periodic guidance; limited self-verification. |
| 60–69 | Needs step-by-step direction; rarely checks own work. |
| < 60 | Requires constant prompting; no self-correction. |

**Test with:** single-sentence task briefs, no-handholding runs measuring intervention count, tasks where success requires running tests/builds before declaring done.

---

## Benchmark Protocol

Apply consistently so scores are comparable across models and over time.

1. **Fixed task suite.** Maintain a versioned set of tasks per attribute (≥5 each). Reuse the same suite for every model.
2. **Identical conditions.** Same prompts, same tools/MCPs available, same repo state, same time/turn budget.
3. **Blind scoring where possible.** Score outputs without knowing which model produced them.
4. **Score per task, then aggregate.** Record a 0–100 per task; the attribute score is the mean (note variance if spread is wide).
5. **Cite evidence.** Each attribute score links to its task results.
6. **Re-run on release.** Re-score on every model update to catch regressions.

### Per-task scoring inputs

- **Outcome:** did it produce a correct, working result? (pass/partial/fail)
- **Efficiency:** turns, tokens, wall-clock vs. baseline.
- **Intervention count:** how many human corrections were needed.
- **Verification:** did the model confirm its own result (tests/build/run)?

---

## Scorecard Template

```
Model:          <name + version>
Date:           <YYYY-MM-DD>
Task suite ver: <vX.Y>

| Attr | Score | Tier      | Evidence (tasks / notes)            |
|------|-------|-----------|-------------------------------------|
| INT  |       |           |                                     |
| STR  |       |           |                                     |
| AGI  |       |           |                                     |
| DEX  |       |           |                                     |
| CTX  |       |           |                                     |
| AUT  |       |           |                                     |

Composite (mean): __
Weighted (if used): __   weights: INT_, STR_, AGI_, DEX_, CTX_, AUT_
Summary: <one-paragraph verdict — strengths, weaknesses, best use>
```

### Composite score

- **Unweighted:** simple mean of the six attributes — a balanced general rating.
- **Weighted:** apply weights summing to 1.0 for a use-case profile. Examples:
  - *Autonomous agent runner:* AUT 0.25, DEX 0.20, STR 0.20, AGI 0.15, CTX 0.15, INT 0.05.
  - *Hard problem solver:* INT 0.35, AGI 0.20, CTX 0.20, STR 0.10, DEX 0.10, AUT 0.05.
  - *Large-codebase maintainer:* CTX 0.30, STR 0.25, INT 0.20, DEX 0.10, AGI 0.10, AUT 0.05.

Always report which weighting was used; never compare a weighted score to an unweighted one.

---

## Comparison Matrix (template)

Fill one row per model to compare a fleet at a glance.

| Model | INT | STR | AGI | DEX | CTX | AUT | Composite |
| :--- | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| Model A |  |  |  |  |  |  |  |
| Model B |  |  |  |  |  |  |  |
| Model C |  |  |  |  |  |  |  |

---

*Matrix v1.0 — 2026. Keep the task suite versioned alongside this rubric; a score is only comparable against runs on the same suite version.*
