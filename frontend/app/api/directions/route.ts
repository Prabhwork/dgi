import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!MAPBOX_TOKEN) {
        return NextResponse.json({ error: 'Missing Mapbox Token' }, { status: 500 });
    }

    const [oLat, oLng] = origin.split(',');
    const [dLat, dLng] = destination.split(',');

    // Fetch from Mapbox Directions API for perfect map-road alignment
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${oLng},${oLat};${dLng},${dLat}?geometries=geojson&overview=full&annotations=congestion,duration,distance&steps=true&access_token=${MAPBOX_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes?.length) {
            console.error('Mapbox Directions API Error:', data);
            return NextResponse.json({ routes: [] });
        }

        const mbRoute = data.routes[0];

        // Format speed intervals to Google format
        const speedReadingIntervals: any[] = [];
        if (mbRoute.legs?.[0]?.annotation?.congestion) {
            const congestion = mbRoute.legs[0].annotation.congestion;
            let currentStart = 0;
            let currentSpeed = '';
            const getSpeed = (c: string) => {
                if (c === 'severe' || c === 'heavy') return 'TRAFFIC_JAM';
                if (c === 'moderate') return 'SLOW';
                return 'NORMAL';
            };

            for (let i = 0; i < congestion.length; i++) {
                const sp = getSpeed(congestion[i]);
                if (i === 0) { currentSpeed = sp; }
                else if (sp !== currentSpeed) {
                    speedReadingIntervals.push({ startPolylinePointIndex: currentStart, endPolylinePointIndex: i, speed: currentSpeed });
                    currentStart = i;
                    currentSpeed = sp;
                }
            }
            if (congestion.length > 0) {
                speedReadingIntervals.push({ startPolylinePointIndex: currentStart, endPolylinePointIndex: congestion.length, speed: currentSpeed });
            }
        }

        // Map steps
        const steps = mbRoute.legs?.[0]?.steps?.map((step: any) => ({
            startLocation: { latLng: { latitude: step.maneuver.location[1], longitude: step.maneuver.location[0] } },
            navigationInstruction: { instructions: step.maneuver.instruction }
        })) || [];

        // Format to what NearbyMap.tsx expects from Google Routes API
        const fastest = {
            duration: `${Math.round(mbRoute.duration)}s`,
            distanceMeters: mbRoute.distance,
            polyline: {
                geoJsonLinestring: {
                    coordinates: mbRoute.geometry.coordinates
                }
            },
            travelAdvisory: {
                speedReadingIntervals
            },
            legs: [{ steps }]
        };

        return NextResponse.json({ routes: [fastest] });
    } catch (error) {
        console.error('Error fetching directions:', error);
        return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 });
    }
}
