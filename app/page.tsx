"use client";

import { useState } from "react";
import { Plus, Users, Upload, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { UserForm } from "@/components/user-form";
import { UserList } from "@/components/user-list";
import { BulkUpload } from "@/components/bulk-upload";
import { User } from "@/types/user";

export default function Home() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSuccess = () => {
    setEditingUser(null);
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("users");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setActiveTab("form");
  };

  const handleCancel = () => {
    setEditingUser(null);
    setActiveTab("users");
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setActiveTab("form");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Hero Section - Only show on overview tab */}
          {activeTab === "overview" && <HeroSection />}
          
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-4 h-12 p-1 bg-card/50 backdrop-blur-sm">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="form" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </TabsTrigger>
            </TabsList>

            {(activeTab === "users" || activeTab === "overview") && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  onClick={handleAddNew} 
                  className="w-full lg:w-auto button-glow h-12 px-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Tab Content */}
          <div className="space-y-8">
            <TabsContent value="overview" className="space-y-8 mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12"
              >
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Choose how you'd like to begin managing your users. You can add them individually 
                  or import multiple users at once using our Excel template.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleAddNew}
                    size="lg"
                    className="button-glow"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First User
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("upload")}
                    variant="outline"
                    size="lg"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Import from Excel
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 mt-0">
              <UserList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="form" className="space-y-6 mt-0">
              <UserForm
                user={editingUser || undefined}
                onSuccess={handleSuccess}
                onCancel={activeTab === "form" ? handleCancel : undefined}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-6 mt-0">
              <BulkUpload onSuccess={handleSuccess} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 py-12 border-t"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">UserFlow Pro</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade user management platform built with Next.js, TypeScript, and modern web technologies. 
              Featuring advanced security, real-time processing, and seamless Excel integration.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span>✨ Real-time Processing</span>
              <span>🔒 Enterprise Security</span>
              <span>📊 Advanced Analytics</span>
              <span>🚀 High Performance</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}