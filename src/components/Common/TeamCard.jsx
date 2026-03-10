import { FiUsers, FiX, FiUserPlus, FiTrash2, FiTrash } from "react-icons/fi";
import { getInitials } from "../../utils";
import { PALETTE } from "../../utils";
import { useState, useEffect } from "react";
import api from "../../api";

export default function TeamCard({ team, idx, isDeleting, onTeamDeleted }) {
  const { bg, accent } = PALETTE[idx % PALETTE.length];
  const memberDetails = team.memberDetails || [];
  const memberCount = memberDetails.length || team.members?.length || 0;
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [fullTeamData, setFullTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleCardClick = async () => {
    setShowMembersModal(true);
    await fetchTeamDetails();
  };

  const fetchTeamDetails = async () => {
    if (team.id) {
      setLoading(true);
      try {
        const data = await api.get(`/api/teams/${team.id}`);
        setFullTeamData(data);
      } catch (error) {
        // Error fetching team details
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get("/api/users", { params: { page: 0, size: 100 } });
      const users = response.content || response;
      setAllUsers(users);
    } catch (error) {
      // Error fetching users
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    try {
      await api.post(`/api/teams/${team.id}/members/${selectedUserId}`);
      await fetchTeamDetails();
      setShowAddMember(false);
      setSelectedUserId("");
    } catch (error) {
      alert("Failed to add member: " + (error.message || "Unknown error"));
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await api.delete(`/api/teams/${team.id}/members/${memberId}`);
      await fetchTeamDetails();
    } catch (error) {
      alert("Failed to remove member: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/api/teams/${team.id}`);
      setShowMembersModal(false);
      if (onTeamDeleted) {
        onTeamDeleted(team.id);
      }
    } catch (error) {
      alert("Failed to delete team: " + (error.message || "Unknown error"));
    }
  };

  useEffect(() => {
    if (showAddMember) {
      fetchAllUsers();
    }
  }, [showAddMember]);

  const displayMembers = fullTeamData?.memberDetails || memberDetails;
  const currentMemberIds = displayMembers.map(m => m.id);
  const availableUsers = allUsers.filter(u => !currentMemberIds.includes(u.id));

  return (
    <>
      <div
        className="dash-card"
        style={{
          background: bg,
          position: "relative",
          opacity: isDeleting ? 0.5 : 1,
          pointerEvents: isDeleting ? "none" : "auto",
          transition: "opacity 0.3s ease",
          cursor: "pointer",
        }}
        onClick={handleCardClick}
      >
        <div className="dash-card-accent" style={{ background: accent }} />
        <div className="dash-card-body">
          <div className="dash-card-avatar" style={{ background: accent }}>
            {getInitials(team.name)}
          </div>
          <div className="dash-card-info">
            <h3 className="dash-card-title">{team.name}</h3>
            <span className="dash-card-meta" style={{ color: accent }}>
              <FiUsers
                size={11}
                style={{ marginRight: 3, verticalAlign: "middle" }}
              />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>

        {memberDetails.length > 0 && (
          <div className="mini-avatars">
            {memberDetails.slice(0, 4).map((member, mi) => (
              <div
                key={member.id || mi}
                className="mini-avatar"
                style={{ background: PALETTE[(mi + 2) % PALETTE.length].accent }}
                title={member.name}
              >
                {getInitials(member.name)}
              </div>
            ))}
            {memberDetails.length > 4 && (
              <div className="mini-avatar mini-avatar--more">
                +{memberDetails.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{team.name} - Members</h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="btn-delete-team"
                  onClick={handleDeleteTeam}
                  title="Delete team"
                >
                  <FiTrash size={18} />
                </button>
                <button
                  className="modal-close"
                  onClick={() => setShowMembersModal(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              {!showAddMember && (
                <button
                  className="btn-add-member"
                  onClick={() => setShowAddMember(true)}
                >
                  <FiUserPlus size={16} style={{ marginRight: 6 }} />
                  Add Member
                </button>
              )}

              {showAddMember && (
                <div className="add-member-form">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="user-select"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      className="btn-primary"
                      onClick={handleAddMember}
                      disabled={!selectedUserId}
                    >
                      Add
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setShowAddMember(false);
                        setSelectedUserId("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <span className="spinner" />
                </div>
              ) : displayMembers.length > 0 ? (
                <div className="members-list">
                  {displayMembers.map((member, idx) => (
                    <div key={member.id || idx} className="member-item">
                      <div
                        className="member-avatar"
                        style={{ background: PALETTE[(idx + 2) % PALETTE.length].accent }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                      <button
                        className="btn-remove-member"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px" }}>
                  No members in this team
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
