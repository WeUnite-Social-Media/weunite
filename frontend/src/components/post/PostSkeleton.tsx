import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostSkeleton() {
  return (
    <Card className="w-full max-w-[45em] shadow-none border-0 border-b rounded-none border-foreground/50">
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />

        <div className="flex flex-col space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>

        <Skeleton className="h-5 w-5 rounded-full ml-auto" />
      </CardHeader>

      <CardContent className="space-y-4 mt-[-18px]">
        {Math.random() > 0.5 && (
          <Skeleton className="w-full h-[200px] rounded-md" />
        )}

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col mt-[-20px]">
        <div className="flex justify-between w-full mb-3">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex w-full justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
