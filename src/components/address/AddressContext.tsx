/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { addressService } from "@/api";
import { useAuthStore } from "@/stores/authStore";

interface AddressData {
  id?: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  recipient: string;
  phone: string;
  latitude: number;
  longitude: number;
  callAnotherPerson: boolean;
}

interface AddressContextType {
  address: AddressData | null;
  setAddress: (address: AddressData) => void;
  getAddressString: () => string;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<AddressData | null>(null);
  const { isAuthenticated } = useAuthStore();

  const loadDefaultAddress = useCallback(async () => {
    try {
      const response = await addressService.getAddresses()
      
      const addresses = response.addresses || [];
      const defaultAddress = addresses.find((addr) => addr.is_default);

      if (defaultAddress) {
        setAddressState({
          id: defaultAddress._id,
          province: defaultAddress.city || "",
          district: defaultAddress.district || "",
          ward: defaultAddress.ward || "",
          street: defaultAddress.address || "",
          latitude: defaultAddress.latitude || 0,
          longitude: defaultAddress.longitude || 0,
          recipient: defaultAddress.full_name || "",
          phone: defaultAddress.phone || "",
          callAnotherPerson: false,
        });
      }
    } catch (error) {
      console.error("Error loading default address:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem("savedAddress");

    if (isAuthenticated) {
      loadDefaultAddress();
    }
  }, [isAuthenticated, loadDefaultAddress]);

  const setAddress = (newAddress: AddressData) => {
    setAddressState(newAddress);
  };

  const getAddressString = () => {
    if (!address) return "Chọn địa chỉ giao hàng";

    const parts = [
      address.street,
      address.ward,
      address.district,
      address.province,
    ].filter(Boolean);

    return parts.join(", ") || "Chưa nhập địa chỉ";
  };

  return (
    <AddressContext.Provider value={{ address, setAddress, getAddressString }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within AddressProvider");
  }
  return context;
}
