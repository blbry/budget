/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable promise/catch-or-return */
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select';
import { Button } from '../components/button';
import { UnitsIcon } from '../components/icons/UnitsIcon';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [version, setVersion] = useState<string>('');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currencyFormat, setCurrencyFormat] = useState('USD');

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
              <Select defaultValue={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date Format</label>
              <Select defaultValue={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Currency Format</label>
              <Select defaultValue={currencyFormat} onValueChange={setCurrencyFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="NMS">
                    No Man&apos;s Sky Units (<UnitsIcon />)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="flex gap-4">
            <Button variant="outline">Export Data</Button>
            <Button variant="destructive">Restore Data</Button>
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
