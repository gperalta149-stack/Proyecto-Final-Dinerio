import React from "react";
import "./SubscriptionTabs.css";

export type FilterKey = "all" | "active" | "paused" | "cancelled";

export interface Tab {
  key: FilterKey;
  label: string;
  count: number;
}

interface SubscriptionTabsProps {
  tabs: Tab[];
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}

export const SubscriptionTabs: React.FC<SubscriptionTabsProps> = ({ tabs, activeFilter, onFilterChange }) => (
  <div className="subs-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        className={`subs-tab ${activeFilter === tab.key ? "active" : ""}`}
        onClick={() => onFilterChange(tab.key)}
      >
        {tab.label} ({tab.count})
      </button>
    ))}
  </div>
);

export default SubscriptionTabs;
