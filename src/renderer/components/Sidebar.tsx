import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/net-worth', label: 'Net Worth' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/insights', label: 'Insights' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-muted p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground">Blueberry Budget</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded transition-colors ${
              location.pathname === item.path
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
