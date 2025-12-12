import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { AuthScreen } from '@/components/AuthScreen';
import { StudentHome } from '@/components/StudentHome';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { ContentList } from '@/components/ContentList';
import { BottomNav } from '@/components/BottomNav';
import { Settings, Bell, LogOut, User, Moon, Shield, HelpCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';

const MainApp: React.FC = () => {
  const { user, profile, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  // Teacher view
  if (profile.role === 'teacher') {
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const { profile, logout } = useAuth();

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
                <p className="font-semibold">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <p className="text-xs text-primary mt-1 capitalize">{profile?.role}</p>
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
