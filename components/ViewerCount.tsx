"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription } from "../components/ui/alert"

"../nterface ViewerCountResponse {
  viewerCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ViewerCount() {
  const [prevCount, setPrevCount] = useState<number>(0)
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null)

  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR<ViewerCountResponse>("/api/viewerCount", fetcher, { refreshInterval: 5000 })

  // Track when viewer count changes to trigger animation
  useEffect(() => {
    if (data?.viewerCount !== undefined && prevCount !== data.viewerCount) {
      setIsIncreasing(data.viewerCount > prevCount)
      setPrevCount(data.viewerCount)
    }
  }, [data?.viewerCount, prevCount])

  // Increment viewer count on mount
  useEffect(() => {
    const incrementViewerCount = async () => {
      try {
        await fetch("/api/viewerCount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "increment" }),
        })
      } catch (error) {
        console.error("Error incrementing viewer count:", error)
      }
    }

    incrementViewerCount()

    // Decrement viewer count on unmount
    return () => {
      fetch("/api/viewerCount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decrement" }),
      }).catch((error) => {
        console.error("Error decrementing viewer count:", error)
      })
    }
  }, [])

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Real-Time Audience</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  Live
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Updates every 5 seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Current number of people viewing this page</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>Unable to load viewer count. Please try again later.</AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={data?.viewerCount || 0}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-3xl font-bold tabular-nums"
                    >
                      {data?.viewerCount || 0}
                    </motion.span>
                  </AnimatePresence>
                )}
                {isIncreasing !== null && !isLoading && (
                  <Badge variant={isIncreasing ? "success" : "destructive"} className="h-5">
                    {isIncreasing ? "↑" : "↓"}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {data?.viewerCount === 1 ? "viewer" : "viewers"} online
              </span>
            </div>
          </div>
        )}
      </CardContent>    
    </Card>
  )
}

