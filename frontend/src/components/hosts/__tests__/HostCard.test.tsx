import { render, screen, fireEvent } from '@testing-library/react';
import HostCard from '../HostCard';
import { Host } from '@/types';

const mockHost: Host = {
  id: 1,
  title: 'テスト宿主',
  description: 'テスト用の宿主です',
  location: '東京都渋谷区',
  price_per_night: 10000,
  max_guests: 2,
  rating: 4.5,
  review_count: 10,
  photos: ['/test-image.jpg'],
  user: {
    id: 1,
    full_name: 'テストユーザー',
    profile_image: null,
  },
  amenities: ['WiFi', 'キッチン'],
  matching_score: 85,
  matching_reasons: ['アート', '音楽'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HostCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders host information correctly', () => {
    render(<HostCard host={mockHost} />);

    expect(screen.getByText('テスト宿主')).toBeInTheDocument();
    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument();
    expect(screen.getByText('¥10,000')).toBeInTheDocument();
    expect(screen.getByText('最大2名')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10)')).toBeInTheDocument();
    expect(screen.getByText('宿主: テストユーザー')).toBeInTheDocument();
  });

  it('displays matching score and reasons', () => {
    render(<HostCard host={mockHost} />);

    expect(screen.getByText('マッチング度 85%')).toBeInTheDocument();
    expect(screen.getByText('アート')).toBeInTheDocument();
    expect(screen.getByText('音楽')).toBeInTheDocument();
  });

  it('navigates to host detail on click', () => {
    render(<HostCard host={mockHost} />);

    const detailButton = screen.getByText('詳細を見る');
    fireEvent.click(detailButton);

    expect(mockPush).toHaveBeenCalledWith('/hosts/1');
  });

  it('handles favorite toggle', () => {
    const onFavoriteToggle = jest.fn();
    render(<HostCard host={mockHost} onFavoriteToggle={onFavoriteToggle} />);

    const favoriteButton = screen.getByLabelText('お気に入りに追加');
    fireEvent.click(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledWith(1);
  });

  it('shows favorited state', () => {
    render(<HostCard host={mockHost} isFavorited={true} />);

    const favoriteButton = screen.getByLabelText('お気に入りから削除');
    expect(favoriteButton).toHaveClass('text-red-500');
  });

  it('truncates long descriptions', () => {
    const longDescriptionHost = {
      ...mockHost,
      description: 'これは非常に長い説明文です。'.repeat(10),
    };

    render(<HostCard host={longDescriptionHost} />);

    const description = screen.getByText(/これは非常に長い説明文です/);
    expect(description).toHaveClass('line-clamp-2');
  });
});