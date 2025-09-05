import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import HostCard from '@/components/hosts/HostCard';
import SearchFilters from '@/components/hosts/SearchFilters';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { hostsApi, HostSearchParams } from '@/lib/hosts';
import { useAuth } from '@/contexts/AuthContext';
import { Host } from '@/types';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filters, setFilters] = useState<HostSearchParams>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  // 初回ロード時にホストデータを取得
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      loadHosts();
    }
  }, []);

  const loadHosts = async (searchParams: HostSearchParams = {}) => {
    setIsLoading(true);
    console.log('Loading hosts with params:', searchParams);
    try {
      const data = await hostsApi.getHosts(searchParams);
      console.log('Hosts data received:', data);
      setHosts(data);
    } catch (error) {
      console.error('ホストデータの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadHosts(filters);
  };

  const handleFiltersChange = (newFilters: HostSearchParams) => {
    setFilters(newFilters);
  };

  const handleFavoriteToggle = (hostId: number) => {
    // TODO: お気に入り機能の実装
    console.log('お気に入り切り替え:', hostId);
  };

  return (
    <>
      <Head>
        <title>宿主を探す - StayConnect</title>
        <meta name="description" content="興味関心でつながる宿主を見つけて、特別な宿泊体験をしませんか？" />
      </Head>

      <Layout>
        <div className="container py-8">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">宿主を探す</h1>
              <p className="text-gray-600">
                あなたの興味関心に合った宿主を見つけて、特別な体験をしませんか？
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 表示モード切り替え */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* フィルター表示切り替え */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 検索フィルター */}
            {showFilters && (
              <div className="lg:col-span-1">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* 検索結果 */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {/* 検索結果ヘッダー */}
              {hosts.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-600">
                      {hosts.length}件の宿主が見つかりました
                    </p>
                  </div>
                </div>
              )}

              {/* 検索結果一覧 */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : hosts.length > 0 ? (
                <>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }>
                    {hosts.map((host) => (
                      <HostCard
                        key={host.id}
                        host={host}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={false}
                      />
                    ))}
                  </div>
                </>
              ) : hosts.length === 0 && !isLoading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      検索条件に一致する宿主が見つかりませんでした
                    </h3>
                    <p className="text-gray-600 mb-6">
                      検索条件を変更して再度お試しください
                    </p>
                    <Button onClick={() => setFilters({})}>
                      検索条件をクリア
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      宿主を検索してみましょう
                    </h3>
                    <p className="text-gray-600 mb-6">
                      左側の検索フィルターを使って、あなたにぴったりの宿主を見つけてください
                    </p>
                    <Button onClick={handleSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      検索開始
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SearchPage;