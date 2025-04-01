import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTask, fetchTaskData } from '../services/api';
import * as d3 from 'd3';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

// Product categories for filtering
const PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Books', 'Sports', 'Toys'];

function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [taskData, setTaskData] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    year: '',
    platform: '',
  });

  // Refs for the chart containers
  const lineChartRef = useRef(null);
  const barChart1Ref = useRef(null);
  const barChart2Ref = useRef(null);

  // Fetch task details and data
  useEffect(() => {
    let intervalId;
    let isMounted = true; // Add flag to prevent state updates after unmount
    
    const loadTaskDetails = async () => {
      if (!isMounted) return;
      
      try {
        if (isMounted) setLoading(true);
        
        // Fetch the task details
        const taskDetails = await fetchTask(taskId);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Only update state if data actually changed to prevent re-renders
        if (!task || task.status !== taskDetails.status) {
          setTask(taskDetails);
        }
        
        // If task is completed, fetch the data (only once)
        if (taskDetails.status === 'completed' && (!taskData.data || taskData.data.length === 0)) {
          const data = await fetchTaskData(taskId);
          if (isMounted) setTaskData(data);
          
          // If task is completed, clear the interval
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
        
        if (isMounted) setError(null);
      } catch (err) {
        if (isMounted) {
          setError('Failed to load task details. Please try again later.');
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Initial data load
    loadTaskDetails();
    
    // Set up polling - will be cleared once task is completed
    intervalId = setInterval(() => {
      loadTaskDetails();
    }, 2000); // Poll every 2 seconds
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [taskId]); // Only depend on taskId which is stable

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    if (!taskData.data) return [];
    
    return taskData.data.filter((record) => {
      // Apply category filter
      if (filters.category && record.category !== filters.category) {
        return false;
      }
      
      // Apply brand filter
      if (filters.brand && record.brand !== filters.brand) {
        return false;
      }
      
      // Apply platform filter
      if (filters.platform && record.platform !== filters.platform) {
        return false;
      }
      
      // Apply year filter
      if (filters.year && new Date(record.purchase_date).getFullYear() !== parseInt(filters.year, 10)) {
        return false;
      }
      
      return true;
    });
  }, [taskData, filters]);

  // Get unique brands from data for filtering
  const uniqueBrands = React.useMemo(() => {
    if (!taskData.data) return [];
    return [...new Set(taskData.data.map(record => record.brand))].filter(Boolean).sort();
  }, [taskData]);

  // Add this line after the filteredData useMemo to memoize chart data
  const chartData = React.useMemo(() => {
    if (!filteredData.length) return { 
      timeSeriesData: [], 
      categorySalesData: [], 
      platformData: [] 
    };
    
    // For time series chart
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dateData = filteredData.map(d => ({
      ...d,
      date: parseDate(d.purchase_date.split('T')[0])
    }));
    
    // Time series data - sales by month
    const monthData = d3.rollup(
      dateData,
      v => d3.sum(v, d => d.price * d.quantity),
      d => d3.timeMonth(d.date)
    );
    
    const timeSeriesData = Array.from(monthData, ([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date - b.date);
      
    // Category data - sales by category
    const categoryData = d3.rollup(
      filteredData,
      v => d3.sum(v, d => d.price * d.quantity),
      d => d.category
    );
    
    const categorySalesData = Array.from(categoryData, ([category, totalSales]) => ({ category, totalSales }))
      .sort((a, b) => b.totalSales - a.totalSales);
      
    // Platform comparison data
    const platformData = Array.from(
      d3.rollup(
        filteredData,
        v => ({
          totalSales: d3.sum(v, d => d.price * d.quantity),
          avgOrderValue: d3.mean(v, d => d.price * d.quantity),
          totalItems: d3.sum(v, d => d.quantity),
          orderCount: v.length
        }),
        d => d.platform
      ),
      ([platform, metrics]) => ({
        platform,
        ...metrics
      })
    );
    
    return { timeSeriesData, categorySalesData, platformData };
  }, [filteredData]);

  // Update Time Series Chart (First Chart)
  useEffect(() => {
    if (!chartData.timeSeriesData.length || !lineChartRef.current) return;
    
    // Clean up previous chart first
    const chartContainer = d3.select(lineChartRef.current);
    chartContainer.selectAll('*').remove();
    
    const data = chartData.timeSeriesData;
    
    // Set up chart dimensions with better margins
    const margin = { top: 50, right: 50, bottom: 90, left: 80 };
    const width = lineChartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = chartContainer
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis - limit number of ticks based on width
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    
    // Calculate appropriate number of ticks - aim for one tick every ~100px
    const xTicks = Math.max(2, Math.min(data.length, Math.floor(width / 120)));
    
    // Add x-axis with better text positioning
    const xAxis = svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(xTicks));
    
    // Improved x-axis label styling
    xAxis.selectAll('text')
      .attr('transform', 'translate(-18,10)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');
    
    // Y axis with better formatting
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d3.format(",")(d)}`));
    
    // Add nice grid lines for y-axis
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2);
    
    // Add the line with smoother curve
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('class', 'chart-stroke-1')
      .attr('stroke-width', 3)
      .attr('d', d3.line()
        .x(d => x(d.date))
        .y(d => y(d.sales))
        .curve(d3.curveMonotoneX)
      );
    
    // Add points with hover effect
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.sales))
      .attr('r', 5)
      .attr('class', 'chart-color-1')
      .style('cursor', 'pointer')
      .style('transition', 'r 0.2s');
    
    // Add tooltip with improved styling
    const tooltip = d3.select(lineChartRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    svg.selectAll('circle')
      .on('mouseover', function(event, d) {
        // Grow the circle on hover
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 7);
          
        tooltip.transition()
          .duration(200)
          .style('opacity', .95);
        tooltip.html(`
          <strong>${d3.timeFormat('%B %Y')(d.date)}</strong><br/>
          Sales: <strong>$${d3.format(",")(d.sales.toFixed(2))}</strong>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        // Return to normal size
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 5);
          
        tooltip.transition()
          .duration(300)
          .style('opacity', 0);
      });
    
    // Title with more space
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Total Sales by Month');
      
  }, [chartData.timeSeriesData, lineChartRef]);

  // Update Category Sales Chart (Second Chart)
  useEffect(() => {
    if (!chartData.categorySalesData.length || !barChart1Ref.current) return;
    
    // Clean up previous chart first
    const chartContainer = d3.select(barChart1Ref.current);
    chartContainer.selectAll('*').remove();
    
    const data = chartData.categorySalesData;
    
    // Set up chart dimensions with better spacing for long category names
    const margin = { top: 40, right: 30, bottom: 140, left: 80 };
    const width = barChart1Ref.current.clientWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = chartContainer
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis with more space for text rotation
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.category))
      .padding(0.3);
    
    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-12,12)rotate(-45)')
      .attr('dy', '.15em')
      .attr('dx', '-.8em')
      .style('text-anchor', 'end')
      .style('font-size', '11px');
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalSales) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(y).tickFormat(d => `$${d3.format(",")(d)}`));
    
    // Define color scale using our CSS variables
    const barColors = ['var(--primary)', 'var(--primary-light)', 'var(--info)', 'var(--success)',
                       'var(--warning)', 'var(--secondary)', 'var(--danger)'];
                       
    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category))
      .attr('y', d => y(d.totalSales))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.totalSales))
      .attr('fill', (d, i) => barColors[i % barColors.length]);
    
    // Add value labels - adjust position based on label width
    svg.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.category) + x.bandwidth() / 2)
      .attr('y', d => y(d.totalSales) - 10)
      .attr('text-anchor', 'middle')
      .text(d => `$${Math.round(d.totalSales).toLocaleString()}`)
      .style('font-size', '11px'); // Smaller font size
    
    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Total Sales by Category');
      
  }, [chartData.categorySalesData, barChart1Ref]);

  // Update Platform Comparison Chart (Third Chart) to fix labels
  useEffect(() => {
    if (!chartData.platformData.length || !barChart2Ref.current) return;
    
    // Clean up previous chart first
    const chartContainer = d3.select(barChart2Ref.current);
    chartContainer.selectAll('*').remove();
    
    // Ensure we have both platforms (Online and Store)
    // If data is missing one platform, add a placeholder with zeros
    let platformData = [...chartData.platformData];
    const platformNames = platformData.map(p => p.platform);
    
    // Check if we're missing platforms
    if (!platformNames.includes('Online')) {
      platformData.push({
        platform: 'Online',
        totalSales: 0,
        avgOrderValue: 0,
        totalItems: 0,
        orderCount: 0
      });
    }
    
    if (!platformNames.includes('Store')) {
      platformData.push({
        platform: 'Store',
        totalSales: 0,
        avgOrderValue: 0,
        totalItems: 0,
        orderCount: 0
      });
    }
    
    // Sort by platform name for consistent ordering
    platformData = platformData.sort((a, b) => a.platform.localeCompare(b.platform));
    
    // Set up chart dimensions with more horizontal space
    const margin = { top: 50, right: 180, bottom: 80, left: 100 };
    const width = barChart2Ref.current.clientWidth - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = chartContainer
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Metrics to display with formatting
    const metrics = [
      { key: 'totalSales', label: 'Total Sales', format: d => `$${d3.format(",")(d)}` },
      { key: 'avgOrderValue', label: 'Avg Order Value', format: d => `$${d3.format(".2f")(d)}` },
      { key: 'totalItems', label: 'Items Sold', format: d => d3.format(",")(d) },
      { key: 'orderCount', label: 'Order Count', format: d => d3.format(",")(d) }
    ];
    
    // X axis with more padding - use more width of the chart
    const x0 = d3.scaleBand()
      .domain(platformData.map(d => d.platform))
      .rangeRound([0, width])
      .paddingInner(0.6);  // More space between platform groups
    
    const x1 = d3.scaleBand()
      .domain(metrics.map((m, i) => i))
      .rangeRound([0, x0.bandwidth()])
      .padding(0.2);
    
    // Add x-axis but DO NOT add text labels here 
    // We'll add custom labels below with better positioning
    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickSize(0).tickFormat(''));
      
    // Add custom platform labels only once
    platformData.forEach((platform, i) => {
      svg.append('text')
        .attr('class', 'platform-label')
        .attr('x', x0(platform.platform) + x0.bandwidth() / 2)
        .attr('y', height + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(platform.platform);
    });
    
    // Y axis - calculate max values properly with safety for zeros
    const maxValues = {
      totalSales: Math.max(1, d3.max(platformData, d => d.totalSales)),
      avgOrderValue: Math.max(1, d3.max(platformData, d => d.avgOrderValue)),
      totalItems: Math.max(1, d3.max(platformData, d => d.totalItems)),
      orderCount: Math.max(1, d3.max(platformData, d => d.orderCount))
    };
    
    // Normalize all values as percentages of their maximum
    const normalizedData = platformData.map(platform => {
      const normalized = { platform: platform.platform };
      metrics.forEach(metric => {
        normalized[metric.key] = platform[metric.key] / maxValues[metric.key];
      });
      return normalized;
    });
    
    // Y axis - for normalized values (0-100%)
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    
    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(y).tickFormat(d => `${d3.format(".0%")(d)}`));
    
    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 40)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Percentage of Maximum Value");
    
    // Colors for metrics with better contrast
    const colors = [
      'var(--primary)', 
      'var(--info)', 
      'var(--success)',
      'var(--warning)'
    ];
    
    // Add bars for each platform and metric
    platformData.forEach((platform, i) => {
      metrics.forEach((metric, j) => {
        // Draw each bar with unique class
        svg.append('rect')
          .attr('class', `bar-${platform.platform.toLowerCase()}-${metric.key}`)
          .attr('x', x0(platform.platform) + x1(j))
          .attr('y', y(normalizedData[i][metric.key]))
          .attr('width', x1.bandwidth())
          .attr('height', height - y(normalizedData[i][metric.key]))
          .attr('fill', colors[j])
          .attr('stroke', 'var(--white)')
          .attr('stroke-width', 1);
        
        // Add the actual value label with more spacing
        const percentValue = normalizedData[i][metric.key];
        const labelY = percentValue > 0.1 
                       ? y(percentValue) - 15 
                       : y(percentValue) - 25;
        
        // Only add labels for non-zero values to avoid clutter
        if (platform[metric.key] > 0) {
          svg.append('text')
            .attr('class', 'bar-label')
            .attr('x', x0(platform.platform) + x1(j) + x1.bandwidth() / 2)
            .attr('y', labelY)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .text(metric.format(platform[metric.key]));
        }
      });
    });
    
    // Add legend with better positioning and spacing
    const legend = svg.append('g')
      .attr('class', 'legend-container')
      .attr('transform', `translate(${width + 20}, 10)`);
    
    metrics.forEach((metric, i) => {
      const legendRow = legend.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(0, ${i * 35})`); // More spacing between legend items
      
      legendRow.append('rect')
        .attr('class', 'legend-color')
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', colors[i]);
      
      legendRow.append('text')
        .attr('x', 28)
        .attr('y', 12)
        .style('font-size', '13px')
        .style('font-weight', '500')
        .text(metric.label);
    });
    
    // Title with more space
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Online vs Physical Store Performance');
      
  }, [chartData.platformData, barChart2Ref]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !task) {
    return <Loader size="large" />;
  }

  if (error) {
    return (
      <div className="error-container">
        <ErrorMessage message={error} />
        <Link to="/" className="button">Back to Tasks</Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="error-container">
        <ErrorMessage message="Task not found" />
        <Link to="/" className="button">Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Task Details {task && `#${task.id}`}</h1>
        {task && (
          <div className="task-status">
            <StatusBadge status={task.status} />
          </div>
        )}
      </div>
      
      <div className="card">
        <h2>Task Details</h2>
        <div className="task-details">
          <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(task.updated_at).toLocaleString()}</p>
          <p><strong>Filter Parameters:</strong></p>
          <ul>
            <li>Year Range: {task.filter_params.year_from} - {task.filter_params.year_to}</li>
            {task.filter_params.companies && task.filter_params.companies.length > 0 && (
              <li>Brands: {task.filter_params.companies.join(', ')}</li>
            )}
            {task.filter_params.categories && task.filter_params.categories.length > 0 && (
              <li>Categories: {task.filter_params.categories.join(', ')}</li>
            )}
            {task.filter_params.data_sources && task.filter_params.data_sources.length > 0 && (
              <li>Data Sources: {task.filter_params.data_sources.map(source => 
                source === 'source_a' ? 'Online Store (JSON)' : 'Physical Store (CSV)'
              ).join(', ')}</li>
            )}
          </ul>
        </div>
      </div>
      
      {task.status === 'completed' && taskData.data && taskData.data.length > 0 ? (
        <div>
          <div className="filters card">
            <h2>Data Filters</h2>
            <div className="filter-controls">
              <div className="form-group">
                <label htmlFor="category">Filter by Category</label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {PRODUCT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="brand">Filter by Brand</label>
                <select
                  id="brand"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="platform">Filter by Platform</label>
                <select
                  id="platform"
                  name="platform"
                  value={filters.platform}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Platforms</option>
                  <option value="Online">Online</option>
                  <option value="Store">Physical Store</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="year">Filter by Year</label>
                <select
                  id="year"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 6 }, (_, i) => 2020 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="data-summary">
              <p><strong>Records Found:</strong> {filteredData.length}</p>
              <p><strong>Online Store Records:</strong> {filteredData.filter(d => d.source === 'source_a').length}</p>
              <p><strong>Physical Store Records:</strong> {filteredData.filter(d => d.source === 'source_b').length}</p>
              <p><strong>Total Value:</strong> ${filteredData.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="visualizations">
            <div className="card">
              <h2>Sales Visualizations</h2>
              <p>The charts below show various sales metrics by time period, category, and platform.</p>
            </div>

            <div className="chart-container" ref={lineChartRef}>
              <div className="chart-title">Monthly Sales Trend</div>
            </div>
            
            <div className="chart-container" ref={barChart1Ref}>
              <div className="chart-title">Sales by Product Category</div>
            </div>
            
            <div className="chart-container" ref={barChart2Ref}>
              <div className="chart-title">Online vs Physical Store Performance</div>
            </div>
          </div>
          
          <div className="card">
            <h2>Data Table</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price ($)</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Platform</th>
                    <th>Purchase Date</th>
                    {filteredData.some(r => r.rating) && <th>Rating</th>}
                    {filteredData.some(r => r.location) && <th>Location</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((record, index) => (
                    <tr key={index}>
                      <td>{record.source === 'source_a' ? 'Online' : 'Store'}</td>
                      <td>{record.category}</td>
                      <td>{record.brand}</td>
                      <td>${record.price.toLocaleString()}</td>
                      <td>{record.quantity}</td>
                      <td>${(record.price * record.quantity).toLocaleString()}</td>
                      <td>{record.platform}</td>
                      <td>{new Date(record.purchase_date).toLocaleDateString()}</td>
                      {filteredData.some(r => r.rating) && <td>{record.rating || 'N/A'}</td>}
                      {filteredData.some(r => r.location) && <td>{record.location || 'N/A'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 100 && (
                <div className="table-note">Showing first 100 records of {filteredData.length} total</div>
              )}
            </div>
          </div>
        </div>
      ) : task.status === 'completed' ? (
        <div className="card">
          <p>No data available for this task. The filters may be too restrictive.</p>
        </div>
      ) : (
        <div className="card">
          <p>Waiting for task to complete...</p>
          <p>Current status: <strong>{task.status}</strong></p>
          <div className="progress-bar">
            <div 
              className={`progress-value progress-${task.status}`}
              style={{ 
                width: task.status === 'pending' ? '30%' : 
                       task.status === 'in_progress' ? '70%' : '100%' 
              }}
            ></div>
          </div>
          <p className="status-message">
            {task.status === 'pending' ? 
              'Task is queued and will begin processing shortly...' : 
              'Task is being processed. Retrieving data from selected sources...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default TaskDetails; 