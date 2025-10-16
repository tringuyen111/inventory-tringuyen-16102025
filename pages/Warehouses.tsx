import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Warehouse, Branch } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { PlusCircle, Loader2, Search, FileDown } from "lucide-react";
import { toast } from "../components/ui/use-toast";

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
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [branchId, setBranchId] = useState("");
  const queryClient = useQueryClient();

  // Fetch warehouses with branch and organization names (nested join)
  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async (): Promise<Warehouse[]> => {
      const { data, error } = await supabase
        .from("warehouse")
        .select("*, branch(*, organization(name))")
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Fetch branches for the dropdown
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branchesSimple"],
    queryFn: async (): Promise<Pick<Branch, 'id' | 'name'>[]> => {
        const { data, error } = await supabase.from("branch").select("id, name");
        if (error) throw new Error(error.message);
        return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newWarehouse: { code: string; name: string; address: string; branch_id: string }) => {
      const { error } = await supabase.from("warehouse").insert([newWarehouse]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setIsDialogOpen(false);
      setCode("");
      setName("");
      setAddress("");
      setBranchId("");
      toast({
        title: "Success!",
        description: "A new warehouse has been created.",
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
    if (code && name && branchId) {
        createMutation.mutate({ code, name, address, branch_id: branchId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-sm text-muted-foreground">Manage your warehouses and their locations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Warehouse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branchId} onValueChange={setBranchId}>
                            <SelectTrigger id="branch">
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingBranches ? (
                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                    branches?.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
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
                    <Input placeholder="Search warehouses..." className="pl-8 sm:w-[300px]" />
                </div>
                <Button variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {isLoadingWarehouses ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading warehouses...</p>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-muted-foreground w-[120px]">Code</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Branch</TableHead>
                    <TableHead className="text-muted-foreground">Organization</TableHead>
                    <TableHead className="text-muted-foreground w-[100px]">Status</TableHead>
                    <TableHead className="text-muted-foreground w-[180px]">Created At</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {warehouses?.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                    <TableCell className="font-mono text-sm font-medium">{warehouse.code}</TableCell>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.branch?.name || 'N/A'}</TableCell>
                    <TableCell>{warehouse.branch?.organization?.name || 'N/A'}</TableCell>
                    <TableCell>
                        <WarehouseStatusBadge status={warehouse.status} />
                    </TableCell>
                    <TableCell>{new Date(warehouse.created_at).toLocaleString()}</TableCell>
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