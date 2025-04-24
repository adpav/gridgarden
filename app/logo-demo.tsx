"use client"

import { GridGardenLogo } from "@/components/grid-garden-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LogoDemo() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Grid Garden Logo</h1>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <GridGardenLogo size="large" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-start space-y-8 p-10">
              <div className="flex items-center w-full">
                <span className="w-24 text-sm text-muted-foreground">Small:</span>
                <GridGardenLogo size="small" />
              </div>
              <div className="flex items-center w-full">
                <span className="w-24 text-sm text-muted-foreground">Medium:</span>
                <GridGardenLogo size="medium" />
              </div>
              <div className="flex items-center w-full">
                <span className="w-24 text-sm text-muted-foreground">Large:</span>
                <GridGardenLogo size="large" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-white">
              <CardContent className="flex items-center justify-center p-10">
                <GridGardenLogo size="medium" />
              </CardContent>
            </Card>

            <Card className="bg-gray-100">
              <CardContent className="flex items-center justify-center p-10">
                <GridGardenLogo size="medium" />
              </CardContent>
            </Card>

            <Card className="bg-green-100">
              <CardContent className="flex items-center justify-center p-10">
                <GridGardenLogo size="medium" />
              </CardContent>
            </Card>

            <Card className="bg-green-800">
              <CardContent className="flex items-center justify-center p-10">
                <GridGardenLogo size="medium" className="text-white" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
