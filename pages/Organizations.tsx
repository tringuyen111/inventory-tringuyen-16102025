import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Organization } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal, DialogOverlay, DialogFooter, DialogDescription } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { PlusCircle, Loader2, Search, FileDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const OrgStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const statusClasses =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function Organizations() {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase.from("organization").select("*").order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const handleOpenCreate = () => {
    setSelectedOrg(null);
    setCode('');
    setName('');
    setStatus('active');
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setCode(org.code);
    setName(org.name);
    setStatus(org.status);
    setIsFormDialogOpen(true);
  };

  const handleOpenDelete = (org: Organization) => {
    setSelectedOrg(org);
    setIsDeleteDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      const { error } = await supabase.from("organization").insert([{ code, name }]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsFormDialogOpen(false);
      toast({
        title: "Success!",
        description: "A new organization has been created.",
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

  const updateMutation = useMutation({
    mutationFn: async (updatedOrg: { id: string; code: string; name: string; status: string }) => {
        const { id, ...updateData } = updatedOrg;
        const { error } = await supabase.from("organization").update(updateData).eq("id", id);
        if (error) throw new Error(error.message);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        setIsFormDialogOpen(false);
        toast({ title: "Success!", description: "Organization has been updated." });
    },
    onError: (error: Error) => {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from("organization").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        setIsDeleteDialogOpen(false);
        toast({ title: "Success!", description: "Organization has been deleted." });
    },
    onError: (error: Error) => {
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: error.message,
        });
    },
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
        if (selectedOrg) {
            updateMutation.mutate({ id: selectedOrg.id, code, name, status });
        } else {
            createMutation.mutate({ code, name });
        }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedOrg) {
        deleteMutation.mutate(selectedOrg.id);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-sm text-muted-foreground">Manage your organization hierarchy.</p>
        </div>
        <Button onClick={handleOpenCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
        </Button>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedOrg ? 'Edit Organization' : 'Create New Organization'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                      <div>
                          <Label htmlFor="code">Code</Label>
                          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                      </div>
                      <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      {selectedOrg && (
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                      )}
                  </div>
                  <Button type="submit" disabled={isMutating} className="w-full mt-2">
                    {isMutating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {selectedOrg ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (selectedOrg ? 'Save Changes' : 'Create')}
                  </Button>
              </form>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the <strong>{selectedOrg?.name}</strong> organization.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                        <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search organizations..." className="pl-8 sm:w-[300px]" />
                </div>
                <Button variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading organizations...</p>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px] text-muted-foreground">Code</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="w-[100px] text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[180px] text-muted-foreground">Created At</TableHead>
                    <TableHead className="w-[100px] text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {organizations?.map((org) => (
                    <TableRow key={org.id}>
                    <TableCell className="font-mono text-sm font-medium">{org.code}</TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                        <OrgStatusBadge status={org.status} />
                    </TableCell>
                    <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(org)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(org)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </TableCell>
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