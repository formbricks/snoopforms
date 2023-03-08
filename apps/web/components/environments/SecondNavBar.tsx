import { cn } from "@/lib/utils";
import Link from "next/link";

interface SecondNavbarProps {
  tabs: { id: string; label: string; href: string; icon?: React.ReactNode }[];
  activeId: string;
}

export default function SecondNavbar({ tabs, activeId }: SecondNavbarProps) {
  return (
    <div>
      <div className="flex h-14 w-full items-center justify-center border bg-white">
        <nav className="flex h-full items-center space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                tab.id === activeId
                  ? " border-brand-dark border-b-2 font-semibold text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                "flex h-full items-center px-3 text-sm font-medium"
              )}
              aria-current={tab.id === activeId ? "page" : undefined}>
              {tab.icon && <div className="mr-2 h-5 w-5">{tab.icon}</div>}
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
