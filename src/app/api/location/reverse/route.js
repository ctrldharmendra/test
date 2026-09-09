// app/api/location/reverse/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
    );

    if (!response.ok) {
      throw new Error(`LocationIQ responded with status ${response.status}`);
    }

    const data = await response.json();

    return Response.json({
      displayName: data.display_name || null,
    });
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return Response.json({ error: "Failed to reverse geocode" }, { status: 500 });
  }
}