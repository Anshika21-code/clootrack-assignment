# Ticket Classification System

## Tech Stack
- Django + DRF
- React (Vite)
- PostgreSQL
- Docker & Docker Compose

## Setup Instructions

1. Clone repo
2. Add .env file
3. Run:
   docker compose up --build

4. Backend:
   http://localhost:8000

5. Frontend:
   http://localhost:5173

## LLM Used

## 🤖 LLM Choice

Initially, I started integrating OpenAI for ticket classification. However, I quickly ran into API usage limits during testing, which made it difficult to properly validate the classification flow end-to-end.

Because of that, I switched to Google Gemini (google.generativeai). I had previously used Google's Generative AI API during my learning phase, so I was already familiar with its setup and API key configuration process. This made the transition smooth and allowed me to continue development without delays.

While testing the classification endpoint, I also added a short cooldown (around 2 seconds) between requests to avoid hitting rate limits during rapid testing.

The LLM is used to automatically classify support tickets into categories like:
- Technical
- Billing
- General
- Other

The API key is managed using environment variables to ensure it is not hardcoded in the project.

## 🏗 Design Decisions

### 1. Clear Separation Between Frontend and Backend

I decided to keep the frontend (React) and backend (Django REST Framework) completely separate. The backend handles business logic, database operations, and LLM integration, while the frontend focuses only on UI and user interaction.

---

### 2. Database-Level Aggregation for Stats

For the `/api/tickets/stats/` endpoint, I used Django ORM aggregation instead of calculating statistics in Python loops.

This ensures:
- Better performance
- Cleaner code
- Proper use of database capabilities


---

### 3. Docker-First Development

Instead of setting up PostgreSQL manually on my local machine, I chose to containerize the entire application using Docker.

This ensures:
- Anyone can run the project with one command
- No environment mismatch issues
- No manual dependency setup

The full app (frontend, backend, database) runs using:

docker compose up --build

This was important because the assignment specifically required the project to work end-to-end using Docker.

---

### 4. Environment Variables for Secrets

All sensitive values, especially the LLM API key, are handled through environment variables.

This avoids hardcoding secrets in the source code and follows basic security best practices.