"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SquareData, SquareType } from "@/app/page"

interface SquareFormProps {
  initialData: SquareData
  onSubmit: (data: SquareData) => void
  onCancel: () => void
  multipleSelection: boolean
}

export function SquareForm({ initialData, onSubmit, onCancel, multipleSelection }: SquareFormProps) {
  const [formData, setFormData] = useState<SquareData>(initialData)
  const [activeTab, setActiveTab] = useState<string>("general")

  const handleTypeChange = (value: SquareType) => {
    setFormData({ ...formData, type: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Determine if we should show the detailed tabs
  const showDetailedTabs = formData.type === "plant" || formData.type === "tree"

  return (
    <Card className="w-full max-w-xl mx-auto fixed bottom-4 left-1/2 transform -translate-x-1/2 shadow-lg z-50 bg-white">
      <CardHeader>
        <CardTitle>
          {multipleSelection
            ? "Edit Multiple Squares"
            : `Edit ${formData.type !== "empty" ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1) : "Square"}`}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Square Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleTypeChange(value as SquareType)}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plant" id="plant" />
                <Label htmlFor="plant">Plant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tree" id="tree" />
                <Label htmlFor="tree">Tree</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lawn" id="lawn" />
                <Label htmlFor="lawn">Lawn</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="water" id="water" />
                <Label htmlFor="water">Water</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="path" id="path" />
                <Label htmlFor="path">Path</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="building" id="building" />
                <Label htmlFor="building">Building</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="decking" id="decking" />
                <Label htmlFor="decking">Decking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="empty" id="empty" />
                <Label htmlFor="empty">Empty</Label>
              </div>
            </RadioGroup>
          </div>

          {showDetailedTabs && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="growing">Growing</TabsTrigger>
                <TabsTrigger value="notes">Notes & Info</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{formData.type === "plant" ? "Plant" : "Tree"} Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formData.type === "plant" ? "e.g., Tomato, Basil, Rose" : "e.g., Oak, Maple, Cherry"}
                  />
                </div>
              </TabsContent>

              <TabsContent value="growing" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="soilPh">Soil pH Level: {formData.soilPh || 7}</Label>
                  </div>
                  <Slider
                    id="soilPh"
                    min={0}
                    max={14}
                    step={0.1}
                    value={[formData.soilPh || 7]}
                    onValueChange={(value) => setFormData({ ...formData, soilPh: value[0] })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Acidic (0)</span>
                    <span>Neutral (7)</span>
                    <span>Alkaline (14)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sun Exposure</Label>
                  <RadioGroup
                    value={formData.sunExposure || "both"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sunExposure: value as "sun" | "shade" | "both" })
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sun" id="sun" />
                      <Label htmlFor="sun">Full Sun</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shade" id="shade" />
                      <Label htmlFor="shade">Shade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Partial</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={`Additional information about this ${formData.type}...`}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="infoUrl">Information Link</Label>
                  <Input
                    id="infoUrl"
                    type="url"
                    value={formData.infoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, infoUrl: e.target.value })}
                    placeholder="https://example.com/plant-info"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a link to a webpage with more information about this {formData.type}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{multipleSelection ? "Apply to All Selected" : "Save"}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
