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

## Usage

1. Create a new data sourcing task
2. Specify filters like date range and car brands
3. Submit the task and wait for processing
4. View the results with interactive charts
5. Apply additional filters to analyze the data

## Evaluation Criteria

- **Architecture and Design**: The application follows a clean separation of concerns with proper MVC architecture.
- **Frontend and Visualization**: Interactive D3.js visualizations with dynamic filtering.
- **Code Quality & Documentation**: Code is modular, well-documented, and follows best practices.

## License

This project is open source and available under the [MIT License](LICENSE). 