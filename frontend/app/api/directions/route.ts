import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    
    if (!origin || !destination) {
        return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'Missing Google Maps API Key' }, { status: 500 });
    }

    const [oLat, oLng] = origin.split(',');
    const [dLat, dLng] = destination.split(',');

    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    
    const body = {
        origin: { location: { latLng: { latitude: Number(oLat), longitude: Number(oLng) } } },
        destination: { location: { latLng: { latitude: Number(dLat), longitude: Number(dLng) } } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE_OPTIMAL",
        extraComputations: ["TRAFFIC_ON_POLYLINE"]
    };

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory,routes.legs'
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error("Google Routes API Error:", data.error);
            return NextResponse.json(data, { status: data.error.code || 400 });
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching directions:", error);
        return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 });
    }
}
