// app/api/location/search/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length < 3) {
    return Response.json([]);
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
        query
      )}&format=json&countrycodes=np&limit=5&addressdetails=1`
    );

    if (!response.ok) {
      // LocationIQ returns 404 (not 200 with empty array) when nothing matches — treat as "no results", not an error
      if (response.status === 404) {
        return Response.json([]);
      }
      throw new Error(`LocationIQ responded with status ${response.status}`);
    }

    const data = await response.json();

    const results = data.map((place) => ({
      displayName: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    }));

    return Response.json(results);
  } catch (error) {
    console.error("Location search failed:", error);
    return Response.json(
      { error: "Failed to search location" },
      { status: 500 }
    );
  }
}