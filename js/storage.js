/**
 * SmartResolve AI - LocalStorage Data Manager
 * 
 * Handles all complaint persistence, querying, sample data seeding,
 * and statistical aggregations via HTML5 localStorage.
 */

const ComplaintStorage = (function() {
  const STORAGE_KEY = 'smartresolve_complaints_v1';

  // Realistic sample demo complaints
  const SAMPLE_COMPLAINTS = [
    {
      id: 'CMP-2026-1001',
      studentName: 'Aarav Sharma',
      studentRoll: 'CS-2024-041',
      studentEmail: 'aarav.sharma@campus.edu',
      location: 'Hostel Block B, Room 204',
      title: 'Severe water pipe leakage under washbasin',
      description: 'The drainage pipe beneath the washbasin has cracked and is continuously leaking water onto the bathroom floor, creating a severe slipping hazard and water accumulation.',
      category: 'Water',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-10-10T09:15:00.000Z',
      updatedAt: '2026-10-11T14:30:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Water',
        categoryConfidence: 92,
        matchedKeywords: ['water', 'pipe', 'leak', 'washbasin'],
        department: 'Plumbing & Water Supply Department',
        priority: 'High',
        priorityReason: 'Critical safety or infrastructure disruption detected. Trigger terms: "pipe, leak, hazard". Requires immediate intervention.',
        summary: 'Reported high priority water issue: "Severe water pipe leakage under washbasin" at Hostel Block B, Room 204.',
        suggestedAction: 'Shut off local isolation valve at Hostel Block B, Room 204. Mobilize plumbing crew to contain water damage and prevent floor slipping.'
      },
      adminRemarks: 'Plumber Raman assigned ticket on Oct 11. Replacement pipe ordered from campus inventory.',
      history: [
        { status: 'Pending', timestamp: '2026-10-10T09:15:00.000Z', note: 'Complaint submitted by student.' },
        { status: 'In Progress', timestamp: '2026-10-11T14:30:00.000Z', note: 'Assigned to Plumbing Maintenance Wing.' }
      ]
    },
    {
      id: 'CMP-2026-1002',
      studentName: 'Priya Narayanan',
      studentRoll: 'EE-2023-112',
      studentEmail: 'priya.n@campus.edu',
      location: 'Central Library, 2nd Floor Digital Lab',
      title: 'Campus Wi-Fi drops frequently and captive portal errors',
      description: 'Wi-Fi access point AP-LIB-02 disconnects every 5 minutes. Students attempting to access research journals get DNS timeout errors and captive portal login loops.',
      category: 'Wi-Fi',
      priority: 'Medium',
      status: 'Pending',
      createdAt: '2026-10-11T11:45:00.000Z',
      updatedAt: '2026-10-11T11:45:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Wi-Fi',
        categoryConfidence: 94,
        matchedKeywords: ['wifi', 'wi-fi', 'disconnect', 'dns', 'captive portal'],
        department: 'Campus Information Technology (IT) & Network Services',
        priority: 'Medium',
        priorityReason: 'Operational disruption affecting student routine or study. Trigger terms: "disconnect, error". Resolve within 24-48 hours.',
        summary: 'Reported medium priority wi-fi issue: "Campus Wi-Fi drops frequently and captive portal errors" at Central Library, 2nd Floor Digital Lab.',
        suggestedAction: 'Reboot access point remotely. Monitor ping latency and re-assign channel if frequency congestion is detected.'
      },
      adminRemarks: '',
      history: [
        { status: 'Pending', timestamp: '2026-10-11T11:45:00.000Z', note: 'Complaint submitted by student.' }
      ]
    },
    {
      id: 'CMP-2026-1003',
      studentName: 'Rahul Verma',
      studentRoll: 'ME-2024-078',
      studentEmail: 'rahul.v@campus.edu',
      location: 'Mechanical Block Seminar Hall 3',
      title: 'Electric switchboard sparking when projector is turned on',
      description: 'The wall switchboard near the podium produced visible electrical sparks and a burning smell when turning on the HDMI projector. Switched off immediately for safety.',
      category: 'Electricity',
      priority: 'High',
      status: 'Resolved',
      createdAt: '2026-10-09T14:20:00.000Z',
      updatedAt: '2026-10-10T16:00:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Electricity',
        categoryConfidence: 95,
        matchedKeywords: ['electric', 'switch', 'spark', 'burning', 'power'],
        department: 'Electrical Engineering & Maintenance Team',
        priority: 'High',
        priorityReason: 'Critical safety or infrastructure disruption detected. Trigger terms: "spark, smell, safety". Requires immediate intervention.',
        summary: 'Reported high priority electricity issue: "Electric switchboard sparking when projector is turned on" at Mechanical Block Seminar Hall 3.',
        suggestedAction: 'Cut off local circuit breaker at Mechanical Block Seminar Hall 3. Immediately dispatch campus senior electrician to prevent fire/shock hazards.'
      },
      adminRemarks: 'Senior electrician replaced shorted 16A modular switch and renewed wire insulation. Tested projector load safely. Verified resolved.',
      history: [
        { status: 'Pending', timestamp: '2026-10-09T14:20:00.000Z', note: 'Complaint submitted by student.' },
        { status: 'In Progress', timestamp: '2026-10-09T15:10:00.000Z', note: 'Emergency electrician dispatched.' },
        { status: 'Resolved', timestamp: '2026-10-10T16:00:00.000Z', note: 'Switch replaced and circuit insulation certified safe.' }
      ]
    },
    {
      id: 'CMP-2026-1004',
      studentName: 'Ananya Deshmukh',
      studentRoll: 'BT-2025-019',
      studentEmail: 'ananya.d@campus.edu',
      location: 'Student Mess Dining Hall - Block A',
      title: 'Overflowing garbage bins attracting pests near dining area',
      description: 'The waste disposal bins outside the mess exit are completely full and overflowing onto the footpath, causing foul odor and attracting stray animals and insects.',
      category: 'Cleanliness',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: '2026-10-11T18:05:00.000Z',
      updatedAt: '2026-10-12T08:30:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Cleanliness',
        categoryConfidence: 91,
        matchedKeywords: ['garbage', 'bins', 'waste', 'foul odor', 'pests', 'insects'],
        department: 'Campus Sanitation & Housekeeping Department',
        priority: 'Medium',
        priorityReason: 'Operational disruption affecting student routine or study. Trigger terms: "foul odor, pests". Resolve within 24-48 hours.',
        summary: 'Reported medium priority cleanliness issue: "Overflowing garbage bins attracting pests near dining area" at Student Mess Dining Hall - Block A.',
        suggestedAction: 'Assign morning sanitation crew for thorough cleaning and restocking of amenities in Student Mess Dining Hall - Block A.'
      },
      adminRemarks: 'Sanitation contractor instructed to clear bins twice daily and apply disinfectant spray.',
      history: [
        { status: 'Pending', timestamp: '2026-10-11T18:05:00.000Z', note: 'Complaint submitted by student.' },
        { status: 'In Progress', timestamp: '2026-10-12T08:30:00.000Z', note: 'Sanitation team supervisor alerted.' }
      ]
    },
    {
      id: 'CMP-2026-1005',
      studentName: 'Karthik Raja',
      studentRoll: 'CV-2023-055',
      studentEmail: 'karthik.r@campus.edu',
      location: 'Civil Engineering Block - Lecture Hall 102',
      title: 'Broken desk latch and wobbly benches in third row',
      description: 'Two study benches in the third row have broken iron brackets and wobble severely during lectures. Writing surface is uneven.',
      category: 'Maintenance',
      priority: 'Low',
      status: 'Pending',
      createdAt: '2026-10-12T10:15:00.000Z',
      updatedAt: '2026-10-12T10:15:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Maintenance',
        categoryConfidence: 88,
        matchedKeywords: ['desk', 'benches', 'broken', 'furniture'],
        department: 'Campus Estate & Civil Infrastructure Team',
        priority: 'Low',
        priorityReason: 'Standard inquiry or routine maintenance; no immediate safety or systemic disruption detected.',
        summary: 'Reported low priority maintenance issue: "Broken desk latch and wobbly benches in third row" at Civil Engineering Block - Lecture Hall 102.',
        suggestedAction: 'Add to weekly preventive maintenance schedule. Standard resolution timeline: 3-5 business days.'
      },
      adminRemarks: '',
      history: [
        { status: 'Pending', timestamp: '2026-10-12T10:15:00.000Z', note: 'Complaint submitted by student.' }
      ]
    },
    {
      id: 'CMP-2026-1006',
      studentName: 'Sneha Patel',
      studentRoll: 'EC-2024-032',
      studentEmail: 'sneha.p@campus.edu',
      location: 'Girls Hostel 3, First Floor Corridor',
      title: 'Corridor main tube light flickering continuously',
      description: 'The tube light right outside room 114 is flickering non-stop and creates humming noise throughout the night, making it difficult to study.',
      category: 'Electricity',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '2026-10-08T20:10:00.000Z',
      updatedAt: '2026-10-09T11:00:00.000Z',
      aiAnalysis: {
        model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
        isSimulated: true,
        category: 'Electricity',
        categoryConfidence: 85,
        matchedKeywords: ['tube light', 'light', 'flickering'],
        department: 'Electrical Engineering & Maintenance Team',
        priority: 'Low',
        priorityReason: 'Standard inquiry or routine maintenance; no immediate safety or systemic disruption detected.',
        summary: 'Reported low priority electricity issue: "Corridor main tube light flickering continuously" at Girls Hostel 3, First Floor Corridor.',
        suggestedAction: 'Schedule routine replacement of fluorescent ballast/LED starter in Girls Hostel 3 corridor.'
      },
      adminRemarks: 'Replaced with energy-efficient 20W LED batten fixture.',
      history: [
        { status: 'Pending', timestamp: '2026-10-08T20:10:00.000Z', note: 'Complaint submitted by student.' },
        { status: 'In Progress', timestamp: '2026-10-09T09:30:00.000Z', note: 'Hostel caretaker logged request with electrician.' },
        { status: 'Resolved', timestamp: '2026-10-09T11:00:00.000Z', note: 'LED fixture replaced.' }
      ]
    }
  ];

  /**
   * Initializes storage with default sample data if empty
   */
  function init() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        loadDemoData();
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or disabled:', e);
    }
  }

  /**
   * Retrieves all complaints
   */
  function getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error reading complaints from localStorage:', e);
      return [];
    }
  }

  /**
   * Saves complete list to localStorage
   */
  function saveAll(complaints) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
      return true;
    } catch (e) {
      console.error('Error saving complaints to localStorage:', e);
      return false;
    }
  }

  /**
   * Generates a collision-resistant unique Complaint ID
   * Format: CMP-YYYY-XXXX (e.g. CMP-2026-1048)
   */
  function generateId() {
    const year = new Date().getFullYear();
    const complaints = getAll();
    
    // Find highest numeric suffix if available
    let maxNum = 1000;
    complaints.forEach(c => {
      if (c.id && c.id.startsWith(`CMP-${year}-`)) {
        const parts = c.id.split('-');
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `CMP-${year}-${nextNum}`;
  }

  /**
   * Finds a complaint by ID (case-insensitive)
   */
  function getById(id) {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    const complaints = getAll();
    return complaints.find(c => c.id && c.id.toUpperCase() === cleanId) || null;
  }

  /**
   * Creates and stores a new complaint
   */
  function create(complaintData) {
    const complaints = getAll();
    const now = new Date().toISOString();
    const id = complaintData.id || generateId();

    const newRecord = {
      id,
      studentName: complaintData.studentName.trim(),
      studentRoll: complaintData.studentRoll ? complaintData.studentRoll.trim() : 'N/A',
      studentEmail: complaintData.studentEmail ? complaintData.studentEmail.trim() : 'N/A',
      location: complaintData.location.trim(),
      title: complaintData.title.trim(),
      description: complaintData.description.trim(),
      category: complaintData.category || 'Other',
      priority: complaintData.priority || 'Medium',
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      aiAnalysis: complaintData.aiAnalysis || null,
      adminRemarks: '',
      history: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Complaint registered by student.'
        }
      ]
    };

    complaints.unshift(newRecord); // Add to beginning
    saveAll(complaints);
    return newRecord;
  }

  /**
   * Updates an existing complaint status / admin remarks
   */
  function update(id, updates) {
    const complaints = getAll();
    const index = complaints.findIndex(c => c.id.toUpperCase() === id.trim().toUpperCase());
    if (index === -1) return null;

    const existing = complaints[index];
    const now = new Date().toISOString();

    const updated = {
      ...existing,
      ...updates,
      updatedAt: now
    };

    // If status changed, record timeline history
    if (updates.status && updates.status !== existing.status) {
      if (!updated.history) updated.history = [];
      updated.history.push({
        status: updates.status,
        timestamp: now,
        note: updates.statusNote || `Status updated to ${updates.status} by administration.`
      });
    }

    complaints[index] = updated;
    saveAll(complaints);
    return updated;
  }

  /**
   * Deletes a complaint by ID
   */
  function deleteComplaint(id) {
    const complaints = getAll();
    const filtered = complaints.filter(c => c.id.toUpperCase() !== id.trim().toUpperCase());
    if (filtered.length !== complaints.length) {
      saveAll(filtered);
      return true;
    }
    return false;
  }

  /**
   * Loads sample complaints into storage
   */
  function loadDemoData() {
    saveAll(SAMPLE_COMPLAINTS);
    return SAMPLE_COMPLAINTS;
  }

  /**
   * Clears all complaints from storage
   */
  function clearAll() {
    saveAll([]);
    return true;
  }

  /**
   * Aggregates live statistical metrics for dashboard
   */
  function getStatistics() {
    const complaints = getAll();
    const total = complaints.length;

    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let highPriority = 0;

    const categoryCounts = {
      Water: 0,
      Electricity: 0,
      'Wi-Fi': 0,
      Cleanliness: 0,
      Maintenance: 0,
      Other: 0
    };

    complaints.forEach(c => {
      // Status
      if (c.status === 'Pending') pending++;
      else if (c.status === 'In Progress') inProgress++;
      else if (c.status === 'Resolved') resolved++;

      // Priority
      if (c.priority === 'High') highPriority++;

      // Category
      const cat = c.category;
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts.Other++;
      }
    });

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      resolved,
      highPriority,
      resolutionRate,
      categoryCounts
    };
  }

  // Initialize on load
  init();

  return {
    getAll,
    getById,
    create,
    update,
    delete: deleteComplaint,
    loadDemoData,
    clearAll,
    getStatistics,
    generateId
  };
})();

// Export for module environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComplaintStorage;
}
