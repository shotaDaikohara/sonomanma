import React from 'react';
import Link from 'next/link';
import { Host, MatchingResult } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MapPin, Users, Star, Heart, Wifi, Car, Coffee, Tv } from 'lucide-react';

interface HostCardProps {
  host: Host;
  matchingScore?: number;
  matchingReasons?: string[];
  onFavoriteToggle?: (hostId: number) => void;
  isFavorite?: boolean;
}

const HostCard: React.FC<HostCardProps> = ({
  host,
  matchingScore,
  matchingReasons,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
      case 'wi-fi':
        return <Wifi className="w-4 h-4" />;
      case '駐車場':
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'コーヒー':
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'テレビ':
      case 'tv':
        return <Tv className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* 画像 */}
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {host.photos && host.photos.length > 0 ? (
            <img
              src={host.photos[0]}
              alt={host.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">画像なし</span>
            </div>
          )}
          
          {/* お気に入りボタン */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle(host.id);
              }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* マッチング率 */}
          {matchingScore !== undefined && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-medium">
              {Math.round(matchingScore * 100)}% マッチ
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* 基本情報 */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
              {host.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{host.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">新規</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">最大{host.max_guests}名</span>
              </div>
            </div>
          </div>

          {/* 説明文 */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {host.description}
          </p>

          {/* アメニティ */}
          {host.amenities && host.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {host.amenities.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {getAmenityIcon(amenity)}
                  <span className="ml-1">{amenity}</span>
                </div>
              ))}
              {host.amenities.length > 4 && (
                <span className="text-xs text-gray-500">+{host.amenities.length - 4}個</span>
              )}
            </div>
          )}

          {/* マッチング理由 */}
          {matchingReasons && matchingReasons.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {matchingReasons.slice(0, 2).map((reason, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {reason}
                  </span>
                ))}
                {matchingReasons.length > 2 && (
                  <span className="text-xs text-gray-500">+{matchingReasons.length - 2}個</span>
                )}
              </div>
            </div>
          )}

          {/* 価格と予約ボタン */}
          <div className="flex items-center justify-between">
            <div>
              {host.price_per_night && (
                <div className="text-lg font-semibold text-gray-900">
                  ¥{host.price_per_night.toLocaleString()}
                  <span className="text-sm font-normal text-gray-600">/泊</span>
                </div>
              )}
            </div>
            <Link href={`/hosts/${host.id}`}>
              <Button size="sm">
                詳細を見る
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default HostCard;