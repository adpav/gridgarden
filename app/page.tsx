"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { GridSquare } from "@/components/grid-square"
import { SquareForm } from "@/components/square-form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { GridGardenLogo } from "@/components/grid-garden-logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define types for our garden data
export type SquareType = "empty" | "plant" | "tree" | "lawn" | "water" | "path" | "building" | "decking"

export interface SquareData {
  type: SquareType
  name?: string
  soilPh?: number
  sunExposure?: "sun" | "shade" | "both"
  notes?: string
  infoUrl?: string
}

// Define a type for our history entries
interface HistoryEntry {
  gardenData: SquareData[][]
  gridSize: { rows: number; cols: number }
  description: string
}

export default function GardenPlanner() {
  const { toast } = useToast()
  const [gridSize, setGridSize] = useState({ rows: 8, cols: 8 })
  const [gardenData, setGardenData] = useState<SquareData[][]>([])
  const [selectedSquares, setSelectedSquares] = useState<{ row: number; col: number }[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)

  // Add state for history and undo
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [canUndo, setCanUndo] = useState(false)

  // Add state for drag and drop
  const [draggedSquare, setDraggedSquare] = useState<{ row: number; col: number } | null>(null)
  const [dragOverSquare, setDragOverSquare] = useState<{ row: number; col: number } | null>(null)
  const [isDraggingSquare, setIsDraggingSquare] = useState(false)

  // Add zoom state
  const [zoomLevel, setZoomLevel] = useState(1)
  const MIN_ZOOM = 0.5
  const MAX_ZOOM = 3
  const ZOOM_STEP = 0.25

  // Grid size constraints
  const MIN_ROWS = 4
  const MAX_ROWS = 20
  const MIN_COLS = 4
  const MAX_COLS = 20

  // Initialize garden data
  useEffect(() => {
    // Try to load saved data from localStorage
    const savedData = localStorage.getItem("gardenData")
    const savedGridSize = localStorage.getItem("gridSize")

    if (savedGridSize) {
      try {
        const parsedGridSize = JSON.parse(savedGridSize)
        if (parsedGridSize && typeof parsedGridSize.rows === "number" && typeof parsedGridSize.cols === "number") {
          setGridSize(parsedGridSize)
        }
      } catch (e) {
        console.error("Failed to parse saved grid size")
      }
    }

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (Array.isArray(parsedData)) {
          setGardenData(parsedData)
          return
        }
      } catch (e) {
        console.error("Failed to parse saved garden data")
      }
    }

    // If no saved data or parsing failed, initialize with empty data
    initializeEmptyGarden()
  }, [])

  // Initialize empty garden data based on grid size
  const initializeEmptyGarden = () => {
    const initialData: SquareData[][] = Array(gridSize.rows)
      .fill(null)
      .map(() =>
        Array(gridSize.cols).fill({
          type: "empty",
        }),
      )
    setGardenData(initialData)
  }

  // Save garden data to localStorage whenever it changes
  useEffect(() => {
    if (gardenData.length > 0) {
      localStorage.setItem("gardenData", JSON.stringify(gardenData))
    }
  }, [gardenData])

  // Save grid size to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gridSize", JSON.stringify(gridSize))
  }, [gridSize])

  // Load zoom level from localStorage
  useEffect(() => {
    const savedZoom = localStorage.getItem("gardenZoomLevel")
    if (savedZoom) {
      try {
        const parsedZoom = Number.parseFloat(savedZoom)
        if (!isNaN(parsedZoom) && parsedZoom >= MIN_ZOOM && parsedZoom <= MAX_ZOOM) {
          setZoomLevel(parsedZoom)
        }
      } catch (e) {
        console.error("Failed to parse saved zoom level")
      }
    }
  }, [])

  // Save zoom level to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gardenZoomLevel", zoomLevel.toString())
  }, [zoomLevel])

  // Update canUndo state whenever history changes
  useEffect(() => {
    setCanUndo(history.length > 0)
  }, [history])

  // Function to add current state to history
  const addToHistory = (description: string) => {
    // Create a deep copy of the current garden data
    const gardenDataCopy = JSON.parse(JSON.stringify(gardenData))

    // Add to history
    setHistory((prevHistory) => [
      ...prevHistory,
      {
        gardenData: gardenDataCopy,
        gridSize: { ...gridSize },
        description,
      },
    ])
  }

  // Function to undo the last action
  const handleUndo = () => {
    if (history.length === 0) return

    // Get the last history entry
    const lastEntry = history[history.length - 1]

    // Restore garden data and grid size
    setGardenData(lastEntry.gardenData)
    setGridSize(lastEntry.gridSize)

    // Remove the entry from history
    setHistory((prevHistory) => prevHistory.slice(0, -1))

    // Show toast
    toast({
      title: "Undo",
      description: `Undid: ${lastEntry.description}`,
    })
  }

  const toggleSelectionMode = (enabled: boolean) => {
    setSelectionMode(enabled)
    if (!enabled) {
      setSelectedSquares([])
    } else {
      toast({
        title: "Selection Mode Enabled",
        description: "Tap squares to select them or drag to select multiple squares at once.",
      })
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0])
  }

  // Grid size modification functions
  const addRow = () => {
    if (gridSize.rows >= MAX_ROWS) {
      toast({
        title: "Maximum rows reached",
        description: `Cannot add more than ${MAX_ROWS} rows.`,
        variant: "destructive",
      })
      return
    }

    // Add to history before making changes
    addToHistory("Add row")

    // Create a new row of empty squares
    const newRow = Array(gridSize.cols).fill({ type: "empty" })

    // Add the new row to the garden data
    const newGardenData = [...gardenData, newRow]

    // Update state
    setGardenData(newGardenData)
    setGridSize({ ...gridSize, rows: gridSize.rows + 1 })

    toast({
      title: "Row added",
      description: `Added a new row. Grid size is now ${gridSize.rows + 1}×${gridSize.cols}.`,
    })
  }

  const removeRow = () => {
    if (gridSize.rows <= MIN_ROWS) {
      toast({
        title: "Minimum rows reached",
        description: `Cannot have fewer than ${MIN_ROWS} rows.`,
        variant: "destructive",
      })
      return
    }

    // Add to history before making changes
    addToHistory("Remove row")

    // Remove the last row
    const newGardenData = gardenData.slice(0, -1)

    // Update state
    setGardenData(newGardenData)
    setGridSize({ ...gridSize, rows: gridSize.rows - 1 })

    // Clear any selections that might be in the removed row
    setSelectedSquares((prev) => prev.filter((square) => square.row < gridSize.rows - 1))

    toast({
      title: "Row removed",
      description: `Removed the last row. Grid size is now ${gridSize.rows - 1}×${gridSize.cols}.`,
    })
  }

  const addColumn = () => {
    if (gridSize.cols >= MAX_COLS) {
      toast({
        title: "Maximum columns reached",
        description: `Cannot add more than ${MAX_COLS} columns.`,
        variant: "destructive",
      })
      return
    }

    // Add to history before making changes
    addToHistory("Add column")

    // Add a new column to each row
    const newGardenData = gardenData.map((row) => [...row, { type: "empty" }])

    // Update state
    setGardenData(newGardenData)
    setGridSize({ ...gridSize, cols: gridSize.cols + 1 })

    toast({
      title: "Column added",
      description: `Added a new column. Grid size is now ${gridSize.rows}×${gridSize.cols + 1}.`,
    })
  }

  const removeColumn = () => {
    if (gridSize.cols <= MIN_COLS) {
      toast({
        title: "Minimum columns reached",
        description: `Cannot have fewer than ${MIN_COLS} columns.`,
        variant: "destructive",
      })
      return
    }

    // Add to history before making changes
    addToHistory("Remove column")

    // Remove the last column from each row
    const newGardenData = gardenData.map((row) => row.slice(0, -1))

    // Update state
    setGardenData(newGardenData)
    setGridSize({ ...gridSize, cols: gridSize.cols - 1 })

    // Clear any selections that might be in the removed column
    setSelectedSquares((prev) => prev.filter((square) => square.col < gridSize.cols - 1))

    toast({
      title: "Column removed",
      description: `Removed the last column. Grid size is now ${gridSize.rows}×${gridSize.cols - 1}.`,
    })
  }

  const handleGridPointerDown = (e: React.PointerEvent, row: number, col: number) => {
    // If we're in drag mode, start dragging the square
    if (e.altKey || e.ctrlKey) {
      setIsDraggingSquare(true)
      setDraggedSquare({ row, col })
      return
    }

    if (selectionMode) {
      setIsDragging(true)
      setDragStart({ row, col })

      // If we're starting a new drag and not in the middle of a multi-select operation,
      // clear the previous selection unless shift key is pressed
      if (!e.shiftKey) {
        setSelectedSquares([{ row, col }])
      } else if (!selectedSquares.some((s) => s.row === row && s.col === col)) {
        // If shift key is pressed, add to selection if not already selected
        setSelectedSquares([...selectedSquares, { row, col }])
      }

      // Prevent default to avoid text selection
      e.preventDefault()
    }
  }

  const handleGridPointerMove = (e: React.PointerEvent) => {
    if (!gridRef.current) return

    // Get the grid element's position and dimensions
    const gridRect = gridRef.current.getBoundingClientRect()
    const squareWidth = gridRect.width / gridSize.cols
    const squareHeight = gridRect.height / gridSize.rows

    // Calculate which square the pointer is over
    const col = Math.min(Math.max(Math.floor((e.clientX - gridRect.left) / squareWidth), 0), gridSize.cols - 1)
    const row = Math.min(Math.max(Math.floor((e.clientY - gridRect.top) / squareHeight), 0), gridSize.rows - 1)

    // Handle square dragging
    if (isDraggingSquare && draggedSquare) {
      setDragOverSquare({ row, col })
      return
    }

    // Handle selection dragging
    if (selectionMode && isDragging && dragStart) {
      // If we've moved to a new square, update the selection
      if (!selectedSquares.some((s) => s.row === row && s.col === col)) {
        // Calculate the rectangle between dragStart and current position
        const startRow = Math.min(dragStart.row, row)
        const endRow = Math.max(dragStart.row, row)
        const startCol = Math.min(dragStart.col, col)
        const endCol = Math.max(dragStart.col, col)

        // Create a new selection that includes all squares in the rectangle
        const newSelection: { row: number; col: number }[] = []

        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            newSelection.push({ row: r, col: c })
          }
        }

        setSelectedSquares(newSelection)
      }
    }
  }

  const handleGridPointerUp = () => {
    // Handle square dragging completion
    if (isDraggingSquare && draggedSquare && dragOverSquare) {
      // Only proceed if we're dropping to a different location
      if (draggedSquare.row !== dragOverSquare.row || draggedSquare.col !== dragOverSquare.col) {
        // Add to history before making changes
        addToHistory(
          `Move square from (${draggedSquare.row},${draggedSquare.col}) to (${dragOverSquare.row},${dragOverSquare.col})`,
        )

        // Create a copy of the garden data
        const newGardenData = [...gardenData.map((row) => [...row])]

        // Get the data from the dragged square
        const draggedData = { ...gardenData[draggedSquare.row][draggedSquare.col] }

        // Move the data to the new location
        newGardenData[dragOverSquare.row][dragOverSquare.col] = draggedData

        // Clear the original location if not in copy mode (Alt key)
        if (!window.event || !(window.event as any).altKey) {
          newGardenData[draggedSquare.row][draggedSquare.col] = { type: "empty" }
        }

        // Update the garden data
        setGardenData(newGardenData)

        toast({
          title: "Square moved",
          description:
            window.event && (window.event as any).altKey
              ? "Square copied to new location"
              : "Square moved to new location",
        })
      }
    }

    // Reset drag states
    setIsDraggingSquare(false)
    setDraggedSquare(null)
    setDragOverSquare(null)

    // Handle selection dragging completion
    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)

      if (selectedSquares.length > 1 && selectionMode) {
        toast({
          title: `${selectedSquares.length} squares selected`,
          description: "Click 'Apply to Selected' to modify all selected squares.",
        })
      }
    }
  }

  const handleSquareTap = (row: number, col: number) => {
    if (selectionMode) {
      // In selection mode, toggle the selection state of the square
      const isSelected = selectedSquares.some((s) => s.row === row && s.col === col)

      if (isSelected) {
        setSelectedSquares(selectedSquares.filter((s) => !(s.row === row && s.col === col)))
      } else {
        setSelectedSquares([...selectedSquares, { row, col }])
      }
    } else if (isSelecting) {
      // Original multi-select mode behavior
      if (!selectedSquares.some((s) => s.row === row && s.col === col)) {
        setSelectedSquares([...selectedSquares, { row, col }])
      }
    } else {
      // Single tap behavior (unchanged)
      setSelectedSquares([{ row, col }])
      setShowForm(true)
    }
  }

  const handleSquareLongPress = (row: number, col: number) => {
    if (!selectionMode) {
      setIsSelecting(true)
      setSelectedSquares([{ row, col }])
      toast({
        title: "Multiple selection mode",
        description: "Tap additional squares to select them. Tap 'Apply to Selected' when done.",
      })
    }
  }

  const cancelSelection = () => {
    setIsSelecting(false)
    setSelectedSquares([])
    setShowForm(false)
    // Don't turn off selection mode automatically
  }

  const handleFormSubmit = (data: SquareData) => {
    // Add to history before making changes
    addToHistory(`Edit ${selectedSquares.length} square${selectedSquares.length > 1 ? "s" : ""}`)

    const updatedGardenData = gardenData.map((row, rowIndex) =>
      row.map((square, colIndex) => {
        if (selectedSquares.some((s) => s.row === rowIndex && s.col === colIndex)) {
          return data
        }
        return square
      }),
    )

    setGardenData(updatedGardenData)
    setShowForm(false)
    setSelectedSquares([])
    setIsSelecting(false)
  }

  // Helper function to check if two squares have the same type
  const hasSameType = (row1: number, col1: number, row2: number, col2: number) => {
    if (
      row2 < 0 ||
      row2 >= gridSize.rows ||
      col2 < 0 ||
      col2 >= gridSize.cols ||
      !gardenData[row1] ||
      !gardenData[row2]
    ) {
      return false
    }

    const square1 = gardenData[row1][col1]
    const square2 = gardenData[row2][col2]

    return square1?.type === square2?.type && square1?.type !== "empty"
  }

  // Format zoom level as percentage
  const zoomPercentage = Math.round(zoomLevel * 100)

  // Determine if a square is being dragged over
  const isSquareDraggedOver = (row: number, col: number) => {
    return dragOverSquare?.row === row && dragOverSquare?.col === col
  }

  // Determine if a square is being dragged
  const isSquareBeingDragged = (row: number, col: number) => {
    return draggedSquare?.row === row && draggedSquare?.col === col && isDraggingSquare
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <GridGardenLogo size="small" />
        <div className="w-32"></div> {/* Spacer for alignment */}
      </div>

      <h1 className="text-3xl font-bold text-left hidden">Grid Garden Planner</h1>
      <p className="text-left mb-4">Map out your garden using the grid below.</p>

      <Tabs defaultValue="controls" className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="grid-size">Grid Size</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <Switch id="selection-mode" checked={selectionMode} onCheckedChange={toggleSelectionMode} />
              <Label htmlFor="selection-mode" className="cursor-pointer">
                Selection Mode {selectionMode ? "(On)" : "(Off)"}
              </Label>
            </div>

            {/* Undo button */}
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo} className="h-9 w-9">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7v6h6" />
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                      </svg>
                      <span className="sr-only">Undo</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo Last Action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-sm">
                <p>Undo</p>
                <p className="text-xs text-muted-foreground">
                  {canUndo ? `${history.length} action${history.length !== 1 ? "s" : ""}` : "No actions"}
                </p>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
                title="Zoom Out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span className="sr-only">Zoom Out</span>
              </Button>

              <div className="flex items-center space-x-2 min-w-[120px]">
                <Slider
                  value={[zoomLevel]}
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={ZOOM_STEP}
                  onValueChange={handleZoomChange}
                  className="w-24"
                />
                <span className="text-xs font-medium w-12">{zoomPercentage}%</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
                title="Zoom In"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span className="sr-only">Zoom In</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleResetZoom} className="text-xs">
                Reset
              </Button>
            </div>
          </div>

          {/* Drag instructions */}
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="text-sm font-medium mb-1">Drag & Drop Squares</h3>
            <p className="text-xs text-muted-foreground">
              Hold Ctrl/Cmd while dragging to move a square. Hold Alt while dragging to copy a square.
            </p>
          </div>

          {(selectionMode || isSelecting) && selectedSquares.length > 0 && (
            <div className="flex items-center space-x-4 bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-bold">{selectedSquares.length}</span> squares selected
              </p>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={cancelSelection}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setShowForm(true)}>
                  Apply to Selected
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grid-size" className="pt-2">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Row controls */}
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <div className="flex flex-col items-center">
                <Label className="mb-1 text-sm">Rows: {gridSize.rows}</Label>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={removeRow} disabled={gridSize.rows <= MIN_ROWS}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3v18h18" />
                            <path d="M3 15h18" />
                          </svg>
                          <span className="sr-only">Remove Row</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove Row</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={addRow} disabled={gridSize.rows >= MAX_ROWS}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3v18h18" />
                            <path d="M3 9h18" />
                            <path d="M3 15h18" />
                            <path d="M9 3v18" />
                          </svg>
                          <span className="sr-only">Add Row</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Row</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Column controls */}
            <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg">
              <div className="flex flex-col items-center">
                <Label className="mb-1 text-sm">Columns: {gridSize.cols}</Label>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={removeColumn}
                          disabled={gridSize.cols <= MIN_COLS}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3v18h18" />
                            <path d="M9 3v18" />
                          </svg>
                          <span className="sr-only">Remove Column</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove Column</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={addColumn} disabled={gridSize.cols >= MAX_COLS}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3v18h18" />
                            <path d="M9 3v18" />
                            <path d="M15 3v18" />
                            <path d="M3 9h18" />
                          </svg>
                          <span className="sr-only">Add Column</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Column</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Grid size display */}
            <div className="flex items-center justify-center bg-muted p-3 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Grid Size</p>
                <p className="text-lg font-bold">
                  {gridSize.rows} × {gridSize.cols}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Grid container with zoom */}
      <div
        ref={gridContainerRef}
        className="overflow-auto border rounded-lg mb-8 bg-gray-50 p-4"
        style={{
          height: "calc(100vh - 300px)",
          minHeight: "400px",
        }}
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "1rem",
          }}
        >
          <div
            ref={gridRef}
            className="grid gap-0 relative touch-none"
            style={{
              gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
              width: "100%",
              maxWidth: "1000px",
            }}
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerLeave={handleGridPointerUp}
          >
            {Array.from({ length: gridSize.rows }).map((_, rowIndex) =>
              Array.from({ length: gridSize.cols }).map((_, colIndex) => (
                <GridSquare
                  key={`${rowIndex}-${colIndex}`}
                  data={gardenData[rowIndex]?.[colIndex] || { type: "empty" }}
                  isSelected={selectedSquares.some((s) => s.row === rowIndex && s.col === colIndex)}
                  onTap={() => handleSquareTap(rowIndex, colIndex)}
                  onLongPress={() => handleSquareLongPress(rowIndex, colIndex)}
                  onPointerDown={(e) => handleGridPointerDown(e, rowIndex, colIndex)}
                  selectionMode={selectionMode}
                  // Pass information about adjacent squares
                  joinTop={hasSameType(rowIndex, colIndex, rowIndex - 1, colIndex)}
                  joinRight={hasSameType(rowIndex, colIndex, rowIndex, colIndex + 1)}
                  joinBottom={hasSameType(rowIndex, colIndex, rowIndex + 1, colIndex)}
                  joinLeft={hasSameType(rowIndex, colIndex, rowIndex, colIndex - 1)}
                  // Pass drag and drop states
                  isDraggedOver={isSquareDraggedOver(rowIndex, colIndex)}
                  isBeingDragged={isSquareBeingDragged(rowIndex, colIndex)}
                />
              )),
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <SquareForm
          initialData={
            selectedSquares.length === 1
              ? gardenData[selectedSquares[0].row][selectedSquares[0].col]
              : { type: "empty" }
          }
          onSubmit={handleFormSubmit}
          onCancel={cancelSelection}
          multipleSelection={selectedSquares.length > 1}
        />
      )}
    </div>
  )
}
