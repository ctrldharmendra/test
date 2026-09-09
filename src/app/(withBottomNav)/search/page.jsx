"use client";

import { useEffect, useState } from "react";
import { FaXmark, FaClock } from "react-icons/fa6";
import { BsSearchHeart } from "react-icons/bs";
import ProfileFilters from "../explore/component/filter/ProfileFilter";
import { useDispatch, useSelector } from "react-redux";
import PeopleSearchResults from "./components/PeopleSearchResult";
import { CgSpinner } from "react-icons/cg";
import { setSearchedUsers } from "@/redux/slices/stateSlice";
import toast from "react-hot-toast";


export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
const dispatch = useDispatch();




  //REDUX  STATES 
  const selectedAge = useSelector((state) => state?.userState?.selectedAge);

  const selectedDistance = useSelector((state) => state?.userState?.selectedDistance);

  const selectedGender = useSelector((state) => state?.userState?.selectedGender); 

  const searchedUsers = useSelector((state) => state?.userState?.searchedUsers);

  const [page, setpage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [hasMore, setHasMore] = useState(0)
  const [totalCount, settotalCount] = useState(0)




  // CALLING API TO GET RECENT SEARCHED USER TO SHOW IN UI
  const [recentSearches, setrecentSearches] = useState([])
  const [recentSearchLoadingStat, setrecentSearchLoadingStat] = useState(false)
      const fetchRecentSearches = async () => {
      try {
        setrecentSearchLoadingStat(true)
        const res = await fetch(`/api/search`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load recent searches");
        }
        setrecentSearchLoadingStat(false)
        // console.log(data?.data, "SEARCH HISTORY DATA")
        setrecentSearches(data?.data || []);
      } catch (error) {
        setrecentSearchLoadingStat(false)
        console.error("Failed to fetch recent searches:", error);
        throw new error
      }
    };
  useEffect(() => {

    fetchRecentSearches();
  }, []);
  // CALLING API TO GET RECENT SEARCH END



  // WHEN CLICK ON SEARCH THEN CALL SEARCH API 
const handleSearch = async (searchTerm = search) => {
  try {
    setrecentSearchLoadingStat(true);

    const res = await fetch(
      `/api/users/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to search");
    }

    // console.log(data, "DATA SEARCHED USER");

if(data?.users?.length > 0){  
      dispatch(setSearchedUsers(data?.users || []));
}

    settotalCount(data?.totalCount);
    setHasMore(data?.hasMore);
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    setrecentSearchLoadingStat(false);
  }
};
  // WHEN CLICK ON SEARCH THEN CALL SEARCH API END
  

// DELETE PARTICULAR SEARCH HISTORY | WHEN CLICK ON X
const handleDeleteParticularSearchHIstory = async(searchHistoryId) =>{
  // console.log(searchHistoryId)
  setrecentSearchLoadingStat(true)
  try {
// call api first | its a patch api | soft delete 
const res = await fetch(`/api/search/${searchHistoryId}`, {
  method: "PATCH",
  credentials: "include",
  cache: "no-store",
});
const data = await res.json();
if (!res.ok) {
  throw new Error(data?.message || "Failed to delete search history");
}

if(data?.data?.affectedRows > 0){
  // now remove this particular search item with searchHistoryId from recentSearches state   
    const filteredSearches = recentSearches.filter((item) => item.id !== searchHistoryId);
    setrecentSearches(filteredSearches);
    setrecentSearchLoadingStat(false)
toast.success("Search history deleted successfully");

}
  } catch (error) {
    setrecentSearchLoadingStat(false)
    return console.error("Delete search history error:", error);
  }
}
// DELETE PARTICULAR SEARCH HISTORY | WHEN CLICK ON X END


// DELETE All SEARCH HISTORY | 
const handleDeleteAllSearchHIstory = async() =>{
  setrecentSearchLoadingStat(true)
  try {
// call api first | its a patch api | soft delete 
const res = await fetch(`/api/search`, {
  method: "PATCH",
  credentials: "include",
  cache: "no-store",
});
const data = await res.json();
if (!res.ok) {
  throw new Error(data?.message || "Failed to delete search history");
}

if(data?.data?.affectedRows > 0){ 
    setrecentSearchLoadingStat(false)
    setrecentSearches([]);
toast.success("All Search History deleted successfully");
dispatch(setSearchedUsers([]));
}
  } catch (error) {
    setrecentSearchLoadingStat(false)
    return console.error("Delete search history error:", error);
  }
}
// DELETE All SEARCH HISTORY | END

// console.log(hasMore, "hasMore")
// console.log(totalCount, "totalCount")


  // CALLING API TO CREATE SEARCH HISTORY 
const createSearchHistory = async ()=>{
  try {
    setHasSearched(true);
  setrecentSearchLoadingStat(true)
  const res = await fetch(`/api/search`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ search }),
  });

  if (!res.ok) {
    console.log(res)
    // throw new Error(res);
  }

  if(res.ok){
    handleSearch();
  console.log(res, "creat res")
  }
  } catch (error) {
  setrecentSearchLoadingStat(false)

     console.error("Failed to fetch recent searches:", error);
    throw new Error(error)

  }
}
  // CALLING API TO CREATE SEARCH HISTORY END


  return (
    <main className="min-h-dvh bg-[#080808] text-white">
      <div className="mx-auto min-h-dvh w-full max-w-[600px]">

        {/* Header */}
        <header className="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+18px)]">
          <h1 className="text-2xl font-bold">
            Search
          </h1>

          <p className="mt-1 text-sm text-white/40">
            Find people around you
          </p>
        </header>


{/* Search input */}
<div className="px-4 pt-4">
  <div
    className="
      flex items-center gap-3
      rounded-2xl
      border border-white/10
      bg-white/[0.07]
      px-3 py-2.5
      transition
      focus-within:border-red-500/40
      focus-within:bg-white/[0.09]
      focus-within:shadow-[0_0_25px_rgba(239,68,68,0.08)]
    "
  >
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
          createSearchHistory();
        }
      }}
      placeholder="Search username or name..."
      className="
        min-w-0 flex-1
        bg-transparent
        px-2
        py-1
        text-sm
        text-white
        outline-none
        placeholder:text-white/30
      "
    />

    {/* Clear */}
    {search && (
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setHasSearched(false);
fetchRecentSearches()
        }}
        className="
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-full
          bg-white/[0.06]
          text-white/40
          transition
          hover:bg-white/10
          hover:text-white
          active:scale-90
        "
        aria-label="Clear search"
      >
        <FaXmark className="text-xs" />
      </button>
    )}

    {/* Search ICON button SEARCHHHHH CLICK*/}
    <button
      type="button"
      onClick={createSearchHistory}
      className="
        relative flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-xl
        bg-red-500/10
        text-red-500
        transition-all
        hover:bg-red-500/20
        hover:shadow-[0_0_18px_rgba(239,68,68,0.25)]
        active:scale-90
      "
      aria-label="Search"
    >
      <BsSearchHeart className="text-lg" />

      {/* Tiny decorative glow */}
      <span
        className="
          pointer-events-none
          absolute inset-0
          rounded-xl
          ring-1 ring-red-500/20
        "
      />
    </button>
  </div>
</div>


        {/* Reuse existing filters */}
        {/* <div className="mt-2">
          <ProfileFilters />
        </div> */}

        {/* Content */}
        <section className=" pb-24">

{
  recentSearchLoadingStat ? <CgSpinner className="animate-spin mt-8 mx-auto" size={20}></CgSpinner> :
<section className="px-3 pb-24">

{/* RECENTLY SEARCHED USERS FROM REDUX TOOLKIT STATE */}
  {/* Search results */}
{
  searchedUsers?.length >0 && (
    <div className="mt-5">

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            People
          </h2>

          {search && (
            <p className="mt-0.5 text-xs text-white/30">
              Results for "{search}"
            </p>
          )}
        </div>

        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/40">
          { searchedUsers?.length > 1 ? "Recently Visited Profiles" : "Recently Visited Profile"}
        </span>
      </div>

      <PeopleSearchResults search={searchedUsers} />

    </div>

  )
}
{/* RECENTLY SEARCHED USERS FROM REDUX TOOLKIT STATE END */}



  {/* Recent searches HISTORY  */}
  {recentSearches?.length >0 && (
    <div className="mt-4">

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Recent searches
        </h2>

        <button
          onClick={(e)=>{
            e.stopPropagation();
            handleDeleteAllSearchHIstory();
          }}
          type="button"
          className="text-xs text-white/40 transition hover:text-white/70"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-1">

        {recentSearches?.map((item) => (
<button
  key={item?.id}
  type="button"
  onClick={() => {
    const searchTerm = item?.data;

    setSearch(searchTerm);
    setHasSearched(true);

    // Immediately search using item.data
    handleSearch(searchTerm);
  }}
  className="
    flex w-full items-center gap-3
    rounded-xl px-3 py-3
    text-left
    transition
    active:scale-[0.98]
    hover:bg-white/[0.05]
  "
>

            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full
                bg-white/[0.08]
              "
            >
              <FaClock className="text-xs text-white/40" />
            </div>

            <span className="flex-1 text-sm text-[#a3a3a3]">
              {item?.data}
            </span>

       <FaXmark
  className="text-xs text-white/70"
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteParticularSearchHIstory(item?.id);
  }}
/>
          </button>
        ))}
      </div>
    </div>
  )}



</section>

}



        </section>
      </div>
    </main>
  );
}