import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Heart, Eye, EyeOff, Dna, Check, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { donorAuthService } from "@/services/donorAuthService";

const DonorAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    donorNumber: "",
    cryobankName: "",
    donorType: "sperm",
    isAnonymous: true,
    agreeToTerms: false,
    consentToContact: false
  });

  useEffect(() => {
    // Check for invite token in URL
    const token = searchParams.get('token');
    if (token) {
      setInviteToken(token);
      // Pre-fill data if available
      // TODO: Fetch invite details using token
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('Donor authenticated, redirecting to donor dashboard');
      navigate("/donor/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Get the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          // Check if user is a donor
          const isDonor = await donorAuthService.isDonor(currentUser.id);
          
          if (isDonor) {
            toast({
              title: "Welcome back!",
              description: "Redirecting to your donor portal...",
            });
            navigate("/donor/dashboard");
          } else {
            toast({
              title: "Access denied",
              description: "This portal is for donors only.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        }
      }
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.agreeToTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the donor auth service to create the complete donor profile
      const { user, person, donor, error } = await donorAuthService.signUpDonor({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.fullName,
        donorNumber: signUpData.donorNumber,
        cryobankName: signUpData.cryobankName,
        donorType: signUpData.donorType as 'sperm' | 'egg' | 'embryo' | 'other',
        isAnonymous: signUpData.isAnonymous,
        consentToContact: signUpData.consentToContact
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      // Move to next step for profile completion
      setStep(2);
      
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              Account Created Successfully!
            </CardTitle>
            <CardDescription>
              Your donor account has been created. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Check your email for verification link</li>
                  <li>Click the link to verify your account</li>
                  <li>Return here to sign in and complete your profile</li>
                </ol>
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => {
                setStep(1);
                // Switch to sign in tab
              }}
            >
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-light tracking-wide text-foreground">
            Donor Portal
          </span>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-light text-center">
              Welcome to the Donor Portal
            </CardTitle>
            <CardDescription className="text-center">
              Manage your profile and connect with families
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={handleSignInChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={handleSignUpChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-donor-number">Donor Number (Optional)</Label>
                    <Input
                      id="signup-donor-number"
                      name="donorNumber"
                      type="text"
                      placeholder="e.g., 12345"
                      value={signUpData.donorNumber}
                      onChange={handleSignUpChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-cryobank">Cryobank/Clinic Name (Optional)</Label>
                    <Input
                      id="signup-cryobank"
                      name="cryobankName"
                      type="text"
                      placeholder="e.g., California Cryobank"
                      value={signUpData.cryobankName}
                      onChange={handleSignUpChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Donor Type</Label>
                    <RadioGroup 
                      value={signUpData.donorType}
                      onValueChange={(value) => setSignUpData(prev => ({ ...prev, donorType: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sperm" id="sperm" />
                        <Label htmlFor="sperm">Sperm Donor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="egg" id="egg" />
                        <Label htmlFor="egg">Egg Donor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="embryo" id="embryo" />
                        <Label htmlFor="embryo">Embryo Donor</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={signUpData.isAnonymous}
                        onCheckedChange={(checked) => 
                          setSignUpData(prev => ({ ...prev, isAnonymous: checked as boolean }))
                        }
                      />
                      <Label htmlFor="anonymous" className="text-sm">
                        I wish to remain anonymous to recipient families
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consent"
                        checked={signUpData.consentToContact}
                        onCheckedChange={(checked) => 
                          setSignUpData(prev => ({ ...prev, consentToContact: checked as boolean }))
                        }
                      />
                      <Label htmlFor="consent" className="text-sm">
                        I consent to be contacted about important health updates
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={signUpData.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setSignUpData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the <Link to="/terms" className="underline">terms and conditions</Link>
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !signUpData.agreeToTerms}
                  >
                    {isLoading ? "Creating account..." : "Create Donor Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Are you a recipient family? <Link to="/auth" className="underline">Sign up here</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorAuth;