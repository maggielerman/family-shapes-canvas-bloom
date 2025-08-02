import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Heart, 
  Building2, 
  Users, 
  Shield,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export default function StyleGuide() {
  return (
    <div className="responsive-page-container">
      <div className="responsive-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="responsive-title mb-4">
            Family Shapes <span className="text-coral-600">Brand Style Guide</span>
          </h1>
          <p className="responsive-description max-w-3xl mx-auto">
            Our comprehensive design system ensures consistency, accessibility, and a cohesive user experience across all platforms.
          </p>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="principles" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Principles
            </TabsTrigger>
          </TabsList>

          {/* Colors Section */}
          <TabsContent value="colors" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Primary Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-coral-600" />
                    Primary Colors
                  </CardTitle>
                  <CardDescription>
                    Our primary coral color represents warmth, care, and human connection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 50</div>
                        <div className="text-muted-foreground">#fef7f4</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 100</div>
                        <div className="text-muted-foreground">#fdeee8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 200</div>
                        <div className="text-muted-foreground">#fad9cd</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 300</div>
                        <div className="text-muted-foreground">#f5bba8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 400</div>
                        <div className="text-muted-foreground">#ee9176</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 500</div>
                        <div className="text-muted-foreground">#e36749</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 600</div>
                        <div className="text-muted-foreground">#d04a29</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 700</div>
                        <div className="text-muted-foreground">#b0391f</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 800</div>
                        <div className="text-muted-foreground">#91321e</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-coral-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Coral 900</div>
                        <div className="text-muted-foreground">#772e1f</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-navy-600" />
                    Secondary Colors
                  </CardTitle>
                  <CardDescription>
                    Navy blue represents trust, professionalism, and stability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 50</div>
                        <div className="text-muted-foreground">#f7f8fa</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 100</div>
                        <div className="text-muted-foreground">#eef1f5</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 200</div>
                        <div className="text-muted-foreground">#d9e0e8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 300</div>
                        <div className="text-muted-foreground">#b8c7d4</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 400</div>
                        <div className="text-muted-foreground">#91a7bc</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 500</div>
                        <div className="text-muted-foreground">#718ba6</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 600</div>
                        <div className="text-muted-foreground">#597393</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 700</div>
                        <div className="text-muted-foreground">#495e78</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 800</div>
                        <div className="text-muted-foreground">#3e4f64</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-navy-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Navy 900</div>
                        <div className="text-muted-foreground">#364354</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Sage Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-sage-600" />
                    Sage Colors
                  </CardTitle>
                  <CardDescription>
                    Sage green represents growth, harmony, and natural balance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 50</div>
                        <div className="text-muted-foreground">#f8faf8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 100</div>
                        <div className="text-muted-foreground">#f0f4f0</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 200</div>
                        <div className="text-muted-foreground">#e2ebe2</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 300</div>
                        <div className="text-muted-foreground">#c9d8c9</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 400</div>
                        <div className="text-muted-foreground">#a8c0a8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 500</div>
                        <div className="text-muted-foreground">#82a182</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 600</div>
                        <div className="text-muted-foreground">#5f8260</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 700</div>
                        <div className="text-muted-foreground">#4a6b4b</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 800</div>
                        <div className="text-muted-foreground">#3a543b</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-sage-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Sage 900</div>
                        <div className="text-muted-foreground">#2d412e</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terracotta Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-terracotta-600" />
                    Terracotta Colors
                  </CardTitle>
                  <CardDescription>
                    Terracotta represents warmth, earthiness, and organic connection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 50</div>
                        <div className="text-muted-foreground">#fdf8f6</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 100</div>
                        <div className="text-muted-foreground">#f9f0ed</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 200</div>
                        <div className="text-muted-foreground">#f2e0d9</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 300</div>
                        <div className="text-muted-foreground">#e8c8bc</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 400</div>
                        <div className="text-muted-foreground">#d9a894</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 500</div>
                        <div className="text-muted-foreground">#c88a6c</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 600</div>
                        <div className="text-muted-foreground">#b06d4e</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 700</div>
                        <div className="text-muted-foreground">#95573d</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 800</div>
                        <div className="text-muted-foreground">#7a4632</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-terracotta-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Terracotta 900</div>
                        <div className="text-muted-foreground">#633a2a</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Deep Blue Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-deep-blue-600" />
                    Deep Blue Colors
                  </CardTitle>
                  <CardDescription>
                    Deep blue represents depth, sophistication, and professional trust.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 50</div>
                        <div className="text-muted-foreground">#f0f2f7</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 100</div>
                        <div className="text-muted-foreground">#e1e5ef</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 200</div>
                        <div className="text-muted-foreground">#c3cbe0</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 300</div>
                        <div className="text-muted-foreground">#9ba8c8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 400</div>
                        <div className="text-muted-foreground">#6b7ba8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 500</div>
                        <div className="text-muted-foreground">#4a5a8a</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 600</div>
                        <div className="text-muted-foreground">#3a4970</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 700</div>
                        <div className="text-muted-foreground">#2f3b5a</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 800</div>
                        <div className="text-muted-foreground">#283147</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-deep-blue-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Deep Blue 900</div>
                        <div className="text-muted-foreground">#0F1632</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ocean Blue Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-ocean-blue-600" />
                    Ocean Blue Colors
                  </CardTitle>
                  <CardDescription>
                    Ocean blue represents trust, reliability, and professional communication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-50 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 50</div>
                        <div className="text-muted-foreground">#f0f8ff</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-100 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 100</div>
                        <div className="text-muted-foreground">#e0f2fe</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-200 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 200</div>
                        <div className="text-muted-foreground">#bae6fd</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-300 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 300</div>
                        <div className="text-muted-foreground">#7dd3fc</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-400 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 400</div>
                        <div className="text-muted-foreground">#38bdf8</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-500 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 500</div>
                        <div className="text-muted-foreground">#005DBC</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-600 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 600</div>
                        <div className="text-muted-foreground">#0052a3</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-700 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 700</div>
                        <div className="text-muted-foreground">#004785</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-800 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 800</div>
                        <div className="text-muted-foreground">#003c6b</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-ocean-blue-900 rounded-lg border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Ocean Blue 900</div>
                        <div className="text-muted-foreground">#003152</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Semantic Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>
                  Colors used to convey meaning and status throughout the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Success</span>
                    </div>
                    <div className="h-12 bg-green-500 rounded-lg"></div>
                    <div className="text-sm text-muted-foreground">Used for confirmations and positive actions</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Error</span>
                    </div>
                    <div className="h-12 bg-red-500 rounded-lg"></div>
                    <div className="text-sm text-muted-foreground">Used for errors and destructive actions</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Info</span>
                    </div>
                    <div className="h-12 bg-blue-500 rounded-lg"></div>
                    <div className="text-sm text-muted-foreground">Used for informational messages</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <div className="h-12 bg-yellow-500 rounded-lg"></div>
                    <div className="text-sm text-muted-foreground">Used for warnings and cautions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Color Usage Guidelines</CardTitle>
                <CardDescription>
                  How to properly use our color palette in different contexts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Primary Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full">Primary Button</Button>
                      <p className="text-sm text-muted-foreground">
                        Use coral-600 for primary CTAs, main actions, and key interactions.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Secondary Actions</h4>
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full">Secondary Button</Button>
                      <p className="text-sm text-muted-foreground">
                        Use navy for secondary actions, alternative options, and supporting elements.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Text Hierarchy</h4>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold">Primary Heading</h1>
                      <h2 className="text-xl font-semibold text-navy-700">Secondary Heading</h2>
                              <p className="text-sage-600">Sage text for subtle emphasis</p>
        <p className="text-terracotta-600">Terracotta text for warm accents</p>
        <p className="text-deep-blue-600">Deep blue text for professional emphasis</p>
        <p className="text-ocean-blue-600">Ocean blue text for trust and reliability</p>
        <p className="text-muted-foreground">Body text with proper contrast</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Interactive Elements</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="default">Primary Badge</Badge>
                                <Badge variant="secondary">Secondary Badge</Badge>
        <Badge className="bg-sage-100 text-sage-700 border-sage-200">Sage Badge</Badge>
        <Badge className="bg-terracotta-100 text-terracotta-700 border-terracotta-200">Terracotta Badge</Badge>
        <Badge className="bg-deep-blue-100 text-deep-blue-700 border-deep-blue-200">Deep Blue Badge</Badge>
        <Badge className="bg-ocean-blue-100 text-ocean-blue-700 border-ocean-blue-200">Ocean Blue Badge</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use appropriate colors for badges, links, and interactive elements.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Section */}
          <TabsContent value="typography" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Headings */}
              <Card>
                <CardHeader>
                  <CardTitle>Typography Scale</CardTitle>
                  <CardDescription>
                    Our typography hierarchy ensures clear content structure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold">Heading 1</h1>
                    <p className="text-sm text-muted-foreground">Font size: 2.25rem (36px)</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold">Heading 2</h2>
                    <p className="text-sm text-muted-foreground">Font size: 1.875rem (30px)</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">Heading 3</h3>
                    <p className="text-sm text-muted-foreground">Font size: 1.5rem (24px)</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-medium">Heading 4</h4>
                    <p className="text-sm text-muted-foreground">Font size: 1.25rem (20px)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Body Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Body Text</CardTitle>
                  <CardDescription>
                    Body text styles for different content types.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg">Large body text (18px)</p>
                    <p className="text-base">Regular body text (16px)</p>
                    <p className="text-sm">Small body text (14px)</p>
                    <p className="text-xs">Extra small text (12px)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Muted text for secondary information</p>
                    <p className="text-sm text-muted-foreground">Small muted text for captions</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Font Family */}
            <Card>
              <CardHeader>
                <CardTitle>Font Family</CardTitle>
                <CardDescription>
                  We use Inter as our primary font family for optimal readability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Font: Inter</h4>
                    <p className="text-lg">
                      The quick brown fox jumps over the lazy dog. 0123456789
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Font Weights</h4>
                    <div className="space-y-1">
                      <p className="font-light">Light (300) - Light text for subtle emphasis</p>
                      <p className="font-normal">Normal (400) - Default body text weight</p>
                      <p className="font-medium">Medium (500) - Medium emphasis for labels</p>
                      <p className="font-semibold">Semibold (600) - Strong emphasis for headings</p>
                      <p className="font-bold">Bold (700) - Maximum emphasis for titles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Section */}
          <TabsContent value="components" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>
                    Button variants for different interaction contexts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button>Primary Button</Button>
                    <p className="text-sm text-muted-foreground">Default primary action</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="secondary">Secondary Button</Button>
                    <p className="text-sm text-muted-foreground">Secondary or alternative action</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline">Outline Button</Button>
                    <p className="text-sm text-muted-foreground">Subtle action or navigation</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="destructive">Destructive Button</Button>
                    <p className="text-sm text-muted-foreground">Dangerous or destructive action</p>
                  </div>
                </CardContent>
              </Card>

              {/* Form Elements */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                  <CardDescription>
                    Input fields and form controls with consistent styling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="example">Input Field</Label>
                    <Input id="example" placeholder="Enter text here" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabled">Disabled Input</Label>
                    <Input id="disabled" placeholder="Disabled field" disabled />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cards and Layout */}
            <Card>
              <CardHeader>
                <CardTitle>Cards and Layout</CardTitle>
                <CardDescription>
                  Card components for content organization and layout structure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>Card description text</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Card content goes here with proper spacing and typography.</p>
                    </CardContent>
                  </Card>
                  <div className="space-y-4">
                    <h4 className="font-medium">Layout Principles</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use consistent spacing (4px, 8px, 16px, 24px, 32px)</li>
                      <li>• Maintain visual hierarchy with typography</li>
                      <li>• Group related elements together</li>
                      <li>• Use cards to organize content sections</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Principles Section */}
          <TabsContent value="principles" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Core Principles */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Design Principles</CardTitle>
                  <CardDescription>
                    The fundamental principles that guide our design decisions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-coral-600">Human-Centered</h4>
                    <p className="text-sm text-muted-foreground">
                      Every design decision prioritizes the needs and experiences of families, donors, and healthcare professionals.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-navy-600">Trustworthy</h4>
                    <p className="text-sm text-muted-foreground">
                      Our design conveys reliability, security, and professionalism in handling sensitive family data.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-coral-600">Accessible</h4>
                    <p className="text-sm text-muted-foreground">
                      All interfaces meet WCAG guidelines and work for users with diverse abilities and needs.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-navy-600">Consistent</h4>
                    <p className="text-sm text-muted-foreground">
                      Unified design language across all platforms and touchpoints for seamless user experience.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Values */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Values</CardTitle>
                  <CardDescription>
                    The values that shape our visual and interaction design.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-coral-600" />
                    <div>
                      <h4 className="font-medium">Compassion</h4>
                      <p className="text-sm text-muted-foreground">Warm, caring, and empathetic design</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-navy-600" />
                    <div>
                      <h4 className="font-medium">Security</h4>
                      <p className="text-sm text-muted-foreground">Trustworthy and protective design</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-coral-600" />
                    <div>
                      <h4 className="font-medium">Connection</h4>
                      <p className="text-sm text-muted-foreground">Facilitating meaningful relationships</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-navy-600" />
                    <div>
                      <h4 className="font-medium">Professional</h4>
                      <p className="text-sm text-muted-foreground">Reliable and industry-standard design</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accessibility Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Guidelines</CardTitle>
                <CardDescription>
                  Ensuring our design is inclusive and accessible to all users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Color Contrast</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Minimum 4.5:1 contrast ratio for normal text</li>
                      <li>• Minimum 3:1 contrast ratio for large text</li>
                      <li>• Don't rely solely on color to convey information</li>
                      <li>• Test with color blindness simulators</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Interactive Elements</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Minimum 44px touch targets on mobile</li>
                      <li>• Clear focus indicators for keyboard navigation</li>
                      <li>• Descriptive labels for screen readers</li>
                      <li>• Logical tab order and navigation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 