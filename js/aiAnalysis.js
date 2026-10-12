/**
 * SmartResolve AI - AI Complaint Analysis Engine
 * 
 * Note on Implementation:
 * This client-side version utilizes deterministic Rule-Based Natural Language Processing (NLP)
 * and keyword heuristic algorithms to categorize, prioritize, summarize, and recommend actions.
 * It is structured with an asynchronous API-ready interface so that a production LLM
 * (e.g. Gemini 1.5 Pro, Claude, or OpenAI) can be connected seamlessly via a secure backend.
 */

const SmartResolveAI = (function() {
  // Category keyword patterns and weights
  const CATEGORY_RULES = {
    Water: {
      keywords: [
        'water', 'leak', 'leaking', 'leakage', 'pipe', 'tap', 'washroom', 'restroom',
        'toilet', 'flush', 'sink', 'plumbing', 'flood', 'flooding', 'drinking water',
        'cooler', 'drain', 'drainage', 'sewage', 'overflow', 'overflowing', 'tank', 'ro water'
      ],
      dept: 'Plumbing & Water Supply Department',
      defaultAction: 'Dispatch campus maintenance plumber for inspection and pipe/tap repair.'
    },
    Electricity: {
      keywords: [
        'electricity', 'electric', 'power', 'power cut', 'outage', 'blackout', 'spark',
        'sparking', 'switch', 'socket', 'plug', 'wire', 'wiring', 'shock', 'short circuit',
        'bulb', 'light', 'tube light', 'fan', 'ac', 'air conditioner', 'mcb', 'fuse',
        'voltage', 'generator', 'transformer'
      ],
      dept: 'Electrical Engineering & Maintenance Team',
      defaultAction: 'Dispatch certified campus electrician immediately to verify circuit breaker and rewire.'
    },
    'Wi-Fi': {
      keywords: [
        'wifi', 'wi-fi', 'internet', 'network', 'router', 'connection', 'disconnected',
        'bandwidth', 'signal', 'slow net', 'lan', 'ethernet', 'login', 'captive portal',
        'dns', 'ip address', 'speed', 'no signal', 'packet loss'
      ],
      dept: 'Campus Information Technology (IT) & Network Services',
      defaultAction: 'Conduct remote access point diagnostic, reset local switch/router, or dispatch network technician.'
    },
    Cleanliness: {
      keywords: [
        'clean', 'cleanliness', 'dirty', 'garbage', 'trash', 'dustbin', 'waste', 'smell',
        'odor', 'pest', 'pests', 'cockroach', 'insects', 'rats', 'rodents', 'stagnant',
        'sweep', 'sweeping', 'mop', 'hygiene', 'unhygienic', 'litter', 'corridor clean',
        'mess food hygiene'
      ],
      dept: 'Campus Sanitation & Housekeeping Department',
      defaultAction: 'Notify housekeeping supervisor for scheduled deep cleaning, waste clearance, or pest fumigation.'
    },
    Maintenance: {
      keywords: [
        'door', 'window', 'lock', 'broken door', 'chair', 'desk', 'bench', 'table',
        'blackboard', 'projector', 'screen', 'podium', 'wall', 'paint', 'crack', 'ceiling',
        'plaster', 'elevator', 'lift', 'stairs', 'railing', 'furniture', 'glass', 'mirror'
      ],
      dept: 'Campus Estate & Civil Infrastructure Team',
      defaultAction: 'Schedule civil/carpentry inspection, repair broken fittings or replace defective fixtures.'
    }
  };

  // High urgency trigger terms
  const HIGH_PRIORITY_KEYWORDS = [
    'emergency', 'urgent', 'danger', 'dangerous', 'spark', 'sparking', 'shock',
    'electric shock', 'short circuit', 'fire', 'smoke', 'flood', 'flooding', 'burst',
    'hazard', 'injury', 'bleed', 'gas leak', 'trapped', 'elevator stuck', 'blackout',
    'severe', 'unusable', 'immediately', 'critical', 'contamination'
  ];

  // Medium urgency trigger terms
  const MEDIUM_PRIORITY_KEYWORDS = [
    'not working', 'stopped working', 'broken', 'damaged', 'leak', 'leakage',
    'exam tomorrow', 'presentation', 'classes affected', 'study affected', 'smell',
    'foul odor', 'no water', 'frequent', 'slow', 'disconnect', 'unable to work'
  ];

  /**
   * Cleans text and splits into lowercase tokens
   */
  function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
  }

  /**
   * Rule-based Category Classifier
   */
  function detectCategory(title, description) {
    const combined = `${title} ${description}`.toLowerCase();
    const scores = {};
    const matchedKeywords = {};

    Object.keys(CATEGORY_RULES).forEach(category => {
      scores[category] = 0;
      matchedKeywords[category] = [];
      const rule = CATEGORY_RULES[category];

      rule.keywords.forEach(keyword => {
        // Multi-word phrase check vs single word
        if (keyword.includes(' ')) {
          if (combined.includes(keyword)) {
            scores[category] += 3;
            matchedKeywords[category].push(keyword);
          }
        } else {
          // Word boundary regex
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = combined.match(regex);
          if (matches) {
            scores[category] += matches.length * 2;
            matchedKeywords[category].push(keyword);
          }
        }
      });
    });

    // Find category with highest score
    let highestCat = 'Other';
    let highestScore = 0;
    Object.keys(scores).forEach(category => {
      if (scores[category] > highestScore) {
        highestScore = scores[category];
        highestCat = category;
      }
    });

    // If score is 0 or very weak, default to 'Other'
    if (highestScore === 0) {
      return {
        category: 'Other',
        confidence: 45,
        matchedKeywords: [],
        department: 'General Campus Administration Helpdesk'
      };
    }

    const matchedList = Array.from(new Set(matchedKeywords[highestCat]));
    const confidence = Math.min(95, 60 + highestScore * 4);

    return {
      category: highestCat,
      confidence,
      matchedKeywords: matchedList,
      department: CATEGORY_RULES[highestCat].dept
    };
  }

  /**
   * Rule-based Urgency & Priority Assessor
   */
  function detectPriority(title, description, detectedCategory) {
    const combined = `${title} ${description}`.toLowerCase();
    const highMatches = [];
    const medMatches = [];

    HIGH_PRIORITY_KEYWORDS.forEach(word => {
      if (word.includes(' ') && combined.includes(word)) {
        highMatches.push(word);
      } else {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(combined)) highMatches.push(word);
      }
    });

    MEDIUM_PRIORITY_KEYWORDS.forEach(word => {
      if (word.includes(' ') && combined.includes(word)) {
        medMatches.push(word);
      } else {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(combined)) medMatches.push(word);
      }
    });

    let priority = 'Low';
    let reason = 'Standard inquiry or routine maintenance; no immediate safety or systemic disruption detected.';

    if (highMatches.length > 0) {
      priority = 'High';
      reason = `Critical safety or infrastructure disruption detected. Trigger terms: "${highMatches.slice(0, 3).join(', ')}". Requires immediate intervention.`;
    } else if (medMatches.length > 0) {
      priority = 'Medium';
      reason = `Operational disruption affecting student routine or study. Trigger terms: "${medMatches.slice(0, 3).join(', ')}". Resolve within 24-48 hours.`;
    } else if (detectedCategory === 'Electricity' || detectedCategory === 'Water') {
      priority = 'Medium';
      reason = `Utility-related issue (${detectedCategory}) prioritized for prompt student amenity service.`;
    }

    return {
      priority,
      reason,
      triggers: highMatches.length > 0 ? highMatches : medMatches
    };
  }

  /**
   * Generates a concise natural summary of the complaint
   */
  function generateSummary(title, description, category, priority, location) {
    const cleanTitle = title.trim();
    const cleanLocation = location ? ` at ${location.trim()}` : '';
    const cleanDesc = description.trim();
    const truncatedDesc = cleanDesc.length > 90 ? cleanDesc.substring(0, 87) + '...' : cleanDesc;

    return `Reported ${priority.toLowerCase()} priority ${category.toLowerCase()} issue: "${cleanTitle}"${cleanLocation}. Core observation: "${truncatedDesc}"`;
  }

  /**
   * Recommends actionable resolution steps for college admins
   */
  function suggestNextAction(category, priority, location) {
    const locText = location ? ` at ${location}` : '';
    
    if (priority === 'High') {
      switch (category) {
        case 'Electricity':
          return `URGENT: Cut off local circuit breaker${locText}. Immediately dispatch campus senior electrician to prevent fire/shock hazards.`;
        case 'Water':
          return `URGENT: Shut off local isolation valve${locText}. Mobilize plumbing crew to contain water damage and prevent floor slipping.`;
        case 'Wi-Fi':
          return `URGENT: Escalate to Senior Network Administrator. Check core switch/gateway serving the block for hardware failure.`;
        case 'Cleanliness':
          return `URGENT: Alert Estate Officer and sanitation team for emergency hazardous waste / spill decontamination.`;
        case 'Maintenance':
          return `URGENT: Cordon off defective area/equipment${locText} to prevent student injury. Dispatch emergency carpentry/civil technician.`;
        default:
          return `URGENT: Campus administrative desk to dispatch duty officer to ${location || 'site'} within 30 minutes.`;
      }
    }

    if (priority === 'Medium') {
      switch (category) {
        case 'Electricity':
          return `Log ticket with Hostel Electrical Desk. Schedule technician visit within 24 hours to replace faulty fixture.`;
        case 'Water':
          return `Issue maintenance slip to campus plumber. Check line pressure and replace seals/faucet washers.`;
        case 'Wi-Fi':
          return `Reboot access point remotely. Monitor ping latency and re-assign channel if frequency congestion is detected.`;
        case 'Cleanliness':
          return `Assign morning sanitation crew for thorough cleaning and restocking of amenities in ${location || 'the area'}.`;
        case 'Maintenance':
          return `Log repair request in campus asset register. Procure necessary hardware and schedule fix within 48 hours.`;
        default:
          return `Assign ticket to relevant campus supervisor. Follow up within 24-48 hours.`;
      }
    }

    // Low priority
    return `Add to weekly preventive maintenance schedule. Standard resolution timeline: 3-5 business days.`;
  }

  /**
   * Public Analysis Method (Asynchronous / API-ready)
   * 
   * Returns a complete analysis object.
   * If an external backend is configured in the future, this method can fetch from
   * `POST /api/complaints/analyze` while keeping the frontend UI completely unchanged.
   */
  async function analyzeComplaint({ title, description, location, manualCategory = null }) {
    // Simulated micro-delay (150ms) to emulate analysis processing cleanly
    await new Promise(resolve => setTimeout(resolve, 150));

    const detected = detectCategory(title, description);
    
    // Allow user override if they manually chose a specific category
    const finalCategory = (manualCategory && manualCategory !== 'auto' && manualCategory !== '') 
      ? manualCategory 
      : detected.category;

    const priorityInfo = detectPriority(title, description, finalCategory);
    const summary = generateSummary(title, description, finalCategory, priorityInfo.priority, location);
    const suggestedAction = suggestNextAction(finalCategory, priorityInfo.priority, location);

    return {
      model: 'SmartResolve Heuristic NLP v1.2 (Rule-Based)',
      isSimulated: true,
      category: finalCategory,
      autoDetectedCategory: detected.category,
      categoryConfidence: detected.confidence,
      matchedKeywords: detected.matchedKeywords,
      department: detected.department,
      priority: priorityInfo.priority,
      priorityReason: priorityInfo.reason,
      summary: summary,
      suggestedAction: suggestedAction,
      timestamp: new Date().toISOString()
    };
  }

  return {
    analyzeComplaint,
    detectCategory,
    detectPriority,
    suggestNextAction,
    CATEGORY_RULES,
    HIGH_PRIORITY_KEYWORDS,
    MEDIUM_PRIORITY_KEYWORDS
  };
})();

// Export for module environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartResolveAI;
}
