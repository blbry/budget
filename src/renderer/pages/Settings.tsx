import { useTheme } from '../components/ThemeProvider';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
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
      </div>
    </div>
  );
}
