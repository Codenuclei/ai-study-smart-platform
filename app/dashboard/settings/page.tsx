'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    quizReminders: true,
    weeklyDigest: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-3xl py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {/* Profile Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="User Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="user@example.com" type="email" disabled />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and important information</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quizReminders" className="text-base">
                      Quiz Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Get reminded to practice your quizzes</p>
                  </div>
                  <Switch
                    id="quizReminders"
                    checked={settings.quizReminders}
                    onCheckedChange={() => handleToggle('quizReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyDigest" className="text-base">
                      Weekly Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive a summary of your weekly learning progress</p>
                  </div>
                  <Switch
                    id="weeklyDigest"
                    checked={settings.weeklyDigest}
                    onCheckedChange={() => handleToggle('weeklyDigest')}
                  />
                </div>

                <Button onClick={handleSave}>Save Preferences</Button>
              </CardContent>
            </Card>

            {/* Learning Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Default Difficulty Level</Label>
                  <select
                    id="difficulty"
                    defaultValue="medium"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <select
                    id="language"
                    defaultValue="en"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <Button onClick={handleSave}>Save Preferences</Button>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input id="oldPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Change Password</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
