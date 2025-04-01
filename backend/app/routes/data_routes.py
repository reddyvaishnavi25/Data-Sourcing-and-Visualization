from flask import request, jsonify
from app import app, db
from app.models.task import Task
from app.models.data_record import DataRecord
from sqlalchemy import and_, or_

@app.route('/api/tasks/<int:task_id>/data', methods=['GET'])
def get_task_data(task_id):
    # Ensure task exists
    task = Task.query.get_or_404(task_id)
    
    # Get filter parameters from request
    company = request.args.get('company')
    car_model = request.args.get('car_model')
    year_from = request.args.get('year_from')
    year_to = request.args.get('year_to')
    
    # Build query
    query = DataRecord.query.filter_by(task_id=task_id)
    
    # Apply additional filters if provided
    if company:
        query = query.filter(DataRecord.company == company)
    if car_model:
        query = query.filter(DataRecord.car_model == car_model)
    if year_from:
        query = query.filter(DataRecord.sale_date >= f"{year_from}-01-01")
    if year_to:
        query = query.filter(DataRecord.sale_date <= f"{year_to}-12-31")
    
    # Get data
    data_records = query.all()
    
    return jsonify({
        'task': task.to_dict(),
        'data': [record.to_dict() for record in data_records]
    }) 