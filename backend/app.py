from app import app, db
import os

# Create database tables before running the app
with app.app_context():
    db.create_all()
    print("Database tables created successfully")

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found', 'message': 'The requested resource was not found'}, 404

@app.errorhandler(500)
def server_error(error):
    return {'error': 'Server error', 'message': 'An internal server error occurred'}, 500

if __name__ == '__main__':
    app.run(debug=True) 