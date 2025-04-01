from flask import jsonify
from app import app

@app.route('/', methods=['GET'])
def index():
    """Root endpoint that provides information about available API endpoints"""
    return jsonify({
        'status': 'success',
        'message': 'Data Sourcing and Visualization API',
        'api_endpoints': {
            'GET /api/tasks': 'Get all tasks',
            'GET /api/tasks/<task_id>': 'Get a specific task by ID',
            'POST /api/tasks': 'Create a new task',
            'GET /api/tasks/<task_id>/data': 'Get data for a specific task'
        },
        'version': '1.0.0'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is working"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running'
    }) 