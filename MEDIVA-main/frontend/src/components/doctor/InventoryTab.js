import React, { useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Package, Plus, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TriageBadge } from "@/components/Brand";
import { addInventory } from "@/lib/api";
import { expiryStatus } from "@/lib/format";

export default function InventoryTab({ inventory, onChange }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    medicine_name: "",
    batch_number: "",
    stock_quantity: "",
    unit: "bottles",
    expiry_date: dayjs().add(6, "month").format("YYYY-MM-DD"),
    supplier_name: "",
  });

  async function save() {
    if (!form.medicine_name.trim() || !form.expiry_date)
      return toast.error("Medicine name and expiry date are required.");
    setSaving(true);
    try {
      await addInventory({
        ...form,
        stock_quantity: Number(form.stock_quantity) || 0,
      });
      toast.success("Inventory item added");
      setOpen(false);
      setForm({
        medicine_name: "",
        batch_number: "",
        stock_quantity: "",
        unit: "bottles",
        expiry_date: dayjs().add(6, "month").format("YYYY-MM-DD"),
        supplier_name: "",
      });
      onChange?.();
    } catch (e) {
      toast.error(e.message || "Could not add item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Medicine Stock &amp; Expiry</h2>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sorted by soonest expiry
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 bg-sky-600 hover:bg-sky-700" data-testid="doctor-add-inventory-button">
              <Plus className="h-4 w-4" /> Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="doctor-inventory-dialog">
            <DialogHeader>
              <DialogTitle>Add inventory item</DialogTitle>
              <DialogDescription>
                Add a new medicine batch to the pharmacy stock with its expiry date.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Medicine name</Label>
                <Input
                  value={form.medicine_name}
                  onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                  className="h-11"
                  data-testid="inv-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Batch number</Label>
                <Input
                  value={form.batch_number}
                  onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input
                  value={form.supplier_name}
                  onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Expiry date</Label>
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-700"
                data-testid="inv-save"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        data-testid="doctor-stock-table"
      >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Medicine</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Batch</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Qty</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Expiry</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-slate-600">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  <Package className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  No inventory yet.
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
                const st = expiryStatus(item.expiry_date);
                const rowBg =
                  st.tier === "red" ? "bg-rose-50/60" : st.tier === "amber" ? "bg-amber-50/50" : "";
                return (
                  <TableRow key={item.id} className={`hover:bg-slate-50 ${rowBg}`}>
                    <TableCell className="text-sm font-medium text-slate-900">
                      {item.medicine_name}
                      <div className="text-xs font-normal text-slate-400">{item.supplier_name}</div>
                    </TableCell>
                    <TableCell className="font-mono-num text-sm text-slate-600">
                      {item.batch_number}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {item.stock_quantity} {item.unit}
                    </TableCell>
                    <TableCell className="font-mono-num text-sm text-slate-700">
                      {dayjs(item.expiry_date).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>
                      <TriageBadge tier={st.tier} label={st.label} dataTestId="doctor-stock-expiry-badge" />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
