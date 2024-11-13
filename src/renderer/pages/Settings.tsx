import { useTheme } from '../components/ThemeProvider';
import { useState, useEffect } from 'react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.electron.app.getVersion().then(setVersion);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-8 max-w-md">
        {/* Appearance Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="p-2 rounded-md border bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date Format</label>
              <select
                className="p-2 rounded-md border bg-background"
                defaultValue="MM/DD/YYYY"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Currency Format</label>
              <select
                className="p-2 rounded-md border bg-background"
                defaultValue="USD"
              >
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Export Data
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
              Restore Data
            </button>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Version: </span>
              <span className="text-sm">{version}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Made with ❤️ by </span>
              <a
                href="https://github.com/blbry"
                className="text-sm text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Blueberry
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
