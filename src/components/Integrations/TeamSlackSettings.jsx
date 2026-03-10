import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';
import './TeamSlackSettings.css';

const TeamSlackSettings = ({ teamId }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!teamId) return;
    loadWebhook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const loadWebhook = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/teams/${teamId}/slack-webhook`);
      setWebhookUrl(data.webhookUrl || '');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load Slack webhook' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put(`/api/teams/${teamId}/slack-webhook`, { webhookUrl });
      setMessage({ type: 'success', text: 'Slack webhook saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save webhook' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    alert('Test notification feature coming soon!');
  };

  if (loading) {
    return <div className="loading">Loading Slack settings...</div>;
  }

  return (
    <div className="slack-settings-container">
      <div className="slack-settings-header">
        <h2>🔔 Slack Integration</h2>
        <p>Configure Slack notifications for your team's retro boards</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="slack-settings-form">
        <div className="form-group">
          <label htmlFor="webhookUrl">
            Slack Webhook URL
            <span className="required">*</span>
          </label>
          <input
            id="webhookUrl"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
            className="form-control"
          />
          <small className="form-text">
            Paste your Slack incoming webhook URL here.{' '}
            <a
              href="#setup-guide"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('setup-guide').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Need help?
            </a>
          </small>
        </div>

        <div className="button-group">
          <button
            onClick={handleSave}
            disabled={saving || !webhookUrl}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Webhook'}
          </button>
          {webhookUrl && (
            <button onClick={handleTest} className="btn btn-secondary" disabled={saving}>
              Test Notification
            </button>
          )}
        </div>
      </div>

      <div id="setup-guide" className="setup-guide">
        <h3>📖 How to Get Your Slack Webhook URL</h3>
        <ol>
          <li>
            <strong>Go to Slack API:</strong> Visit{' '}
            <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">
              https://api.slack.com/apps
            </a>
          </li>
          <li>
            <strong>Create or Select App:</strong> Create a new app or select an existing one
          </li>
          <li>
            <strong>Enable Incoming Webhooks:</strong> Go to "Incoming Webhooks" and turn it on
          </li>
          <li>
            <strong>Add Webhook to Channel:</strong> Click "Add New Webhook to Workspace"
          </li>
          <li>
            <strong>Select Channel:</strong> Choose the Slack channel for notifications (e.g., #retro-notifications)
          </li>
          <li>
            <strong>Copy URL:</strong> Copy the webhook URL and paste it above
          </li>
        </ol>

        <div className="notification-examples">
          <h4>What Notifications Will You Receive?</h4>
          <ul>
            <li>🎉 New retro board created (with clickable link)</li>
            <li>🚀 Retro session started (with join button)</li>
            <li>📋 Columns added or renamed</li>
            <li>💡 Cards created or updated</li>
            <li>💬 Comments added</li>
            <li>👍 Votes added or removed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamSlackSettings;
