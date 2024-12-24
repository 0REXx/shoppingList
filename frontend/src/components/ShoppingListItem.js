import React from 'react';
import '../App.css'; 

function ShoppingListItem({ item, onToggleResolved, onDelete }) {
  return (
    <li className="shopping-item">
      <span className={`item-name ${item.resolved ? 'resolved' : ''}`}>
        {item.name}
      </span>
      <div className="item-actions">
        <button className="resolve-button" onClick={() => onToggleResolved(item.id)}>
          {item.resolved ? 'Cancel' : 'Done'}
        </button>
        <button className="delete-button" onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default ShoppingListItem;
