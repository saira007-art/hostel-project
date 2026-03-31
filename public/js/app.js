document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const btnRaiseComplaint = document.getElementById('btn-raise-complaint');
  const modalOverlay = document.getElementById('complaint-modal');
  const closeModal = document.getElementById('close-modal');
  const complaintForm = document.getElementById('complaint-form');
  
  const complaintsList = document.getElementById('complaints-list');
  const noticesList = document.getElementById('notices-list');
  const itemsList = document.getElementById('items-list');
  
  const pendingComplaintsValue = document.getElementById('pending-complaints-value');
  const laundryStatValue = document.getElementById('laundry-stat-value');
  const pageTitle = document.getElementById('page-title');

  // Navigation logic
  const navLinks = document.querySelectorAll('#sidebar-nav a');
  const viewSections = document.querySelectorAll('.view-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav class
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      
      // Update topbar title
      pageTitle.innerText = link.innerText;

      // Hide all views, show target view
      const targetView = link.getAttribute('data-view');
      viewSections.forEach(section => {
        section.style.display = 'none';
      });
      document.getElementById(`view-${targetView}`).style.display = 'block';
    });
  });

  // API Base URL
  const API_URL = '/api';

  // Toggle Modal
  btnRaiseComplaint.addEventListener('click', () => {
    modalOverlay.classList.add('active');
  });

  closeModal.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  // Data Fetching Functions
  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      if (response.ok) {
        const result = await response.json();
        renderComplaints(result.data);
      }
    } catch (error) {
      console.log('Failed to fetch complaints');
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_URL}/notices`);
      if (response.ok) {
        const result = await response.json();
        renderNotices(result.data);
      }
    } catch (error) {
      console.log('Failed to fetch notices');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items`);
      if (response.ok) {
        const result = await response.json();
        renderItems(result.data);
      }
    } catch (error) {
      console.log('Failed to fetch items');
    }
  };

  const fetchLaundry = async () => {
    try {
      const response = await fetch(`${API_URL}/laundry`);
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const latest = result.data[0];
          const time = new Date(latest.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          laundryStatValue.innerText = `Slot ${time}`;
        }
      }
    } catch (error) {
      console.log('Failed to fetch laundry');
    }
  };

  // Render Functions
  const renderComplaints = (complaints) => {
    if (!complaints || complaints.length === 0) {
      complaintsList.innerHTML = '<p>No recent complaints found.</p>';
      pendingComplaintsValue.innerText = '0';
      return;
    }

    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    if (pendingComplaintsValue) pendingComplaintsValue.innerText = pendingCount;

    complaintsList.innerHTML = complaints.map(c => `
      <div class="complaint-item">
        <div class="details">
          <h4>${c.category} Issue</h4>
          <p>${c.description}</p>
        </div>
        <div class="status-badge status-${c.status}">
          ${c.status.replace('-', ' ')}
        </div>
      </div>
    `).join('');
  };

  const renderNotices = (notices) => {
    if (!notices || notices.length === 0) {
      noticesList.innerHTML = '<p>No recent notices found.</p>';
      return;
    }

    // noticeList uses <li> 
    noticesList.innerHTML = notices.map(n => {
      const dateStr = new Date(n.created_at).toLocaleDateString();
      return `
      <li>
        <span class="notice-date">${dateStr}</span>
        <h4 style="margin-bottom: 4px; font-size: 1rem;">${n.title}</h4>
        <p>${n.content}</p>
      </li>
    `}).join('');
  };

  const renderItems = (items) => {
    if (!items || items.length === 0) {
      itemsList.innerHTML = '<p>No items in marketplace.</p>';
      return;
    }

    itemsList.innerHTML = items.map(item => `
      <div class="complaint-item">
        <div class="details">
          <h4>${item.title} <span style="font-size: 0.8em; font-weight: normal; color: gray; text-transform: uppercase;">(${item.item_type})</span></h4>
          <p>${item.description}</p>
        </div>
        <div class="status-badge status-resolved">
          ${item.status}
        </div>
      </div>
    `).join('');
  };

  // Submit new complaint
  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('complaint-category').value;
    const description = document.getElementById('complaint-desc').value;
    const room_number = document.getElementById('complaint-room').value;
    
    const payload = { category, description, room_number };

    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Complaint submitted successfully!');
        modalOverlay.classList.remove('active');
        complaintForm.reset();
        fetchComplaints(); // Refresh list
      } else {
        alert('Failed to submit complaint');
      }
    } catch (error) {
      alert('Error submitting complaint');
    }
  });

  // Initial load
  fetchComplaints();
  fetchNotices();
  fetchItems();
  fetchLaundry();
});
