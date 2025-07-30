import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMonths } from "date-fns";
import { 
  Heart, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Save,
  Plus,
  Trash2,
  Info,
  FileText,
  Activity,
  Pill
} from "lucide-react";
import { getPersonIdFromUserId } from "@/utils/donorUtils";

interface HealthCondition {
  id: string;
  condition: string;
  diagnosisDate: string;
  treatment: string;
  notes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason: string;
}

interface HealthUpdate {
  generalHealth: string;
  conditions: HealthCondition[];
  medications: Medication[];
  allergies: string[];
  familyHistory: string;
  lifestyleFactors: {
    smoking: 'never' | 'former' | 'current';
    alcohol: 'none' | 'occasional' | 'moderate' | 'heavy';
    exercise: 'none' | 'light' | 'moderate' | 'regular';
  };
  additionalNotes: string;
  lastUpdated: Date | null;
}

const DonorHealth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const [healthData, setHealthData] = useState<HealthUpdate>({
    generalHealth: "",
    conditions: [],
    medications: [],
    allergies: [],
    familyHistory: "",
    lifestyleFactors: {
      smoking: 'never',
      alcohol: 'none',
      exercise: 'moderate'
    },
    additionalNotes: "",
    lastUpdated: null
  });

  const [newAllergy, setNewAllergy] = useState("");

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  const loadHealthData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('medical_history')
        .eq('person_id', personId)
        .single();

      if (error) throw error;

      if (donorData?.medical_history) {
        const history = donorData.medical_history;
        setHealthData({
          generalHealth: history.general_health || "",
          conditions: history.conditions || [],
          medications: history.medications || [],
          allergies: history.allergies || [],
          familyHistory: history.family_history || "",
          lifestyleFactors: history.lifestyle_factors || {
            smoking: 'never',
            alcohol: 'none',
            exercise: 'moderate'
          },
          additionalNotes: history.additional_notes || "",
          lastUpdated: history.last_updated ? new Date(history.last_updated) : null
        });
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: "Error loading health data",
        description: "Failed to load your health information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      const medicalHistory = {
        general_health: healthData.generalHealth,
        conditions: healthData.conditions,
        medications: healthData.medications,
        allergies: healthData.allergies,
        family_history: healthData.familyHistory,
        lifestyle_factors: healthData.lifestyleFactors,
        additional_notes: healthData.additionalNotes,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('donors')
        .update({ 
          medical_history: medicalHistory,
          updated_at: new Date().toISOString()
        })
        .eq('person_id', personId);

      if (error) throw error;

      setHealthData(prev => ({
        ...prev,
        lastUpdated: new Date()
      }));

      toast({
        title: "Health information updated",
        description: "Your health information has been saved successfully"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving health data:', error);
      toast({
        title: "Error saving health data",
        description: "Failed to save your health information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    const newCondition: HealthCondition = {
      id: Date.now().toString(),
      condition: "",
      diagnosisDate: "",
      treatment: "",
      notes: ""
    };
    setHealthData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const removeCondition = (id: string) => {
    setHealthData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
  };

  const updateCondition = (id: string, field: keyof HealthCondition, value: string) => {
    setHealthData(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      reason: ""
    };
    setHealthData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const removeMedication = (id: string) => {
    setHealthData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setHealthData(prev => ({
      ...prev,
      medications: prev.medications.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setHealthData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setHealthData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const getHealthStatus = () => {
    if (!healthData.lastUpdated) return 'never';
    const monthsSince = differenceInMonths(new Date(), healthData.lastUpdated);
    if (monthsSince >= 12) return 'overdue';
    if (monthsSince >= 11) return 'upcoming';
    return 'current';
  };

  const healthStatus = getHealthStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Information</h1>
          <p className="text-muted-foreground">
            Keep your health information up to date for recipient families
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Update Health Info
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              loadHealthData();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {healthStatus === 'overdue' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Health Update Overdue</AlertTitle>
          <AlertDescription>
            Your health information was last updated on {healthData.lastUpdated ? format(healthData.lastUpdated, 'MMMM d, yyyy') : 'Never'}.
            Annual updates are required to keep recipient families informed.
          </AlertDescription>
        </Alert>
      )}
      {healthStatus === 'upcoming' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Health Update Due Soon</AlertTitle>
          <AlertDescription>
            Your annual health update is due next month. Please review and update your information.
          </AlertDescription>
        </Alert>
      )}
      {healthStatus === 'current' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Health Information Current</AlertTitle>
          <AlertDescription className="text-green-700">
            Last updated on {healthData.lastUpdated ? format(healthData.lastUpdated, 'MMMM d, yyyy') : 'Never'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Health Information</CardTitle>
              <CardDescription>Overall health status and family history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalHealth">General Health Status</Label>
                <Textarea
                  id="generalHealth"
                  placeholder="Describe your overall health status..."
                  value={healthData.generalHealth}
                  onChange={(e) => setHealthData(prev => ({ ...prev, generalHealth: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="familyHistory">Family Medical History</Label>
                <Textarea
                  id="familyHistory"
                  placeholder="Include relevant family medical history..."
                  value={healthData.familyHistory}
                  onChange={(e) => setHealthData(prev => ({ ...prev, familyHistory: e.target.value }))}
                  disabled={!isEditing}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Include information about hereditary conditions, chronic diseases, or other relevant family health history
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
              <CardDescription>Current and past medical conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <Button onClick={addCondition} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Condition
                </Button>
              )}
              
              {healthData.conditions.length === 0 && !isEditing ? (
                <p className="text-muted-foreground text-center py-4">No medical conditions reported</p>
              ) : (
                <div className="space-y-4">
                  {healthData.conditions.map((condition) => (
                    <Card key={condition.id}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Condition Name</Label>
                            <Input
                              value={condition.condition}
                              onChange={(e) => updateCondition(condition.id, 'condition', e.target.value)}
                              disabled={!isEditing}
                              placeholder="e.g., Type 2 Diabetes"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Diagnosis Date</Label>
                            <Input
                              type="date"
                              value={condition.diagnosisDate}
                              onChange={(e) => updateCondition(condition.id, 'diagnosisDate', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Treatment</Label>
                          <Input
                            value={condition.treatment}
                            onChange={(e) => updateCondition(condition.id, 'treatment', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Current treatment or management"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Additional Notes</Label>
                          <Textarea
                            value={condition.notes}
                            onChange={(e) => updateCondition(condition.id, 'notes', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Any additional relevant information"
                            rows={2}
                          />
                        </div>
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCondition(condition.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>Medications you are currently taking or have taken recently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <Button onClick={addMedication} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              )}
              
              {healthData.medications.length === 0 && !isEditing ? (
                <p className="text-muted-foreground text-center py-4">No medications reported</p>
              ) : (
                <div className="space-y-4">
                  {healthData.medications.map((medication) => (
                    <Card key={medication.id}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Medication Name</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Medication name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                              disabled={!isEditing}
                              placeholder="e.g., 500mg"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                              disabled={!isEditing}
                              placeholder="e.g., Twice daily"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={medication.startDate}
                              onChange={(e) => updateMedication(medication.id, 'startDate', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date (if applicable)</Label>
                            <Input
                              type="date"
                              value={medication.endDate || ""}
                              onChange={(e) => updateMedication(medication.id, 'endDate', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Reason for Taking</Label>
                          <Input
                            value={medication.reason}
                            onChange={(e) => updateMedication(medication.id, 'reason', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Condition or reason for this medication"
                          />
                        </div>
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMedication(medication.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>List any known allergies (food, medication, environmental)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter allergy..."
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                  />
                  <Button onClick={addAllergy} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {healthData.allergies.length === 0 && !isEditing ? (
                <p className="text-muted-foreground text-center py-4">No allergies reported</p>
              ) : (
                <div className="space-y-2">
                  {healthData.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{allergy}</span>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllergy(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Factors</CardTitle>
              <CardDescription>Information about lifestyle choices that may affect health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Smoking Status</Label>
                <RadioGroup
                  value={healthData.lifestyleFactors.smoking}
                  onValueChange={(value) => setHealthData(prev => ({
                    ...prev,
                    lifestyleFactors: { ...prev.lifestyleFactors, smoking: value as any }
                  }))}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">Never smoked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="former" />
                    <Label htmlFor="former">Former smoker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" />
                    <Label htmlFor="current">Current smoker</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Alcohol Consumption</Label>
                <RadioGroup
                  value={healthData.lifestyleFactors.alcohol}
                  onValueChange={(value) => setHealthData(prev => ({
                    ...prev,
                    lifestyleFactors: { ...prev.lifestyleFactors, alcohol: value as any }
                  }))}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occasional" id="occasional" />
                    <Label htmlFor="occasional">Occasional (less than weekly)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate (1-2 times per week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heavy" id="heavy" />
                    <Label htmlFor="heavy">Heavy (daily or near daily)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Exercise Frequency</Label>
                <RadioGroup
                  value={healthData.lifestyleFactors.exercise}
                  onValueChange={(value) => setHealthData(prev => ({
                    ...prev,
                    lifestyleFactors: { ...prev.lifestyleFactors, exercise: value as any }
                  }))}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="ex-none" />
                    <Label htmlFor="ex-none">No regular exercise</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light (1-2 times per week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="ex-moderate" />
                    <Label htmlFor="ex-moderate">Moderate (3-4 times per week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">Regular (5+ times per week)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Health Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any other health information you'd like to share..."
                  value={healthData.additionalNotes}
                  onChange={(e) => setHealthData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your health information is shared with recipient families based on your privacy settings. 
          Regular updates help families make informed decisions about their health care.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DonorHealth;