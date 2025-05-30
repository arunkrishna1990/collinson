# 🌤️ Weather Activity Ranking App

This project is designed to evaluate and rank locations based on how suitable they are for specific outdoor activities—such as **Outdoor Sightseeing**—using real-time weather data from Open-Meteo. It aims to showcase design patterns, extensibility, and thoughtful design decisions that allow easy scaling for future enhancements like additional activity types, analytics, and partner integrations.

---

## 🚀 How to Start

Follow these steps to get the project running locally:

1. **Install dependencies**

```bash

npm install

```

2. **Start the backend GraphQL API**

```bash

npx nx run activity-forecast-api:serve

```

This command runs the weather-ranking API server on the configured port 3001.

3. **Start the React web client**

```bash

npx nx run web:serve

```

This command launches the React frontend app, typically accessible at `http://localhost:4200`.

---

### Notes

- Make sure you have Node.js (version 16+) and npm installed.

- You can run these commands in separate terminal windows to have backend and frontend running simultaneously.

- To run tests or build projects, use Nx commands like:

```bash

npx nx test <project-name>

npx nx run-many --target=test --passWithNoTests //To run all the tests

npx nx build <project-name>

```

Replace `<project-name>` with the actual package/app name, e.g., `activity-forecast-api` or `web`.

## 🛠️ Current Design Decisions

### 📦 Monorepo with Nx.js

* I chose **Nx.js** for its excellent support for managing monorepos, especially for full-stack projects.
* It helps avoid boilerplate by scaffolding libs, apps, services, and test setups quickly.
* **VSCode** has a great Nx extension that visually shows dependencies, simplifies running targets, and helps save time.
* For **Sprint 0**, this was ideal because setting up build, lint, and test targets manually would have been time-consuming.
* In the long run, it helps structure microservices cleanly with shared libraries.

### 🎯 Modular Package Structure

* I structured the app into clear domains: `weather-provider`, `weather-ranking`, `web-app`, `graphql-server`, etc.
* This makes responsibilities explicit and improves long-term maintainability.
* Shared types like `Result`, `DailyForecast`, etc., are moved into a core types package to avoid circular dependencies or leaks.

### ⚙️ Config-Driven Scoring

* Instead of hardcoding logic for scoring each activity, I used a **config structure** which looks like this:

```ts
const config: ActivityForecastConfig = {
  activity: ActivityType.OUTDOOR_SIGHTSEEING,
  conditions: [
    {
      field: 'sunshine',
      operator: Operator.GREATER_THAN,
      value: 36000,
      weight: 1,
      reason: 'High sunshine hours are ideal for outdoor sightseeing'
    }
  ]
}
```

* This lets us scale easily by adding more activities, tuning thresholds, or adjusting weights without changing the code.
* I considered the **Strategy Pattern** but rejected it for now since it would push more logic into the code layer and reduce flexibility.
* Currently, the Outdoor Sightseeing ranking is based solely on sunshine duration, as it is the most influential and intuitive weather factor affecting outdoor enjoyment.
* Other weather factors such as precipitation, temperature, and wind are not yet incorporated but can be easily added by extending the config structure in the future.
* This design keeps the scoring flexible and extensible without changing core code, allowing rapid iteration on activity criteria.
* The weight property in each condition allows fine-tuning the influence of specific weather factors on the overall score, enabling a nuanced and flexible ranking system.

### ✅ Custom Result Type

* I introduced a `Result<T, U>` type:

```ts
export type Result<T, U> = Failure<T> | Success<U>;
export type Success<T> = { success: true; result: T };
export type Failure<T> = { success: false; error: T };
```

* This helps in explicitly handling errors across services, instead of relying on try-catch with unpredictable exceptions.
* A major benefit is that **when you read a function signature, you know exactly what error types it might throw**.
* From a readability standpoint, it’s far better than implicit `throw`, especially in larger teams or multi-service systems.

### ⚛️ React + Apollo Client

* Used Apollo Client to easily fetch GraphQL data.
* Types are auto-generated using codegen, which improves type safety and helps maintain a clean UI-to-schema contract.
* Components like `ForecastViewer` are simple but allow expansion for richer UI later (e.g., weather breakdown, charts, etc).

## 🔍 Tradeoffs Made

### ⏳ 1. Rate Limiting Skipped for Simplicity
**Why:** Open-Meteo enforces strict rate limits on its free API tier (e.g., 10,000 calls per day, 5,000 per hour, 600 per minute) to prevent misuse and ensure fair access. Implementing IP-based or API Key-based rate limiting (for example, via Kong Gateway or Redis token bucket) on my API is essential to avoid surpassing these limits, which could lead to service blocking or degraded performance. For the MVP, I intentionally skipped this to focus on core features.

**Tradeoff:** The current implementation does not limit incoming requests, meaning excessive or malicious use could exhaust the Open-Meteo quota, potentially causing failed forecasts or API blocks.

**Better Approach:** In a mature production system, rate limiting should be combined with:

-   Retry logic with backoff to handle temporary throttling gracefully.

-   Job queues to smooth out bursts of requests.

-   Caching layers (e.g., Redis) to reduce redundant calls and conserve quota.

-   Monitoring and alerting to track usage and preemptively act before limits are hit.

This multi-layered strategy improves reliability, protects the external API, and enhances overall user experience beyond simple gateway-level rate limiting.

### 🧠 2. Redis-Based Caching Deferred
**Why:** Caching weather forecasts in Redis --- for example, keyed by latitude/longitude and date --- can dramatically reduce the number of calls to the external Open-Meteo API, lowering latency and cost. Cached data would serve repeated requests quickly without hitting API rate limits. However, setting up Redis infrastructure, designing appropriate cache keys, and managing cache invalidation and expiration introduces additional complexity. For the MVP, I decided to skip this to keep the implementation lean and focused on core functionality.

**Tradeoff:** Every forecast request currently hits the external API directly, which can increase latency and usage costs under load. While this is acceptable for development and testing, it's not sustainable for production or high-traffic scenarios.

**Next Iteration:** Adding Redis caching is a natural next step. It would involve:

-   Implementing cache reads/writes keyed on location and forecast date range.

-   Setting TTLs and cache invalidation policies to keep data fresh without excessive API calls.

-   Potentially integrating a background job or Kafka consumer to pre-fetch and update cached forecasts regularly.

This enhancement will improve performance, reduce external API dependency, and safeguard against rate limiting in production.

### ⚙️ 3. Strategy Pattern vs Config-Driven Design
**Why:** Initially, I considered using a full-fledged Strategy Pattern to encapsulate the evaluation logic separately for each activity type. While the Strategy Pattern is powerful for managing multiple distinct behaviors and complex functionalities, in this case, it would have introduced scattered logic across many classes and tighter coupling, making the system harder to maintain and extend.

**Decision:** Instead, I opted for a config-driven approach. This design centralizes all scoring rules in easily editable configuration objects, which makes it straightforward to add or adjust activity scoring criteria without touching the codebase. This is especially useful for non-developer stakeholders or dynamic updates via a database in future iterations. The system relies on a single, shared scoring engine that interprets these configs and computes scores accordingly.

**Tradeoff:** The config-driven design is less strictly object-oriented compared to Strategy Pattern, but this tradeoff results in a simpler, more readable, and highly customizable system. It also reduces duplication and makes testing more focused on data-driven outcomes rather than multiple class behaviors. Should future requirements demand more complex and distinct scoring logic per activity, transitioning to a Strategy Pattern or hybrid approach would be a natural evolution.

### 🧱 4. In-Memory Config Instead of Database
**Why:** For simplicity, the activity scoring configuration is hardcoded in memory.

**Tradeoff:** This limits flexibility and requires code changes for config updates. In production, this will be moved to a database for dynamic updates.

### 🔍 5. Only One Activity Implemented
**Why:** The app currently supports only `Outdoor Sightseeing`. This was intentional to showcase the system without inflating scope.

**Tradeoff:** Other activities like Skiing or Surfing are not configured yet, but the system is fully extensible and supports them by design. The config file structure allows this switch instantly.Not applied currently to avoid scope creep

### ⚡ 6. No Persistent Storage for Forecast Data
**Why:** Data is fetched live per request to keep the MVP simple and focus on delivering core functionality quickly.

**Tradeoff:** This limits the ability to build historical trends or perform analytics on forecast data. Implementing persistent storage and a scheduled job infrastructure would have significantly increased development time and complexity, which was not aligned with the MVP scope and tight timeline. For future iterations, I am considering a Kafka-driven cron job system that persists forecasts daily to enable long-term insights and richer features.

---

## ⚠️ Known Limitations

* **Single Activity Supported:** Only *Outdoor Sightseeing* is currently implemented. Other activities like Skiing or Surfing are not yet configured but can be added easily through the config.

* **No Persistent Data Storage:** The app fetches live data on every request, which means no historical data or analytics capabilities are available.

* **No Rate Limiting:** The API currently does not enforce rate limiting, which could risk hitting Open-Meteo's free tier quotas.

* **No Caching Layer:** Absence of caching means repeated requests to the same location trigger external API calls, increasing latency and costs.

* **Simplified Scoring Logic:** The scoring engine uses config-based conditions and weights but does not support complex behavior or machine learning predictions yet.

---

# ⏱️ Project Timeline & User Stories

This section outlines the work completed across two sprint phases, all within a total development time of **under 3 hours**.

---

## 🧱 Sprint 0: Developer Setup (Time: \~10 minutes)

> **Role:** Developer

* ✅ Initialized a new monorepo using **Nx.js** for efficient modularity.
* ✅ Set up `weather-provider`, `weather-ranking`, `api-server`, and `client` apps as separate packages.
* ✅ Installed Apollo Server & Client, React, GraphQL, and supporting libraries.
* ✅ Verified project builds, test runners, and development server launch through `nx` commands.
* ✅ Used **Copilot-assisted coding** for boilerplate generation.

---

## 🚀 Sprint 1: MVP Use Case Delivery (Time: \~2 hours 30 minutes)

> **Role:** User

### 🧭 As a user, I want to search for a location

* Implemented a **GraphQL query** to search by location name.
* Integrated with Open-Meteo Geocoding API.
* Converted responses into a clean `Location` model.

### 🌤 As a user, I want to view daily outdoor sightseeing desirability for a location

* Integrated with Open-Meteo **7-day weather forecast API**.
* Designed a configuration-driven **scoring engine** to evaluate desirability.
* Each day is scored using domain-specific rules (e.g., `sunshine > 36000`).
* Scores include **human-readable reasons** for transparency.

### 🧱 As a user, I want the GraphQL schema to return weather and scores clearly

* Designed modular `ActivityForecastResult`, `DailyForecast`, and `ActivityDesirability` types.
* Added raw weather data (sunshine & precipitation) per day for UI display.

### 🖥 As a user, I want a web UI that shows forecast in a friendly format

* Used React + Apollo Client for the **Forecast Viewer**.
* Location shown as heading with dates and ranked activity scores.
* Sorted by score and grouped by day.
* Shown only if score is > 0 for clean UX.

### Note : (Time: \~10 minutes)
As part of this was setting up docker-compose.yml file for Redis work. But took a call that this will be a scope creep and not to squeeze that in. But I left the docker-compose.yml file in for future consideration.

🔮 Future Enhancements
----------------------

### ⏱️ Forecast Caching & Scheduled Fetching

-   Collect forecasts every few hours using a **Kafka-based cron job**

-   Store latest forecast data to avoid real-time API dependency

### 🔧 Store Configs in DB

-   Currently loaded statically --- should move to DB for:

    -   Partner-specific config

    -   A/B tests

    -   Admin editing

### 📊 Analytics

-   Track which cities are frequently queried

-   Use query heatmap to suggest popular locations

-   Store result scores for historical analysis

### 🧠 ML-Driven Forecast Scoring

-   Future: Replace config weights with ML model predictions for better accuracy

-   Train model using user feedback and real activity suitability

## 🧠 AI & Copilot Assistance

* ChatGPT helped brainstorm and create types from the JSON structure quickly.
* GitHub Copilot was useful to scaffold boilerplate quickly
* Github Copilot suggestions most of them were what I was thinking so it was saving time
