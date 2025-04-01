import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';

// Product categories and popular brands for filtering
const PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Books', 'Sports', 'Toys'];
const POPULAR_BRANDS = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Ikea', 'Sony', 'Lego', 'L\'Oreal', 'Amazon', 'Philips', 'HP', 'Dell', 'Microsoft', 'Zara', 'H&M'];

// Available data sources
const DATA_SOURCES = ['Source A (Online Store JSON)', 'Source B (Physical Store CSV)'];

function CreateTask() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    year_from: '2020',
    year_to: '2025',
    brands: [],
    categories: [],
    data_sources: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (brand) => {
    setFormData((prev) => {
      const updatedBrands = prev.brands.includes(brand)
        ? prev.brands.filter((c) => c !== brand)
        : [...prev.brands, brand];
        
      return { ...prev, brands: updatedBrands };
    });
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
        
      return { ...prev, categories: updatedCategories };
    });
  };

  // Handle data source selection
  const handleSourceChange = (source) => {
    setFormData((prev) => {
      const updatedSources = prev.data_sources.includes(source)
        ? prev.data_sources.filter((s) => s !== source)
        : [...prev.data_sources, source];
        
      return { ...prev, data_sources: updatedSources };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      setError('Please enter a task name');
      return;
    }

    // Validate data sources
    if (formData.data_sources.length === 0) {
      setError('Please select at least one data source');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API call
      const taskData = {
        name: formData.name,
        filter_params: {
          year_from: formData.year_from,
          year_to: formData.year_to,
          companies: formData.brands.length > 0 ? formData.brands : undefined,
          categories: formData.categories.length > 0 ? formData.categories : undefined,
          data_sources: formData.data_sources.map(source => 
            source === 'Source A (Online Store JSON)' ? 'source_a' : 'source_b'
          ),
        },
      };
      
      // Create task via API
      const createdTask = await createTask(taskData);
      
      // Redirect to task details page
      navigate(`/tasks/${createdTask.id}`);
      
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Create New Task</h1>
      </div>
      
      <div className="card">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Task Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter a name for this task"
              />
            </div>
            
            <div className="form-group">
              <label>Date Range</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label htmlFor="year_from">From Year</label>
                  <input
                    type="number"
                    id="year_from"
                    name="year_from"
                    value={formData.year_from}
                    onChange={handleChange}
                    min="2015"
                    max="2025"
                  />
                </div>
                <div>
                  <label htmlFor="year_to">To Year</label>
                  <input
                    type="number" 
                    id="year_to"
                    name="year_to"
                    value={formData.year_to}
                    onChange={handleChange}
                    min="2015"
                    max="2025"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Data Sources</label>
              <div className="checkbox-group">
                {DATA_SOURCES.map((source) => (
                  <div key={source} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`source-${source}`}
                      checked={formData.data_sources.includes(source)}
                      onChange={() => handleSourceChange(source)}
                    />
                    <label htmlFor={`source-${source}`}>{source}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Product Categories</label>
              <div className="checkbox-group">
                {PRODUCT_CATEGORIES.map((category) => (
                  <div key={category} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <label htmlFor={`category-${category}`}>{category}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Brands (Optional)</label>
              <div className="checkbox-group">
                {POPULAR_BRANDS.map((brand) => (
                  <div key={brand} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={formData.brands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <label htmlFor={`brand-${brand}`}>{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '24px' }}>
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateTask; 