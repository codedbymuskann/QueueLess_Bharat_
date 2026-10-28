# QueueLess Bharat

**AI Hospital Availability & Waiting-Time Predictor**

During medical emergencies, patients and relatives often spend critical minutes calling multiple hospitals to find ICU beds, ventilators, emergency services, or blood. Even after arriving, they face unpredictable queues with no visibility into current load. QueueLess Bharat brings hospital resource availability, emergency hospital discovery, and waiting-time estimates into one emergency-first dashboard.

**Live demo:** https://queue-less-bharat.vercel.app/

---

## The problem

- **Critical time loss:** Families call several hospitals one by one to locate ICU beds, ventilators, emergency care, and blood.
- **Static directories:** Existing listings do not provide real-time updates or crowd forecasting.
- **Uncertain queues:** Patients have no way to estimate waiting times or see current queue load.

## The solution

- **Live hospital updates:** Hospitals publish real-time metrics for ICU and general beds, ventilators, emergency departments, blood availability, and medical specialties.
- **Emergency hospital finder:** Search by live location, radius, and required resources (for example, *ICU + ventilator + emergency* within 10 km), with distance, resources, and ratings shown together.
- **AI waiting-time prediction (planned):** Time-series and regression models that use day, time, queue size, active doctors, and arrival rates to estimate waiting times (for example, 18–25 minutes).
- **Crowd-level forecasting (planned):** Predicts expected crowd levels so people can plan non-emergency visits.
- **Verified-availability filtering:** Results are ranked by verified resource data. The system does not make automated medical decisions.

## Feature status

Update this list to match what is working in the current build.

- [ ] Hospital search by location and radius
- [ ] Filter by required resources (ICU, ventilator, emergency, blood)
- [ ] Hospital results with distance and ratings
- [ ] Hospital dashboard for updating live resource counts
- [ ] Waiting-time prediction model
- [ ] Crowd-level forecast
- [ ] Direct call integration for hospitals and ambulances

## Tech stack

**Current**
- TypeScript
- Vite

**Planned architecture**
- Frontend: React / Next.js with Tailwind CSS, responsive layout, and map integration
- Backend: Node.js or Python (Flask / FastAPI) with RESTful APIs
- Database: PostgreSQL or MongoDB
- Real-time updates: WebSockets for live bed and queue data
- AI / ML: Python, scikit-learn, and TensorFlow for time-series forecasting, regression-based waiting-time prediction, and geo-filtering

## Getting started

```bash
git clone https://github.com/codedbymuskann/QueueLess_Bharat_.git
cd QueueLess_Bharat_
bun install
bun run dev
```

Open the local URL that Vite prints (usually `http://localhost:5173`).

> Check the `scripts` section of `package.json` if a command differs.

## Project structure

```
QueueLess_Bharat_/
├── src/              # Application source code
├── index.html        # Entry page
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite configuration
└── metadata.json     # Project metadata
```

## Data and references

- Open Government Data (OGD) Platform India
- Emergency healthcare response frameworks
- Standard time-series regression research

## Design principles

- **Predictable, not promised:** The goal is to make waiting easier to plan. It does not claim to remove queues.
- **Privacy first:** The platform stores hospital resource data. It does not store patient clinical diagnostics.
- **Verified availability over automation:** Recommendations are based on verified availability, not automated medical decisions.

## Roadmap

- Connect hospital data through a secure update dashboard
- Add a backend with a real-time data pipeline
- Train and evaluate the waiting-time model on historical arrival data
- Add map-based hospital search
- Add emergency-mode quick search

## Team

Built at **Build with Bharat 4.0 – National Level Hackathon**, KCC Institute of Technology and Management, Greater Noida (team *The Malwares*).

- Muskan Gupta
- Arshpreet Singh
- Manish Chandra Maity
- Irshad Saifi
- Saurav Singh Pal
