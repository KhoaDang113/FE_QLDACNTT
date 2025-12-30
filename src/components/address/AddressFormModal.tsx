import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "./CustomSelect";
import { addressService } from "@/api";
import type { Address, CreateAddressDto } from "@/api/types";
import { useAuthStore } from "@/stores/authStore";
import { useNotification } from "@/hooks/useNotification";
import { LocationPicker } from "./LocationPicker";

interface Province {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface ProvinceApiResponse {
  code: string | number;
  name: string;
}

interface WardApiResponse {
  code: string | number;
  name: string;
}

interface ProvinceDetailApiResponse {
  wards?: WardApiResponse[];
  districts?: {
    wards?: WardApiResponse[];
  }[];
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAddress?: Address | null;
}

// Helper function để tạo timeout cho fetch
const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
};

// Helper to normalize string for comparison - xử lý tốt hơn cho tiếng Việt
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/thành phố|thanh pho|tp\.|tp /gi, "")
    .replace(/tỉnh|tinh /gi, "")
    .replace(/quận|quan |q\.|q /gi, "")
    .replace(/huyện|huyen |h\.|h /gi, "")
    .replace(/thị xã|thi xa|tx\.|tx /gi, "")
    .replace(/phường|phuong |p\.|p /gi, "")
    .replace(/xã|xa /gi, "")
    .replace(/thị trấn|thi tran|tt\.|tt /gi, "")
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
};

// Advanced matching function for Vietnamese place names
const matchPlaceName = (searchTerm: string, candidateName: string): number => {
  const normSearch = normalizeString(searchTerm);
  const normCandidate = normalizeString(candidateName);

  // Exact match after normalization
  if (normSearch === normCandidate) return 100;

  return 0;
};

// Find best matching item from list
const findBestMatch = <T extends { name: string }>(
  searchTerm: string | undefined,
  candidates: T[],
  minScore: number = 100
): T | undefined => {
  if (!searchTerm || candidates.length === 0) return undefined;

  let bestMatch: T | undefined;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = matchPlaceName(searchTerm, candidate.name);
    if (score > bestScore && score >= minScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  if (bestMatch) {
    console.log(`[AddressFormModal] Matched "${searchTerm}" → "${bestMatch.name}" (score: ${bestScore})`);
  } else {
    console.log(`[AddressFormModal] No match found for "${searchTerm}" (best score: ${bestScore})`);
  }

  return bestMatch;
};

export function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  editingAddress,
}: AddressFormModalProps) {
  const { user: currentUser } = useAuthStore();
  const { showNotification } = useNotification();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [geocodingAttempted, setGeocodingAttempted] = useState<boolean>(false);

  // Map state
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  // Coordinates state - persistent storage for lat/lng to send to backend
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  // Track if coordinates were set manually (to avoid overwriting with auto-geocode)
  const [manualCoordinates, setManualCoordinates] = useState<boolean>(false);

  const fetchProvinces = useCallback(async () => {
    try {
      setLoading(true);
      // API v2 - Danh sách tỉnh thành sau sát nhập
      const response = await fetch("https://provinces.open-api.vn/api/v2/", {
        signal: createTimeoutSignal(10000),
      });

      if (response.ok) {
        const data = (await response.json()) as ProvinceApiResponse[];
        if (Array.isArray(data)) {
          // Map data từ v2 format sang format cũ
          const mappedProvinces = data.map((p: ProvinceApiResponse) => ({
            code: p.code.toString(), // Convert code to string
            name: p.name,
          }));
          setProvinces(mappedProvinces);
        }
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      showNotification({
        type: "error",
        title: "Lỗi",
        message: "Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Forward geocoding: Convert address to coordinates
  const handleForwardGeocode = useCallback(async (fullAddress: string) => {
    try {
      setGeocoding(true);
      // Nominatim search API with Vietnam bias
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=vn&limit=1&accept-language=vi`,
        {
          signal: createTimeoutSignal(10000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (!isNaN(lat) && !isNaN(lng)) {
            setCoordinates({ lat, lng });
            setMapLocation({ lat, lng });
            setManualCoordinates(false);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error forward geocoding:", error);
      return false;
    } finally {
      setGeocoding(false);
    }
  }, []);

  const fetchWards = useCallback(async (provinceCode: string): Promise<Ward[]> => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`,
        {
          signal: createTimeoutSignal(10000),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as ProvinceDetailApiResponse;

        const allWards: Ward[] = [];

        if (data.wards && Array.isArray(data.wards)) {
          data.wards.forEach((ward: WardApiResponse) => {
            allWards.push({
              code: ward.code.toString(),
              name: ward.name,
            });
          });
        } else if (data.districts && Array.isArray(data.districts)) {
          // Fallback: nếu có districts (API khác)
          data.districts.forEach((district) => {
            if (district.wards && Array.isArray(district.wards)) {
              district.wards.forEach((ward: WardApiResponse) => {
                allWards.push({
                  code: ward.code.toString(),
                  name: ward.name,
                });
              });
            }
          });
        }

        setWards(allWards);
        return allWards;
      }
      return [];
    } catch {
      setWards([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProvinces();
    }
  }, [isOpen, fetchProvinces]);

  useEffect(() => {
    if (isOpen && editingAddress) {
      setFullName(editingAddress.full_name);
      setPhone(editingAddress.phone);
      setStreet(editingAddress.address);
      setIsDefault(editingAddress.is_default);

      const provinceObj = provinces.find(p => p.name === editingAddress.city);
      if (provinceObj) {
        setSelectedProvince(provinceObj.code);
        // Trigger fetch wards when province is set, handled by another effect or manual call?
        // The effect below handles fetching wards when selectedProvince changes
      } else {
        setSelectedProvince("");
      }

      setSelectedWard(editingAddress.ward);

      // Restore coordinates if available
      if (editingAddress.latitude && editingAddress.longitude) {
        setCoordinates({
          lat: editingAddress.latitude,
          lng: editingAddress.longitude,
        });
        setMapLocation({
          lat: editingAddress.latitude,
          lng: editingAddress.longitude,
        });
      } else {
        setCoordinates(null);
        setMapLocation(undefined);
      }
    } else if (isOpen) {
      setSelectedProvince("");
      setSelectedWard("");
      setStreet("");
      setIsDefault(false);
      setMapLocation(undefined);
      setCoordinates(null);
      setManualCoordinates(false);
      setGeocodingAttempted(false);

      if (currentUser) {
        setFullName(currentUser.name || "");
        setPhone(currentUser.phone || currentUser.phoneNumber || "");
      } else {
        setFullName("");
        setPhone("");
      }
    }
  }, [isOpen, editingAddress, provinces, currentUser]);

  useEffect(() => {
    if (selectedProvince && !editingAddress) {
      fetchWards(selectedProvince);
      setSelectedWard("");
    } else if (selectedProvince && editingAddress) {

      fetchWards(selectedProvince).then((fetchedWards) => {
        const wardObj = fetchedWards.find(w => w.name === editingAddress.ward);
        if (wardObj) {
          setSelectedWard(wardObj.code);
        }
      });
    }
  }, [selectedProvince, editingAddress, fetchWards]);

  // Auto-geocoding effect: Trigger when address fields change
  useEffect(() => {
    // Reset geocoding attempted when address changes
    setGeocodingAttempted(false);

    // Only auto-geocode for new addresses, not when editing
    if (editingAddress) {
      return;
    }
    // Don't override manual coordinates
    if (manualCoordinates) {
      return;
    }
    // Need all required fields for geocoding
    if (!selectedProvince || !selectedWard || !street.trim()) {
      return;
    }

    const provinceName = provinces.find((p) => p.code === selectedProvince)?.name;
    const wardName = wards.find((w) => w.code === selectedWard)?.name;

    if (!provinceName || !wardName) {
      return;
    }

    // Build full address string
    const fullAddress = `${street.trim()}, ${wardName}, ${provinceName}, Vietnam`;

    // Debounce: Wait 1.5 seconds after user stops typing
    const timeoutId = setTimeout(() => {
      setGeocodingAttempted(true);
      handleForwardGeocode(fullAddress);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [selectedProvince, selectedWard, street, provinces, wards, editingAddress, manualCoordinates, handleForwardGeocode]);

  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
    address?: {
      province?: string;
      city?: string;
      district?: string;
      ward?: string;
      street?: string;
      full_address?: string;
    };
  }) => {
    setMapLocation({ lat: location.lat, lng: location.lng });
    // Save coordinates for backend submission
    setCoordinates({ lat: location.lat, lng: location.lng });
    // Mark as manual since user clicked "Current Location" button or dragged marker
    setManualCoordinates(true);

    if (location.address) {
      const { province, city, district, ward, street } = location.address;

      console.log('[AddressFormModal] Processing location address:', { province, city, district, ward, street });

      // 1. Match Province
      let provinceMatch = undefined;

      // Strict matching logic:
      // - If 'province' (state) is provided, ONLY try to match it.
      // - If 'province' is MISSING/EMPTY, only then fallback to 'city'.
      if (province && province.trim()) {
        provinceMatch = findBestMatch(province, provinces);
      } else {
        if (city && city.trim()) {
          provinceMatch = findBestMatch(city, provinces);
        }

        if (!provinceMatch && district && district.trim()) {
          provinceMatch = findBestMatch(district, provinces);
        }
      }



      if (provinceMatch) {
        setSelectedProvince(provinceMatch.code);

        // 2. Fetch Wards for this province
        const fetchedWards = await fetchWards(provinceMatch.code);

        // 3. Match Ward
        if (ward && ward.trim()) {
          const wardMatch = findBestMatch(ward, fetchedWards);
          if (wardMatch) {
            setSelectedWard(wardMatch.code);
          }
        }
        // Fallback to district if ward is missing or no match (sometimes district acts as ward in data)
        else if (district && district.trim()) {
          const wardMatch = findBestMatch(district, fetchedWards);
          if (wardMatch) {
            setSelectedWard(wardMatch.code);
          }
        }
      }

      // 4. Set Street - Chỉ cập nhật nếu có thông tin thực sự
      if (street && street.trim()) {
        setStreet(street);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showNotification({
        type: "warning",
        title: "Thông báo",
        message: "Vui lòng nhập họ tên người nhận",
        duration: 3000,
      });
      return;
    }

    if (!phone.trim()) {
      showNotification({
        type: "warning",
        title: "Thông báo",
        message: "Vui lòng nhập số điện thoại",
        duration: 3000,
      });
      return;
    }

    if (!addressService.validatePhone(phone)) {
      showNotification({
        type: "warning",
        title: "Thông báo",
        message: "Số điện thoại không hợp lệ",
        duration: 3000,
      });
      return;
    }

    if (!selectedProvince || !selectedWard) {
      showNotification({
        type: "warning",
        title: "Thông báo",
        message: "Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã",
        duration: 3000,
      });
      return;
    }

    if (!street.trim()) {
      showNotification({
        type: "warning",
        title: "Thông báo",
        message: "Vui lòng nhập số nhà, tên đường",
        duration: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);

      const provinceName =
        provinces.find((p) => p.code === selectedProvince)?.name || selectedProvince;
      const wardName =
        wards.find((w) => w.code === selectedWard)?.name || selectedWard;

      const addressData: CreateAddressDto = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: street.trim(),
        ward: wardName,
        // Không gửi district - mô hình 2 cấp: Chỉ có Tỉnh và Xã
        city: provinceName,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        is_default: isDefault,
        is_active: true,
      };

      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id, addressData);
        showNotification({
          type: "success",
          title: "Thành công",
          message: "Cập nhật địa chỉ thành công!",
          duration: 3000,
        });
      } else {
        await addressService.createAddress(addressData);
        showNotification({
          type: "success",
          title: "Thành công",
          message: "Thêm địa chỉ mới thành công!",
          duration: 3000,
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      showNotification({
        type: "error",
        title: "Lỗi",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto px-6 py-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Map */}
            <div className="h-full">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={mapLocation}
              />
              {geocoding && (
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  Đang tìm tọa độ...
                </div>
              )}
              {coordinates && !manualCoordinates && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Đã tìm thấy tọa độ tự động
                </p>
              )}
            </div>

            {/* Right Column: Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên người nhận"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Province dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={selectedProvince}
                    onChange={setSelectedProvince}
                    options={provinces.map((p) => ({ value: p.code, label: p.name }))}
                    placeholder="Chọn Tỉnh/Thành phố"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Ward dropdown - Mô hình 2 cấp: Phường/Xã trực thuộc Tỉnh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                    {wards.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">({wards.length} phường/xã)</span>
                    )}
                  </label>
                  <CustomSelect
                    value={selectedWard}
                    onChange={setSelectedWard}
                    options={wards.map((w) => ({ value: w.code, label: w.name }))}
                    placeholder={wards.length === 0 ? "Vui lòng chọn Tỉnh/Thành phố trước" : "Chọn Phường/Xã"}
                    disabled={!selectedProvince || loading || submitting}
                    required
                    openUp={true}
                  />
                  {wards.length === 0 && selectedProvince && !loading && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ Không tải được danh sách. Vui lòng kiểm tra console (F12)
                    </p>
                  )}
                </div>

                {/* Street address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà, tên đường <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Nhập số nhà, tên đường"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                    disabled={submitting}
                  />
                </div>


                {/* Set as default checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={submitting}
                  />
                  <label
                    htmlFor="is_default"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                {/* Coordinates required warning */}
                {!editingAddress && !coordinates && selectedProvince && selectedWard && street.trim() && (
                  <div className={`rounded-md p-3 mt-2 border ${geocoding
                    ? 'bg-blue-50 border-blue-200'
                    : geocodingAttempted
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    {geocoding ? (
                      <div className="text-xs text-blue-800 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Đang tìm tọa độ địa chỉ...
                      </div>
                    ) : geocodingAttempted ? (
                      <>
                        <p className="text-xs text-red-800">
                          ❌ Không thể xác định tọa độ cho địa chỉ này. Vui lòng:
                        </p>
                        <ul className="text-xs text-red-700 mt-1 ml-4 list-disc">
                          <li>Kiểm tra lại địa chỉ đã đúng chưa</li>
                          <li>Click nút "Vị trí hiện tại" để sử dụng GPS</li>
                          <li>Hoặc kéo marker trên bản đồ đến vị trí chính xác</li>
                        </ul>
                      </>
                    ) : (
                      <p className="text-xs text-yellow-800">
                        ⏳ Đang chờ xác định tọa độ địa chỉ...
                      </p>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={submitting || loading || geocoding || !coordinates}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang lưu...
                    </span>
                  ) : geocoding ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang tìm tọa độ...
                    </span>
                  ) : !coordinates ? (
                    "Chờ xác định tọa độ..."
                  ) : editingAddress ? (
                    "Cập nhật"
                  ) : (
                    "Thêm địa chỉ"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

