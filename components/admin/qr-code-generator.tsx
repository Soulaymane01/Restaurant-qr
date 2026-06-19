"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Trash2, QrCode } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import type { QRCode, Restaurant } from "@/lib/types"
import QRCodeLib from "qrcode"

interface Props { restaurantId: string }

export function QRCodeGenerator({ restaurantId }: Props) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState("")
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewImg, setPreviewImg] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QRCode | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [sortedQrCodes, restSnapshot] = await Promise.all([
        getDocs(query(collection(db, "qrCodes"), where("restaurantId", "==", restaurantId)))
          .then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() } as QRCode))
          .sort((a, b) => { const da = a.createdAt?.toDate?.() || new Date(0); const db = b.createdAt?.toDate?.() || new Date(0); return db.getTime() - da.getTime() })),
        getDoc(doc(db, "restaurants", restaurantId)),
      ])
      setQrCodes(sortedQrCodes)
      if (restSnapshot.exists()) setRestaurant({ id: restSnapshot.id, ...restSnapshot.data() } as Restaurant)
    } catch { toast.error("Failed to load QR codes") } finally { setLoading(false) }
  }, [restaurantId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleGenerate = async () => {
    const tableNum = Number.parseInt(tableNumber)
    if (!tableNum || tableNum < 1) { toast.error("Enter a valid table number"); return }
    setGenerating(true)
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const slug = restaurant?.slug || "restaurant"
      const menuUrl = `${baseUrl}/menu/${slug}/${tableNum}`
      const qrDataUrl = await QRCodeLib.toDataURL(menuUrl, { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      setPreviewUrl(menuUrl); setPreviewImg(qrDataUrl); setPreviewOpen(true)
    } catch { toast.error("Failed to generate QR code") } finally { setGenerating(false) }
  }

  const handleSave = async () => {
    if (!previewImg || !previewUrl) return
    try {
      const res = await fetch("/api/qr-codes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: Number.parseInt(tableNumber), restaurantId, qrCodeUrl: previewImg }),
      })
      if (!res.ok) throw new Error()
      toast.success("QR code saved"); setPreviewOpen(false); setTableNumber(""); fetchData()
    } catch { toast.error("Failed to save QR code") }
  }

  const handleDownload = (dataUrl: string, tableNum: number) => {
    const link = document.createElement("a")
    link.download = `table-${tableNum}-qr.png`; link.href = dataUrl; link.click()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/qr-codes/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("QR code deleted"); setDeleteTarget(null); fetchData()
    } catch { toast.error("Failed to delete QR code") } finally { setDeleting(false) }
  }

  if (loading) {
    return <div className="space-y-6">
      <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><div className="flex gap-4 items-end"><Skeleton className="h-10 flex-1 max-w-xs" /><Skeleton className="h-10 w-32" /></div></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 flex-1" /><Skeleton className="h-5 w-24" /><Skeleton className="h-8 w-16" /></div>)}</CardContent></Card>
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Generate New QR Code</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1 max-w-xs"><Label htmlFor="table">Table Number</Label><Input id="table" type="number" min="1" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 1" /></div>
            <Button onClick={handleGenerate} disabled={generating || !tableNumber}><QrCode className="h-4 w-4 mr-2" />{generating ? "Generating..." : "Generate"}</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Table {tableNumber} QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {previewImg && <img src={previewImg} alt="QR Code" className="w-64 h-64" />}
            <p className="text-xs text-muted-foreground text-center break-all">{previewUrl}</p>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => handleDownload(previewImg, Number.parseInt(tableNumber))}><Download className="h-4 w-4 mr-2" />Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {qrCodes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Saved QR Codes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Table</TableHead><TableHead>Menu URL</TableHead><TableHead>Created</TableHead><TableHead className="w-32"></TableHead></TableRow></TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell className="font-medium">Table {qr.tableNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">/menu/{restaurant?.slug}/{qr.tableNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{qr.createdAt?.toDate?.().toLocaleDateString() || new Date(qr.createdAt as unknown as string).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild><Button variant="ghost" size="icon"><QrCode className="h-4 w-4" /></Button></DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader><DialogTitle>Table {qr.tableNumber}</DialogTitle></DialogHeader>
                            <div className="flex flex-col items-center py-4">
                              <img src={qr.qrCodeUrl} alt="" className="w-64 h-64" />
                              <Button variant="outline" className="mt-4" onClick={() => handleDownload(qr.qrCodeUrl, qr.tableNumber)}><Download className="h-4 w-4 mr-2" />Download</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(qr)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete QR code?</AlertDialogTitle>
            <AlertDialogDescription>Delete QR code for Table {deleteTarget?.tableNumber}?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">{deleting ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
