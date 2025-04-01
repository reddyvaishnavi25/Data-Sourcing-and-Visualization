# Data Sourcing and Visualization Backend

This is the backend for the Data Sourcing and Visualization application. It provides API endpoints for creating data sourcing tasks and retrieving the fetched data.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
```
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Run the application:
```
python app.py
```

## API Endpoints

- `GET /api/tasks` - List all tasks
- `GET /api/tasks/<task_id>` - Get details of a specific task
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/<task_id>/data` - Get data for a specific task

## Database

The application uses SQLite for simplicity. The database file will be created automatically when you run the application. 