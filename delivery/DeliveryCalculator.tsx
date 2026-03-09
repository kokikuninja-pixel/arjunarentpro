
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLoadScript, Autocomplete, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Calculator, Plus, Trash2, Edit } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PricingCalculator } from '@/lib/pricingEngine';
import { formatCurrency } from '@/lib/utils';
import type { GarageLocation, PricingRule } from '@/lib/types';

const GOOGLE_MAPS_LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

interface DeliveryCalculatorProps {
  branchId: string;
  onCalculate: (result: {
    pickup?: DeliveryResult;
    delivery?: DeliveryResult;
    total: number;
  }) => void;
}

interface DeliveryResult {
  location: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  duration: number;
  price: number;
  breakdown: Array<{ label: string; amount: number }>;
}

export function DeliveryCalculator({ branchId, onCalculate }: DeliveryCalculatorProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [garage, setGarage] = useState<GarageLocation | null>(null);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{
    pickup?: DeliveryResult;
    delivery?: DeliveryResult;
    total: number;
  } | null>(null);

  // Load garage and rules
  useEffect(() => {
    const loadData = async () => {
      // Load default garage
      const garageQuery = query(
        collection(db, 'garageLocations'),
        where('branchId', '==', branchId),
        where('isDefault', '==', true)
      );
      const garageSnap = await getDocs(garageQuery);
      if (!garageSnap.empty) {
        setGarage(garageSnap.docs[0].data() as GarageLocation);
      }

      // Load active rules
      const rulesQuery = query(
        collection(db, 'pricingRules'),
        where('branchId', '==', branchId),
        where('isActive', '==', true)
      );
      const rulesSnap = await getDocs(rulesQuery);
      setRules(rulesSnap.docs.map(d => ({ id: d.id, ...d.data() }) as PricingRule));

      // Load today's booking count
      const today = new Date().toISOString().split('T')[0];
      const bookingRef = doc(db, 'deliveryBookings', `${branchId}_${today}`);
      const bookingSnap = await getDoc(bookingRef);
      setBookingCount(bookingSnap.exists() ? bookingSnap.data().count : 0);
    };

    loadData();
  }, [branchId]);

  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !garage) return;
    
    setCalculating(true);
    const directionsService = new google.maps.DirectionsService();
    const calculator = new PricingCalculator(rules, garage, new Date(), bookingCount);

    try {
      let pickupResult: DeliveryResult | undefined;
      let deliveryResult: DeliveryResult | undefined;
      let total = 0;

      // Calculate Pickup (Customer -> Garage)
      if (pickupLocation && pickupCoords) {
        const directionsResponse = await directionsService.route({
            origin: pickupCoords,
            destination: { lat: garage.coordinates.lat, lng: garage.coordinates.lng },
            travelMode: google.maps.TravelMode.DRIVING,
        });

        const route = directionsResponse.routes[0].legs[0];
        const distanceKm = route.distance!.value / 1000;
        
        const calculation = await calculator.calculateDelivery(
          pickupLocation,
          distanceKm,
          true // isPickup
        );

        pickupResult = {
          location: pickupLocation,
          coordinates: pickupCoords,
          distance: distanceKm,
          duration: route.duration!.value / 60,
          price: calculation.total,
          breakdown: calculation.breakdown
        };
        
        total += calculation.total;
      }

      // Calculate Delivery (Garage -> Customer)
      if (deliveryLocation && deliveryCoords) {
        const directionsResponse = await directionsService.route({
            origin: { lat: garage.coordinates.lat, lng: garage.coordinates.lng },
            destination: deliveryCoords,
            travelMode: google.maps.TravelMode.DRIVING,
        });

        const route = directionsResponse.routes[0].legs[0];
        const distanceKm = route.distance!.value / 1000;
        
        const calculation = await calculator.calculateDelivery(
          deliveryLocation,
          distanceKm,
          false // isDelivery
        );

        deliveryResult = {
          location: deliveryLocation,
          coordinates: deliveryCoords,
          distance: distanceKm,
          duration: route.duration!.value / 60,
          price: calculation.total,
          breakdown: calculation.breakdown
        };
        
        total += calculation.total;
      }
        
      // Show route on map
      if (pickupCoords && deliveryCoords) {
        directionsService.route(
            {
              origin: pickupCoords,
              destination: deliveryCoords,
              waypoints: [
                { location: { lat: garage.coordinates.lat, lng: garage.coordinates.lng } }
              ],
              optimizeWaypoints: false,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                setDirections(result);
              }
            }
        );
      } else if (deliveryCoords) {
         directionsService.route(
            {
              origin: { lat: garage.coordinates.lat, lng: garage.coordinates.lng },
              destination: deliveryCoords,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                setDirections(result);
              }
            }
        );
      }


      const finalResult = {
        pickup: pickupResult,
        delivery: deliveryResult,
        total
      };

      setResult(finalResult);
      onCalculate(finalResult);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setCalculating(false);
    }
  }, [isLoaded, garage, rules, bookingCount, pickupLocation, deliveryLocation, pickupCoords, deliveryCoords, onCalculate]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#CCFF00]" />
          Delivery Calculator
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Garasi: {garage?.name || 'Loading...'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Jemput (Dari)
            </label>
            <Autocomplete
              onLoad={(autocomplete) => {
                autocomplete.addListener('place_changed', () => {
                  const place = autocomplete.getPlace();
                  if (place.geometry) {
                    setPickupLocation(place.formatted_address || '');
                    setPickupCoords({
                      lat: place.geometry.location!.lat(),
                      lng: place.geometry.location!.lng()
                    });
                  }
                });
              }}
              options={{ componentRestrictions: { country: 'id' } }}
            >
              <input
                type="text"
                placeholder="Cari lokasi jemput..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </Autocomplete>
            {result?.pickup && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-900">
                  {result.pickup.distance.toFixed(1)} km • {Math.round(result.pickup.duration)} menit
                </p>
                <p className="text-blue-700 font-bold text-lg">
                  {formatCurrency(result.pickup.price)}
                </p>
              </div>
            )}
          </div>

          {/* Delivery Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Antar (Ke)
            </label>
            <Autocomplete
              onLoad={(autocomplete) => {
                autocomplete.addListener('place_changed', () => {
                  const place = autocomplete.getPlace();
                  if (place.geometry) {
                    setDeliveryLocation(place.formatted_address || '');
                    setDeliveryCoords({
                      lat: place.geometry.location!.lat(),
                      lng: place.geometry.location!.lng()
                    });
                  }
                });
              }}
              options={{ componentRestrictions: { country: 'id' } }}
            >
              <input
                type="text"
                placeholder="Cari lokasi antar..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
              />
            </Autocomplete>
            {result?.delivery && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-lg text-sm">
                <p className="font-medium text-emerald-900">
                  {result.delivery.distance.toFixed(1)} km • {Math.round(result.delivery.duration)} menit
                </p>
                <p className="text-emerald-700 font-bold text-lg">
                  {formatCurrency(result.delivery.price)}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={calculateRoute}
            disabled={calculating || (!pickupLocation && !deliveryLocation)}
            className="w-full py-3 bg-[#1A1A2E] text-white rounded-xl font-medium hover:bg-[#2D2D44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            {calculating ? 'Menghitung...' : 'Hitung Biaya'}
          </button>

          {/* Total Summary */}
          {result && (
            <div className="p-4 bg-[#CCFF00]/10 border-2 border-[#CCFF00] rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Biaya Antar-Jemput</p>
              <p className="text-3xl font-bold text-[#1A1A2E]">
                {formatCurrency(result.total)}
              </p>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={garage?.coordinates || { lat: -6.9175, lng: 107.6191 }}
            zoom={12}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {garage && (
              <Marker
                position={{ lat: garage.coordinates.lat, lng: garage.coordinates.lng }}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#CCFF00" stroke="#1A1A2E" stroke-width="2"/>
                      <text x="20" y="25" text-anchor="middle" fill="#1A1A2E" font-weight="bold" font-size="14">G</text>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(40, 40)
                }}
                title="Garasi"
              />
            )}
            {pickupCoords && <Marker position={pickupCoords} label="J" />}
            {deliveryCoords && <Marker position={deliveryCoords} label="A" />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
      </div>

      {/* Price Breakdown */}
      {((result?.pickup?.breakdown.length || 0) > 0 || (result?.delivery?.breakdown.length || 0) > 0) ? (
        <div className="border-t border-gray-100 p-4">
          <h4 className="font-medium text-gray-700 mb-3">Rincian Perhitungan</h4>
          <div className="space-y-2 text-sm">
            {result?.pickup?.breakdown.map((item, idx) => (
              <div key={`p-${idx}`} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Jemput: {item.label}</span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            {result?.delivery?.breakdown.map((item, idx) => (
              <div key={`d-${idx}`} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Antar: {item.label}</span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
