import { NextResponse } from 'next/server';

const MAPPLS_KEY = 'kycwcidjksumwgnzfqkcipivnbvtprgzuzpz';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const [oLat, oLng] = origin.split(',');
    const [dLat, dLng] = destination.split(',');

    // Mappls Route ETA API — lng,lat format
    const url = `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_KEY}/route_eta/driving/${oLng},${oLat};${dLng},${dLat}?geometries=polyline&overview=full&steps=true&region=ind`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes?.length) {
            return NextResponse.json({ routes: [] });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Mappls directions:', error);
        return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 });
    }
}
