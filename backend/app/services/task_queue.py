import queue
import threading
import time
import json
from datetime import datetime
import random
from app import db
from app.models.task import Task
from app.models.data_record import DataRecord
from app.services.data_source import fetch_data_from_source_a, fetch_data_from_source_b

# In-memory queue for tasks
task_queue = queue.Queue()
is_worker_running = False

def queue_task(task_id):
    """Add a task to the queue for processing"""
    task_queue.put(task_id)
    
    # Start the worker if it's not already running
    global is_worker_running
    if not is_worker_running:
        is_worker_running = True
        thread = threading.Thread(target=process_tasks)
        thread.daemon = True
        thread.start()

def process_tasks():
    """Process tasks from the queue"""
    global is_worker_running
    
    while True:
        try:
            # Get the next task from the queue (with timeout to check if we should stop)
            try:
                task_id = task_queue.get(timeout=1)
            except queue.Empty:
                # If the queue is empty for more than 1 second, break the loop
                if task_queue.empty():
                    is_worker_running = False
                    break
                continue
                
            # Process the task
            process_task(task_id)
            
            # Mark the task as done
            task_queue.task_done()
            
        except Exception as e:
            print(f"Error processing task: {e}")
            # Sleep a bit to avoid high CPU usage in case of repeated errors
            time.sleep(1)

def process_task(task_id):
    """Process a single task"""
    try:
        # Get the task from the database
        task = Task.query.get(task_id)
        if not task:
            print(f"Task {task_id} not found")
            return
            
        # Task is already in "pending" state from creation
        # The 'pending' state should stay for 3-4 seconds
        print(f"Task {task_id} is pending")
        time.sleep(random.uniform(3, 4))
        
        # Update task status to "in_progress"
        task.status = "in_progress"
        db.session.commit()
        print(f"Task {task_id} is now in progress")
        
        # The 'in_progress' state should stay for 4-6 seconds
        time.sleep(random.uniform(4, 6))
        
        # Parse filter parameters
        filter_params = json.loads(task.filter_params)
        
        # Get selected data sources
        data_sources = filter_params.get('data_sources', ['source_a', 'source_b'])
        
        source_a_data = []
        source_b_data = []
        
        # Only fetch data from the selected sources
        if 'source_a' in data_sources:
            source_a_data = fetch_data_from_source_a(filter_params)
            
        if 'source_b' in data_sources:
            source_b_data = fetch_data_from_source_b(filter_params)
        
        # Save data to database
        for record in source_a_data:
            db_record = DataRecord(
                task_id=task.id,
                source="source_a",
                category=record.get("category"),
                brand=record.get("brand"),
                price=record.get("price"),
                purchase_date=datetime.fromisoformat(record.get("purchase_date")) if record.get("purchase_date") else None,
                quantity=record.get("quantity", 1),
                rating=record.get("rating"),
                platform=record.get("platform"),
                payment_method=record.get("payment_method"),
                product_id=record.get("product_id")
            )
            db.session.add(db_record)
            
        for record in source_b_data:
            db_record = DataRecord(
                task_id=task.id,
                source="source_b",
                category=record.get("category"),
                brand=record.get("brand"),
                price=record.get("price"),
                purchase_date=datetime.fromisoformat(record.get("purchase_date")) if record.get("purchase_date") else None,
                quantity=record.get("quantity", 1),
                platform=record.get("platform"),
                location=record.get("location"),
                payment_method=record.get("payment_method"),
                product_id=record.get("product_id")
            )
            db.session.add(db_record)
            
        # Update task status to "completed"
        task.status = "completed"
        db.session.commit()
        print(f"Task {task_id} is now completed")
        
    except Exception as e:
        # Update task status to "failed" in case of error
        if task:
            task.status = "failed"
            db.session.commit()
        print(f"Error processing task {task_id}: {e}")
        # Raise the exception to be caught by the higher-level handler
        raise 