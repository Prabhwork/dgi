import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'Missing Google Maps API Key' }, { status: 500 });
    }

    const [oLat, oLng] = origin.split(',');
    const [dLat, dLng] = destination.split(',');

    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const body = {
        origin: { location: { latLng: { latitude: Number(oLat), longitude: Number(oLng) } } },
        destination: { location: { latLng: { latitude: Number(dLat), longitude: Number(dLng) } } },
        travelMode: 'DRIVE',
        // Always prefer fastest traffic-aware route
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        // Request alternatives so we can pick the single fastest one
        computeAlternativeRoutes: true,
        extraComputations: ['TRAFFIC_ON_POLYLINE'],
    };

    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory,routes.legs',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.error) {
            console.error('Google Routes API Error:', data.error);
            return NextResponse.json(data, { status: data.error.code || 400 });
        }

        if (!data.routes?.length) {
            return NextResponse.json({ routes: [] });
        }

        // Pick the single fastest route by duration (in seconds)
        const fastest = data.routes.reduce((best: any, r: any) => {
            const bSecs = parseInt(best.duration ?? '99999');
            const rSecs = parseInt(r.duration ?? '99999');
            return rSecs < bSecs ? r : best;
        }, data.routes[0]);

        // Return in the same shape as before so the frontend doesn't break
        return NextResponse.json({ routes: [fastest] });
    } catch (error) {
        console.error('Error fetching directions:', error);
        return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 });
    }
}
