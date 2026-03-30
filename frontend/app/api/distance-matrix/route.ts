import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'Missing Google Maps API Key' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { origin, destinations } = body;

        const url = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
        
        const payload = {
            origins: [{
                waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
                routeModifier: { avoidTolls: false, avoidHighways: false, avoidFerries: false }
            }],
            destinations: destinations.map((d: any) => ({
                waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } }
            })),
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE_OPTIMAL",
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,condition'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error("Google Route Matrix API Error:", data.error);
            return NextResponse.json(data, { status: data.error.code || 400 });
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Matrix API request failed:", error);
        return NextResponse.json({ error: 'Failed to fetch distance matrix' }, { status: 500 });
    }
}
