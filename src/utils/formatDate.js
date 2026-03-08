export function formatDate(str) {
  if (!str) return null;
  try {
    return new Date(str).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return { text: null, color: null };
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    let text, color;
    
    if (diffMins < 1) {
      text = "Just now";
      color = "#10b981"; // green
    } else if (diffMins < 60) {
      text = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      color = "#10b981"; // green
    } else if (diffHours < 24) {
      text = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      color = "#3b82f6"; // blue
    } else if (diffDays < 7) {
      text = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      color = "#8b5cf6"; // purple
    } else if (diffWeeks < 4) {
      text = `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
      color = "#f59e0b"; // amber
    } else if (diffMonths < 12) {
      text = `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      color = "#ef4444"; // red
    } else {
      text = formatDate(dateStr);
      color = "#6b7280"; // gray
    }
    
    return { text, color };
  } catch {
    return { text: null, color: null };
  }
}
