from flask import request, jsonify
from app import app, db
from app.models.task import Task
from app.services.task_queue import queue_task
import json

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    
    # Create new task
    task = Task(
        name=data.get('name', 'New Task'),
        filter_params=data.get('filter_params', {})
    )
    
    db.session.add(task)
    db.session.commit()
    
    # Start processing task in background
    queue_task(task.id)
    
    return jsonify(task.to_dict()), 201 