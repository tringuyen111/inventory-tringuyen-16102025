import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Location, Warehouse } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { PlusCircle, Loader2, Search, FileDown } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const LocationStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const statusClasses =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

type LocationType = 'storage' | 'receiving' | 'staging';

export default function Locations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number | ''>('');
  const [locationType, setLocationType] = useState<LocationType>('storage');
  const [allowMixedLot, setAllowMixedLot] = useState(false);

  const queryClient = useQueryClient();

  // Fetch locations with warehouse name
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: async (): Promise<Location[]> => {
      const { data, error } = await supabase
        .from("location")
        .select("*, warehouse(name)")
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Fetch warehouses for the dropdown
  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["warehousesSimple"],
    queryFn: async (): Promise<Pick<Warehouse, 'id' | 'name'>[]> => {
        const { data, error } = await supabase.from("warehouse").select("id, name");
        if (error) throw new Error(error.message);
        return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newLocation: Omit<Location, 'id' | 'created_at' | 'status' | 'zone' | 'bin'>) => {
      const { error } = await supabase.from("location").insert([newLocation]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsDialogOpen(false);
      // Reset form state
      setWarehouseId("");
      setCode("");
      setName("");
      setCapacity('');
      setLocationType('storage');
      setAllowMixedLot(false);
      toast({
        title: "Success!",
        description: "A new location has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name && warehouseId) {
        createMutation.mutate({ 
            code, 
            name, 
            warehouse_id: warehouseId,
            capacity: capacity || null,
            type: locationType,
            allow_mixed_lot: allowMixedLot,
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Locations</h2>
          <p className="text-sm text-muted-foreground">Manage your warehouse bin locations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <div>
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger id="warehouse">
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingWarehouses ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : (
                                warehouses?.map(wh => (
                                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="type">Location Type</Label>
                    <Select value={locationType} onValueChange={(v) => setLocationType(v as LocationType)}>
                        <SelectTrigger id="type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="receiving">Receiving</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="allow-mixed-lot" checked={allowMixedLot} onCheckedChange={setAllowMixedLot} />
                    <Label htmlFor="allow-mixed-lot">Allow mixed lot</Label>
                </div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full mt-2">
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create"}
                </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search locations..." className="pl-8 sm:w-[300px]" />
                </div>
                <Button variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {isLoadingLocations ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading locations...</p>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px] text-muted-foreground">Code</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Warehouse</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="w-[100px] text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[180px] text-muted-foreground">Created At</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {locations?.map((loc) => (
                    <TableRow key={loc.id}>
                    <TableCell className="font-mono text-sm font-medium">{loc.code}</TableCell>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>{loc.warehouse?.name || 'N/A'}</TableCell>
                    <TableCell>{loc.type}</TableCell>
                    <TableCell>
                        <LocationStatusBadge status={loc.status} />
                    </TableCell>
                    <TableCell>{new Date(loc.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}