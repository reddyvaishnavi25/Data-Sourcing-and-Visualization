import json
import random
import os
from datetime import datetime, timedelta

# E-commerce product categories and brands
PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Books', 'Sports', 'Toys']
BRANDS = {
    'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', 'Bose'],
    'Clothing': ['Nike', 'Adidas', 'H&M', 'Zara', 'Levi\'s', 'Gap', 'Calvin Klein', 'Gucci', 'Puma', 'Under Armour'],
    'Home & Kitchen': ['Ikea', 'Bosch', 'Philips', 'KitchenAid', 'Dyson', 'Cuisinart', 'Crate & Barrel', 'OXO', 'Ninja', 'Hamilton Beach'],
    'Beauty': ['L\'Oreal', 'Maybelline', 'MAC', 'Estee Lauder', 'Clinique', 'Dove', 'Neutrogena', 'Nivea', 'Olay', 'Revlon'],
    'Books': ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Hachette', 'Macmillan', 'Scholastic', 'Wiley', 'Oxford', 'Pearson', 'McGraw-Hill'],
    'Sports': ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Wilson', 'Spalding', 'Reebok', 'New Balance', 'Columbia', 'The North Face'],
    'Toys': ['Lego', 'Hasbro', 'Mattel', 'Fisher-Price', 'Disney', 'Nerf', 'Barbie', 'Hot Wheels', 'Play-Doh', 'Nintendo']
}

# Location data
LOCATIONS = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Seattle', 'Boston', 'Denver', 'Atlanta']

# Generate a random date within a range
def random_date(start_year, end_year):
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + timedelta(days=random_number_of_days)

# Filter function based on parameters
def filter_record(record, filter_params):
    # Year range filter
    if 'year_from' in filter_params and 'year_to' in filter_params:
        purchase_date = datetime.fromisoformat(record['purchase_date'])
        if purchase_date.year < int(filter_params['year_from']) or purchase_date.year > int(filter_params['year_to']):
            return False
            
    # Company/brand filter
    if 'companies' in filter_params and filter_params['companies']:
        if record['brand'] not in filter_params['companies']:
            return False
    
    # Category filter
    if 'categories' in filter_params and filter_params['categories']:
        if record['category'] not in filter_params['categories']:
            return False
            
    return True

def fetch_data_from_source_a(filter_params):
    """
    Simulate fetching data from Source A (JSON file) - Online store data
    """
    # Generate e-commerce data (750-800 records)
    num_records = random.randint(750, 800)
    records = []
    
    year_from = int(filter_params.get('year_from', 2020))
    year_to = int(filter_params.get('year_to', 2025))
    
    for _ in range(num_records):
        category = random.choice(PRODUCT_CATEGORIES)
        brand = random.choice(BRANDS[category])
        price = round(random.uniform(10, 1000), 2)
        purchase_date = random_date(year_from, year_to)
        rating = round(random.uniform(1, 5), 1)
        quantity = random.randint(1, 5)
        
        record = {
            'category': category,
            'brand': brand,
            'price': price,
            'purchase_date': purchase_date.isoformat(),
            'rating': rating,
            'quantity': quantity,
            'platform': 'Online',
            'payment_method': random.choice(['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay']),
            'product_id': f"P{random.randint(1000, 9999)}"
        }
        
        # Apply filters
        if filter_record(record, filter_params):
            records.append(record)
    
    return records

def fetch_data_from_source_b(filter_params):
    """
    Simulate fetching data from Source B (CSV file) - Physical store data
    """
    # Generate e-commerce data (350-400 records)
    num_records = random.randint(350, 400)
    records = []
    
    year_from = int(filter_params.get('year_from', 2020))
    year_to = int(filter_params.get('year_to', 2025))
    
    # For physical stores use all categories but limit to certain brands based on filters
    filtered_brands = []
    if 'companies' in filter_params and filter_params['companies']:
        for category in PRODUCT_CATEGORIES:
            filtered_brands.extend([b for b in BRANDS[category] if b in filter_params['companies']])
    
    for _ in range(num_records):
        category = random.choice(PRODUCT_CATEGORIES)
        
        # Use filtered brands if available, otherwise use all brands for the category
        if filtered_brands:
            brand = random.choice(filtered_brands)
        else:
            brand = random.choice(BRANDS[category])
            
        price = round(random.uniform(15, 1200), 2)  # Physical stores might have slightly higher prices
        purchase_date = random_date(year_from, year_to)
        quantity = random.randint(1, 3)
        location = random.choice(LOCATIONS)
        
        record = {
            'category': category,
            'brand': brand,
            'price': price,
            'purchase_date': purchase_date.isoformat(),
            'quantity': quantity,
            'platform': 'Store',
            'location': location,
            'payment_method': random.choice(['Cash', 'Credit Card', 'Debit Card', 'Gift Card']),
            'product_id': f"S{random.randint(1000, 9999)}"
        }
        
        # Apply filters
        if filter_record(record, filter_params):
            records.append(record)
    
    return records 