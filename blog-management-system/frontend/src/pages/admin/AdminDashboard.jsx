import { useState } from 'react';
import { BarChart3, Users, ShieldAlert } from 'lucide-react';
import Overview from './Overview.jsx';
import UsersTab from './UsersTab.jsx';
import ModerationTab from './ModerationTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, Component: Overview },
  { id: 'users', label: 'Users', icon: Users, Component: UsersTab },
  { id: 'moderation', label: 'Moderation', icon: ShieldAlert, Component: ModerationTab },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('overview');
  const { Component } = TABS.find((t) => t.id === active);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="mt-4 flex gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              active === t.id ? 'border-brand text-brand-dark' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Component />
      </div>
    </div>
  );
}
