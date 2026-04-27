# 🌌 NOVA OPS: The Sentient Interface

![Status](https://img.shields.io/badge/System-ONLINE-success?style=for-the-badge)
![AI](https://img.shields.io/badge/Intelligence-TAMBO_AI-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Powered_By-Next.js_14-black?style=for-the-badge)

> **"Interfaces shouldn't just exist; they should react."**

NOVA OPS is a **Generative UI Dashboard** designed for next-gen cyber-defense. Unlike traditional dashboards with static pages, NOVA uses **Tambo AI** to understand user intent (via voice or clicks) and *dynamically renders* the most appropriate interface component in real-time.

--



### 🧠 1. True Generative UI (Powered by Tambo)
The application doesn't have hardcoded pages. It has "Capabilities."
- **Scenario:** User reports a hack.
- **AI Action:** Tambo analyzes the severity and instructs the frontend to render the **Critical Grid Matrix** (Red).
- **Scenario:** User asks to analyze code.
- **AI Action:** Tambo swaps the view to a **Live Code Terminal** (Green).

### ⚡ 2. Hybrid "Neural Core" Architecture
Reliability is key in defense. NOVA OPS implements a **Fail-Safe Logic Layer**:
1.  **Primary Cortex:** Calls **Tambo AI Cloud** for complex reasoning and tool calling.
2.  **Backup Cortex:** If the internet fails or latency spikes, a local logic core instantly takes over, ensuring the dashboard **NEVER crashes**.

### 🔊 3. Immersive "Movie-Grade" UX
- **Web Audio API Integration:** Real-time sound synthesis for alerts and interactions.
- **Holographic Visuals:** Built with `Framer Motion` and `Tailwind CSS`.
- **Live Ticker:** Real-time cyber-log stream.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **AI Engine:** [Tambo AI](https://tambo.ai/) (The Brain) 🧠
- **Styling:** Tailwind CSS + Framer Motion
- **Voice:** Native Web Speech API
- **Deployment:** Vercel

---

## 🤖 The Tambo AI Advantage

We chose **Tambo AI** because of its superior handling of **Function Calling (Tools)**.
In NOVA OPS, Tambo isn't just generating text; it is:
1.  **Deciding Component State:** Safe vs. Critical.
2.  **Generating Next Actions:** Suggesting buttons like `[ TRACE IP ]` or `[ ISOLATE SERVER ]`.
3.  **Structuring Data:** Passing JSON props to React components seamlessly.

*Tambo makes the UI "Context-Aware" rather than just responsive.*

---

## 📸 Snapshots

### 1. The Hero Interface
<img width="1916" height="901" alt="Image" src="https://github.com/user-attachments/assets/6ec81008-c01d-4ab9-bf0c-ef88ed147824" />

### 2. Critical Alert Mode (Generative Red Grid)
<img width="1862" height="862" alt="Image" src="https://github.com/user-attachments/assets/9e3629a8-6a98-4b3b-92d5-041ee8f5515d" />


---

## 💿 Installation

```bash
# Clone the repo
git clone [https://github.com/your-username/nova-ops.git](https://github.com/your-username/nova-ops.git)

# Install dependencies
npm install

# Set up Environment Keys (.env.local)
TAMBO_API_KEY=your_key_here
TAMBO_PROJECT_ID=your_id_here

# Run the Neural Core
npm run dev
