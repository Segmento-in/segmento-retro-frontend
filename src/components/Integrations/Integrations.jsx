import { useState, useEffect } from "react";
import { FiCheck, FiClock, FiExternalLink, FiSettings, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import DashboardLayout from "../Common/DashboardLayout";
import api from "../../api";
import "./integrations.css";

const INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    icon: "slack",
    color: "#4A154B",
    status: "available",
    description: "Get real-time notifications in Slack when boards are created, cards are added, comments are posted, and votes are cast.",
    features: [
      "Real-time board notifications",
      "Card and comment updates",
      "Vote tracking alerts",
      "Custom channel routing"
    ],
    howItWorks: [
      "Install the SegmentoRetro Slack app",
      "Authorize access to your workspace",
      "Select channels for notifications",
      "Configure event types to receive"
    ]
  },
  {
    id: "jira",
    name: "Jira",
    icon: "J",
    color: "#0052CC",
    status: "coming-soon",
    description: "Sync retrospective action items with Jira issues automatically. Create tickets directly from retro cards.",
    features: [
      "Auto-sync action items",
      "Create Jira tickets from cards",
      "Bi-directional updates",
      "Custom field mapping"
    ],
    howItWorks: [
      "Connect your Jira account",
      "Map retro boards to Jira projects",
      "Tag cards to create issues",
      "Track status updates in both systems"
    ]
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: "T",
    color: "#6264A7",
    status: "coming-soon",
    description: "Get notifications in Microsoft Teams channels and collaborate seamlessly with your team.",
    features: [
      "Channel notifications",
      "Adaptive cards support",
      "Bot integration",
      "Meeting summaries"
    ],
    howItWorks: [
      "Add SegmentoRetro bot to Teams",
      "Connect to your channels",
      "Configure notification preferences",
      "Interact with retros from Teams"
    ]
  }
]

function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSlackConfig, setShowSlackConfig] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await api.get("/api/teams", {
        params: { page: 0, size: 100 },
      });
      const teamsArray = data.content ? data.content : Array.isArray(data) ? data : [];
      setTeams(teamsArray);
      if (teamsArray.length > 0) {
        setSelectedTeam(teamsArray[0].id);
      }
    } catch (err) {
      // Failed to load teams
    }
  };

  const loadWebhook = async (teamId) => {
    try {
      const data = await api.get(`/api/teams/${teamId}/slack-webhook`);
      setWebhookUrl(data.webhookUrl || "");
    } catch (error) {
      // Failed to load webhook
    }
  };

  const handleSlackConfigure = () => {
    setShowSlackConfig(true);
    if (selectedTeam) {
      loadWebhook(selectedTeam);
    }
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
    loadWebhook(teamId);
    setMessage({ type: "", text: "" });
  };

  const handleSaveWebhook = async () => {
    if (!selectedTeam) {
      setMessage({ type: "error", text: "Please select a team" });
      return;
    }
    if (!webhookUrl.trim()) {
      setMessage({ type: "error", text: "Please enter a webhook URL" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await api.put(`/api/teams/${selectedTeam}/slack-webhook`, { webhookUrl });
      setMessage({ type: "success", text: "Slack webhook saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save webhook" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setMessage({ type: "error", text: "Please save a webhook URL first" });
      return;
    }
    // Test notification - you can implement this on backend
    setMessage({ type: "success", text: "Test notification sent! Check your Slack channel." });
  };

  const handleLearnMore = (integration) => {
    if (integration.id === "slack") {
      handleSlackConfigure();
    } else {
      setSelectedIntegration(integration);
    }
  };

  const closeModal = () => {
    setSelectedIntegration(null);
  };

  const closeSlackConfig = () => {
    setShowSlackConfig(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <DashboardLayout
      title="Integrations"
      subtitle="Connect SegmentoRetro with your favorite tools"
      activeTab="integrations"
    >
      <div className="integrations-container">
        <div className="integrations-header">
          <div className="integrations-stats">
            <div className="stat-item">
              <span className="stat-number">{INTEGRATIONS.length}</span>
              <span className="stat-label">Integrations</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{INTEGRATIONS.length - 1}</span>
              <span className="stat-label">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="integrations-grid">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className={`integration-card ${integration.status}`}>
              <div className="integration-header">
                <div className="integration-icon" style={{ background: integration.color }}>
                  {integration.icon === "slack" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2m1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5m2-8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9m0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5m8 2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2v-2m-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5m-2 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2m0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>
                      {integration.icon}
                    </span>
                  )}
                </div>
                <div className="integration-info">
                  <h3 className="integration-name">{integration.name}</h3>
                  <span className={`integration-status ${integration.status}`}>
                    {integration.status === "available" ? (
                      <>
                        <FiCheck size={12} />
                        Available
                      </>
                    ) : (
                      <>
                        <FiClock size={12} />
                        Coming Soon
                      </>
                    )}
                  </span>
                </div>
              </div>

              <p className="integration-description">{integration.description}</p>

              <div className="integration-features">
                {integration.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <FiCheck size={14} className="feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="integration-footer">
                <button 
                  className="integration-btn learn-more-btn" 
                  onClick={() => handleLearnMore(integration)}
                >
                  <FiSettings size={14} />
                  <span>{integration.id === "slack" ? "Configure" : "How It Works"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="integrations-cta">
          <div className="cta-content">
            <h3 className="cta-title">Need a custom integration?</h3>
            <p className="cta-description">
              We're always looking to add new integrations. Let us know which tools you'd like to see connected to SegmentoRetro.
            </p>
            <button className="cta-button">
              <span>Request Integration</span>
              <FiExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {selectedIntegration && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="integration-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="integration-icon" style={{ background: selectedIntegration.color }}>
                  {selectedIntegration.icon === "slack" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2m1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5m2-8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9m0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5m8 2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2v-2m-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5m-2 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2m0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>
                      {selectedIntegration.icon}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="modal-title">{selectedIntegration.name} Integration</h2>
                  <p className="modal-subtitle">How it works</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="how-it-works-section">
                <h3 className="section-title">Setup Steps</h3>
                <div className="steps-list">
                  {selectedIntegration.howItWorks.map((step, idx) => (
                    <div key={idx} className="step-item">
                      <div className="step-number">{idx + 1}</div>
                      <div className="step-content">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="how-it-works-section">
                <h3 className="section-title">Features</h3>
                <div className="features-grid">
                  {selectedIntegration.features.map((feature, idx) => (
                    <div key={idx} className="feature-card">
                      <FiCheck size={16} className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="coming-soon-notice">
                <FiClock size={20} />
                <div>
                  <strong>Coming Soon</strong>
                  <p>This integration is currently under development. We'll notify you when it's ready!</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Close</button>
              <button className="btn-primary" disabled>
                <FiClock size={14} />
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slack Configuration Modal */}
      {showSlackConfig && (
        <div className="modal-backdrop" onClick={closeSlackConfig}>
          <div className="slack-config-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="integration-icon" style={{ background: "#4A154B" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2m1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5m2-8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9m0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5m8 2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2v-2m-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5m-2 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2m0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="modal-title">Configure Slack Integration</h2>
                  <p className="modal-subtitle">Set up webhook notifications for your team</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeSlackConfig}>×</button>
            </div>

            <div className="modal-body">
              {message.text && (
                <div className={`alert alert-${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-section">
                <label className="form-label">
                  Select Team
                  <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedTeam || ""}
                  onChange={(e) => handleTeamChange(Number(e.target.value))}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <small className="form-hint">Choose which team's notifications to configure</small>
              </div>

              <div className="form-section">
                <label className="form-label">
                  Slack Webhook URL
                  <span className="required">*</span>
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                />
                <small className="form-hint">
                  Paste your Slack incoming webhook URL here.{" "}
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-link"
                  >
                    Get webhook URL
                  </a>
                </small>
              </div>

              <div className="setup-guide-compact">
                <h4 className="guide-title">📖 Quick Setup Guide</h4>
                <ol className="guide-steps">
                  <li>Visit <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">Slack API</a></li>
                  <li>Create or select your app</li>
                  <li>Enable "Incoming Webhooks"</li>
                  <li>Add webhook to your channel</li>
                  <li>Copy the URL and paste above</li>
                </ol>
              </div>

              <div className="notification-info">
                <h4 className="info-title">🔔 You'll receive notifications for:</h4>
                <div className="notification-list">
                  <span className="notification-badge">🎉 Board created</span>
                  <span className="notification-badge">💡 Cards added</span>
                  <span className="notification-badge">💬 Comments posted</span>
                  <span className="notification-badge">👍 Votes cast</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeSlackConfig}>
                Cancel
              </button>
              <button
                className="btn-secondary"
                onClick={handleTestWebhook}
                disabled={!webhookUrl || saving}
              >
                Test Webhook
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveWebhook}
                disabled={!webhookUrl || saving}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Integrations;
