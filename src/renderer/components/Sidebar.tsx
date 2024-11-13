import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface NavItem {
  path?: string;
  label: string;
  children?: NavItem[];
}

function Sidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard' },
    {
      label: 'Assets',
      children: [
        { path: '/assets/accounts', label: 'Accounts' },
        { path: '/assets/vehicles', label: 'Vehicles' },
        { path: '/assets/properties', label: 'Properties' },
        { path: '/assets/investments', label: 'Investments' },
        { path: '/assets/debt', label: 'Debt' },
      ],
    },
    { path: '/income', label: 'Income' },
    {
      label: 'Spending',
      children: [
        { path: '/spending/transactions', label: 'Transactions' },
        { path: '/spending/categories', label: 'Category Management' },
        { path: '/spending/payment-methods', label: 'Payment Methods' },
      ],
    },
    {
      label: 'Insights',
      children: [
        { path: '/insights/net-worth', label: 'Net Worth Analytics' },
        { path: '/insights/spending', label: 'Spending Analytics' },
      ],
    },
    { path: '/settings', label: 'Settings' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const sectionId = item.label.toLowerCase();
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(sectionId);

    return (
      <div key={item.path || sectionId}>
        {item.path ? (
          <Link
            to={item.path}
            className={`block px-4 py-2 rounded transition-colors ${
              location.pathname === item.path
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            style={{ paddingLeft: `${level * 12 + 16}px` }}
          >
            {item.label}
          </Link>
        ) : (
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full text-left px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            style={{ paddingLeft: `${level * 12 + 16}px` }}
          >
            {item.label}
            <span className="float-right">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
        {hasChildren && isExpanded && item.children && (
          <div className="relative">
            <div
              className="absolute left-[22px] top-0 bottom-0 border-l border-muted-foreground/20"
            />
            <div className="py-1">
              {item.children.map((child) => renderNavItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full">
      <div className="pt-2 px-2">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Blueberry Budget</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
