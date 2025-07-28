import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Globe, TrendingUp, Users, Play, Headphones } from "lucide-react";
import { useState, useRef } from 'react';
import * as THREE from 'three';

// Sample listening data by country
const countryData = [
  { country: "United States", listeners: 125000, streams: 890000, position: [0, 0.4, 0.9] },
  { country: "United Kingdom", listeners: 85000, streams: 650000, position: [-0.1, 0.5, 0.85] },
  { country: "Canada", listeners: 45000, streams: 320000, position: [-0.6, 0.6, 0.5] },
  { country: "Australia", listeners: 32000, streams: 180000, position: [0.8, -0.5, 0.3] },
  { country: "Germany", listeners: 78000, streams: 540000, position: [0.1, 0.4, 0.9] },
  { country: "France", listeners: 56000, streams: 410000, position: [0.0, 0.45, 0.9] },
  { country: "Brazil", listeners: 67000, streams: 480000, position: [-0.3, -0.2, 0.9] },
  { country: "Japan", listeners: 43000, streams: 350000, position: [0.7, 0.3, 0.6] },
  { country: "South Korea", listeners: 38000, streams: 290000, position: [0.65, 0.35, 0.65] },
  { country: "Mexico", listeners: 51000, streams: 380000, position: [-0.5, 0.2, 0.8] }
];

const Globe3D = ({ onCountryHover }: { onCountryHover: (country: any) => void }) => {
  const globeRef = useRef<THREE.Mesh>(null);

  const CountryMarker = ({ position, data }: { position: [number, number, number], data: any }) => {
    const [hovered, setHovered] = useState(false);
    
    return (
      <group position={position}>
        <Sphere
          args={[0.02, 8, 6]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onCountryHover(data);
          }}
          onPointerOut={() => {
            setHovered(false);
            onCountryHover(null);
          }}
        >
          <meshStandardMaterial 
            color={hovered ? "#3b82f6" : "#ef4444"} 
            emissive={hovered ? "#1e40af" : "#dc2626"}
            emissiveIntensity={0.2}
          />
        </Sphere>
        {hovered && (
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.05}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {data.country}
          </Text>
        )}
      </group>
    );
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Sphere ref={globeRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1e293b"
          roughness={0.8}
          metalness={0.1}
          wireframe={true}
          wireframeLinewidth={1}
        />
      </Sphere>
      
      <Sphere args={[0.99, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#0f172a"
          transparent={true}
          opacity={0.3}
        />
      </Sphere>
      
      {countryData.map((country, index) => (
        <CountryMarker
          key={index}
          position={country.position as [number, number, number]}
          data={country}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={5}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

export const Analytics = () => {
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  
  const totalListeners = countryData.reduce((sum, country) => sum + country.listeners, 0);
  const totalStreams = countryData.reduce((sum, country) => sum + country.streams, 0);
  
  const topCountries = [...countryData]
    .sort((a, b) => b.listeners - a.listeners)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground mt-2">
            Deep insights into your music performance worldwide
          </p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary mr-2" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalListeners.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Listeners</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-5 w-5 text-primary mr-2" />
            </div>
            <div className="text-2xl font-bold text-primary">{totalStreams.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Streams</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Globe className="h-5 w-5 text-primary mr-2" />
            </div>
            <div className="text-2xl font-bold text-primary">{countryData.length}</div>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
            </div>
            <div className="text-2xl font-bold text-primary">+24%</div>
            <p className="text-sm text-muted-foreground">Growth This Month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interactive Globe */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Global Listening Activity
            </CardTitle>
            <CardDescription>
              Hover over markers to see detailed listening data by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 relative">
              <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                <Globe3D onCountryHover={setHoveredCountry} />
              </Canvas>
              
              {hoveredCountry && (
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg min-w-64">
                  <h4 className="font-semibold text-lg mb-2">{hoveredCountry.country}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Listeners:</span>
                      <span className="font-medium">{hoveredCountry.listeners.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Streams:</span>
                      <span className="font-medium">{hoveredCountry.streams.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. per Listener:</span>
                      <span className="font-medium">{Math.round(hoveredCountry.streams / hoveredCountry.listeners)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Performing Countries
            </CardTitle>
            <CardDescription>
              Your biggest markets and their performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCountries.map((country, index) => (
              <div key={country.country} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{country.country}</p>
                      <p className="text-sm text-muted-foreground">
                        {country.listeners.toLocaleString()} listeners
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{country.streams.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">streams</p>
                  </div>
                </div>
                <Progress 
                  value={(country.listeners / totalListeners) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Listening Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Peak Hours:</span>
                <span className="font-medium">8PM - 10PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Most Active Day:</span>
                <span className="font-medium">Friday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. Session:</span>
                <span className="font-medium">18 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completion Rate:</span>
                <span className="font-medium">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Monthly Growth:</span>
                <span className="font-medium text-green-500">+24%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">New Listeners:</span>
                <span className="font-medium text-green-500">+12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Retention Rate:</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Discovery Rate:</span>
                <span className="font-medium text-green-500">+8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Spotify:</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Apple Music:</span>
                <span className="font-medium">22%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">YouTube Music:</span>
                <span className="font-medium">7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other:</span>
                <span className="font-medium">3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};