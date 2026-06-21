'use client';

import React, { useState, useMemo } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { Map, MapPin, Navigation, Bus, Utensils, Zap, ArrowRight } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  type: 'transit_station' | 'bicycle_store' | 'park' | 'electric_vehicle_charging_station' | 'health';
  lat: number; // grid coords for mock visual
  lng: number;
  description: string;
  distance: string;
}

const MOCK_POIS: POI[] = [
  { id: 'poi-1', name: 'IIT Bombay Metro Station', type: 'transit_station', lat: 30, lng: 40, description: 'Rapid transit rail station connecting local lines. Swapping to metro reduces daily transport emissions by 75%.', distance: '0.4 km' },
  { id: 'poi-2', name: 'GreenRide Bicycle Rental', type: 'transit_station', lat: 65, lng: 45, description: 'Electric and standard bicycle rentals. Shared cycle rates starting at ₹10/hour.', distance: '0.8 km' },
  { id: 'poi-3', name: 'Powai Plaza EV Charging Station', type: 'electric_vehicle_charging_station', lat: 25, lng: 70, description: 'Dual port CCS2 EV fast charger supporting up to 50kW charging rates.', distance: '1.2 km' },
  { id: 'poi-4', name: 'Hiranandani Organic Farmers Market', type: 'health', lat: 50, lng: 30, description: 'Weekly local farming coop offering organic produce, reducing diet-related transport emissions.', distance: '1.5 km' },
  { id: 'poi-5', name: 'Central Park Green Belt', type: 'park', lat: 40, lng: 60, description: 'Urban forestry conservation park. Good active commuting alternative route.', distance: '1.0 km' }
];

const POI_TYPES = [
  { type: 'all', label: 'All Locations', icon: MapPin },
  { type: 'transit_station', label: 'Public Transit', icon: Bus },
  { type: 'electric_vehicle_charging_station', label: 'EV Chargers', icon: Zap },
  { type: 'health', label: 'Farmers Markets', icon: Utensils }
];

export default function MapsPage() {
  const user = useUserStore(state => state.user);
  const activeRecord = useFootprintStore(state => state.activeRecord);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(MOCK_POIS[0]);

  // Determine user's highest hotspot to suggest transit or charger
  const hotspotSuggestion = useMemo(() => {
    if (!activeRecord) {return null;}
    const { breakdown } = activeRecord.results;
    const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
    const topCategory = sorted[0][0];

    if (topCategory === 'transport') {
      return {
        focusType: 'transit_station',
        msg: '🚨 Your top hotspot is Transportation. We are highlighting local Metro transit stations and cycle rental shops to help you reduce travel emissions.'
      };
    } else if (topCategory === 'energy') {
      return {
        focusType: 'electric_vehicle_charging_station',
        msg: '⚡ Your top hotspot is Energy Usage. We are highlighting local EV Charging networks to support shifts towards green electricity commutes.'
      };
    } else if (topCategory === 'diet') {
      return {
        focusType: 'health',
        msg: '🥬 Your top hotspot is Diet. We are highlighting organic farming food hubs to source local ingredients and drop delivery overheads.'
      };
    }
    return null;
  }, [activeRecord]);

  // Filtered POIs
  const filteredPOIs = useMemo(() => {
    if (selectedType === 'all') {
      return MOCK_POIS;
    }
    return MOCK_POIS.filter(p => p.type === selectedType);
  }, [selectedType]);

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Map className="h-6 w-6 text-emerald-500" />
          <span>Eco POI Explorer</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Discover low-carbon transit networks, bicycle outlets, electric charging grids, and local farmers markets near {user?.location.city || 'your area'}.
        </p>
      </div>

      {/* Hotspot dynamic notification */}
      {hotspotSuggestion && (
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/25 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse-slow">
          {hotspotSuggestion.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left/Middle: Map Canvas Mockup */}
        <div className="lg:col-span-2 flex flex-col space-y-4">

          {/* Map controls */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl overflow-x-auto">
            {POI_TYPES.map((type) => {
              const BtnIcon = type.icon;
              const isSelected = selectedType === type.type;
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${isSelected
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                >
                  <BtnIcon className="h-4 w-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Map Visualizer */}
          <div className="relative h-[55vh] border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-inner">
            {/* Grid mesh backdrop simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>

            {/* Map Roads Visual Simulation */}
            <div className="absolute h-1 bg-zinc-200 dark:bg-zinc-900 top-1/3 left-0 right-0 rotate-1 transform origin-center"></div>
            <div className="absolute h-1 bg-zinc-200 dark:bg-zinc-900 top-2/3 left-0 right-0 -rotate-2 transform origin-center"></div>
            <div className="absolute w-1 bg-zinc-200 dark:bg-zinc-900 left-1/3 top-0 bottom-0 rotate-3 transform origin-center"></div>
            <div className="absolute w-1 bg-zinc-200 dark:bg-zinc-900 left-2/3 top-0 bottom-0 -rotate-12 transform origin-center"></div>

            {/* Rendering Pins */}
            {filteredPOIs.map((poi) => {
              const isSelected = selectedPOI?.id === poi.id;
              const isRecommended = hotspotSuggestion?.focusType === poi.type;
              return (
                <button
                  key={poi.id}
                  onClick={() => handlePOIClick(poi)}
                  style={{ top: `${poi.lat}%`, left: `${poi.lng}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5 focus:outline-none z-10 group"
                  aria-label={`POI: ${poi.name}`}
                >
                  <div className={`relative flex items-center justify-center p-1.5 rounded-full shadow-lg transition-transform focus:scale-125 hover:scale-125 ${isSelected
                      ? 'bg-emerald-600 text-white scale-125 ring-4 ring-emerald-500/20'
                      : isRecommended
                        ? 'bg-amber-500 text-white animate-bounce'
                        : 'bg-zinc-800 text-slate-350 dark:bg-zinc-900'
                    }`}>
                    {poi.type === 'transit_station' && <Bus className="h-3.5 w-3.5" />}
                    {poi.type === 'electric_vehicle_charging_station' && <Zap className="h-3.5 w-3.5" />}
                    {poi.type === 'health' && <Utensils className="h-3.5 w-3.5" />}
                    {poi.type === 'park' && <Navigation className="h-3.5 w-3.5" />}

                    {isRecommended && !isSelected && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Tooltip labels */}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                    {poi.name} ({poi.distance})
                  </span>
                </button>
              );
            })}

            {/* Simulated GPS Compass button */}
            <div className="absolute bottom-4 right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-md cursor-pointer hover:bg-zinc-50 text-zinc-650 dark:text-zinc-350">
              <Navigation className="h-4 w-4" />
            </div>

            {/* Map Mode indicator overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-emerald-400 font-bold tracking-wide uppercase">
              ⚡ Dual-Mode: Interactive Mock Map
            </div>
          </div>

        </div>

        {/* Right Column: Selected POI Details */}
        <div className="space-y-6">

          {selectedPOI ? (
            <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-fade-in">
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                {selectedPOI.type.replace(/_/g, ' ')}
              </span>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-zinc-850 dark:text-zinc-150">{selectedPOI.name}</h3>
                <span className="text-xs text-zinc-400 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Est. Distance: {selectedPOI.distance}</span>
                </span>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-150 dark:border-zinc-850 pt-3">
                {selectedPOI.description}
              </p>

              <button
                className="w-full inline-flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors focus:outline-none"
                onClick={() => alert(`Starting simulated navigation to ${selectedPOI.name}...`)}
              >
                <span>Navigate Route</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-zinc-500 font-semibold py-12">
              Select a location pin on the map to explore green initiatives nearby.
            </div>
          )}

          {/* Quick POI Tips */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">How POIs Help You</h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              Choosing locally-sourced organic foods drops intermediate shipping costs. Biking eliminates 100% of vehicular fossil inputs. Exploring local POIs maps sustainable actions into direct savings.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
