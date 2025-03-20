import React, { useState, useEffect } from 'react';
import { SectionTitle } from '../shared/sectionTitle';
import { apiFetch } from '../../utils';
import { toast } from 'react-toastify';
import { validateEmail } from '../../utils';

// Types for our notification settings
interface NotificationSettings {
  telegram: {
    enabled: boolean;
    chats: string[];
  };
  email: {
    enabled: boolean;
    emails: string[];
  };
  pagerduty: {
    enabled: boolean;
    integration_key: string | null;
  };
}

// Type for alert flag
interface AlertFlag {
  alert: string;
  enabled: boolean;
}

const AlertSettings: React.FC = () => {
  // All state declarations must be at the top level of the component
  // State for notification settings
  const [settings, setSettings] = useState<NotificationSettings>({
    telegram: { enabled: false, chats: [] },
    email: { enabled: false, emails: [] },
    pagerduty: { enabled: false, integration_key: null }
  });

  // State for alert flags
  const [alertFlags, setAlertFlags] = useState<AlertFlag[]>([]);

  // State for form inputs
  const [newEmail, setNewEmail] = useState('');
  const [pagerDutyKey, setPagerDutyKey] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAlerts, setIsSavingAlerts] = useState(false);

  // Track if settings have been modified
  const [settingsModified, setSettingsModified] = useState(false);
  const [alertsModified, setAlertsModified] = useState(false);

  // Modal state
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Collapsible state for "Select Alerts" section
  const [alertsExpanded, setAlertsExpanded] = useState(true);

  // Helper to mark settings as modified
  const markAsModified = () => {
    setSettingsModified(true);
  };

  // Helper to mark alerts as modified
  const markAlertsAsModified = () => {
    setAlertsModified(true);
  };

  // No formatting for alert names
  const formatAlertName = (alertName: string) => {
    return alertName;
  };

  // Fetch notification settings and alert flags on component mount
  useEffect(() => {
    fetchSettings();
    fetchAlertFlags();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('alerts/services', 'GET');
      setSettings(response.data);

      // Initialize form values from fetched data
      if (response.data.pagerduty.integration_key) {
        setPagerDutyKey(response.data.pagerduty.integration_key);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      toast.error('Failed to load notification settings', { theme: 'dark' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch alert flags
  const fetchAlertFlags = async () => {
    try {
      setIsLoading(true);

      // Get the list of enabled alerts
      const response = await apiFetch('alerts/notifications/readable', 'GET');

      // If we get data from the API, use it to determine which alerts are enabled
      if (response.data && Array.isArray(response.data)) {
        const enabledAlerts = response.data;

        // Create the full list with enabled/disabled status
        const allAlerts = [
          { "alert": "UpdatedEigenAvs", "enabled": enabledAlerts.includes("UpdatedEigenAvs") },
          { "alert": "NewEigenAvs", "enabled": enabledAlerts.includes("NewEigenAvs") },
          { "alert": "NeedsUpdate", "enabled": enabledAlerts.includes("NeedsUpdate") },
          { "alert": "LowPerformanceScore", "enabled": enabledAlerts.includes("LowPerformanceScore") },
          { "alert": "HardwareResourceUsage", "enabled": enabledAlerts.includes("HardwareResourceUsage") },
          { "alert": "NoOperatorId", "enabled": enabledAlerts.includes("NoOperatorId") },
          { "alert": "NoMetrics", "enabled": enabledAlerts.includes("NoMetrics") },
          { "alert": "NoChainInfo", "enabled": enabledAlerts.includes("NoChainInfo") },
          { "alert": "NodeNotRunning", "enabled": enabledAlerts.includes("NodeNotRunning") },
          { "alert": "NodeNotResponding", "enabled": enabledAlerts.includes("NodeNotResponding") },
          { "alert": "MachineNotResponding", "enabled": enabledAlerts.includes("MachineNotResponding") },
          { "alert": "UnregisteredFromActiveSet", "enabled": enabledAlerts.includes("UnregisteredFromActiveSet") },
          { "alert": "ActiveSetNoDeployment", "enabled": enabledAlerts.includes("ActiveSetNoDeployment") }
        ];

        setAlertFlags(allAlerts);
      } else {
        // Initialize with all alerts disabled by default
        setAlertFlags([
          { "alert": "UpdatedEigenAvs", "enabled": false },
          { "alert": "NewEigenAvs", "enabled": false },
          { "alert": "NeedsUpdate", "enabled": false },
          { "alert": "LowPerformanceScore", "enabled": false },
          { "alert": "HardwareResourceUsage", "enabled": false },
          { "alert": "NoOperatorId", "enabled": false },
          { "alert": "NoMetrics", "enabled": false },
          { "alert": "NoChainInfo", "enabled": false },
          { "alert": "NodeNotRunning", "enabled": false },
          { "alert": "NodeNotResponding", "enabled": false },
          { "alert": "MachineNotResponding", "enabled": false },
          { "alert": "UnregisteredFromActiveSet", "enabled": false },
          { "alert": "ActiveSetNoDeployment", "enabled": false }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch alert flags:', error);
      toast.error('Failed to load alert settings', { theme: 'dark' });
      // Initialize with all alerts disabled by default
      setAlertFlags([
        { "alert": "UpdatedEigenAvs", "enabled": false },
        { "alert": "NewEigenAvs", "enabled": false },
        { "alert": "NeedsUpdate", "enabled": false },
        { "alert": "LowPerformanceScore", "enabled": false },
        { "alert": "HardwareResourceUsage", "enabled": false },
        { "alert": "NoOperatorId", "enabled": false },
        { "alert": "NoMetrics", "enabled": false },
        { "alert": "NoChainInfo", "enabled": false },
        { "alert": "NodeNotRunning", "enabled": false },
        { "alert": "NodeNotResponding", "enabled": false },
        { "alert": "MachineNotResponding", "enabled": false },
        { "alert": "UnregisteredFromActiveSet", "enabled": false },
        { "alert": "ActiveSetNoDeployment", "enabled": false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      // Prepare the updated settings
      const updatedSettings = {
        ...settings,
        pagerduty: {
          ...settings.pagerduty,
          integration_key: pagerDutyKey || null
        }
      };

      await apiFetch('alerts/services', 'POST', updatedSettings);
      toast.success('Notification settings saved successfully', { theme: 'dark' });
      setSettingsModified(false);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings', { theme: 'dark' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAlertFlags = async () => {
    try {
      setIsSavingAlerts(true);

      // Format the payload to match what the backend expects: an array of {alert, enabled} objects
      // This follows the AlertFlagUpdate structure expected by the backend
      const alertUpdates = alertFlags.map(flag => ({
        alert: flag.alert,
        enabled: flag.enabled
      }));

      // Send all alerts with their enabled/disabled state
      await apiFetch('alerts/notifications/set_flags', 'POST', alertUpdates);
      toast.success('Alert settings saved successfully', { theme: 'dark' });
      setAlertsModified(false);
    } catch (error) {
      console.error('Failed to save alert settings:', error);
      toast.error('Failed to save alert settings', { theme: 'dark' });
    } finally {
      setIsSavingAlerts(false);
    }
  };

  // Toggle enabled state for a service
  const toggleService = (service: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled
      }
    }));
    markAsModified();
  };

  // Toggle alert flag
  const toggleAlertFlag = (alertName: string) => {
    setAlertFlags(prev => prev.map(flag =>
      flag.alert === alertName ? { ...flag, enabled: !flag.enabled } : flag
    ));
    markAlertsAsModified();
  };

  // Toggle all alert flags
  const toggleAllAlertFlags = (enableAll: boolean) => {
    setAlertFlags(prev => prev.map(flag => ({ ...flag, enabled: enableAll })));
    markAlertsAsModified();
  };

  // Show Telegram instruction modal without toggling
  const showTelegramInstructions = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTelegramModal(true);
  };

  // Handle email input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);

    // Auto-enable email notifications if the user starts typing
    if (e.target.value && !settings.email.enabled) {
      toggleService('email');
    }
  };

  // Handle PagerDuty key input
  const handlePagerDutyKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagerDutyKey(e.target.value);

    // Auto-enable PagerDuty notifications if the user starts typing
    if (e.target.value && !settings.pagerduty.enabled) {
      toggleService('pagerduty');
    }
  };

  // Add a new email
  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    if (!validateEmail(newEmail)) {
      toast.warning('Please enter a valid email address', { theme: 'dark' });
      return;
    }

    if (settings.email.emails.includes(newEmail)) {
      toast.warning('This email address already exists', { theme: 'dark' });
      return;
    }

    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        emails: [...prev.email.emails, newEmail]
      }
    }));
    setNewEmail('');
    markAsModified();
  };

  // Remove an email
  const handleRemoveEmail = (email: string) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        emails: prev.email.emails.filter(e => e !== email)
      }
    }));
    markAsModified();
  };

  // UI component for alert flags section
  const renderAlertFlagsSection = () => {
    // Group alerts into columns (3 columns)
    const alertsPerColumn = Math.ceil(alertFlags.length / 3);
    const columns = [
      alertFlags.slice(0, alertsPerColumn),
      alertFlags.slice(alertsPerColumn, 2 * alertsPerColumn),
      alertFlags.slice(2 * alertsPerColumn)
    ];

    // Check if all alerts are enabled
    const allAlertsEnabled = alertFlags.every(flag => flag.enabled);

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SectionTitle title="Select Alerts" className="text-textPrimary" />
            <button
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="text-textGrey hover:text-textPrimary"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {alertsExpanded ? (
                  // Down arrow when expanded (to collapse)
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                ) : (
                  // Right arrow when collapsed (to expand)
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
          <div></div> {/* Empty div to maintain the justify-between layout */}
        </div>

        {alertsExpanded && (
          <div className="bg-widgetBg rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-textGrey/20">
              <div className="flex items-center gap-2">
                <span className="text-textPrimary font-medium">Select All</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-textSecondary">
                  {allAlertsEnabled ? 'On' : 'Off'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={allAlertsEnabled}
                    onChange={() => toggleAllAlertFlags(!allAlertsEnabled)}
                  />
                  <div className="w-11 h-6 bg-textGrey peer-focus:outline-none rounded-full peer peer-checked:bg-black bg-opacity-30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-3">
                  {column.map(flag => (
                    <div key={flag.alert} className="flex items-center justify-between">
                      <span className="text-textSecondary">{formatAlertName(flag.alert)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-textSecondary">
                          {flag.enabled ? 'On' : 'Off'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={flag.enabled}
                            onChange={() => toggleAlertFlag(flag.alert)}
                          />
                          <div className="w-11 h-6 bg-textGrey peer-focus:outline-none rounded-full peer peer-checked:bg-black bg-opacity-30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // UI components for each service
  const renderTelegramSection = () => (
    <div className="bg-widgetBg rounded-lg p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-textPrimary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h3 className="text-textPrimary font-medium">Telegram</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-textSecondary">
            {settings.telegram.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.telegram.enabled}
              onChange={() => toggleService('telegram')}
            />
            <div className="w-11 h-6 bg-textGrey peer-focus:outline-none rounded-full peer peer-checked:bg-black bg-opacity-30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
      </div>

      <div className="space-y-2 flex-grow">
        {settings.telegram.chats.length > 0 ? (
          <p className="text-textSecondary text-sm">
            {settings.telegram.chats.length} Telegram {settings.telegram.chats.length === 1 ? 'chat' : 'chats'} configured
          </p>
        ) : (
          <p className="text-textSecondary text-sm">
            Enable Telegram notifications to receive alerts through your Telegram account.
          </p>
        )}
        <p className="text-textGrey text-sm italic cursor-pointer hover:text-textSecondary" onClick={showTelegramInstructions}>
          Follow the setup instructions to connect your Telegram account.
        </p>
      </div>
    </div>
  );

  const renderEmailSection = () => (
    <div className="bg-widgetBg rounded-lg p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-textPrimary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-textPrimary font-medium">Email</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-textSecondary">
            {settings.email.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.email.enabled}
              onChange={() => toggleService('email')}
            />
            <div className="w-11 h-6 bg-textGrey peer-focus:outline-none rounded-full peer peer-checked:bg-black bg-opacity-30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={handleEmailChange}
            placeholder="Add email address"
            className="flex-1 p-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
            disabled={!settings.email.enabled}
          />
          <button
            onClick={handleAddEmail}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textprimary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!settings.email.enabled || !newEmail.trim()}
          >
            Add
          </button>
        </div>

        <div className="overflow-y-auto max-h-48">
          {settings.email.emails.length > 0 ? (
            settings.email.emails.map((email) => (
              <div key={email} className="flex items-center justify-between bg-black bg-opacity-30 p-2 rounded-lg mb-2">
                <span className="text-textSecondary truncate">{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="text-textGrey hover:text-textWarning ml-2 flex-shrink-0"
                  disabled={!settings.email.enabled}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="text-textGrey text-sm italic">
              {settings.email.enabled ?
                'Add email addresses to receive notifications.' :
                'Enable email notifications to get started.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPagerDutySection = () => (
    <div className="bg-widgetBg rounded-lg p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-textPrimary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-textPrimary font-medium">PagerDuty</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-textSecondary">
            {settings.pagerduty.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.pagerduty.enabled}
              onChange={() => toggleService('pagerduty')}
            />
            <div className="w-11 h-6 bg-textGrey peer-focus:outline-none rounded-full peer peer-checked:bg-black bg-opacity-30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <p className="text-textSecondary text-sm">
          Enable PagerDuty to receive urgent alerts through your PagerDuty service.
        </p>

        <input
          type="text"
          value={pagerDutyKey || ''}
          onChange={handlePagerDutyKeyChange}
          placeholder="Enter PagerDuty integration key"
          className="w-full p-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
          disabled={!settings.pagerduty.enabled}
        />

        <div className="text-textGrey text-sm italic">
          Add your PagerDuty integration key to connect your account.
        </div>
      </div>
    </div>
  );

  // Render Telegram setup modal
  const renderTelegramModal = () => {
    if (!showTelegramModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-widgetBg rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-textPrimary font-medium">Telegram Setup Instructions</h3>
            <button
              onClick={() => setShowTelegramModal(false)}
              className="text-textGrey hover:text-textWarning"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-textSecondary space-y-4">
            <p>Telegram notifications must be set up directly through Telegram:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open Telegram and search for the IvyNetBot (@YourIvyNetBot)</li>
              <li>Start a conversation with the bot by sending the /start command</li>
              <li>The bot will provide you with a unique chat ID</li>
              <li>Enable Telegram notifications here and the system will use this chat ID automatically</li>
            </ol>
            <p className="text-textGrey italic mt-4">Note: You must complete this setup in Telegram before notifications will work.</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTelegramModal(false)}
              className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-textGrey"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderAlertFlagsSection()}

      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg ${alertsModified ? 'bg-positive hover:bg-positive/90 text-ivywhite' : 'bg-bgButton hover:bg-textGrey text-textSecondary'} disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={saveAlertFlags}
          disabled={isSavingAlerts || !alertsModified}
        >
          {isSavingAlerts ? 'Saving...' : alertsModified ? 'Save Alert Settings' : 'Save Alert Settings'}
        </button>
      </div>

      <div>
        <SectionTitle title="Notifications Overview" className="text-textPrimary mb-6" />

        <div className="bg-contentBg space-y-4">
          {renderTelegramSection()}
          {renderEmailSection()}
          {renderPagerDutySection()}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg ${settingsModified ? 'bg-positive hover:bg-positive/90 text-ivywhite' : 'bg-bgButton hover:bg-textGrey text-textSecondary'} disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={saveSettings}
          disabled={isSaving || !settingsModified}
        >
          {isSaving ? 'Saving...' : settingsModified ? 'Save Changes' : 'Save Settings'}
        </button>
      </div>

      {renderTelegramModal()}
    </div>
  );
};

export default AlertSettings;
