# 🌌 NOVA OPS // SENTIENT INTERFACE
> **The UI that feels. The Dashboard that lives.**

![Project Status](https://img.shields.io/badge/Status-Operational-cyan)
![Built With](https://img.shields.io/badge/Built%20With-Tambo%20AI-blueviolet)
![Hackathon](https://img.shields.io/badge/The%20UI-Strikes%20Back-yellow)

## 🚨 Overview
**NOVA OPS** is a next-generation **Generative UI System** built for the *The UI Strikes Back* Hackathon. Unlike static dashboards, NOVA uses **Tambo AI** to analyze user intent and emotional tone, dynamically rendering and modifying the interface in real-time.

If you say "System Status", it stays **Cool Blue**.
If you scream "WE ARE BEING HACKED!", it turns **Red, Glitches, and Shakes**.

## ✨ Key Features (The "Wow" Factor)

### 🧠 1. Sentient Generative UI
The interface doesn't just "show data"—it reacts to the context.
- **Safe Mode:** Cyan/Blue theme, calm animations.
- **Caution Mode:** Yellow theme, warning pulses.
- **Critical Mode:** Red theme, violent shaking, glitch effects, and "Access Denied" logs.

### 🛡️ 2. Hybrid Intelligence Architecture
To ensure **Enterprise-Grade Reliability** (and zero demo fails), NOVA uses a dual-core logic:
1.  **Cloud Core (Tambo API):** Uses the LLM to intelligently decide when to render the `AgentGrid` tool.
2.  **Local Core (Fallback Protocol):** If the API encounters latency or network errors, the local semantic analyzer takes over instantly, ensuring the UI **never crashes**.

### 🎬 3. Sci-Fi Visuals
Powered by **Framer Motion** and **Tailwind CSS**, the dashboard features:
- Live "Heartbeat" data simulation (CPU/RAM/NET).
- Scrolling Terminal Logs (Matrix style).
- CRT Scanning Line effects.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI Engine:** Tambo AI (Generative UI SDK / API)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Language:** TypeScript

---

## 📸 Screenshots
*(will add later)*

| Safe Mode (Blue) | Critical Mode (Red) |
| :---: | :---: |
| *System Normal* | *Hacking Detected* |

---

## 🚀 How It Works (Under the Hood)

1.  **User Input:** The user types a command (e.g., *"Unauthorized access detected!"*).
2.  **Intent Analysis:** Tambo AI analyzes the prompt for "Tools".
3.  **Generative Decision:** The AI decides to call the `AgentGrid` tool and sets parameters:
    ```json
    { "mode": "critical", "message": "SECURITY BREACH" }
    ```
4.  **Dynamic Rendering:** The frontend receives these props and hydrates the `AgentGrid` component with the specific "Critical" theme and animations.

---

## 💻 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/nova-ops.git](https://github.com/your-username/nova-ops.git)
    cd nova-ops
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a `.env.local` file:
    ```bash
    TAMBO_API_KEY=your_key_here
    TAMBO_PROJECT_ID=your_project_id
    ```

4.  **Run the System**
    ```bash
    npm run dev
    ```

---

## 🔮 Future Roadmap
- [ ] Voice Command Integration.
- [ ] Multi-Agent collaboration (Dev Droid vs Sec Droid).
- [ ] 3D Holographic Elements using Three.js.

---

Made with 💻 & ☕ by **ghost_hunter** for **WeMakeDevs Hackathon**.
