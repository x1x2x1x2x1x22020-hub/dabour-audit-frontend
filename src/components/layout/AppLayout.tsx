import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  BookOpen, 
  Briefcase, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة القيادة", nameEn: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "العملاء", nameEn: "Clients", href: "/clients", icon: Users },
  { name: "شجرة الحسابات", nameEn: "Accounts", href: "/accounts", icon: Briefcase },
  { name: "القيود اليومية", nameEn: "Journal", href: "/journal", icon: BookOpen },
  { name: "التقارير", nameEn: "Reports", href: "/reports", icon: FileText },
  { name: "التحليل المالي", nameEn: "Analysis", href: "/analysis", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground rtl:dir-rtl">
      <aside className="hidden md:flex w-64 flex-col border-l border-border bg-card">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-accent-foreground">D</div>
            <span>Dabour Audit</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs opacity-70">{item.nameEn}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border p-4">
          <Link href="/login" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span>تسجيل الخروج</span>
              <span className="text-xs opacity-70">Logout</span>
            </div>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
