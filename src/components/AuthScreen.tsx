import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, Mail, Lock, User, ChevronRight, GraduationCap, BookOpen } from 'lucide-react';
import { UserRole, StudentLevel } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'role-select' | 'level-select';

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StudentLevel | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Invalid credentials. Try student@nursing.edu or teacher@nursing.edu');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'student') {
      setMode('level-select');
    } else {
      handleRegister(role);
    }
  };

  const handleLevelSelect = (level: StudentLevel) => {
    setSelectedLevel(level);
    handleRegister('student', level);
  };

  const handleRegister = async (role: UserRole, level?: StudentLevel) => {
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await register(email, password, fullName, role, level);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const goToRegister = () => {
    setMode('register');
  };

  const goToRoleSelect = () => {
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }
    setMode('role-select');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-glow mb-4">
          <Stethoscope className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-center">NurseLearn</h1>
        <p className="text-muted-foreground text-center mt-1">Your Nursing Education Hub</p>
      </div>

      {/* Auth Form */}
      <div className="p-4 pb-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'role-select' && 'Select Your Role'}
              {mode === 'level-select' && 'Select Your Level'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Sign in to continue learning'}
              {mode === 'register' && 'Join our nursing community'}
              {mode === 'role-select' && 'Are you a student or teacher?'}
              {mode === 'level-select' && 'Which year are you in?'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {mode === 'login' && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="text-center">
                  <Button variant="link" onClick={goToRegister}>
                    Don't have an account? Sign up
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-center text-muted-foreground mb-3">Demo credentials:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="font-medium">Student</p>
                      <p className="text-muted-foreground">student@nursing.edu</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="font-medium">Teacher</p>
                      <p className="text-muted-foreground">teacher@nursing.edu</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={goToRoleSelect}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="text-center">
                  <Button variant="link" onClick={() => setMode('login')}>
                    Already have an account? Sign in
                  </Button>
                </div>
              </>
            )}

            {mode === 'role-select' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-info" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">I'm a Student</p>
                    <p className="text-sm text-muted-foreground">Access learning materials</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">I'm a Teacher</p>
                    <p className="text-sm text-muted-foreground">Upload and manage content</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <Button variant="ghost" className="w-full" onClick={() => setMode('register')}>
                  Back
                </Button>
              </div>
            )}

            {mode === 'level-select' && (
              <div className="space-y-3">
                {[100, 200, 300].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level as StudentLevel)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between',
                      'border-border hover:border-primary hover:bg-primary/5'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        level === 100 && 'bg-info/10 text-info',
                        level === 200 && 'bg-purple-500/10 text-purple-600',
                        level === 300 && 'bg-primary/10 text-primary'
                      )}>
                        {level}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Level {level}</p>
                        <p className="text-sm text-muted-foreground">
                          {level === 100 && 'First Year'}
                          {level === 200 && 'Second Year'}
                          {level === 300 && 'Third Year'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}

                <Button variant="ghost" className="w-full" onClick={() => setMode('role-select')}>
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
