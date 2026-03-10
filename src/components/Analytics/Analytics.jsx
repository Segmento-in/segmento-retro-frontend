import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrendingUp, FiUsers, FiFileText, FiCalendar } from "react-icons/fi";
import api from "../../api";
import DashboardLayout from "../Common/DashboardLayout";
import { formatRelativeTime } from "../../utils/formatDate";
import "./analytics.css";

function Analytics() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const userId = localStorage.getItem("userId");
      const data = await api.get(`/api/boards/user/${userId}`, { params: { page: 0, size: 100 } });
      // Handle paginated response
      const boardsArray = data.content ? data.content : (Array.isArray(data) ? data : []);

      // Use board data as-is - backend should provide card counts and contributor info
      // If not available, we'll show 0 instead of making N additional API calls
      const boardsWithAnalytics = boardsArray.map((board) => ({
        ...board,
        cardCount: board.cardCount || 0,
        contributorCount: board.contributorCount || 1,
      }));

      setBoards(boardsWithAnalytics);
    } catch (err) {
      // Error fetching analytics
    } finally {
      setLoading(false);
    }
  }

  const totalCards = boards.reduce((sum, board) => sum + (board.cardCount || 0), 0);
  const totalContributors = boards.reduce((sum, board) => sum + (board.contributorCount || 0), 0);

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Track your team's retrospective activity and insights"
        activeTab="analytics"
      >
        <div className="analytics-loading">
          <div className="spinner-container">
            <div className="modern-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-dot"></div>
            </div>
            <p className="loading-text">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Track your team's retrospective activity and insights"
      activeTab="analytics"
    >
      {/* Stats Cards */}
      <div className="analytics-stats">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <FiFileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{boards.length}</div>
            <div className="stat-label">Total Boards</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <FiTrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalCards}</div>
            <div className="stat-label">Total Cards</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <FiUsers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalContributors}</div>
            <div className="stat-label">Contributors</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-header">
          <h2 className="section-title">Board Overview</h2>
          <div className="section-badge">{boards.length} boards</div>
        </div>

        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th className="th-name">
                  <div className="th-content">
                    <FiFileText size={14} />
                    <span>Board Name</span>
                  </div>
                </th>
                <th className="th-date">
                  <div className="th-content">
                    <FiCalendar size={14} />
                    <span>Created</span>
                  </div>
                </th>
                <th className="th-date">
                  <div className="th-content">
                    <FiCalendar size={14} />
                    <span>Last Modified</span>
                  </div>
                </th>
                <th className="th-number">
                  <div className="th-content">
                    <FiTrendingUp size={14} />
                    <span>Cards</span>
                  </div>
                </th>
                <th className="th-number">
                  <div className="th-content">
                    <FiUsers size={14} />
                    <span>Contributors</span>
                  </div>
                </th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state-table">
                      <FiFileText size={48} color="#cbd5e0" />
                      <p>No boards found</p>
                      <span>Create your first board to see analytics</span>
                    </div>
                  </td>
                </tr>
              ) : (
                boards.map((board, index) => {
                  const createdTime = formatRelativeTime(board.createdAt);
                  const modifiedTime = formatRelativeTime(board.updatedAt || board.createdAt);
                  
                  return (
                    <tr key={board.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="board-name">
                        <div className="board-name-content">
                          <div className="board-avatar" style={{ 
                            background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][index % 5]} 0%, ${['#764ba2', '#f5576c', '#00f2fe', '#38f9d7', '#fee140'][index % 5]} 100%)`
                          }}>
                            {board.title.charAt(0).toUpperCase()}
                          </div>
                          <span>{board.title}</span>
                        </div>
                      </td>
                      <td className="date-cell">
                        <div className="date-chip" style={{ 
                          background: `${createdTime.color}15`,
                          color: createdTime.color 
                        }}>
                          {createdTime.text}
                        </div>
                      </td>
                      <td className="date-cell">
                        <div className="date-chip" style={{ 
                          background: `${modifiedTime.color}15`,
                          color: modifiedTime.color 
                        }}>
                          {modifiedTime.text}
                        </div>
                      </td>
                      <td className="number-cell">
                        <div className="metric-badge metric-cards">
                          {board.cardCount || 0}
                        </div>
                      </td>
                      <td className="number-cell">
                        <div className="metric-badge metric-contributors">
                          {board.contributorCount || 1}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/board/${board.id}`)}
                        >
                          <FiEye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Analytics;
