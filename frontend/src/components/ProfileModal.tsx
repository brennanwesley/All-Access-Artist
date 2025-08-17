import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  // Mock profile data - will be replaced with API calls
  const mockProfile = {
    id: user?.id || '',
    first_name: 'Brennan',
    last_name: 'Tharaldson',
    email: user?.email || '',
    phone: null,
    phone_verified: false,
    billing_address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zip: '90210'
    },
    payment_method_last4: null,
    referral_code: '7WHAS2',
    referral_credits: 0,
    created_at: '2025-08-04T01:54:54.270653Z',
    updated_at: '2025-08-17T18:42:24.375249Z'
  };

  // Mock referral stats - will be replaced with API calls
  const mockReferralStats = {
    total_referrals: 0,
    total_credits: 0,
    pending_credits: 0
  };

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: mockProfile.first_name,
      last_name: mockProfile.last_name,
      billing_address: mockProfile.billing_address,
    },
  });

  // Referral form
  const referralForm = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      referral_code: '',
    },
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Updating profile:', data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const onApplyReferral = async (data: ReferralFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Applying referral code:', data.referral_code);
      toast.success('Referral code applied successfully!');
      referralForm.reset();
    } catch (error) {
      console.error('Referral application error:', error);
      toast.error('Failed to apply referral code. Please try again.');
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(mockProfile.referral_code);
      setCopiedReferralCode(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopiedReferralCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Referrals
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        {...profileForm.register('first_name')}
                      />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        {...profileForm.register('last_name')}
                      />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={mockProfile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="phone"
                        value={mockProfile.phone || 'Not provided'}
                        disabled
                        className="bg-muted"
                      />
                      <Badge variant={mockProfile.phone_verified ? "default" : "secondary"}>
                        {mockProfile.phone_verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={profileForm.formState.isSubmitting}
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
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your billing address and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...profileForm.register('billing_address.street')}
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...profileForm.register('billing_address.city')}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...profileForm.register('billing_address.state')}
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      {...profileForm.register('billing_address.zip')}
                      placeholder="94105"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      {mockProfile.payment_method_last4 ? (
                        <p className="text-sm">
                          Card ending in {mockProfile.payment_method_last4}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No payment method on file
                        </p>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Payment method management will be available soon. Stripe integration is planned for future releases.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Referral Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Code</CardTitle>
                  <CardDescription>
                    Share this code with friends to earn credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={mockProfile.referral_code}
                        readOnly
                        className="font-mono text-lg text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyReferralCode}
                      >
                        {copiedReferralCode ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When someone uses your code, you both earn credits!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral Statistics</CardTitle>
                  <CardDescription>
                    Track your referral performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Referrals:</span>
                      <Badge variant="secondary">{mockReferralStats.total_referrals}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Credits Earned:</span>
                      <Badge variant="default">{mockReferralStats.total_credits}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Available Credits:</span>
                      <Badge variant="outline">{mockProfile.referral_credits}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Apply Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle>Apply Referral Code</CardTitle>
                <CardDescription>
                  Enter a friend's referral code to earn credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={referralForm.handleSubmit(onApplyReferral)} className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        {...referralForm.register('referral_code')}
                        placeholder="Enter 6-character code"
                        className="font-mono"
                        maxLength={6}
                      />
                      {referralForm.formState.errors.referral_code && (
                        <p className="text-sm text-destructive mt-1">
                          {referralForm.formState.errors.referral_code.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit"
                      disabled={referralForm.formState.isSubmitting}
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
