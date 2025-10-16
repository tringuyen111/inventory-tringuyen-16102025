import { Search, Bell, Menu, Flag } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between border-b border-border bg-card px-8">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-muted md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-secondary pl-8 pr-2 h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 rounded-full hover:bg-muted">
          <Flag className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Change Language</span>
        </button>
        <button className="relative p-2 rounded-full hover:bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
          <span className="sr-only">Notifications</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            AA
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Anna Adame</p>
            <p className="text-xs text-muted-foreground">Founder</p>
          </div>
        </div>
      </div>
    </header>
  );
}
