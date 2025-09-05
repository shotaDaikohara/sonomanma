import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilters from '../SearchFilters';

const mockFilters = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  minPrice: 0,
  maxPrice: 50000,
  amenities: [],
  sortBy: 'matching' as const,
};

describe('SearchFilters', () => {
  it('renders all filter inputs', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    expect(screen.getByPlaceholderText('場所を検索')).toBeInTheDocument();
    expect(screen.getByLabelText('チェックイン')).toBeInTheDocument();
    expect(screen.getByLabelText('チェックアウト')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1名')).toBeInTheDocument();
  });

  it('handles location input change', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const locationInput = screen.getByPlaceholderText('場所を検索');
    fireEvent.change(locationInput, { target: { value: '東京' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      location: '東京',
    });
  });

  it('handles date input changes', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const checkInInput = screen.getByLabelText('チェックイン');
    fireEvent.change(checkInInput, { target: { value: '2024-03-01' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      checkIn: '2024-03-01',
    });
  });

  it('handles guest count change', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const guestSelect = screen.getByDisplayValue('1名');
    fireEvent.change(guestSelect, { target: { value: '3' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      guests: 3,
    });
  });

  it('handles sort by change', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const sortSelect = screen.getByDisplayValue('マッチング度順');
    fireEvent.change(sortSelect, { target: { value: 'price' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      sortBy: 'price',
    });
  });

  it('handles price range changes', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const minPriceSlider = screen.getByLabelText('最低価格');
    fireEvent.change(minPriceSlider, { target: { value: '5000' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      minPrice: 5000,
    });
  });

  it('handles amenity selection', () => {
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={mockFilters} onFiltersChange={onFiltersChange} />);

    const wifiCheckbox = screen.getByLabelText('WiFi');
    fireEvent.click(wifiCheckbox);

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      amenities: ['WiFi'],
    });
  });

  it('handles amenity deselection', () => {
    const filtersWithAmenities = {
      ...mockFilters,
      amenities: ['WiFi', 'キッチン'],
    };
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={filtersWithAmenities} onFiltersChange={onFiltersChange} />);

    const wifiCheckbox = screen.getByLabelText('WiFi');
    fireEvent.click(wifiCheckbox);

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...filtersWithAmenities,
      amenities: ['キッチン'],
    });
  });

  it('clears all filters', () => {
    const filtersWithValues = {
      location: '東京',
      checkIn: '2024-03-01',
      checkOut: '2024-03-03',
      guests: 2,
      minPrice: 5000,
      maxPrice: 15000,
      amenities: ['WiFi'],
      sortBy: 'price' as const,
    };
    const onFiltersChange = jest.fn();
    render(<SearchFilters filters={filtersWithValues} onFiltersChange={onFiltersChange} />);

    const clearButton = screen.getByText('クリア');
    fireEvent.click(clearButton);

    expect(onFiltersChange).toHaveBeenCalledWith(mockFilters);
  });
});