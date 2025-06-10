import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function WeatherSkeleton() {
  return (
    <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="p-6">
        {/* Réponse principale */}
        <div className="text-center p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl mb-6 border-2 border-green-200">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto" />
        </div>

        {/* Détails météorologiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-full" />
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
