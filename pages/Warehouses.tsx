
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Warehouse, Organization } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select } from "../components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { PlusCircle, Loader2 } from "lucide-react";

const WarehouseStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const statusClasses =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function Warehouses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const queryClient = useQueryClient();

  // Fetch warehouses with organization name
  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async (): Promise<Warehouse[]> => {
      const { data, error } = await supabase
        .from("warehouse")
        .select("*, organization(name)")
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data as any) || [];
    },
  });

  // Fetch organizations for the select dropdown
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Pick<Organization, 'id' | 'name'>[]> => {
      const { data, error } = await supabase.from("organization").select("id, name");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newWarehouse: { organization_id: string; code: string; name: string; address: string; }) => {
      const { error } = await supabase.from("warehouse").insert([newWarehouse]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setIsDialogOpen(false);
      setOrganizationId("");
      setCode("");
      setName("");
      setAddress("");
      alert("Warehouse created!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationId && code && name) {
        createMutation.mutate({ organization_id: organizationId, code, name, address });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">Manage your warehouses and their locations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Warehouse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="organization" className="text-right">Organization</Label>
                        <Select 
                          id="organization" 
                          value={organizationId} 
                          onChange={(e) => setOrganizationId(e.target.value)} 
                          required 
                          className="col-span-3"
                        >
                            <option value="" disabled>Select an organization</option>
                            {organizations?.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Code</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
                    </div>
                </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg shadow-sm">
        {isLoadingWarehouses ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading warehouses...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[180px]">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses?.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-sm">{wh.code}</TableCell>
                  <TableCell className="font-medium">{wh.name}</TableCell>
                  <TableCell>{wh.organization?.name || 'N/A'}</TableCell>
                  <TableCell>{wh.address || 'N/A'}</TableCell>
                  <TableCell>
                    <WarehouseStatusBadge status={wh.status} />
                  </TableCell>
                  <TableCell>{new Date(wh.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
