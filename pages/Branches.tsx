import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Branch, Organization } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal, DialogOverlay } from "../components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { PlusCircle, Loader2, Search, FileDown } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const BranchStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const statusClasses =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

export default function Branches() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const queryClient = useQueryClient();

  // Fetch branches with organization name
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: async (): Promise<Branch[]> => {
      const { data, error } = await supabase
        .from("branch")
        .select("*, organization(name)")
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Fetch organizations for the dropdown
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Pick<Organization, 'id' | 'name'>[]> => {
        const { data, error } = await supabase.from("organization").select("id, name");
        if (error) throw new Error(error.message);
        return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newBranch: { code: string; name: string; organization_id: string }) => {
      const { error } = await supabase.from("branch").insert([newBranch]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsDialogOpen(false);
      setCode("");
      setName("");
      setOrganizationId("");
      toast({
        title: "Success!",
        description: "A new branch has been created.",
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
    if (code && name && organizationId) {
        createMutation.mutate({ code, name, organization_id: organizationId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
          <p className="text-sm text-muted-foreground">Manage your company's branches.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Branch
            </Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                      <div>
                          <Label htmlFor="organization">Organization</Label>
                          <Select value={organizationId} onValueChange={setOrganizationId}>
                              <SelectTrigger id="organization">
                                  <SelectValue placeholder="Select an organization" />
                              </SelectTrigger>
                              <SelectContent>
                                  {isLoadingOrganizations ? (
                                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                                  ) : (
                                      organizations?.map(org => (
                                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
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
          </DialogPortal>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search branches..." className="pl-8 sm:w-[300px]" />
                </div>
                <Button variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {isLoadingBranches ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading branches...</p>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px] text-muted-foreground">Code</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Organization</TableHead>
                    <TableHead className="w-[100px] text-muted-foreground">Status</TableHead>
                    <TableHead className="w-[180px] text-muted-foreground">Created At</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {branches?.map((branch) => (
                    <TableRow key={branch.id}>
                    <TableCell className="font-mono text-sm font-medium">{branch.code}</TableCell>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.organization?.name || 'N/A'}</TableCell>
                    <TableCell>
                        <BranchStatusBadge status={branch.status} />
                    </TableCell>
                    <TableCell>{new Date(branch.created_at).toLocaleString()}</TableCell>
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