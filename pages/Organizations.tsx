
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Organization } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { PlusCircle, Loader2 } from "lucide-react";

const OrgStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const statusClasses =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function Organizations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase.from("organization").select("*").order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      const { error } = await supabase.from("organization").insert([{ code, name }]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsDialogOpen(false);
      setCode("");
      setName("");
      // Using a more integrated notification would be better than alert in a real app
      alert("Organization created!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
        createMutation.mutate({ code, name });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">Manage your organization hierarchy.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Code</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-3" />
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
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading organizations...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[180px]">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations?.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-mono text-sm">{org.code}</TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <OrgStatusBadge status={org.status} />
                  </TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
