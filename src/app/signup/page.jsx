"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaLocationCrosshairs, FaMagnifyingGlass } from "react-icons/fa6";
import ProfileImage from "./components/ProfileImage";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const router = useRouter();

  // --- search-by-location state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const [formData, setformData] = useState({
    username: "",
    fullname: "",
    email: "",
    gender: "",
    dob: "",
    password: "",
    location_source: "",
    display_name: "",
    latitude: "",
    longitude: "",
  });

  const [profileImage, setProfileImage] = useState(null);
const [profileImagePreview, setProfileImagePreview] = useState("");

  const handleNext = () => {
    setStep(2);
  };

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

      setformData((prev) => ({
        ...prev,
        location_source: "gps",
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        display_name: "Current location",
      }));

      setSearchQuery("");
      setSearchResults([]);
    },
    () => {
      toast.error("Unable to get your location.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
};

  // --- debounced location search ---
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location/search?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        toast.error("Location search failed");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // --- close dropdown when clicking outside ---
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleSelectLocation = (result) => {
  setLocation({
    latitude: result.latitude,
    longitude: result.longitude,
    source: "manual",
  });

  setformData((prev) => ({
    ...prev,
    location_source: "manual",
    display_name: result.displayName,
    latitude: result.latitude.toString(),
    longitude: result.longitude.toString(),
  }));

  setSearchQuery(result.displayName);
  setShowDropdown(false);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      toast.error("Please set your location before continuing");
      return;
    }

    const fd = new FormData(formRef.current);

const data = new FormData();

data.append("email", formData.email);
data.append("password", formData.password);
data.append("fullname", formData.fullname);
data.append("username", formData.username);
data.append("dob", formData.dob);
data.append("gender", formData.gender);

data.append("location_source", formData.location_source);
data.append("display_name", formData.display_name);
data.append("latitude", formData.latitude);
data.append("longitude", formData.longitude);


if (profileImage) {
  data.append("dp", profileImage);
}

  try {
      const res = await fetch("/api/auth/register", {
  method: "POST",
  body: data,
});

      const result = await res.json();

   if(res.ok === true && res.status === 201){
      toast.success(result.message);
      router.push("/login");
      return;
   }

   toast.error(result.message);


  } catch (error) {
    console.log("catch", "FCATCH")
    return console.log(error);
  }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {step === 1 ? "Enter your account details" : "Add your location"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step >= 1 ? "bg-blue-600" : "bg-slate-200"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step >= 2 ? "bg-blue-600" : "bg-slate-200"
            }`}
          />
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">

<ProfileImage profileImage={profileImage} setProfileImage={setProfileImage}  profileImagePreview={profileImagePreview} setProfileImagePreview={setProfileImagePreview} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^[a-zA-Z0-9]*$/.test(value)) {
                      toast.error("Only letters and numbers are allowed");
                      return;
                    }
                    setformData((prev) => ({ ...prev, username: value }));
                  }}
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^[a-zA-Z\s]*$/.test(value)) {
                      toast.error("Only letters are allowed");
                      return;
                    }
                    setformData((prev) => ({ ...prev, fullname: value }));
                  }}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setformData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={formData.gender}
                  onChange={(e) =>
                    setformData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setformData((prev) => ({ ...prev, dob: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setformData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Your location
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Get your current location or search for it manually.
                </p>
              </div>

              {/* GPS button */}
              <button
                type="button"
                onClick={getLocation}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.99]"
              >
                <FaLocationCrosshairs className="text-lg" />
                Get my location
              </button>

              <div className="relative flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Search input */}
              <div className="relative" ref={searchWrapperRef}>
                <div className="relative">
                  <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    placeholder="Search location e.g. New Baneshwor"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handleSelectLocation(result)}
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                      >
                        {result.displayName}
                      </button>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <p className="mt-1 text-xs text-slate-400">Searching...</p>
                )}

                {showDropdown &&
                  !isSearching &&
                  searchQuery.trim().length >= 3 &&
                  searchResults.length === 0 && (
                    <p className="mt-1 text-xs text-slate-400">
                      No matching locations found
                    </p>
                  )}
              </div>

              {/* Selected coordinates confirmation */}
              {location && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {location.source === "gps" ? "Current location" : "Searched"}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span className="text-slate-500">Latitude</span>
                    <span className="font-medium text-slate-900">
                      {location.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span className="text-slate-500">Longitude</span>
                    <span className="font-medium text-slate-900">
                      {location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}

              {/* <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Display name
                </label>
                <input
                  type="text"
                  name="display_name"
                  placeholder="e.g. Home, Office"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div> */}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  Create account
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}