"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PostSkeleton;
var card_1 = require("@/shared/components/ui/card");
var skeleton_1 = require("@/shared/components/ui/skeleton");
function PostSkeleton() {
    return (<card_1.Card className="w-full max-w-[45em] shadow-none border-0 border-b rounded-none border-foreground/50">
      <card_1.CardHeader className="flex flex-row items-center gap-4">
        <skeleton_1.Skeleton className="h-10 w-10 rounded-full"/>

        <div className="flex flex-col space-y-2 flex-1">
          <skeleton_1.Skeleton className="h-4 w-24"/>
          <skeleton_1.Skeleton className="h-3 w-16"/>
        </div>

        <skeleton_1.Skeleton className="h-5 w-5 rounded-full ml-auto"/>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4 mt-[-18px]">
        {Math.random() > 0.5 && (<skeleton_1.Skeleton className="w-full h-[200px] rounded-md"/>)}

        <div className="space-y-2">
          <skeleton_1.Skeleton className="h-4 w-full"/>
          <skeleton_1.Skeleton className="h-4 w-full"/>
          <skeleton_1.Skeleton className="h-4 w-3/4"/>
        </div>
      </card_1.CardContent>

      <card_1.CardFooter className="flex flex-col mt-[-20px]">
        <div className="flex justify-between w-full mb-3">
          <skeleton_1.Skeleton className="h-4 w-32"/>
        </div>

        <div className="flex w-full justify-between">
          <div className="flex items-center gap-3">
            <skeleton_1.Skeleton className="h-5 w-5 rounded-full"/>
            <skeleton_1.Skeleton className="h-5 w-5 rounded-full"/>
            <skeleton_1.Skeleton className="h-5 w-5 rounded-full"/>
          </div>
          <skeleton_1.Skeleton className="h-5 w-5 rounded-full"/>
        </div>
      </card_1.CardFooter>
    </card_1.Card>);
}
