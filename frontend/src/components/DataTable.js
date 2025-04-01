import React from 'react';

function DataTable({ data, columns }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <p className="status-message">No data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={`${index}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <p className="table-note">Showing {data.length} record(s)</p>
      )}
    </div>
  );
}

export default DataTable; 