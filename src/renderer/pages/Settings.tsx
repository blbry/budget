/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable promise/catch-or-return */
import { useState, useEffect } from 'react';
import { useTheme } from '@/renderer/components/ThemeProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/select';
import { Button } from '@/renderer/components/button';
import { UnitsIcon } from '@/renderer/components/icons/UnitsIcon';
import { Alert, AlertDescription } from '@/renderer/components/alert';
import { useCurrency } from '@/renderer/components/CurrencyProvider';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [version, setVersion] = useState<string>('');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currencyFormat, setCurrencyFormat] = useState('USD');
  const [location, setLocation] = useState('NY');
  const { setCurrencyFormat: setGlobalCurrencyFormat } = useCurrency();

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.settings.getAll();
      setTheme(settings.theme as 'light' | 'dark' | 'system');
      setDateFormat(settings.dateFormat);
      setCurrencyFormat(settings.currencyFormat);
      setLocation(settings.location);
    };

    loadSettings();
  }, [setTheme]);

  useEffect(() => {
    window.electron.app.getVersion().then(setVersion);
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
    window.electron.settings.update('theme', value);
  };

  const handleDateFormatChange = (value: string) => {
    setDateFormat(value);
    window.electron.settings.update('dateFormat', value);
  };

  const handleCurrencyFormatChange = (value: string) => {
    setCurrencyFormat(value);
    setGlobalCurrencyFormat(value);
    window.electron.settings.update('currencyFormat', value);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    window.electron.settings.update('location', value);
  };

  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ];

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
              <Select value={theme} onValueChange={handleThemeChange}>
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
              <Select value={dateFormat} onValueChange={handleDateFormatChange}>
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
              <Select value={currencyFormat} onValueChange={handleCurrencyFormatChange}>
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
              <Alert>
                <AlertDescription>
                  Currency conversion is symbolic only - it changes the display format but does not perform actual conversion.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={location} onValueChange={handleLocationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Alert>
                <AlertDescription>
                  We currently only support US locations.
                </AlertDescription>
              </Alert>
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
          <p className="text-sm text-muted-foreground">Version: {version}</p>
          <div className="space-y-2">
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
