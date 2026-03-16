"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedHome = FeedHome;
var Post_1 = require("@/features/feed/components/post/Post");
var PostSkeleton_1 = require("@/features/feed/components/post/PostSkeleton");
var usePosts_1 = require("@/features/feed/state/usePosts");
function FeedHome() {
    var _a = (0, usePosts_1.useGetPosts)(), data = _a.data, isLoading = _a.isLoading;
    var posts = data === null || data === void 0 ? void 0 : data.data;
    if (isLoading) {
        return (<div className="flex justify-center w-full">
        <div className="max-w-[700px] w-full flex flex-col items-center">
          {Array.from({ length: 3 }).map(function (_, index) { return (<PostSkeleton_1.default key={index}/>); })}
        </div>
      </div>);
    }
    if (!posts || posts.length === 0) {
        return (<div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-muted-foreground">Nenhum post encontrado</p>
      </div>);
    }
    return (<div className="flex justify-center w-full">
      <div className="max-w-[700px] w-full flex flex-col items-center">
        {posts.map(function (post) { return (<Post_1.default key={post.id} post={post}/>); })}
      </div>
    </div>);
}
