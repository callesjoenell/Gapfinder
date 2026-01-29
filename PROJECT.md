# GAP FINDER

A spec-driven market opportunity discovery system for solo founders.

---

## THE NORTH STAR: The Emotional Journey

**Every technical decision in this project serves ONE outcome: how users FEEL when they complete the process.**

This is not a feature list with an emotional section tacked on. The emotional journey IS the product. Features are just the delivery mechanism.

### The Arc

```
START: "I don't know what to build" / "I have too many ideas"
       (Confusion, overwhelm, self-doubt)
                    ↓
PHASE 0: "I have more to offer than I realized"
         (Discovery of unfair advantages)
                    ↓
PHASE 1: "There are real problems I could solve"
         (Connection to market reality)
                    ↓
PHASE 2: "I see how MY unique combination fits"
         (Synthesis and ownership - THEY connect the dots)
                    ↓
PHASE 3: "I know exactly WHO I'm helping"
         (Clarity of purpose)
                    ↓
PHASE 4: "This is worth pursuing - here's why"
         (Validated confidence with evidence)
                    ↓
PHASES 5-6: "Real people confirmed this matters"
            (External validation from human conversations)
                    ↓
PHASES 7-8: "People will pay for this"
            (Market validation through pre-selling)
                    ↓
END: "I know exactly what to build and why"
     (Clarity, confidence, capability, OWNERSHIP)
```

### User Exits Feeling

| Outcome | What It Means | How We Measure |
|---------|---------------|----------------|
| **Confident** | "I CAN do this" | Language shifts to certainties |
| **Capable** | "I know HOW" | Asks "how do I..." not "should I..." |
| **Clear** | "I know WHAT and WHO" | Can articulate idea in one sentence |
| **Ownership** | "This is MY idea, I discovered it" | Says "I realized" not "Claude suggested" |

### The Design Principle

**Before implementing ANY feature, ask:**
> "Does this help users feel capable and clear, with genuine ownership of their idea?"

If the answer is no or unclear, reconsider the feature.

**Examples:**
- Idea card animation (blobs merging) → Visualizes THEIR journey from confusion to clarity
- Progress bar → Shows THEY are making progress, builds confidence
- Handoff phases → Ensures THEY synthesize the idea, not Claude
- Challenge mode → Honest feedback builds trust, prepares them for reality
- No cheerleading → Respect, not false encouragement

---

## VISION

Gap Finder transforms "I want to start a business but don't know what to build" into a repeatable system that surfaces validated opportunities at the intersection of pain, demand, and timing.

**The Problem It Solves:**
Most founders pick ideas based on gut feel, then spend months building before discovering nobody wants it. Alternatively, they drown in "market research" that produces analysis paralysis rather than action.

**The Solution:**
A structured Claude skill + research tools that:
1. Maps your personal context to find starting points with built-in unfair advantages (Phase 0)
2. Systematically surfaces market gaps using data (Amazon reviews, Reddit frustration, YouTube engagement, Google Trends)
3. Filters ideas through the Four Scores Gate (Pain, Simplicity, Shareability, Timing)
4. Forces human validation before building (20 conversations framework using Mom Test + JTBD)
5. Uses rigorous interview methodology to separate real demand from false signals
6. Outputs actionable go/no-go decisions with evidence

**Core Philosophy (All in Service of the Emotional Journey):**
- **WHAT > HOW** — Finding what to build is harder than building it → Users exit with CLARITY
- **Speed > Quality** — Ship in days, iterate fast → Users feel CAPABLE of acting
- **Distribution > Code** — AI writes code, can't get users → Users know HOW to reach people
- **Sell before you build** — Validate with humans, not assumptions → Users have CONFIDENCE from evidence
- **Pick a person, not a product** — WHO matters more than WHAT → Users have CLARITY of purpose
- **Idea comes from THEM** — Claude surfaces dots, user connects → Users have OWNERSHIP

## CURRENT STATE

### What Exists

**SKILL.md** (v7, ~4000+ lines)
- 10-phase methodology (0-9): Know Yourself → Find Gaps → Connect the Dots → Pick Your Person → Score & Sharpen → Discovery Calls → Validation Calls → Design Your Offer → Sell First → Build & Ship
- **Phase 0:** Know Yourself based on MILES Framework, Ikigai, Paul Graham organic ideas, NBER research
- **Phase 2:** Connect the Dots - Human synthesizes, AI assists. The idea comes from YOU.
- **Phase 5/6:** Split conversation phases - Discovery (1-10) explores, Validation (11-20) confirms and tests price
- 6 Starting Points: Life Situation, Profession, Hobbies, Skills Others Pay For, Networks, Transformations Made
- **Distribution-First Research:** Audience Arbitrage Matrix, Underpriced Channels, Deep Pockets/Needs indicators
- Specific Patterns: Facebook for Gen X, LinkedIn for non-tech B2B, YouTube for professionals, WhatsApp for European B2B
- The Taste Moat concept
- Anti-patterns to reject
- Four Scores Gate (Pain, Simplicity, Shareability, Timing) in Phase 4
- **Manual Research Guide with 8 platform-specific instructions**
- **Expanded MCP Server & API Reference** (see Research Tools section)
- Context-aware Research Assignments
- Human validation framework based on Mom Test + Jobs To Be Done
- Decision gates between phases
- Life Alignment Filter

**Research Tools** (`/tools/`)
- `amazon_scraper.py` - Reviews + pain point extraction
- `google_trends.py` - Interest trajectory analysis
- `reddit_scanner.py` - Community pain point mining
- `producthunt_analyzer.py` - Competitive landscape

### What's Missing

1. **MCP Server Installation**
   - MCP servers documented in SKILL.md but need actual installation
   - Key servers: mcp-server-reddit, hn-mcp, github-mcp-server, tavily-mcp, product-hunt-mcp
   - Setup: Add to `claude_desktop_config.json`

2. **YouTube Research Tool**
   - Currently manual (web search)
   - Need YouTube Data API integration for view counts
   - Requires API key and quota management

3. **Pattern Synthesis Engine**
   - After 20 conversations, need structured synthesis
   - Cross-reference conversation patterns with research data
   - Generate "Evidence Report" for go/no-go decision

4. **Digital Conversation Capture**
   - Current template is markdown
   - Need web form or structured input for easier capture during/after calls

5. **Output Artifacts**
   - "Gap Report" format for validated opportunities
   - Exportable brief for Phase 7 handoff
   - Four Scores scorecard visualization

## RESEARCH TOOLS INVENTORY

### Tier 1: Free & Essential (Install These)

| Tool | Type | Signal | Install |
|------|------|--------|---------|
| **Google News + Trends MCP** | RSS feeds (NO KEY!) | Trending topics, timing signals, news by region | `uvx google-news-trends-mcp@latest` |
| **News Aggregator MCP** | 5 APIs with failover | Catalyst detection, "why now" evidence | `npm install` from repo |
| **Tavily MCP** | Search + Extract | News, timing, current events | `npx tavily-mcp@latest` |
| **Reddit MCP** | Official API | Community pain, frustration | `uvx mcp-server-reddit` |
| **Hacker News MCP** | Algolia API | Tech builder sentiment | `npx -y @devabdultech/hn-mcp-server` |
| **ProductHunt MCP** | GraphQL API | Competition, what's launching | `pip install product-hunt-mcp` |
| **GitHub MCP** | Official API | What devs building, issues | Docker + PAT |

**Priority:** Google News + Trends (free, no key) → Tavily → Reddit → HN → ProductHunt → News Aggregator → GitHub

### Tier 2: Free Public APIs (Use Directly)

| API | Signal | Access |
|-----|--------|--------|
| **Indie Hackers API** | Founder discussions, what's working | `api.indiehackers.com` (public beta) |
| **DEV.to API** | Developer community pain | `dev.to/api` |
| **Stack Overflow** | Technical problems, unanswered Qs | `api.stackexchange.com` |
| **BLS (Bureau of Labor Statistics)** | Employment, wages, industry data | `api.bls.gov` |
| **Census Bureau** | Demographics, economic data | `api.census.gov` |
| **SEC EDGAR** | Public company filings | `sec.gov/developer` |
| **USPTO** | Patent filings (innovation signals) | `developer.uspto.gov` |
| **data.gov** | 250K+ US government datasets | `data.gov` |

### Tier 3: Paid (Only If Budget Allows)

| Tool | Cost | When Worth It |
|------|------|---------------|
| **Keywords Everywhere** | ~$10 (pay-as-you-go) | Validating search volume for specific terms |
| **Twitter/X API** | $100+/month | Only if Twitter is your primary channel |
| **Crunchbase** | Enterprise $$$ | Skip — use web search |
| **Semrush/Ahrefs** | $100-120/month | Skip — use free alternatives |

### Tier 4: Web Search Patterns (Always Available)

```
# Pain signals
site:reddit.com "[topic]" frustrated OR struggling
site:twitter.com "[topic]" (free, no API needed)

# Demand signals
site:youtube.com "[problem] tutorial"
site:udemy.com "[skill]"

# Competition
site:producthunt.com "[topic]"
site:g2.com "[category]"

# Timing
"[topic]" regulation OR "API launched" OR "now possible"
```

## TECH STACK

- **Runtime:** Python 3.11+
- **MCP Framework:** Claude MCP SDK
- **Scraping:** requests, BeautifulSoup, playwright (for JS-heavy sites)
- **Data:** JSON files (no database needed for solo use)
- **Output:** Markdown + optional HTML reports

## CONSTRAINTS

- Must work entirely within Claude Code / claude.ai workflow
- **Ethics-first research:** Only official APIs, public web search, manual browsing
- No scraping or ToS violations — if you wouldn't explain it to the platform CEO, don't do it
- Single-user focused (not multi-tenant SaaS)
- Research tools are assistive, not authoritative — human judgment required
- Manual research (LinkedIn, G2, Upwork, etc.) requires user to browse and report back

## SUCCESS CRITERIA

### Ultimate Success (The Only Metric That Matters)

**A user who completes the process should be able to say:**
> "I feel confident I know what to build, who it's for, and why I'm the right person to build it. This is MY idea - I discovered it through this process."

Everything else is in service of this outcome.

### Feature Milestones (Delivery Mechanism)

**Milestone 1 Complete When:**
- MCP server runs locally and Claude can invoke all research tools
- YouTube validation tool functional
- SKILL.md properly references tool invocation

**Milestone 2 Complete When:**
- Full research cycle works end-to-end on new opportunity
- Four Scores Gate enforced programmatically
- Research output feeds into conversation outreach templates

**Milestone 3 Complete When:**
- 20-conversation framework tested on real opportunity
- Capture template works in practice
- Synthesis framework produces actionable go/no-go recommendation

**Milestone 4 Complete When:**
- "Gap Report" artifact generated from completed research + validation
- Report includes: opportunity summary, evidence strength, timing assessment, Four Scores scores
- Handoff to Offer Design phase is clean

### Emotional Journey Validation

After each milestone, validate against the North Star:
- [ ] Does user language show increased confidence?
- [ ] Does user take ownership of insights ("I noticed..." not "It said...")?
- [ ] Can user articulate their idea clearly without prompting?
- [ ] Does user defend their idea when challenged (ownership signal)?
- [ ] Does user ask "how do I..." questions (ready to act)?

## ROADMAP

### Milestone 1: MCP Server Foundation
- [ ] Install Tier 1 MCP servers (Tavily, Reddit, HN, ProductHunt, GitHub)
- [ ] Configure `claude_desktop_config.json`
- [ ] Test each server invocation from Claude
- [ ] Add YouTube research tool (Data API)
- [ ] Update SKILL.md with proper tool references
- [ ] Document API key setup for each service

### Milestone 2: Research Pipeline
- [ ] Build orchestration script for multi-source research
- [ ] Add data persistence (save research between sessions)
- [ ] Create "Research Brief" output format
- [ ] Integrate Four Scores Gate as checkpoint
- [ ] Add timing assessment automation
- [ ] Test Indie Hackers API integration
- [ ] Test DEV.to API for technical research

### Milestone 3: Validation Framework
- [ ] Build digital capture tool
- [ ] Create pattern synthesis prompts
- [ ] Design "Evidence Report" format
- [ ] Test two-mode conversation flow

### Milestone 4: Full Cycle Polish
- [ ] End-to-end test on new opportunity
- [ ] Gap Report generation
- [ ] Documentation and usage guide
- [ ] (Optional) Simple web UI for non-Claude-Code users

## DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-20 | Added Google News + Trends MCP as top priority | Free (no API key!), direct timing/trending signals via public RSS feeds. Best tool for "why now" research. |
| 2025-01-20 | Added News Aggregator MCP with 5-API failover | Catalyst detection across multiple news sources. Auto-switches when one API hits rate limit. |
| 2025-01-20 | Added Tier system for research tools | Clearer prioritization: Free/Essential → Free APIs → Paid → Web Search fallback |
| 2025-01-20 | Added Indie Hackers API + DEV.to API | Founder community signals (IH) + developer pain (DEV.to) — both free |
| 2025-01-20 | Marked Crunchbase/Semrush/Ahrefs as "Skip" | Too expensive for solo founders; web search provides 80% of value |
| 2025-01-20 | Added Keywords Everywhere as affordable option | Pay-as-you-go (~$10) for keyword validation when needed |
| 2025-01-20 | Expanded government data APIs | BLS, Census, SEC EDGAR, USPTO, data.gov — free, authoritative |
| 2025-01-20 | Platform-specific research instructions for 8 platforms | Each platform works differently. Added detailed step-by-step for: LinkedIn (Posts search), G2/Capterra (star filtering), Upwork/Fiverr (jobs vs gigs), Facebook Groups (finding + searching within), Course Platforms (Udemy/Skillshare/Coursera), Stack Overflow (search operators), Substack (newsletter discovery), Medium (tag browsing + claps). |
| 2025-01-20 | Manual Research is context-aware: Claude gives specific Research Assignments | After Phase 2, Claude generates search terms FROM user's context. Selects sources by idea type. User browses, fills templates, returns. Claude analyzes patterns, updates scores, generates Phase 5 questions. |
| 2025-01-20 | Ethics-first research: Only official APIs, public web search, manual browsing | No scraping, no ToS violations, no grey areas. If you wouldn't explain it to the platform CEO, don't do it. |
| 2025-01-20 | Expanded to 10 phases (0-9) | Web app design revealed need for clearer gates and human ownership of the idea |
| 2025-01-20 | Added Phase 2: Connect the Dots | The idea must come from the HUMAN. AI surfaces dots, human connects them. Addresses 75% abandonment pattern from ideas that don't feel like "theirs" |
| 2025-01-20 | Split Human Validation into Phase 5 (Discovery) + Phase 6 (Validation) | First 10 calls explore and disprove assumptions; second 10 confirm patterns and test price. Each has distinct purpose and capture template |
| 2025-01-20 | Added Phase 0: Personal Context Mapping | Research shows organic ideas (Paul Graham), founder-market fit (NBER), and unfair advantages (MILES) predict success. Start from personal context, not random ideation. |

## EDGE CASES & KNOWN ISSUES

- **API rate limits:** Reddit, YouTube, GitHub APIs have rate limits; space out requests
- **Login-required content:** Facebook Groups, Glassdoor require user's own accounts
- **Manual research burden:** Some sources require human browsing; can't be fully automated
- **Platform changes:** Public page structures change; capture templates may need updates
- **Google Trends:** Now accessible via MCP server (uses RSS feeds, no API key needed)
- **YouTube:** Data API has quota limits; may need workaround for high volume
- **Conversation capture:** Real conversations don't follow templates; need flexible format
- **Validation bias:** Even with Mom Test, founder bias creeps in; need explicit "surprise log"
- **News API rate limits:** News Aggregator auto-fails over, but all 5 APIs have daily limits
- **Indie Hackers API:** Public beta — may change or have limitations

## THE EVALUATION FRAMEWORK

Every idea runs through four scored dimensions before human validation:

### The Four Scores

| Score | Range | Minimum | What It Measures |
|-------|-------|---------|------------------|
| **Pain** | 1-10 | ≥7 | Emotional frustration, spending on failed solutions, YouTube/Reddit validation |
| **Simplicity** | Pass/Fail | Pass | Can explain in 3 words (e.g., "Face analysis", "Photo calories") |
| **Shareability** | 1-10 | ≥5 | Built-in distribution: sharing required, artifacts to show off, network effects |
| **Timing** | 1-10 | ≥6 | Tech readiness, behavior change, market awareness, competition stage, catalyst |

### Timing Sub-Factors (Bill Gross: 42% of success)

| Factor | Question |
|--------|----------|
| Technology Readiness | Has enabling tech recently become affordable? |
| Behavior Readiness | Have consumer behaviors crossed a threshold? |
| Market Awareness | Are people actively searching for solutions? |
| Competition Stage | Early enough to win, validated by some competition? |
| Infrastructure | Are platforms, payments, distribution mature? |
| Catalyst Present | Recent regulation, event, or shift making "now" different? |

### Decision Gate

| Total Score | Decision |
|-------------|----------|
| 25+ with Pass | 🟢 Proceed with confidence |
| 20-24 with Pass | 🟡 Proceed, watch weak spots |
| 18-19 with Pass | 🟠 Sharpen before validation |
| <18 or Fail | 🔴 Do not proceed — sharpen first |

## USAGE

```bash
# From Claude chat, invoke skill:
# "Help me find a market gap for [audience]"
# "Run Gap Finder on [problem space]"
# "I have an idea for [X] — run it through Gap Finder"

# From Claude Code with MCP server (once built):
cd /path/to/gap-finder
python -m gap_finder.server
```

## FILES

```
gap-finder/
├── PROJECT.md          # This file (GSD spec)
├── SKILL.md            # Claude skill definition
├── tools/
│   ├── amazon_scraper.py
│   ├── google_trends.py
│   ├── reddit_scanner.py
│   ├── producthunt_analyzer.py
│   └── youtube_validator.py  # To build
├── server/             # MCP server (to build)
│   ├── __init__.py
│   └── main.py
├── templates/
│   ├── personal_context_map.md
│   ├── connect_the_dots.md
│   ├── research_brief.md
│   ├── discovery_capture.md
│   ├── validation_capture.md
│   ├── four_scores_gate.md
│   └── gap_report.md
└── data/               # Research output storage
    └── .gitkeep
```
