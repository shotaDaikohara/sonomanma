import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { HostSearchParams } from '@/lib/hosts';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  filters: HostSearchParams;
  onFiltersChange: (filters: HostSearchParams) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const AMENITY_OPTIONS = [
  'WiFi', '駐車場', 'エアコン', '暖房', 'キッチン', '洗濯機',
  'テレビ', 'コーヒー', 'シャンプー', 'ドライヤー', 'アイロン', 'デスク'
];

const INTEREST_OPTIONS = [
  '旅行', '料理', '音楽', '映画', 'アート', 'スポーツ',
  '読書', '写真', 'ゲーム', 'アニメ', 'ファッション', 'グルメ',
  'アウトドア', 'ヨガ', 'ダンス', 'カラオケ', 'ショッピング', '温泉',
  'カフェ巡り', '神社仏閣', '歴史', '文化', '言語学習', 'ボランティア'
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<HostSearchParams>({
    defaultValues: filters,
  });

  const watchedValues = watch();

  React.useEffect(() => {
    onFiltersChange(watchedValues);
  }, [watchedValues, onFiltersChange]);



  const handleClearFilters = () => {
    reset({
      location: '',
      max_guests: undefined,
    });
  };

  const onSubmit = () => {
    onSearch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            検索条件
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? '簡易表示' : '詳細検索'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 基本検索 */}
          <div className="space-y-4">
            <Input
              label="場所"
              placeholder="東京都、渋谷区など"
              {...register('location')}
            />
            <Input
              label="最大ゲスト数"
              type="number"
              min="1"
              placeholder="1"
              {...register('max_guests', { valueAsNumber: true })}
            />
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              クリア
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;