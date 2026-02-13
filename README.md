# Health Tracker

A personal health tracking PWA for monitoring food, exercise, energy levels, and weight trends.

## Features

- **Food Diary**: Log meals with timestamps to track eating patterns and fasting windows
- **Exercise Tracking**: Record workouts with categories (weights, cardio, walking, stretching)
- **Weight Tracking**: Monitor body weight in kg with trend visualization
- **Energy Levels**: Daily energy tracking on a 1-5 scale
- **Trends & Charts**: Visualize your progress over 7 days to 1 year
- **PWA Support**: Install as an app on your device
- **Self-Hosted**: Run locally with Docker - your data stays with you

## Quick Start

### Using Docker (Recommended)

```bash
# Pull and run
docker run -d -p 8080:80 -v health-data:/data dpooper79/health-tracker:latest

# Or use docker-compose
docker-compose up -d
```

Access the app at `http://localhost:8080`

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite
- **Deployment**: Docker, Nginx

## Data Storage

SQLite database is stored at `/data/health_tracker.db` inside the container. Mount a volume to persist data:

```bash
docker run -v /path/to/your/data:/data ...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/entries | List daily entries |
| POST | /api/entries | Create daily entry |
| PUT | /api/entries/{date} | Update daily entry |
| GET | /api/meals | List meals |
| POST | /api/meals | Add meal |
| DELETE | /api/meals/{id} | Remove meal |
| GET | /api/exercises | List exercises |
| POST | /api/exercises | Add exercise |
| DELETE | /api/exercises/{id} | Remove exercise |
| GET | /api/daily/{date} | Get full daily overview |
| GET | /api/trends/weight | Weight trends |
| GET | /api/trends/energy | Energy trends |
| GET | /api/trends/exercise | Exercise summary |

## License

MIT
