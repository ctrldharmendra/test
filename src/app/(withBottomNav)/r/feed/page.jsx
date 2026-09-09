import React from 'react'
import FeedPosts from './components/FeedPost'
import { cookies } from 'next/headers';

const page =async  () => {
            const cookieStore = await cookies();
    
        const accessToken = cookieStore.get("accessToken")?.value;



    const getPosts = async () => {
      try {
        const res = await fetch(`${process.env.API_BASE}/api/post`, {
          method: "GET",
          credentials: "include",
          headers: {
            Cookie: `accessToken=${accessToken}`,
          },
          cache: "no-store",
        });
        const data = await res.json();
// console.log(data)
// console.log(res)
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch posts");
        }

return  data?.posts || [];
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

  //  const posts = await getPosts();




  return (
<FeedPosts
/>
  )
}

export default page