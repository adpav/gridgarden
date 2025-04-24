"use client"

import type React from "react"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import type { SquareData } from "@/app/page"

// Update the GridSquareProps interface to include the new props
interface GridSquareProps {
  data: SquareData
  isSelected: boolean
  onTap: () => void
  onLongPress: () => void
  onPointerDown: (e: React.PointerEvent) => void
  selectionMode?: boolean
  joinTop?: boolean
  joinRight?: boolean
  joinBottom?: boolean
  joinLeft?: boolean
  isDraggedOver?: boolean
  isBeingDragged?: boolean
}

// Update the GridSquare component to handle the new props
export function GridSquare({
  data,
  isSelected,
  onTap,
  onLongPress,
  onPointerDown,
  selectionMode = false,
  joinTop = false,
  joinRight = false,
  joinBottom = false,
  joinLeft = false,
  isDraggedOver = false,
  isBeingDragged = false,
}: GridSquareProps) {
  const [pressing, setPressing] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const longPressThreshold = 500 // ms

  // Update the getSquareColor function to include colors for 'building' and 'decking'
  const getSquareColor = () => {
    // First check if being dragged over
    if (isDraggedOver) {
      return "bg-primary/30 hover:bg-primary/40 ring-2 ring-primary ring-inset"
    }

    // Check if being dragged
    if (isBeingDragged) {
      return "bg-primary/50 hover:bg-primary/60 opacity-50"
    }

    // Check if selected
    if (isSelected) {
      return "bg-primary/20 hover:bg-primary/30 ring-2 ring-primary ring-inset"
    }

    switch (data.type) {
      case "plant":
        return "bg-emerald-200 hover:bg-emerald-300"
      case "tree":
        return "bg-green-600 hover:bg-green-700"
      case "lawn":
        return "bg-green-400 hover:bg-green-500"
      case "water":
        return "bg-blue-300 hover:bg-blue-400"
      case "path":
        return "bg-amber-200 hover:bg-amber-300"
      case "building":
        return "bg-gray-500 hover:bg-gray-600"
      case "decking":
        return "bg-amber-600 hover:bg-amber-700"
      default:
        return "bg-yellow-900 border-yellow-950 hover:bg-gray-200"
    }
  }

  // Calculate border radius based on which sides should be joined
  const getBorderRadius = () => {
    // If this is an empty square, always use standard border radius
    if (data.type === "empty") {
      return "rounded-md"
    }

    // Calculate border radius for each corner
    const topLeft = joinTop || joinLeft ? "0" : "0.375rem"
    const topRight = joinTop || joinRight ? "0" : "0.375rem"
    const bottomRight = joinBottom || joinRight ? "0" : "0.375rem"
    const bottomLeft = joinBottom || joinLeft ? "0" : "0.375rem"

    return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // Call the parent's onPointerDown handler
    onPointerDown(e)

    // Only start the long press timer if we're not in selection mode
    if (!selectionMode) {
      setPressing(true)
      pressTimer.current = setTimeout(() => {
        onLongPress()
        setPressing(false)
      }, longPressThreshold)
    }
  }

  const handlePointerUp = () => {
    if (pressing && !selectionMode) {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
      }
      onTap()
      setPressing(false)
    } else if (selectionMode) {
      // In selection mode, we handle taps directly
      onTap()
    }
  }

  const handlePointerLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
    setPressing(false)
  }

  // Create a border style that only shows borders where there isn't a join
  const getBorderStyle = () => {
    if (data.type === "empty" || isSelected) {
      return ""
    }

    const borderClasses = []

    // Only add borders where we don't join with another square
    if (!joinTop) borderClasses.push("border-t")
    if (!joinRight) borderClasses.push("border-r")
    if (!joinBottom) borderClasses.push("border-b")
    if (!joinLeft) borderClasses.push("border-l")

    // If we have any borders, add the base border class
    if (borderClasses.length > 0) {
      return `border-[0.5px] border-opacity-20 border-black ${borderClasses.join(" ")}`
    }

    return ""
  }

  // Update the renderSquareContent function to remove the path icon and add content for building and decking
  const renderSquareContent = () => {
    if (data.type === "plant" && data.name) {
      return <span className="truncate max-w-full px-1">{data.name}</span>
    }

    if (data.type === "tree") {
      return (
        <>
          {data.name && (
            <span className="absolute -top-1 left-0 right-0 text-center text-xs truncate px-1 font-medium text-green-900 bg-green-100 bg-opacity-80 rounded-sm">
              {data.name}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-900"
          >
            <path d="M12 22v-7l-2-2" />
            <path d="M17 8v4h1a2 2 0 0 1 0 4" />
            <path d="M11.5 8H10a2 2 0 0 0 0 4h1" />
            <path d="M15 16a2 2 0 0 1 0 4h-1" />
            <path d="M6 12a2 2 0 0 0 0 4h1" />
            <path d="M12 7V4" />
            <path d="m8 7 1-2" />
            <path d="m16 7-1-2" />
          </svg>
          {data.infoUrl && (
            <a
              href={data.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-0 right-0 p-1 text-green-900 hover:text-green-700"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          )}
        </>
      )
    }

    if (data.type === "water") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600"
        >
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      )
    }

    if (data.type === "building") {
      return null
    }

    if (data.type === "decking") {
      // Create a pattern that looks like wooden decking
      return (
        <div className="absolute inset-0 flex flex-col justify-between opacity-40">
          <div className="h-1 bg-amber-900"></div>
          <div className="h-1 bg-amber-900"></div>
          <div className="h-1 bg-amber-900"></div>
        </div>
      )
    }

    // For path, we now return null (no icon)
    if (data.type === "path") {
      return null
    }

    return null
  }

  return (
    <div
      className={cn(
        "aspect-square transition-all duration-200 cursor-pointer flex items-center justify-center text-xs font-medium relative",
        getSquareColor(),
        getBorderStyle(),
        pressing && "scale-95",
        selectionMode && "hover:ring-2 hover:ring-primary/50",
        isSelected && "z-10", // Ensure selected squares are on top
        isDraggedOver && "z-20", // Ensure drag target is on top
        isBeingDragged && "z-30 opacity-70", // Ensure dragged square is on top with opacity
      )}
      style={{
        borderRadius: getBorderRadius(),
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      data-selected={isSelected}
      data-type={data.type}
      data-dragged-over={isDraggedOver}
      data-being-dragged={isBeingDragged}
    >
      {renderSquareContent()}

      {/* Show drag indicator when being dragged */}
      {isBeingDragged && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M5 9l-3 3 3 3" />
            <path d="M9 5l3-3 3 3" />
            <path d="M15 19l3 3 3-3" />
            <path d="M19 9l3 3-3 3" />
            <path d="M2 12h20" />
            <path d="M12 2v20" />
          </svg>
        </div>
      )}

      {/* Show drop target indicator when being dragged over */}
      {isDraggedOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-md border-2 border-dashed border-primary"></div>
      )}
    </div>
  )
}
