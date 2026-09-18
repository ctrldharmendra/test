// app/signup/google/page.jsx
"use client";

import useDebounce from "@/components/debounceSearch/DebouncedSearch";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaLocationCrosshairs, FaMagnifyingGlass } from "react-icons/fa6";

export default function CompleteGoogleSignup() {
  const router = useRouter();
  const [prefill, setPrefill] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);

  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    gender: "",
    dob: "",
  });

// USERNAME AVAILABILITY CHECK
const debouncedSearchUsername = useDebounce(formData.username, 1000);
  const [loadingUsername, setLoadingUsername] = useState(false);
const [isTaken, setisTaken] = useState(false)


const checkUserNameAvailability = async () => {
  setLoadingUsername(true)

  try {
  const res = await fetch(`/api/istaken/username?username=${debouncedSearchUsername}`);
  const data = await res.json();
  // console.log("api data", data)

if(data?.taken){
  setisTaken(data?.message)
}
if(!data?.taken){
  setisTaken(data?.message)
}
if(data?.success){
  setLoadingUsername(false)
}

} catch (error) {
  console.log(error);
  setLoadingUsername(false)

  return;
}
};

// make checking tryue username 
useEffect(() => {
    setLoadingUsername(false)
  if(formData.username.trim().length > 2){
    setLoadingUsername(true)
}
setisTaken(false)
}, [formData.username])

// calling fun 
useEffect(() => {
  if (debouncedSearchUsername.trim().length < 3) {
    return;
  }
checkUserNameAvailability();
}, [debouncedSearchUsername])
// USERNAME AVAILABILITY CHECK END



  // PAGE LOAD — pending token + prefill data check karo
  useEffect(() => {
    const token = sessionStorage.getItem("pendingSignupToken");
    const prefillData = sessionStorage.getItem("googlePrefill");

    if (!token || !prefillData) {
      toast.error("Signup session expired, please try again");
      router.push("/login");
      return;
    }

    setPendingToken(token);
    setPrefill(JSON.parse(prefillData));
  }, [router]);

  // LOCATION SEARCH (aapke existing signup page se same logic)

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        toast.error("Location search failed");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // const getLocation = () => {
  //   if (!navigator.geolocation) {
  //     toast.error("Location not supported");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         source: "gps",
  //       });
  //     },
  //     () => toast.error("Unable to get your location"),
  //     { enableHighAccuracy: true, timeout: 10000 }
  //   );
  // };


  
  const [showLocationModal, setShowLocationModal] = useState(false); // NAYA
  
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
  
        setLocation({
          latitude,
          longitude,
          source: "gps",
        });
  
        setFormData((prev) => ({
          ...prev,
          location_source: "gps",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          display_name: "Current location",
        }));
  
        setSearchQuery("");
        setSearchResults([]);
        setShowLocationModal(false); // agar modal khula tha, band karo
      },
      (error) => {
          console.log("Geolocation error code:", error.code, error.message); // TEMP DEBUG
        // NAYA — error code ke hisaab se alag response
        if (error.code === 1) {
          // Permission denied — user ne block kiya tha
          toast.error("Location access denied. Please enable it in browser settings.");
        } else if (error.code === 2) {
          // Position unavailable — device location off hai
          setShowLocationModal(true); // custom popup dikhao
        } else if (error.code === 3) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };
  const handleSelectLocation = (result) => {
    setLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      source: "manual",
      display_name: result.displayName,
    });
    setSearchQuery(result.displayName);
    setShowDropdown(false);
  };


  // SUBMIT — poora account banta hai yahan


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.gender || !formData.dob) {
      toast.error("Please fill all fields");
      return;
    }

    if (!location) {
      toast.error("Please set your location");
      return;
    }

    try {
      const res = await fetch("/api/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingSignupToken: pendingToken,
          username: formData.username,
          gender: formData.gender,
          dob: formData.dob,
          location_source: location.source,
          display_name: location.display_name || "Current location",
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        sessionStorage.removeItem("pendingSignupToken");
        sessionStorage.removeItem("googlePrefill");
        toast.success("Account created!");
        router.push("/explore");
        return;
      }

      toast.error(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (!prefill) return null; // ya ek loading spinner

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <FaLocationCrosshairs className="text-2xl text-blue-600" />
              </div>
            </div>
      
            <h3 className="text-center text-lg font-semibold text-slate-900">
              Turn on your location
            </h3>
      
            <p className="mt-2 text-center text-sm text-slate-500">
              We couldn't detect your location. Please make sure location services
              are turned on for your device and browser, then try again.
            </p>
      
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLocationModal(false);
                  getLocation(); // retry
                }}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          {prefill.picture && (
            <img
              src={prefill.picture}
              alt={prefill.name}
              className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {prefill.name}!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Just a few more details to finish setting up your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Username
                         {isTaken && isTaken?.includes("already") && <span className="text-red-500 text-xs pl-[10px]">Username is taken.</span>}
                  {isTaken && isTaken?.includes("available") && <span className="text-green-500 text-xs pl-[10px]">Username is available.</span>}
                  {loadingUsername && <span className="text-blue-500 text-xs pl-[10px]">Checking...</span>}
                  {formData.username.trim().length > 0 && formData.username.trim().length <3 && <span className="text-blue-500 text-xs pl-[10px]">Minimum 3 characters required.</span>}

            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
              placeholder="Choose a username"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              required
              value={formData.gender}
              onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date of birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={getLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <FaLocationCrosshairs />
              Get my location
            </button>

            <div className="relative mt-3" ref={searchWrapperRef}>
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search location"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleSelectLocation(result)}
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      {result.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {location && (
              <p className="mt-2 text-xs text-slate-500">
                ✓ Location set ({location.source === "gps" ? "current location" : "searched"})
              </p>
            )}
          </div>

          <button
            type="submit"
              disabled={isTaken && isTaken.includes("already")}

             className={`mt-2 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] ${isTaken && isTaken.includes("already")  ? "opacity-20 " : ""}`}
          >
            Create account
          </button>
        </form>
      </div>
    </main>
  );
}