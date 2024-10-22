'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Upload, Download, Search } from 'lucide-react'
import MarkdownLatexRenderer from '@/components/MarkdownLatexRenderer'

export default function Component() {
  const [jsonData, setJsonData] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [editedEntry, setEditedEntry] = useState<any>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const file = event.target.files?.[0]

    if (file) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split(/\r?\n/)
          const parsedData = lines
            .map((line, index) => {
              const trimmedLine = line.trim()
              if (trimmedLine === '') return null
              try {
                return JSON.parse(trimmedLine)
              } catch (err) {
                console.error(`Error parsing JSON on line ${index + 1}:`, err)
                throw err
              }
            })
            .filter((item) => item !== null)

          setJsonData(parsedData)
          setCurrentIndex(0)
          setIsFileUploaded(true)
        } catch (error: any) {
          console.error('Error processing file:', error)
          alert(`Error processing file: ${error.message}`)
        }
      }
      fileReader.readAsText(file)
    }
  }

  useEffect(() => {
    if (jsonData.length > 0) {
      setEditedEntry(jsonData[currentIndex])
    }
  }, [currentIndex, jsonData])

  const saveCurrentEntry = (updatedEntry: any) => {
    const updatedData = [...jsonData]
    updatedData[currentIndex] = updatedEntry
    setJsonData(updatedData)
    setEditedEntry(updatedEntry)
  }

  const handleNext = () => {
    if (currentIndex < jsonData.length - 1) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSearch = () => {
    const index = jsonData.findIndex((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (index !== -1) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(index)
    } else {
      alert('No matching entry found')
    }
  }

  const JsonEditor = ({ entry, onSaveEntry }: { entry: any; onSaveEntry: (updatedEntry: any) => void }) => {
    const [localEditedEntry, setLocalEditedEntry] = useState(entry)

    useEffect(() => {
      setLocalEditedEntry(entry)
    }, [entry])

    const handleChange = (key: string, value: string) => {
      setLocalEditedEntry((prevState: any) => ({ ...prevState, [key]: value }))
    }

    const renderInputFields = () => {
      return Object.keys(localEditedEntry).map((key) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {key}:
          </label>
          <Textarea
            value={localEditedEntry[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={key === 'problem_text' || key === 'solution' || key === 'hints' ? 6 : 2}
            className="w-full"
          />
        </div>
      ))
    }

    const PreviewCard = ({ title, content }: { title: string; content: string }) => (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px] w-full" type="always">
            <div className="p-4">
              <MarkdownLatexRenderer content={content} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              {renderInputFields()}
            </ScrollArea>
            <Button onClick={() => onSaveEntry(localEditedEntry)} className="mt-4">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <PreviewCard title="Problem Text" content={localEditedEntry.problem_text} />
              <PreviewCard title="Solution" content={localEditedEntry.solution} />
              <PreviewCard title="Hints" content={localEditedEntry.hints} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <h1 className="text-3xl font-bold mb-8">QD admin panel</h1>

      {!isFileUploaded && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload JSON File</CardTitle>
            <CardDescription>Upload our scraped data in .json format</CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      Upload JSON
                    </span>
                    <input id="file-upload" name="file-upload" type="file" accept=".json" className="sr-only" onChange={handleFileUpload} />
                  </div>
                  <p className="text-xs text-gray-500">JSON files only</p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {isFileUploaded && jsonData.length > 0 && editedEntry && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Entry {currentIndex + 1} of {jsonData.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={currentIndex === jsonData.length - 1}
                variant="outline"
                size="icon"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleSearch} variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <JsonEditor entry={editedEntry} onSaveEntry={saveCurrentEntry} />

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => {
                const dataStr =
                  'data:text/json;charset=utf-8,' +
                  encodeURIComponent(
                    jsonData.map((obj) => JSON.stringify(obj)).join('\n')
                  )
                const downloadAnchorNode = document.createElement('a')
                downloadAnchorNode.setAttribute('href', dataStr)
                downloadAnchorNode.setAttribute('download', 'edited_data.json')
                document.body.appendChild(downloadAnchorNode)
                downloadAnchorNode.click()
                downloadAnchorNode.remove()
              }}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Edited JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}