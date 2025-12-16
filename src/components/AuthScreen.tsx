import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, Mail, Lock, User, ChevronRight, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

type AuthMode = 'login' | 'register' | 'role-select' | 'level-select';
type UserRole = 'student' | 'teacher';
type StudentLevel = '100' | '200' | '300';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export const AuthScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (mode === 'register' || mode === 'role-select' || mode === 'level-select') {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
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
    handleRegister('student', level);
  };

  const handleRegister = async (role: UserRole, level?: StudentLevel) => {
    try {
      await register(email, password, fullName, role, level);
      toast.success('Account created successfully!');
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    }
  };

  const goToRoleSelect = () => {
    if (!validateForm()) return;
    setMode('role-select');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-glow mb-4 animate-scale-in hover:scale-110 transition-transform duration-300">
          <Stethoscope className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-center animate-slide-up" style={{ animationDelay: '100ms' }}>NurseLearn</h1>
        <p className="text-muted-foreground text-center mt-1 animate-slide-up" style={{ animationDelay: '150ms' }}>Your Nursing Education Hub</p>
      </div>

      {/* Auth Form */}
      <div className="p-4 pb-8">
        <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
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
                <div className="space-y-1">
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
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1">
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
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>

                <div className="text-center">
                  <Button variant="link" onClick={() => setMode('register')}>
                    Don't have an account? Sign up
                  </Button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <>
                <div className="space-y-1">
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
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1">
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
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={goToRoleSelect}
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 flex items-center gap-4 disabled:opacity-50 animate-slide-up hover:-translate-y-1 hover:shadow-md"
                  style={{ animationDelay: '50ms' }}
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
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 flex items-center gap-4 disabled:opacity-50 animate-slide-up hover:-translate-y-1 hover:shadow-md"
                  style={{ animationDelay: '100ms' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">I'm a Teacher</p>
                    <p className="text-sm text-muted-foreground">Upload and manage content</p>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <Button variant="ghost" className="w-full animate-fade-in" style={{ animationDelay: '150ms' }} onClick={() => setMode('register')}>
                  Back
                </Button>
              </div>
            )}

            {mode === 'level-select' && (
              <div className="space-y-3">
                {(['100', '200', '300'] as const).map((level, index) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    disabled={isLoading}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between disabled:opacity-50 animate-slide-up hover:-translate-y-1 hover:shadow-md',
                      'border-border hover:border-primary hover:bg-primary/5'
                    )}
                    style={{ animationDelay: `${50 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        level === '100' && 'bg-info/10 text-info',
                        level === '200' && 'bg-purple-500/10 text-purple-600',
                        level === '300' && 'bg-primary/10 text-primary'
                      )}>
                        {level}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Level {level}</p>
                        <p className="text-sm text-muted-foreground">
                          {level === '100' && 'First Year'}
                          {level === '200' && 'Second Year'}
                          {level === '300' && 'Third Year'}
                        </p>
                      </div>
                    </div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                ))}

                <Button variant="ghost" className="w-full animate-fade-in" style={{ animationDelay: '200ms' }} onClick={() => setMode('role-select')}>
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
