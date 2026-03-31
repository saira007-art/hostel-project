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
  const roleSelector = document.getElementById('role-selector');
  const userNameEl = document.getElementById('user-name');
  const userRoomEl = document.getElementById('user-room');
  const userAvatarEl = document.getElementById('user-avatar');
  const btnPostNotice = document.getElementById('btn-post-notice');
  const noticeModal = document.getElementById('notice-modal');
  const closeNoticeModal = document.getElementById('close-notice-modal');
  const noticeForm = document.getElementById('notice-form');

  let currentRole = 'student';

  // Navigation logic
  const navLinks = document.querySelectorAll('#sidebar-nav a');
  const viewSections = document.querySelectorAll('.view-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      pageTitle.innerText = link.innerText;

      const targetView = link.getAttribute('data-view');
      viewSections.forEach(section => {
        section.style.display = 'none';
      });
      document.getElementById(`view-${targetView}`).style.display = 'block';
    });
  });

  // Role Selection Logic
  roleSelector.addEventListener('change', (e) => {
    currentRole = e.target.value;
    updateUIForRole();
  });

  const updateUIForRole = () => {
    if (currentRole === 'warden') {
      userNameEl.innerText = 'Hostel Warden';
      userRoomEl.innerText = 'Admin Block';
      userAvatarEl.innerText = 'W';
      btnRaiseComplaint.style.display = 'none';
      btnPostNotice.style.display = 'block';
    } else {
      userNameEl.innerText = 'Student User';
      userRoomEl.innerText = 'Room 101';
      userAvatarEl.innerText = 'S';
      btnRaiseComplaint.style.display = 'block';
      btnPostNotice.style.display = 'none';
    }
    fetchComplaints(); // Re-render with new controls
  };

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
          <h4>${c.category} Issue <span style="font-weight: normal; font-size: 0.8rem; color: #666;">(Room: ${c.room_number || 'N/A'})</span></h4>
          <p>${c.description}</p>
        </div>
        <div class="actions-group">
          <div class="status-badge status-${c.status}">
            ${c.status.replace('-', ' ')}
          </div>
          ${currentRole === 'warden' && c.status === 'pending' ? `
            <button class="btn-sm btn-resolve" onclick="updateComplaintStatus('${c.id}', 'resolved')">Resolve</button>
            <button class="btn-sm btn-progress" onclick="updateComplaintStatus('${c.id}', 'in-progress')">Work On</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  };

  // Global scope for status update
  window.updateComplaintStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        fetchComplaints();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
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

  // Toggle Notice Modal
  btnPostNotice.addEventListener('click', () => {
    noticeModal.classList.add('active');
  });

  closeNoticeModal.addEventListener('click', () => {
    noticeModal.classList.remove('active');
  });

  // Submit new notice
  noticeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('notice-title').value;
    const content = document.getElementById('notice-content').value;
    
    try {
      const response = await fetch(`${API_URL}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (response.ok) {
        alert('Notice posted successfully!');
        noticeModal.classList.remove('active');
        noticeForm.reset();
        fetchNotices();
      }
    } catch (err) {
      alert('Error posting notice');
    }
  });

  // Initial load
  fetchComplaints();
  fetchNotices();
  fetchItems();
  fetchLaundry();
});
