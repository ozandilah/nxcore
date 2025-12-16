'use client';

import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/atoms/Logo";
import { useEffect, useRef, useState } from "react";
import ContextSelectionForm from "../ContextSelectionForm";
import { signInWithIDempiere } from "../../services/auth.actions";
import FormInputField from "@/shared/components/organisms/FormInputField";
import { SignInFormProps, SignInResult } from "../../types";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/redux-hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { 
  backToCredentials, 
  proceedToContextSelection,
  selectTempToken,
  selectTempUserName,
  selectTempPassword,
  selectAvailableClients, 
  selectCurrentStep, 
  selectIsLoading, 
  setError, 
  setLoading 
} from "../../store";

// Types for local form state
interface CredentialsForm {
  userName: string;
  password: string;
}

const SignInForm = ({ appName, appDescription }: SignInFormProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state selectors (UI flow state only)
  const tempToken = useAppSelector(selectTempToken);
  const tempUserName = useAppSelector(selectTempUserName);
  const tempPassword = useAppSelector(selectTempPassword);
  const availableClients = useAppSelector(selectAvailableClients);
  const currentStep = useAppSelector(selectCurrentStep);
  const isLoading = useAppSelector(selectIsLoading);
  
  // Local form state (credentials should NOT be in Redux)
  const [credentials, setCredentials] = useState<CredentialsForm>({
    userName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Refs for auto-focus
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus on mount
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update local form state
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCredentials = () => {
    const errors: Record<string, string> = {};
    
    if (!credentials.userName.trim()) {
      errors.userName = 'Username harus diisi';
    }
    
    if (!credentials.password) {
      errors.password = 'Password harus diisi';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(null));
    
    if (!validateCredentials()) {
      return;
    }
    
    dispatch(setLoading(true));

    console.log('📤 Submitting credentials:', { userName: credentials.userName });

    try {
      const result: SignInResult = await signInWithIDempiere(credentials);

      if (!result.success) {
        const errorMessage = result.error || 'Login gagal';
        
        dispatch(setError(errorMessage));
        toast.error(errorMessage, { duration: 5000 });
        dispatch(setLoading(false));
        return;
      }

      // Jika membutuhkan context selection
      if (result.requiresContext) {
        console.log('📊 Context selection required, clients:', result.availableClients);
        
        // Proceed to context selection step with required data
        if (result.token && result.availableClients) {
          dispatch(proceedToContextSelection({
            token: result.token,
            clients: result.availableClients,
            // Store credentials temporarily for re-login with context
            userName: credentials.userName,
            password: credentials.password,
          }));
        }
        
        dispatch(setLoading(false));
        toast.success('Username dan password benar! Silakan pilih context Anda');
        return;
      }

      // Login sukses dengan auto-selected single context
      toast.success('Login berhasil! Mengalihkan ke halaman utama...');
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      
      dispatch(setError(errorMessage));
      toast.error(errorMessage, { duration: 5000 });
      dispatch(setLoading(false));
    }
  };

  const handleContextSubmit = async (contextData: {
    clientId: number;
    clientName?: string;
    roleId: number;
    roleName?: string;
    organizationId: number;
    organizationName?: string;
    warehouseId: number;
    warehouseName?: string;
    language: string;
  }) => {
    dispatch(setLoading(true));
    
    console.log('📤 Submitting with context:', contextData);

    try {
      // Use temp credentials from Redux (stored during proceedToContextSelection)
      const result: SignInResult = await signInWithIDempiere({
        userName: tempUserName,
        password: tempPassword,
        ...contextData,
      });

      if (!result.success) {
        dispatch(setError(result.error || 'Login gagal'));
        toast.error(result.error || 'Login gagal');
        dispatch(setLoading(false));
        return;
      }

      // Login sukses
      toast.success('Login berhasil! Mengalihkan ke halaman utama...');
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Terjadi kesalahan'));
      toast.error('Terjadi kesalahan saat login');
      dispatch(setLoading(false));
    }
  };

  const handleBack = () => {
    dispatch(backToCredentials());
    setFieldErrors({});
  };

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button 
        type="submit"
        className="w-full h-10 sm:h-11 text-sm sm:text-base" 
        variant="default" 
        disabled={pending || isLoading}
      >
        {pending || isLoading ? "Memproses..." : "Sign In"}
      </Button>
    );
  }

  // Show context selection form
  if (currentStep === 'context-selection' && tempToken) {
    return (
      <ContextSelectionForm
        authToken={tempToken}
        availableClients={availableClients}
        onSubmit={handleContextSubmit}
        onBack={handleBack}
        isLoading={isLoading}
      />
    );
  }

  // Show credentials form
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10 animate-fade-in-up space-y-4 sm:space-y-5 md:space-y-6 w-full">
        <Logo size="md" className="animate-bounce-gentle" showCompanyName={false} />
        <div className="text-center space-y-2 sm:space-y-2.5 md:space-y-3 px-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {appName}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            {appDescription}
          </p>
        </div>
      </div>

      <Card className="w-full max-w-[95%] sm:max-w-md mx-auto shadow-2xl animate-scale-in border-muted/50">
        <CardHeader className="space-y-2 pb-4 sm:pb-5 md:pb-6 px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
          Login
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base text-muted-foreground">
          Masukkan kredensial iDempiere Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleCredentialsSubmit}>
        <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 md:px-8">
          <FormInputField
            ref={usernameInputRef}
            id="userName"
            name="userName"
            label="Username"
            type="text"
            placeholder="Masukkan username"
            value={credentials.userName}
            onChange={handleCredentialsChange}
            error={fieldErrors.userName}
            required
            disabled={isLoading}
            autoComplete="username"
          />

          <div className="relative">
            <FormInputField
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={credentials.password}
              onChange={handleCredentialsChange}
              error={fieldErrors.password}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              suppressHydrationWarning
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 md:px-8 pb-5 mt-5 sm:pb-6 md:pb-8">
          <SignInButton/>
        </CardFooter>
      </form>
    </Card>
    </div>
  );
}
 
export default SignInForm;
