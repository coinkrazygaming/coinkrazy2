import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Gift,
  DollarSign,
  Users,
  Calendar,
  Trophy,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';

interface Bonus {
  id: string;
  name: string;
  type: 'welcome' | 'daily' | 'weekly' | 'monthly' | 'special';
  amount_sc: number;
  amount_gc: number;
  requirements: string;
  active: boolean;
  start_date: string;
  end_date: string | null;
  max_claims: number | null;
  total_claimed: number;
  created_at: string;
}

interface BonusStats {
  totalBonusesIssued: number;
  totalScGiven: number;
  totalGcGiven: number;
  activeBonuses: number;
  topPerformingBonus: string;
  weeklyBonusClaims: number;
}

export default function BonusAdminSection() {
  const { toast } = useToast();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [stats, setStats] = useState<BonusStats>({
    totalBonusesIssued: 0,
    totalScGiven: 0,
    totalGcGiven: 0,
    activeBonuses: 0,
    topPerformingBonus: '',
    weeklyBonusClaims: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating/editing bonuses
  const [formData, setFormData] = useState({
    name: '',
    type: 'welcome' as Bonus['type'],
    amount_sc: 0,
    amount_gc: 0,
    requirements: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    max_claims: '',
  });

  useEffect(() => {
    fetchBonuses();
    fetchStats();
  }, []);

  const fetchBonuses = async () => {
    try {
      const response = await fetch('/api/admin/bonuses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBonuses(data.bonuses || []);
      }
    } catch (error) {
      console.error('Failed to fetch bonuses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/bonus-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateBonus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bonuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          max_claims: formData.max_claims ? parseInt(formData.max_claims) : null,
          end_date: formData.end_date || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bonus created successfully!',
        });
        fetchBonuses();
        fetchStats();
        setShowCreateForm(false);
        resetForm();
      } else {
        throw new Error('Failed to create bonus');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create bonus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBonus = async () => {
    if (!editingBonus) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/bonuses/${editingBonus.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          max_claims: formData.max_claims ? parseInt(formData.max_claims) : null,
          end_date: formData.end_date || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bonus updated successfully!',
        });
        fetchBonuses();
        fetchStats();
        setEditingBonus(null);
        resetForm();
      } else {
        throw new Error('Failed to update bonus');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bonus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBonusStatus = async (bonusId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/bonuses/${bonusId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Bonus ${active ? 'activated' : 'deactivated'} successfully!`,
        });
        fetchBonuses();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bonus status',
        variant: 'destructive',
      });
    }
  };

  const deleteBonus = async (bonusId: string) => {
    if (!confirm('Are you sure you want to delete this bonus?')) return;

    try {
      const response = await fetch(`/api/admin/bonuses/${bonusId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bonus deleted successfully!',
        });
        fetchBonuses();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bonus',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'welcome',
      amount_sc: 0,
      amount_gc: 0,
      requirements: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      max_claims: '',
    });
  };

  const startEdit = (bonus: Bonus) => {
    setEditingBonus(bonus);
    setFormData({
      name: bonus.name,
      type: bonus.type,
      amount_sc: bonus.amount_sc,
      amount_gc: bonus.amount_gc,
      requirements: bonus.requirements,
      start_date: bonus.start_date.split('T')[0],
      end_date: bonus.end_date ? bonus.end_date.split('T')[0] : '',
      max_claims: bonus.max_claims?.toString() || '',
    });
    setShowCreateForm(true);
  };

  const getBonusTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'daily': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'monthly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'special': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Bonus Management</h2>
          <p className="text-muted-foreground">Manage player bonuses and rewards</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bonus
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-primary" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Bonuses</p>
                <p className="text-2xl font-bold text-primary">{stats.totalBonusesIssued}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">SC Given</p>
                <p className="text-2xl font-bold text-green-500">{stats.totalScGiven.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">GC Given</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.totalGcGiven.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Bonuses</p>
                <p className="text-2xl font-bold text-blue-500">{stats.activeBonuses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bonuses" className="w-full">
        <TabsList>
          <TabsTrigger value="bonuses">Active Bonuses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bonuses">
          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingBonus ? 'Edit Bonus' : 'Create New Bonus'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Bonus Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Welcome Bonus"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Bonus Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as Bonus['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount_sc">SC Amount</Label>
                    <Input
                      id="amount_sc"
                      type="number"
                      step="0.01"
                      value={formData.amount_sc}
                      onChange={(e) => setFormData({ ...formData, amount_sc: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount_gc">GC Amount</Label>
                    <Input
                      id="amount_gc"
                      type="number"
                      value={formData.amount_gc}
                      onChange={(e) => setFormData({ ...formData, amount_gc: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_claims">Max Claims (Optional)</Label>
                    <Input
                      id="max_claims"
                      type="number"
                      value={formData.max_claims}
                      onChange={(e) => setFormData({ ...formData, max_claims: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Input
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="New user registration"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={editingBonus ? handleUpdateBonus : handleCreateBonus}
                    disabled={loading}
                  >
                    {editingBonus ? 'Update' : 'Create'} Bonus
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingBonus(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bonuses List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{bonus.name}</h3>
                        <Badge className={getBonusTypeColor(bonus.type)}>
                          {bonus.type}
                        </Badge>
                        {bonus.active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Rewards: {bonus.amount_sc} SC + {bonus.amount_gc} GC</p>
                        <p>Claims: {bonus.total_claimed} {bonus.max_claims ? `/ ${bonus.max_claims}` : ''}</p>
                        <p>Requirements: {bonus.requirements}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(bonus)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleBonusStatus(bonus.id, !bonus.active)}
                      >
                        {bonus.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBonus(bonus.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Bonus Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-semibold">{stats.weeklyBonusClaims}</p>
                    <p className="text-sm text-muted-foreground">Weekly Claims</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-lg font-semibold">{stats.topPerformingBonus || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Top Performing</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-lg font-semibold">
                      {((stats.totalBonusesIssued / 30) || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Daily Claims</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bonus System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Default Welcome Bonus</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Automatically given to new users upon registration
                  </p>
                  <div className="flex gap-2">
                    <Input placeholder="10000" className="w-24" />
                    <span className="self-center">GC +</span>
                    <Input placeholder="10" className="w-24" />
                    <span className="self-center">SC</span>
                    <Button size="sm">Update</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Daily Login Bonus</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Bonus given for consecutive daily logins
                  </p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
