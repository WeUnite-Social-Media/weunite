import FeedProfile from "@/features/profile/components/FeedProfile";
import HeaderProfile from "@/features/profile/components/HeaderProfile";
import { useParams } from "react-router-dom";

export function Profile() {
  const { username } = useParams<{ username: string }>();
  return (
    <>
      <div className="relative">
        <HeaderProfile profileUsername={username} />
      </div>
      <FeedProfile profileUsername={username} />
    </>
  );
}
