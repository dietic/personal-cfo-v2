"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Personal CFO</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {profile?.name || user.email}
            </p>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back, {profile?.name || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your finances
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.name} {profile?.last_name || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Plan</p>
                <p className="text-sm capitalize text-muted-foreground">
                  {profile?.plan || "free"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.primary_currency || "PEN"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📤 Upload Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💳 Add Card
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Set Budget
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Everything is operational</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="text-sm text-green-600">● Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm text-green-600">● Ready</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Modules */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold">Coming Soon</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Cards", icon: "💳", path: "/cards" },
              { name: "Transactions", icon: "💸", path: "/transactions" },
              { name: "Statements", icon: "📄", path: "/statements" },
              { name: "Analytics", icon: "📊", path: "/analytics" },
              { name: "Budgets", icon: "🎯", path: "/budgets" },
              { name: "Alerts", icon: "🔔", path: "/alerts" },
              { name: "Settings", icon: "⚙️", path: "/settings" },
              { name: "Admin", icon: "👑", path: "/admin" },
            ].map((module) => (
              <Card key={module.path} className="cursor-not-allowed opacity-60">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{module.icon}</span>
                  <span className="font-medium">{module.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
