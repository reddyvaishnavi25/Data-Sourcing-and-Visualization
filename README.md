# Data Sourcing and Visualization

A full-stack web application for sourcing data from multiple external sources and visualizing the results with interactive charts.

## Features

- Create data sourcing tasks with customizable filters
- Pull data from multiple external sources (JSON and CSV)
- In-memory job queue for processing tasks
- SQLite database for storing fetched data
- Interactive visualizations using D3.js
- Filter and analyze the aggregated data

## Architecture

The application is built with:

- **Backend**: Python Flask with SQLAlchemy ORM
- **Frontend**: React with D3.js for visualizations
- **Database**: SQLite (lightweight relational database)
- **Data Sources**: Sample JSON and CSV files

## Project Structure

```
data-sourcing-visualization/
├── backend/                 # Flask backend
│   ├── app/                 # Application code
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   ├── app.py               # Flask app entry point
│   └── requirements.txt     # Python dependencies
├── frontend/                # React frontend
│   ├── public/              # Static files
│   └── src/                 # React components and logic
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       └── services/        # API services
└── data/                    # Sample data files
    ├── source_a.json        # JSON data source
    └── source_b.csv         # CSV data source
```

## Setup

### Backend

1. Navigate to the backend directory:
```
cd backend
```

2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
```
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Run the Flask app:
```
python app.py
```

### Frontend

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

The task processing workflow operates as follows:
User creates a task with filtering parameters
System queues the task for processing
Backend processes data sources asynchronously
Results are stored in the database and made available via API

API Endpoints Design
The API follows RESTful principles with these key endpoints:
1. GET /api/tasks: List all tasks with status information
2. POST /api/tasks: Create new data processing tasks
3. GET /api/tasks/{id}: Retrieve specific task details
4. GET /api/tasks/{id}/data: Retrieve processed data for visualization

Data Visualization
The application provides three main visualization types:
1. Monthly Sales Trend
Line chart showing total sales over time
Interactive tooltips with exact values
Time-based filtering capabilities

2. Product Category Analysis
Bar chart displaying sales by product category
Color-coded category representation
Sortable by total sales value

3. Platform Comparison
Multi-metric comparison between online and physical store sales
Normalized percentage view for fair comparison
Key metrics: Total Sales, Average Order Value, Items Sold, and Order Count


The application includes several performance optimizations:
Task data polling with proper cleanup
React component memoization
D3 chart rendering with element cleanup
Conditional state updates to prevent rendering loops

Overall The application is designed to be reliable, scalable, modular, and easy to understand.
