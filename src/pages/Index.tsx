import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { AuthScreen } from '@/components/AuthScreen';
import { StudentHome } from '@/components/StudentHome';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { ContentList } from '@/components/ContentList';
import { BottomNav } from '@/components/BottomNav';
import { Settings, Bell, LogOut, User, Moon, Sun, Shield, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!user) {
    return <AuthScreen />;
  }

  // Teacher view
  if (user.role === 'teacher') {
    return (
      <>
        {activeTab === 'home' && <TeacherDashboard />}
        {activeTab === 'upload' && <TeacherDashboard />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Student view
  return (
    <>
      {activeTab === 'home' && <StudentHome />}
      {activeTab === 'notes' && <ContentList type={['pdf', 'text']} title="Notes & Documents" />}
      {activeTab === 'videos' && <ContentList type="video" title="Video Lessons" />}
      {activeTab === 'audio' && <ContentList type="audio" title="Audio Lessons" />}
      {activeTab === 'announcements' && <ContentList type={['announcement', 'study_plan']} title="Announcements" />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
};

const NotificationsScreen: React.FC = () => {
  const notifications = [
    { id: 1, title: 'New video uploaded', message: 'Patient Assessment Techniques is now available', time: '2 min ago', unread: true },
    { id: 2, title: 'Study plan updated', message: 'Week 12 study plan has been posted', time: '1 hour ago', unread: true },
    { id: 3, title: 'Announcement', message: 'Clinical rotations schedule updated', time: '3 hours ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero sticky top-0 z-40 safe-top px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Manage your alerts</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {notifications.map(notif => (
          <Card key={notif.id} className={notif.unread ? 'border-primary/30 bg-primary/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-primary' : 'bg-muted'}`} />
                <div className="flex-1">
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero sticky top-0 z-40 safe-top px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary mt-1 capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span>Push Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span>Dark Mode</span>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-5 h-5 mr-3" />
              Help Center
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="w-5 h-5 mr-3" />
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <MainApp />
      </ContentProvider>
    </AuthProvider>
  );
};

export default Index;
