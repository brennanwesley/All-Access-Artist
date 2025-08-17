import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Users, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { toast } from 'sonner';
import { 
  useProfile, 
  useUpdateProfile, 
  useReferralStats, 
  useApplyReferralCode,
} from '@/hooks/api/useProfile';

// Profile update schema
const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  billing_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
});

// Referral validation schema
const referralSchema = z.object({
  referral_code: z.string().min(6, 'Referral code must be 6 characters').max(6, 'Referral code must be 6 characters'),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ReferralFormData = z.infer<typeof referralSchema>;

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  // API hooks
  const { data: profile } = useProfile();
  const { data: referralStats } = useReferralStats();
  const updateProfileMutation = useUpdateProfile();
  const applyReferralMutation = useApplyReferralCode();

  // Profile form with dynamic defaults
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      billing_address: {},
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        billing_address: profile.billing_address || {},
      });
    }
  }, [profile, profileForm]);

  // Referral form
  const referralForm = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      referral_code: '',
    },
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    try {
      // Ensure billing_address is properly formatted
      const profileData = {
        first_name: data.first_name,
        last_name: data.last_name,
        ...(data.billing_address && Object.keys(data.billing_address).length > 0 && {
          billing_address: data.billing_address
        })
      };
      await updateProfileMutation.mutateAsync(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  const onApplyReferral = async (data: ReferralFormData) => {
    try {
      const result = await applyReferralMutation.mutateAsync(data.referral_code);
      toast.success(`Referral code applied! You earned ${result.credits_awarded} credits.`);
      referralForm.reset();
    } catch (error) {
      console.error('Referral application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply referral code. Please try again.';
      toast.error(errorMessage);
    }
  };

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;
    
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopiedReferralCode(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopiedReferralCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-full w-full sm:max-h-[90vh] max-h-screen sm:m-4 m-0 sm:rounded-lg rounded-none overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 sm:p-6 p-4">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 sm:mx-6 mx-4 mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Profile</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Billing</span>
              <span className="xs:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Referrals</span>
              <span className="xs:hidden">Refs</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Container with Responsive Height */}
          <div className="flex-1 overflow-y-auto sm:min-h-[500px] sm:max-h-[500px] min-h-0 sm:mx-6 mx-4">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 h-full">
              <Card className="h-fit">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Personal Information</CardTitle>
                  <CardDescription className="text-sm">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm">First Name *</Label>
                        <Input
                          id="first_name"
                          {...profileForm.register('first_name')}
                          className="h-10 sm:h-9"
                        />
                        {profileForm.formState.errors.first_name && (
                          <p className="text-xs sm:text-sm text-destructive">
                            {profileForm.formState.errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-sm">Last Name *</Label>
                        <Input
                          id="last_name"
                          {...profileForm.register('last_name')}
                          className="h-10 sm:h-9"
                        />
                        {profileForm.formState.errors.last_name && (
                          <p className="text-xs sm:text-sm text-destructive">
                            {profileForm.formState.errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted h-10 sm:h-9"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Email cannot be changed here. Contact support if needed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="phone"
                          value={profile?.phone || 'Not provided'}
                          disabled
                          className="bg-muted h-10 sm:h-9"
                        />
                        <Badge variant={profile?.phone_verified ? "default" : "secondary"} className="text-xs">
                          {profile?.phone_verified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={profileForm.formState.isSubmitting}
                        className="h-10 sm:h-9 px-6"
                      >
                        {profileForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 h-full">
              <Card className="h-fit">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Billing Information</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your billing address and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm">Street Address</Label>
                      <Input
                        id="street"
                        {...profileForm.register('billing_address.street')}
                        placeholder="123 Main St"
                        className="h-10 sm:h-9"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm">City</Label>
                        <Input
                          id="city"
                          {...profileForm.register('billing_address.city')}
                          placeholder="San Francisco"
                          className="h-10 sm:h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm">State</Label>
                        <Input
                          id="state"
                          {...profileForm.register('billing_address.state')}
                          placeholder="CA"
                          className="h-10 sm:h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-sm">ZIP Code</Label>
                      <Input
                        id="zip"
                        {...profileForm.register('billing_address.zip')}
                        placeholder="94105"
                        className="h-10 sm:h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Payment Method</Label>
                      <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          No payment method on file
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs sm:text-sm">
                        Payment method management will be available soon. Stripe integration is planned for future releases.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 h-full">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Your Referral Code */}
                <Card className="h-fit">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Your Referral Code</CardTitle>
                    <CardDescription className="text-sm">
                      Share this code with friends to earn credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={profile?.referral_code || ''}
                          readOnly
                          className="font-mono text-base sm:text-lg text-center h-10 sm:h-9"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyReferralCode}
                          className="h-10 w-10 sm:h-9 sm:w-9"
                        >
                          {copiedReferralCode ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        When someone uses your code, you both earn credits!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Stats */}
                <Card className="h-fit">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Referral Statistics</CardTitle>
                    <CardDescription className="text-sm">
                      Track your referral performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium">Total Referrals:</span>
                        <Badge variant="secondary" className="text-xs">{referralStats?.total_referrals || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium">Credits Earned:</span>
                        <Badge variant="default" className="text-xs">{referralStats?.total_credits || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium">Available Credits:</span>
                        <Badge variant="outline" className="text-xs">{profile?.referral_credits || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Apply Referral Code */}
                <Card className="h-fit">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Apply Referral Code</CardTitle>
                    <CardDescription className="text-sm">
                      Enter a friend's referral code to earn credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <form onSubmit={referralForm.handleSubmit(onApplyReferral)} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <Input
                            {...referralForm.register('referral_code')}
                            placeholder="Enter 6-character code"
                            className="font-mono h-10 sm:h-9"
                            maxLength={6}
                          />
                          {referralForm.formState.errors.referral_code && (
                            <p className="text-xs sm:text-sm text-destructive mt-1">
                              {referralForm.formState.errors.referral_code.message}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="submit"
                          disabled={referralForm.formState.isSubmitting}
                          className="h-10 sm:h-9 px-6 w-full sm:w-auto"
                        >
                          {referralForm.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            'Apply Code'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end pt-4 flex-shrink-0 border-t border-border/50 sm:mx-6 mx-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 sm:h-9 px-6 w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
