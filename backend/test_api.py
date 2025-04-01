import requests
import json
import time

BASE_URL = 'http://127.0.0.1:5000'

def test_health_check():
    response = requests.get(f'{BASE_URL}/api/health')
    print(f'Health Check: {response.status_code}')
    print(response.json())
    print('-' * 50)

def test_root():
    response = requests.get(BASE_URL)
    print(f'Root Endpoint: {response.status_code}')
    print(json.dumps(response.json(), indent=2))
    print('-' * 50)

def test_create_task():
    task_data = {
        'name': 'Test Task',
        'filter_params': {
            'year_from': '2022',
            'year_to': '2023',
            'companies': ['Toyota', 'Honda']
        }
    }
    
    response = requests.post(f'{BASE_URL}/api/tasks', json=task_data)
    print(f'Create Task: {response.status_code}')
    task = response.json()
    print(json.dumps(task, indent=2))
    print('-' * 50)
    
    return task.get('id')

def test_get_tasks():
    response = requests.get(f'{BASE_URL}/api/tasks')
    print(f'Get Tasks: {response.status_code}')
    tasks = response.json()
    print(f'Total tasks: {len(tasks)}')
    print('-' * 50)

def test_get_task(task_id):
    response = requests.get(f'{BASE_URL}/api/tasks/{task_id}')
    print(f'Get Task {task_id}: {response.status_code}')
    task = response.json()
    print(json.dumps(task, indent=2))
    print('-' * 50)
    
    return task

def wait_for_task_completion(task_id, max_wait=30):
    print(f'Waiting for task {task_id} to complete...')
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        task = test_get_task(task_id)
        if task['status'] in ['completed', 'failed']:
            print(f'Task completed with status: {task["status"]}')
            return task
        
        print(f'Task status: {task["status"]}. Waiting...')
        time.sleep(3)
    
    print('Timeout waiting for task completion')
    return None

def test_get_task_data(task_id):
    response = requests.get(f'{BASE_URL}/api/tasks/{task_id}/data')
    print(f'Get Task Data {task_id}: {response.status_code}')
    data = response.json()
    print(f'Task: {data["task"]["name"]}')
    print(f'Total records: {len(data["data"])}')
    
    if data['data']:
        print('Sample records:')
        for record in data['data'][:3]:
            print(json.dumps(record, indent=2))
    
    print('-' * 50)

if __name__ == '__main__':
    try:
        # Test basic endpoints
        test_health_check()
        test_root()
        
        # Test task management
        test_get_tasks()
        task_id = test_create_task()
        
        # Wait for task to complete
        completed_task = wait_for_task_completion(task_id)
        
        if completed_task and completed_task['status'] == 'completed':
            # Test data retrieval
            test_get_task_data(task_id)
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the Flask server is running.")
    except Exception as e:
        print(f"Error during testing: {e}") 