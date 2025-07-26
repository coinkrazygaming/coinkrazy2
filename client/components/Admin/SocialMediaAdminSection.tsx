import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Share2,
  MessageCircle,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Send,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Repeat2,
  ExternalLink,
  Bot,
  Zap,
  Target,
} from 'lucide-react';

interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'discord' | 'telegram';
  content: string;
  image_url?: string;
  scheduled_time?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    reach: number;
  };
  created_at: string;
  published_at?: string;
}

interface SocialMediaStats {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  activeScheduled: number;
  topPerformingPlatform: string;
  weeklyGrowth: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'new_user' | 'big_win' | 'daily' | 'weekly' | 'game_launch';
  platforms: string[];
  template: string;
  active: boolean;
  last_triggered?: string;
  trigger_count: number;
}

export default function SocialMediaAdminSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [stats, setStats] = useState<SocialMediaStats>({
    totalPosts: 0,
    totalEngagement: 0,
    totalReach: 0,
    activeScheduled: 0,
    topPerformingPlatform: '',
    weeklyGrowth: 0,
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);

  // Form state for creating posts
  const [postForm, setPostForm] = useState({
    platform: 'facebook' as SocialMediaPost['platform'],
    content: '',
    image_url: '',
    scheduled_time: '',
  });

  // Form state for automation rules
  const [ruleForm, setRuleForm] = useState({
    name: '',
    trigger: 'new_user' as AutomationRule['trigger'],
    platforms: [] as string[],
    template: '',
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchAutomationRules();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/social-media/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/social-media/stats', {
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

  const fetchAutomationRules = async () => {
    try {
      const response = await fetch('/api/admin/social-media/automation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAutomationRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    }
  };

  const createPost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/social-media/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(postForm),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Social media post created successfully!',
        });
        fetchPosts();
        fetchStats();
        setShowCreatePost(false);
        resetPostForm();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAutomationRule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/social-media/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(ruleForm),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Automation rule created successfully!',
        });
        fetchAutomationRules();
        setShowCreateRule(false);
        resetRuleForm();
      } else {
        throw new Error('Failed to create automation rule');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automation rule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomationRule = async (ruleId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/social-media/automation/${ruleId}/toggle`, {
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
          description: `Automation rule ${active ? 'activated' : 'deactivated'}!`,
        });
        fetchAutomationRules();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update automation rule',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/social-media/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Post deleted successfully!',
        });
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const resetPostForm = () => {
    setPostForm({
      platform: 'facebook',
      content: '',
      image_url: '',
      scheduled_time: '',
    });
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      trigger: 'new_user',
      platforms: [],
      template: '',
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'discord': return '🎮';
      case 'telegram': return '✈️';
      default: return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setRuleForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Social Media Management</h2>
          <p className="text-muted-foreground">Automate and manage your social media presence</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateRule(true)}
          >
            <Bot className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Share2 className="h-8 w-8 text-primary" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-primary">{stats.totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold text-red-500">{stats.totalEngagement.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalReach.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="casino-glow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Weekly Growth</p>
                <p className="text-2xl font-bold text-green-500">+{stats.weeklyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {/* Create Post Form */}
          {showCreatePost && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={postForm.platform}
                      onValueChange={(value) => setPostForm({ ...postForm, platform: value as SocialMediaPost['platform'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">📘 Facebook</SelectItem>
                        <SelectItem value="twitter">🐦 Twitter</SelectItem>
                        <SelectItem value="instagram">📷 Instagram</SelectItem>
                        <SelectItem value="discord">🎮 Discord</SelectItem>
                        <SelectItem value="telegram">✈️ Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="🎰 Big wins happening at CoinKrazy.com! Join now for free SC and GC! #Casino #FreeGames"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL (Optional)</Label>
                    <Input
                      id="image_url"
                      value={postForm.image_url}
                      onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduled_time">Scheduled Time (Optional)</Label>
                    <Input
                      id="scheduled_time"
                      type="datetime-local"
                      value={postForm.scheduled_time}
                      onChange={(e) => setPostForm({ ...postForm, scheduled_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={createPost} disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {postForm.scheduled_time ? 'Schedule Post' : 'Post Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreatePost(false);
                      resetPostForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                        <span className="font-medium capitalize">{post.platform}</span>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        {post.scheduled_time && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(post.scheduled_time).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{post.content}</p>
                      {post.engagement && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>❤️ {post.engagement.likes}</span>
                          <span>🔄 {post.engagement.shares}</span>
                          <span>💬 {post.engagement.comments}</span>
                          <span>👁️ {post.engagement.reach}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost(post.id)}
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

        <TabsContent value="automation">
          {/* Create Automation Rule Form */}
          {showCreateRule && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create Automation Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule_name">Rule Name</Label>
                    <Input
                      id="rule_name"
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                      placeholder="New User Welcome Post"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trigger">Trigger</Label>
                    <Select
                      value={ruleForm.trigger}
                      onValueChange={(value) => setRuleForm({ ...ruleForm, trigger: value as AutomationRule['trigger'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_user">New User Registration</SelectItem>
                        <SelectItem value="big_win">Big Win (>$100)</SelectItem>
                        <SelectItem value="daily">Daily Post</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="game_launch">New Game Launch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Platforms</Label>
                    <div className="flex gap-2 mt-2">
                      {['facebook', 'twitter', 'instagram', 'discord', 'telegram'].map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          size="sm"
                          variant={ruleForm.platforms.includes(platform) ? "default" : "outline"}
                          onClick={() => handlePlatformToggle(platform)}
                        >
                          {getPlatformIcon(platform)} {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template">Post Template</Label>
                    <Textarea
                      id="template"
                      value={ruleForm.template}
                      onChange={(e) => setRuleForm({ ...ruleForm, template: e.target.value })}
                      placeholder="🎉 Welcome {{username}} to CoinKrazy.com! Enjoy your {{bonus_amount}} welcome bonus! 🎰"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use variables like {`{{username}}`}, {`{{bonus_amount}}`}, {`{{win_amount}}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={createAutomationRule} disabled={loading}>
                    <Zap className="w-4 h-4 mr-2" />
                    Create Rule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateRule(false);
                      resetRuleForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Rules List */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {rule.active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <Badge variant="outline">
                          {rule.trigger.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rule.template}</p>
                      <div className="flex gap-2">
                        {rule.platforms.map((platform) => (
                          <span key={platform} className="text-xs">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Triggered {rule.trigger_count} times
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
                      />
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
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
              <CardTitle>Social Media Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Platform Performance</h3>
                  <div className="space-y-2">
                    {['Facebook', 'Twitter', 'Instagram', 'Discord', 'Telegram'].map((platform) => (
                      <div key={platform} className="flex justify-between items-center p-2 border rounded">
                        <span>{getPlatformIcon(platform.toLowerCase())} {platform}</span>
                        <div className="text-right text-sm">
                          <div>{Math.floor(Math.random() * 1000)} posts</div>
                          <div className="text-muted-foreground">{Math.floor(Math.random() * 10000)} reach</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Engagement Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <p className="text-lg font-semibold">{stats.totalEngagement}</p>
                      <p className="text-xs text-muted-foreground">Total Likes</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-lg font-semibold">{Math.floor(stats.totalEngagement * 0.2)}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <Repeat2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-lg font-semibold">{Math.floor(stats.totalEngagement * 0.3)}</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-lg font-semibold">{stats.totalReach}</p>
                      <p className="text-xs text-muted-foreground">Total Reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Platform Connections</h3>
                  <div className="space-y-3">
                    {['Facebook', 'Twitter', 'Instagram', 'Discord', 'Telegram'].map((platform) => (
                      <div key={platform} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(platform.toLowerCase())}</span>
                          <span>{platform}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">AI Content Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-posts">Enable AI-generated posts</Label>
                      <Switch id="ai-posts" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-hashtags">Auto-generate hashtags</Label>
                      <Switch id="auto-hashtags" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sentiment-analysis">Sentiment analysis</Label>
                      <Switch id="sentiment-analysis" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}